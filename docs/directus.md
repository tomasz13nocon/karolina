# Directus Workflow

Directus is the CMS and owns the content model. The committed schema artifact is
`directus/schema/snapshot.yaml`; content migrations live in
`directus/migrations/`. Local database files and uploads are runtime state and
stay ignored.

## Local Schema Changes

1. Start Directus:

   ```bash
   docker compose up -d directus
   ```

2. Change the data model in local Directus.

3. Export the schema snapshot:

   ```bash
   docker compose exec directus npx directus schema snapshot /directus/schema/snapshot.yaml
   ```

4. If content records must be transformed after the schema changes, add a
   Directus custom migration in `directus/migrations/`.

5. Commit `directus/schema/snapshot.yaml`, any migration files, and app code
   changes that depend on them.

## Applying Schema Elsewhere

Back up the production database immediately before applying schema or running
content migrations.

Apply the committed schema to another Directus instance, such as production:

```bash
docker compose exec directus npx directus schema apply --dry-run /directus/schema/snapshot.yaml
docker compose exec directus npx directus schema apply --yes /directus/schema/snapshot.yaml
```

Use `--dry-run` first to inspect the planned changes. Schema snapshots promote
collections, fields, relations, and related Directus configuration; they do not
replace production content.

After the schema is applied, run Directus migrations for content transformations:

```bash
docker compose exec directus npx directus database migrate:latest
```

Custom migrations that depend on fields from the snapshot must run after
`schema apply`. Do not deploy a frontend build that queries new fields until the
schema and required content migrations have completed.
