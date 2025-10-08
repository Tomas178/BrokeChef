import { sql, type Kysely } from 'kysely';
import { addCreatedAtColumn } from '../timestamps';
import { TABLES } from '../tables';

const COLUMN_RECIPE_ID = 'recipe_id';
const COLUMN_USER_ID = 'user_id';
const COLUMN_INGREDIENT_ID = 'ingredient_id';
const COLUMN_TOOL_ID = 'tool_id';

export async function up(database: Kysely<any>) {
  await addCreatedAtColumn(
    database.schema
      .createTable(TABLES.RECIPES)
      .addColumn('id', 'integer', c =>
        c.primaryKey().generatedAlwaysAsIdentity()
      )
      .addColumn(COLUMN_USER_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn('title', 'text', c => c.notNull())
      .addColumn('duration', 'integer', c => c.notNull())
      .addColumn('steps', 'text', c => c.notNull())
  ).execute();

  await addCreatedAtColumn(
    database.schema
      .createTable(TABLES.SAVED_RECIPES)
      .addColumn(COLUMN_RECIPE_ID, 'integer', c =>
        c.notNull().references(`${TABLES.RECIPES}.id`).onDelete('cascade')
      )
      .addColumn(COLUMN_USER_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addPrimaryKeyConstraint('saved_recipes_primary_key', [
        COLUMN_RECIPE_ID,
        COLUMN_USER_ID,
      ])
  ).execute();

  await addCreatedAtColumn(
    database.schema
      .createTable(TABLES.INGREDIENTS)
      .addColumn('id', 'integer', c =>
        c.primaryKey().generatedAlwaysAsIdentity()
      )
      .addColumn('name', 'text', c => c.notNull().unique())
      .addCheckConstraint('tools_name_not_empty', sql`length(name) > 0`)
  ).execute();

  await database.schema
    .createTable(TABLES.RECIPES_INGREDIENTS)
    .addColumn(COLUMN_RECIPE_ID, 'integer', c =>
      c.notNull().references(`${TABLES.RECIPES}.id`).onDelete('cascade')
    )
    .addColumn(COLUMN_INGREDIENT_ID, 'integer', c =>
      c.notNull().references(`${TABLES.INGREDIENTS}.id`).onDelete('cascade')
    )
    .addPrimaryKeyConstraint('recipes_ingredients_primary_key', [
      COLUMN_RECIPE_ID,
      COLUMN_INGREDIENT_ID,
    ])
    .execute();

  await addCreatedAtColumn(
    database.schema
      .createTable(TABLES.TOOLS)
      .addColumn('id', 'integer', c =>
        c.primaryKey().generatedAlwaysAsIdentity()
      )
      .addColumn('name', 'text', c => c.notNull().unique())
      .addCheckConstraint('tools_name_not_empty', sql`length(name) > 0`)
  ).execute();

  await database.schema
    .createTable(TABLES.RECIPES_TOOLS)
    .addColumn(COLUMN_RECIPE_ID, 'integer', c =>
      c.notNull().references(`${TABLES.RECIPES}.id`).onDelete('cascade')
    )
    .addColumn(COLUMN_TOOL_ID, 'integer', c =>
      c.notNull().references(`${TABLES.TOOLS}.id`).onDelete('cascade')
    )
    .addPrimaryKeyConstraint('recipes_tools_primary_key', [
      COLUMN_RECIPE_ID,
      COLUMN_TOOL_ID,
    ])
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropTable(TABLES.RECIPES_TOOLS).execute();
  await database.schema.dropTable(TABLES.RECIPES_INGREDIENTS).execute();
  await database.schema.dropTable(TABLES.TOOLS).execute();
  await database.schema.dropTable(TABLES.INGREDIENTS).execute();
  await database.schema.dropTable(TABLES.SAVED_RECIPES).execute();
  await database.schema.dropTable(TABLES.RECIPES).execute();
}
