import { sql, type Kysely } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .createIndex('idx_recipes_user_id_recipe_id_desc')
    .on('recipes')
    .column('user_id')
    .expression(sql`id desc`)
    .execute();

  await database.schema
    .createIndex('idx_saved_recipes_user_id_recipe_id')
    .on('saved_recipes')
    .columns(['user_id', 'recipe_id'])
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema
    .dropIndex('idx_recipes_user_id_recipe_id_desc')
    .execute();

  await database.schema
    .dropIndex('idx_saved_recipes_user_id_recipe_id')
    .execute();

  await database.schema
    .dropIndex('idx_recipes_ingredients_recipe_id')
    .execute();

  await database.schema.dropIndex('idx_recipes_tools_recipe_id').execute();
}
