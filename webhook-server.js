import http from "http";
import { spawn } from "child_process";
import crypto from "crypto";

// Build-trigger server, run as the `build-hook` service in docker-compose. The
// Directus "Publish" flow POSTs { token, user } to
// http://build-hook:5123/build-prod over the internal compose network — there is
// no published port, so it is never reachable from outside. The build runs
// async: we ack with 202 immediately, build the static site into the shared
// /out volume (which nginx serves), then push the result to the editor's
// Directus Studio bell.
//
// Env (injected by compose): WEBHOOK_TOKEN (required), DIRECTUS_TOKEN (optional —
// without it the build still runs, we just don't notify).

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} environment variable is not set. Refusing to start.`);
    process.exit(1);
  }
  return value;
}

const pass = requireEnv("WEBHOOK_TOKEN");
const directusToken = process.env.DIRECTUS_TOKEN; // optional — without it we just log

// Constants — this only ever runs as the compose build-hook service.
const host = "0.0.0.0"; // the container interface; reachable only inside the compose network
const port = 5123;
const directusUrl = "http://directus:8055"; // the Directus service over the compose network
const buildTimeoutMs = 15 * 60 * 1000; // a hung build is killed after 15 min
const MAX_BODY_BYTES = 16 * 1024;

const hooks = {
  "/build-prod": "bash scripts/build-prod.sh",
};

let isBuilding = false;

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

// Constant-time token comparison so the check can't be probed by timing.
function tokenMatches(received) {
  if (typeof received !== "string") return false;
  const a = Buffer.from(received);
  const b = Buffer.from(pass);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Push a build result to the triggering editor's Directus Studio bell. Best
// effort: a failed notification must never mask the build result, so we only log.
async function notifyStudio({ user, ok, route, detail }) {
  if (!directusToken) {
    log("DIRECTUS_TOKEN unset — skipping Studio notification");
    return;
  }
  if (!user) {
    log("No recipient in request body — skipping Studio notification");
    return;
  }

  const subject = ok ? "✅ Site published" : "❌ Build failed";
  const message = ok
    ? `Build (${route}) completed successfully.`
    : `Build (${route}) failed.\n\n${(detail || "").slice(-1500)}`;

  try {
    const res = await fetch(`${directusUrl}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${directusToken}`,
      },
      body: JSON.stringify({ recipient: user, subject, message }),
    });
    if (!res.ok) {
      log(`Directus notification rejected: ${res.status} ${await res.text().catch(() => "")}`);
    } else {
      log(`Notified ${user}: ${subject}`);
    }
  } catch (err) {
    log(`Directus notification failed: ${err.message}`);
  }
}

// Run the build in the background, streaming output to our logs (so a verbose
// build can't overflow a fixed buffer the way exec() would). Releases the lock
// and notifies the editor on completion.
function runBuild(route, user) {
  log(`Build started: ${route}`);
  const child = spawn("bash", ["-c", hooks[route]], {
    timeout: buildTimeoutMs,
    killSignal: "SIGKILL",
  });

  let tail = "";
  const collect = (chunk) => {
    process.stdout.write(chunk);
    tail = (tail + chunk).slice(-4000);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);

  const finish = (ok, reason) => {
    isBuilding = false;
    if (ok) {
      log(`Build succeeded: ${route}`);
      notifyStudio({ user, ok: true, route, detail: "" });
    } else {
      log(`Build failed: ${route} — ${reason}`);
      // Send the failure reason plus the tail of the build output — that's what
      // an editor (or you) actually needs to debug it.
      notifyStudio({ user, ok: false, route, detail: `${reason}\n\n${tail}` });
    }
  };

  child.on("close", (code, signal) => {
    if (code === 0) finish(true);
    else finish(false, signal ? `killed by ${signal}` : `exit code ${code}`);
  });
  child.on("error", (err) => finish(false, `failed to start: ${err.message}`));
}

const server = http.createServer((req, res) => {
  log(`${req.method} ${req.url}`);

  if (req.method !== "POST" || !Object.prototype.hasOwnProperty.call(hooks, req.url)) {
    res.statusCode = 404;
    return res.end("Not Found");
  }
  const route = req.url;

  let body = "";
  let rejected = false;
  req.on("data", (chunk) => {
    if (rejected) return;
    body += chunk;
    if (body.length > MAX_BODY_BYTES) {
      rejected = true;
      res.statusCode = 413;
      res.end("Payload Too Large");
      req.destroy();
    }
  });
  req.on("error", () => log("Request stream error (client disconnected?)"));

  req.on("end", () => {
    if (rejected) return;

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      return res.end("Invalid JSON");
    }

    if (!tokenMatches(parsed.token)) {
      log("Forbidden: bad token");
      res.statusCode = 403;
      return res.end("Forbidden");
    }

    if (isBuilding) {
      res.statusCode = 423;
      return res.end("Build already in progress");
    }

    // Acquire the lock and ack immediately — the build outlives this request.
    // (Check-and-set is synchronous, so concurrent requests can't both pass.)
    isBuilding = true;
    res.statusCode = 202;
    res.end("Build started");

    runBuild(route, parsed.user);
  });
});

server.listen(port, host, () => {
  log(`Webhook server listening on ${host}:${port}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    log(`${signal} received — shutting down`);
    server.close(() => process.exit(0));
  });
}
