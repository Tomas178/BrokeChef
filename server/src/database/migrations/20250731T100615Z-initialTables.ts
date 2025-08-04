import { Kysely, sql } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .createTable('users')
    .addColumn('id', 'text', c => c.primaryKey())
    .addColumn('name', 'text', c => c.notNull())
    .addColumn('email', 'text', c => c.notNull())
    .addColumn('email_verified', 'boolean', c => c.notNull().defaultTo(false))
    .addColumn('image', 'text')
    .addColumn('created_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await database.schema
    .createTable('sessions')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('user_id', 'text', col =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('token', 'text', col => col.notNull().unique())
    .addColumn('expires_at', 'timestamptz', col => col.notNull())
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('created_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await database.schema
    .createTable('accounts')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('user_id', 'text', col =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('account_id', 'text', col => col.notNull())
    .addColumn('provider_id', 'text', col => col.notNull())
    .addColumn('access_token', 'text')
    .addColumn('refresh_token', 'text')
    .addColumn('access_token_expires_at', 'timestamptz')
    .addColumn('refresh_token_expires_at', 'timestamptz')
    .addColumn('scope', 'text')
    .addColumn('id_token', 'text')
    .addColumn('password', 'text')
    .addColumn('created_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await database.schema
    .createTable('verifications')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('identifier', 'text', col => col.notNull())
    .addColumn('value', 'text', col => col.notNull())
    .addColumn('expires_at', 'timestamptz', col => col.notNull())
    .addColumn('created_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

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
    .addColumn('saved_at', 'timestamptz', c =>
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
