import { sql, type Kysely } from 'kysely';
import { TABLES } from '../tables';

const IDX_RECIPES_USER_ID_RECIPE_ID_DESC = 'idx_recipes_user_id_recipe_id_desc';
const IDX_SAVED_RECIPES_USER_ID_RECIPE_ID =
  'idx_saved_recipes_user_id_recipe_id';

export async function up(database: Kysely<any>) {
  await database.schema
    .createIndex(IDX_RECIPES_USER_ID_RECIPE_ID_DESC)
    .on(TABLES.RECIPES)
    .column('user_id')
    .expression(sql`id desc`)
    .execute();

  await database.schema
    .createIndex(IDX_SAVED_RECIPES_USER_ID_RECIPE_ID)
    .on(TABLES.SAVED_RECIPES)
    .columns(['user_id', 'recipe_id'])
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropIndex(IDX_RECIPES_USER_ID_RECIPE_ID_DESC).execute();

  await database.schema
    .dropIndex(IDX_SAVED_RECIPES_USER_ID_RECIPE_ID)
    .execute();
}
