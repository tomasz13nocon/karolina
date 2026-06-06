#!/usr/bin/env python3
"""Retarget Directus Live Preview URLs to a new base origin.

Only the origin (scheme://host:port) is swapped; each collection's PATH is read
back from Directus and preserved — the paths are defined once in Directus (and
carried in the schema snapshot), never hardcoded here. So this stays correct as
routes change, and works for any collection that has a preview URL.

`preview_url` is environment-specific but lives in the schema snapshot, so:
  - for local iframe testing:  scripts/set-preview-urls.py http://localhost:4322
  - before `schema snapshot`:   scripts/set-preview-urls.py https://preview.karolinanocon.com

Reads DIRECTUS_URL (default http://localhost:8055) and DIRECTUS_MCP_TOKEN.
"""
import json, os, sys, urllib.request
from urllib.parse import urlsplit, urlunsplit

if len(sys.argv) != 2:
    sys.exit("usage: set-preview-urls.py <base-url>")
target = urlsplit(sys.argv[1])
directus = os.environ.get("DIRECTUS_URL", "http://localhost:8055").rstrip("/")
token = os.environ.get("DIRECTUS_MCP_TOKEN")
if not token:
    sys.exit("set DIRECTUS_MCP_TOKEN (e.g. `. ./.env`)")


def call(method, path, body=None):
    req = urllib.request.Request(
        directus + path,
        method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        data=json.dumps(body).encode() if body else None,
    )
    return json.load(urllib.request.urlopen(req))


for col in call("GET", "/collections")["data"]:
    current = (col.get("meta") or {}).get("preview_url")
    if not current:
        continue
    parts = urlsplit(current)
    new = urlunsplit((target.scheme, target.netloc, parts.path, parts.query, parts.fragment))
    call("PATCH", f"/collections/{col['collection']}", {"meta": {"preview_url": new}})
    print(f"{col['collection']:16} {new}")
