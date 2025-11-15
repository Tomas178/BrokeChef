import { sql, type Kysely } from 'kysely';
import { TABLES } from '../tables';
import { addUpdatedAtTrigger, dropUpdatedAtTrigger } from '../timestamps';

const TABLES_WITH_UPDATED_AT = [
  TABLES.USERS,
  TABLES.ACCOUNTS,
  TABLES.VERIFICATIONS,
  TABLES.SESSIONS,
  TABLES.RECIPES,
  TABLES.RATINGS,
];

export async function up(database: Kysely<any>) {
  await sql`CREATE EXTENSION IF NOT EXISTS moddatetime;`.execute(database);

  for (const table of TABLES_WITH_UPDATED_AT) {
    await addUpdatedAtTrigger(database, table);
  }
}

export async function down(database: Kysely<any>) {
  for (const table of TABLES_WITH_UPDATED_AT) {
    await dropUpdatedAtTrigger(database, table);
  }

  await sql`DROP EXTENSION IF EXISTS moddatetime;`.execute(database);
}
