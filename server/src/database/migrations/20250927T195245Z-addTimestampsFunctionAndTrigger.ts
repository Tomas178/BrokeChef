import { sql, type Kysely } from 'kysely';
import { TABLES } from '../tables';
import { UPDATED_AT } from '../timestamps';

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
    await sql`
        CREATE OR REPLACE TRIGGER tg_update_timestamp BEFORE UPDATE ON ${sql.table(table)}
        FOR EACH ROW EXECUTE FUNCTION moddatetime(${sql.raw(UPDATED_AT)});
    `.execute(database);
  }
}

export async function down(database: Kysely<any>) {
  for (const table of TABLES_WITH_UPDATED_AT) {
    await sql`DROP TRIGGER IF EXISTS tg_update_timestamp ON ${sql.table(table)};`.execute(
      database
    );
  }

  await sql`DROP EXTENSION IF EXISTS moddatetime;`.execute(database);
}
