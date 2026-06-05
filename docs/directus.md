# Directus Workflow

Directus is the CMS and owns the content model. The committed schema artifact is
`directus/schema/snapshot.yaml`; local database files and uploads are runtime
state and stay ignored.

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

4. Commit `directus/schema/snapshot.yaml` together with any app code changes that
   depend on the schema.

## Applying Schema Elsewhere

Apply the committed schema to another Directus instance, such as production:

```bash
docker compose exec directus npx directus schema apply --dry-run /directus/schema/snapshot.yaml
docker compose exec directus npx directus schema apply --yes /directus/schema/snapshot.yaml
```

Use `--dry-run` first to inspect the planned changes. Schema snapshots promote
collections, fields, relations, and related Directus configuration; they do not
replace production content.

