import type { Kysely } from 'kysely';
import { addCreatedAtColumn } from '../timestamps';
import { TABLES } from '../tables';

const COLUMN_USER_ID = 'user_id';
const COLUMN_RECIPE_ID = 'recipe_id';

export async function up(database: Kysely<any>) {
  await addCreatedAtColumn(
    database.schema
      .createTable(TABLES.COOKED_RECIPES)
      .addColumn(COLUMN_USER_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn(COLUMN_RECIPE_ID, 'integer', c =>
        c.notNull().references(`${TABLES.RECIPES}.id`).onDelete('cascade')
      )
      .addPrimaryKeyConstraint('cooked_recipes_primary_key', [
        COLUMN_USER_ID,
        COLUMN_RECIPE_ID,
      ])
  ).execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropTable(TABLES.COOKED_RECIPES).execute();
}
