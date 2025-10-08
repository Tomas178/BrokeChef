import type { Kysely } from 'kysely';
import { TABLES } from '../tables';

const COLUMN_IMAGE_URL = 'image_url';

export async function up(database: Kysely<any>) {
  await database.schema
    .alterTable(TABLES.RECIPES)
    .addColumn(COLUMN_IMAGE_URL, 'text', c => c.notNull())
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema
    .alterTable(TABLES.RECIPES)
    .dropColumn(COLUMN_IMAGE_URL)
    .execute();
}
