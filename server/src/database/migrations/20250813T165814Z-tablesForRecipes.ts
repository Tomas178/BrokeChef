import { sql, type Kysely } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .createTable('recipes')
    .addColumn('id', 'integer', c => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('user_id', 'text', c =>
      c.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('title', 'text', c => c.notNull())
    .addColumn('duration', 'text', c => c.notNull())
    .addColumn('steps', 'text', c => c.notNull())
    .addColumn('created_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await database.schema
    .createTable('saved_recipes')
    .addColumn('recipe_id', 'integer', c =>
      c.notNull().references('recipes.id').onDelete('cascade')
    )
    .addColumn('user_id', 'text', c =>
      c.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addPrimaryKeyConstraint('saved_recipes_primary_key', [
      'recipe_id',
      'user_id',
    ])
    .execute();

  await database.schema
    .createTable('ingredients')
    .addColumn('id', 'integer', c => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('name', 'text', c => c.notNull().unique())
    .addColumn('created_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addCheckConstraint('tools_name_not_empty', sql`length(name) > 0`)
    .execute();

  await database.schema
    .createTable('recipes_ingredients')
    .addColumn('recipe_id', 'integer', c =>
      c.notNull().references('recipes.id').onDelete('cascade')
    )
    .addColumn('ingredient_id', 'integer', c =>
      c.notNull().references('ingredients.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('recipes_ingredients_primary_key', [
      'recipe_id',
      'ingredient_id',
    ])
    .execute();

  await database.schema
    .createTable('tools')
    .addColumn('id', 'integer', c => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('name', 'text', c => c.notNull().unique())
    .addColumn('created_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addCheckConstraint('tools_name_not_empty', sql`length(name) > 0`)
    .execute();

  await database.schema
    .createTable('recipes_tools')
    .addColumn('recipe_id', 'integer', c =>
      c.notNull().references('recipes.id').onDelete('cascade')
    )
    .addColumn('tool_id', 'integer', c =>
      c.notNull().references('tools.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('recipes_tools_primary_key', [
      'recipe_id',
      'tool_id',
    ])
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropTable('recipes_tools').execute();
  await database.schema.dropTable('recipes_ingredients').execute();
  await database.schema.dropTable('tools').execute();
  await database.schema.dropTable('ingredients').execute();
  await database.schema.dropTable('saved_recipes').execute();
  await database.schema.dropTable('recipes').execute();
}
