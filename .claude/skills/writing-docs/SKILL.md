---
name: writing-docs
description: Use when writing persistent or editing docs, READMEs, or doc comments.
---

These rules apply to persistent docs, not temporary plans, or state-in-time captures.

# Writing docs

Document a thing only if **all four** hold:

1. Hard for a future agent to figure out,
2. Non-obvious, and
3. Specific to this project or its prod server.
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
