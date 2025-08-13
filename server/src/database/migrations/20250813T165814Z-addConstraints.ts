import { sql, type Kysely } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .alterTable('ingredients')
    .addCheckConstraint('ingredients_name_not_empty', sql`length(name) > 0`)
    .execute();

  await database.schema
    .alterTable('tools')
    .addCheckConstraint('tools_name_not_empty', sql`length(name) > 0`)
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema
    .alterTable('ingredients')
    .dropConstraint('ingredients_name_not_empty')
    .execute();

  await database.schema
    .alterTable('tools')
    .dropConstraint('tools_name_not_empty')
    .execute();
}
