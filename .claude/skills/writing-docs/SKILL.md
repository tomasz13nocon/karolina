---
name: writing-docs
description: Use when writing persistent or editing docs, READMEs, or doc comments.
---

These rules apply to persistent docs (which belong in `docs/`), not temporary plans, or state-in-time captures (which belong in `backlog/`).

# Writing docs

Document a thing only if **all four** hold:

1. Hard for a future agent to figure out
2. Non-obvious
3. Specific to this project
4. Won't become outdated quickly

If any one fails, leave it out.

So do **not** document:

- Anything in vendor docs (Directus, Astro, nginx, …) — reference, don't restate.
- Anything obvious from the code or git history.
- General best practices or rationale essays.

And:

- Per-file gotchas → a comment at the point of use, not a doc.
- State-in-time content (current commit, one-time migration steps) → a clearly
  labeled temp doc to delete, never the lasting docs.
- Be terse — shortest phrasing that conveys the fact, no filler.


## Avoiding useles negative clauses

One of the worst things you can put in a doc is a description of what shouldn't be done or what is NOT the case, which is immediately followed by the correct thing. This happens very often when an agent writes a doc based on user feedback/discussion.

Examples of this terrible documentation style:

User writes: "The command runs inside docker, so it doesn't have access to the file"
Agent changes documentation from:

```
[bad command]
```

to

```
We should not run [bad command] because docker doesn't have access to the file, and that's where this command runs.
We must instead run:

[good command]
```

instead of just

```
[good command]
```
