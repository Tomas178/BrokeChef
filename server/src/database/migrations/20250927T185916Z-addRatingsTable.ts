import { sql, type Kysely } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .createTable('ratings')
    .addColumn('recipe_id', 'integer', c =>
      c.notNull().references('recipes.id').onDelete('cascade')
    )
    .addColumn('user_id', 'text', c =>
      c.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('rating', 'integer', c => c.notNull())
    .addColumn('created_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', c =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addPrimaryKeyConstraint('ratings_primary_key', ['recipe_id', 'user_id'])
    .addCheckConstraint('check_rating', sql`rating BETWEEN 1 AND 5`)
    .execute();

  await database.schema
    .createIndex('idx_ratings_recipe_id_user_id')
    .on('ratings')
    .columns(['recipe_id', 'user_id'])
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropTable('ratings').execute();
}
