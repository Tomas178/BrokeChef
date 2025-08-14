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

  await database.schema
    .createIndex('idx_users_id')
    .on('users')
    .column('id')
    .execute();

  await database.schema
    .createIndex('idx_ingredients_id')
    .on('ingredients')
    .column('id')
    .execute();

  await database.schema
    .createIndex('idx_ingredients_name')
    .on('ingredients')
    .column('name')
    .execute();

  await database.schema
    .createIndex('idx_recipes_ingredients_recipe_id')
    .on('recipes_ingredients')
    .column('recipe_id')
    .execute();

  await database.schema
    .createIndex('idx_tools_id')
    .on('tools')
    .column('id')
    .execute();

  await database.schema
    .createIndex('idx_tools_name')
    .on('tools')
    .column('name')
    .execute();

  await database.schema
    .createIndex('idx_recipes_tools_recipe_id')
    .on('recipes_tools')
    .column('recipe_id')
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema
    .dropIndex('idx_recipes_user_id_recipe_id_desc')
    .execute();

  await database.schema
    .dropIndex('idx_saved_recipes_user_id_recipe_id')
    .execute();

  await database.schema.dropIndex('idx_users_id').execute();

  await database.schema.dropIndex('idx_ingredients_id').execute();

  await database.schema.dropIndex('idx_ingredients_name').execute();

  await database.schema
    .dropIndex('idx_recipes_ingredients_recipe_id')
    .execute();

  await database.schema.dropIndex('idx_tools_id').execute();

  await database.schema.dropIndex('idx_tools_name').execute();

  await database.schema.dropIndex('idx_recipes_tools_recipe_id').execute();
}
