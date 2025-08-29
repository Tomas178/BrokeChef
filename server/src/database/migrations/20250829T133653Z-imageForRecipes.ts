import type { Kysely } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .alterTable('recipes')
    .addColumn('image_url', 'text', c => c.notNull())
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.alterTable('recipes').dropColumn('image_url').execute();
}
