import { sql, type Kysely } from 'kysely';
import { TABLES } from '../tables';
import { addTimestampColumns } from '../timestamps';

const COLUMN_RECIPE_ID = 'recipe_id';
const COLUMN_USER_ID = 'user_id';
const COLUMN_RATING = 'rating';

export async function up(database: Kysely<any>) {
  await addTimestampColumns(
    database.schema
      .createTable(TABLES.RATINGS)
      .addColumn(COLUMN_RECIPE_ID, 'integer', c =>
        c.notNull().references(`${TABLES.RECIPES}.id`).onDelete('cascade')
      )
      .addColumn(COLUMN_USER_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn(COLUMN_RATING, 'integer', c => c.notNull())
      .addPrimaryKeyConstraint('ratings_primary_key', [
        COLUMN_USER_ID,
        COLUMN_RECIPE_ID,
      ])
      .addCheckConstraint(
        'check_rating',
        sql`${sql.raw(COLUMN_RATING)} BETWEEN 1 AND 5`
      )
  ).execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropTable(TABLES.RATINGS).execute();
}
