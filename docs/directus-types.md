# TypeScript types

The SDK schema passed to `createDirectus<Schema>()` lives in `src/lib/directus.ts`
and is **hand-maintained** — Directus has no built-in TS type generation yet
(tracked in [directus#24866](https://github.com/directus/directus/discussions/24866)).
Keep it in sync when the data model changes.

Because it's manual it can drift from the real schema — e.g. omitting the M2M
junction/relation collections, which breaks nested `fields` typing in the SDK.
If maintaining it by hand gets painful,
[`directus-sdk-typegen`](https://github.com/bryantgillespie/directus-sdk-typegen)
or [`directus-typeforge`](https://github.com/StephenGunn/directus-typeforge) can
generate it from a live instance or the snapshot.
