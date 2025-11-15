import { type Kysely } from 'kysely';
import {
  addCreatedAtColumn,
  addTimestampColumns,
  addUpdatedAtTrigger,
  dropUpdatedAtTrigger,
} from '../timestamps';
import { TABLES } from '../tables';

const COLUMN_USER_ID = 'user_id';
const COLUMN_TITLE = 'title';

const COLUMN_COLLECTION_ID = 'collection_id';
const COLUMN_RECIPE_ID = 'recipe_id';

export async function up(database: Kysely<any>) {
  await addTimestampColumns(
    database.schema
      .createTable(TABLES.COLLECTIONS)
      .addColumn('id', 'integer', c => c.primaryKey())
      .addColumn(COLUMN_USER_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn(COLUMN_TITLE, 'text', c => c.notNull())
      .addUniqueConstraint(`${COLUMN_USER_ID}_${COLUMN_TITLE}_unique`, [
        COLUMN_USER_ID,
        COLUMN_TITLE,
      ])
  ).execute();

  await addUpdatedAtTrigger(database, TABLES.COLLECTIONS);

  await addCreatedAtColumn(
    database.schema
      .createTable(TABLES.COLLECTIONS_RECIPES)
      .addColumn(COLUMN_COLLECTION_ID, 'integer', c =>
        c.notNull().references(`${TABLES.COLLECTIONS}.id`).onDelete('cascade')
      )
      .addColumn(COLUMN_RECIPE_ID, 'integer', c =>
        c.notNull().references(`${TABLES.RECIPES}.id`).onDelete('cascade')
      )
      .addPrimaryKeyConstraint(`${TABLES.COLLECTIONS_RECIPES}_primary_key`, [
        COLUMN_COLLECTION_ID,
        COLUMN_RECIPE_ID,
      ])
  ).execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropTable(TABLES.COLLECTIONS_RECIPES).execute();

  await dropUpdatedAtTrigger(database, TABLES.COLLECTIONS);
  await database.schema.dropTable(TABLES.COLLECTIONS).execute();
}
