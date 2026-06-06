const SELECTED_PROJECTS_TITLE = "selected projects";

async function assertColumn(knex, table, column) {
  if (!(await knex.schema.hasColumn(table, column))) {
    throw new Error(
      `Missing ${table}.${column}. Apply directus/schema/snapshot.yaml before running this migration.`,
    );
  }
}

function getInsertedId(result) {
  const row = Array.isArray(result) ? result[0] : result;

  if (row && typeof row === "object" && "id" in row) return row.id;
  return row;
}

async function insertAndGetId(knex, table, data) {
  const result = await knex(table).insert(data).returning("id");
  return getInsertedId(result);
}

async function getSubsetFiles(knex, subsetId) {
  return knex("photo_subsets_files")
    .select("directus_files_id", "sort")
    .where({ photo_subsets_id: subsetId })
    .whereNotNull("directus_files_id")
    .orderBy("sort", "asc")
    .orderBy("id", "asc");
}

async function replacePhotoSetFiles(knex, photoSetId, files) {
  await knex("photo_sets_files").where({ photo_sets_id: photoSetId }).delete();

  if (files.length === 0) return;

  await knex("photo_sets_files").insert(
    files.map((file, index) => ({
      photo_sets_id: photoSetId,
      directus_files_id: file.directus_files_id,
      sort: file.sort ?? index + 1,
    })),
  );
}

export async function up(knex) {
  await assertColumn(knex, "photo_sections", "label");
  await assertColumn(knex, "photo_sections", "displayMode");
  await assertColumn(knex, "photo_sets", "description");
  await assertColumn(knex, "photo_sets", "magicGrid");

  await knex.transaction(async (trx) => {
    const placeholder = await trx("photo_sets")
      .select("id", "section", "thumbnail", "dynamicPosition", "maxColumns")
      .where({ title: SELECTED_PROJECTS_TITLE })
      .first();

    if (!placeholder) {
      await trx("photo_sections")
        .where({ label: SELECTED_PROJECTS_TITLE })
        .update({ displayMode: "dropdown" });
      return;
    }

    await trx("photo_sections").where({ id: placeholder.section }).update({
      label: SELECTED_PROJECTS_TITLE,
      displayMode: "dropdown",
    });

    await trx("photo_sections").whereNot({ id: placeholder.section }).update({
      label: null,
      displayMode: "links",
    });

    const subsets = await trx("photo_subsets")
      .select("id", "label", "description", "magicGrid", "sort_subsets")
      .where({ photo_set_id: placeholder.id })
      .orderBy("sort_subsets", "asc")
      .orderBy("sort", "asc")
      .orderBy("id", "asc");

    for (const [index, subset] of subsets.entries()) {
      if (!subset.label) continue;

      const files = await getSubsetFiles(trx, subset.id);
      const thumbnail = files[0]?.directus_files_id ?? placeholder.thumbnail;

      const existing = await trx("photo_sets")
        .select("id")
        .where({ title: subset.label, section: placeholder.section })
        .first();

      const payload = {
        title: subset.label,
        section: placeholder.section,
        sort: subset.sort_subsets ?? index + 1,
        thumbnail,
        description: subset.description,
        magicGrid: subset.magicGrid ?? true,
        dynamicPosition: placeholder.dynamicPosition ?? false,
        maxColumns: placeholder.maxColumns,
      };

      const photoSetId = existing
        ? existing.id
        : await insertAndGetId(trx, "photo_sets", payload);

      if (existing) await trx("photo_sets").where({ id: photoSetId }).update(payload);
      await replacePhotoSetFiles(trx, photoSetId, files);
    }

    const subsetIds = subsets.map(({ id }) => id);
    if (subsetIds.length > 0) {
      await trx("photo_subsets_files").whereIn("photo_subsets_id", subsetIds).delete();
      await trx("photo_subsets").whereIn("id", subsetIds).delete();
    }

    await trx("photo_sets_files").where({ photo_sets_id: placeholder.id }).delete();
    await trx("photo_sets").where({ id: placeholder.id }).delete();
  });
}

export async function down(knex) {
  await assertColumn(knex, "photo_sections", "label");
  await assertColumn(knex, "photo_sections", "displayMode");
  await assertColumn(knex, "photo_sets", "description");
  await assertColumn(knex, "photo_sets", "magicGrid");

  await knex.transaction(async (trx) => {
    const selectedSection = await trx("photo_sections")
      .select("id")
      .where({ label: SELECTED_PROJECTS_TITLE })
      .first();

    if (!selectedSection) return;

    const projects = await trx("photo_sets")
      .select("id", "title", "description", "magicGrid", "sort", "thumbnail", "dynamicPosition", "maxColumns")
      .where({ section: selectedSection.id })
      .whereNot({ title: SELECTED_PROJECTS_TITLE })
      .orderBy("sort", "asc")
      .orderBy("id", "asc");

    if (projects.length === 0) return;

    const existingPlaceholder = await trx("photo_sets")
      .select("id")
      .where({ title: SELECTED_PROJECTS_TITLE })
      .first();

    const placeholderPayload = {
      title: SELECTED_PROJECTS_TITLE,
      section: selectedSection.id,
      sort: null,
      thumbnail: projects[0].thumbnail,
      description: null,
      magicGrid: true,
      dynamicPosition: projects[0].dynamicPosition ?? false,
      maxColumns: projects[0].maxColumns,
    };

    const placeholderId = existingPlaceholder
      ? existingPlaceholder.id
      : await insertAndGetId(trx, "photo_sets", placeholderPayload);

    if (existingPlaceholder) {
      await trx("photo_sets").where({ id: placeholderId }).update(placeholderPayload);
    }

    await trx("photo_subsets_files")
      .whereIn(
        "photo_subsets_id",
        trx("photo_subsets").select("id").where({ photo_set_id: placeholderId }),
      )
      .delete();
    await trx("photo_subsets").where({ photo_set_id: placeholderId }).delete();

    for (const project of projects) {
      const subsetId = await insertAndGetId(trx, "photo_subsets", {
        label: project.title,
        description: project.description,
        photo_set_id: placeholderId,
        sort: project.sort,
        sort_subsets: project.sort,
        magicGrid: project.magicGrid ?? true,
      });

      const files = await trx("photo_sets_files")
        .select("directus_files_id", "sort")
        .where({ photo_sets_id: project.id })
        .whereNotNull("directus_files_id")
        .orderBy("sort", "asc")
        .orderBy("id", "asc");

      if (files.length > 0) {
        await trx("photo_subsets_files").insert(
          files.map((file, index) => ({
            photo_subsets_id: subsetId,
            directus_files_id: file.directus_files_id,
            sort: file.sort ?? index + 1,
          })),
        );
      }
    }

    await trx("photo_sets_files").whereIn(
      "photo_sets_id",
      projects.map(({ id }) => id),
    ).delete();
    await trx("photo_sets").whereIn(
      "id",
      projects.map(({ id }) => id),
    ).delete();

    await trx("photo_sections").where({ id: selectedSection.id }).update({
      label: null,
      displayMode: "links",
    });
  });
}
