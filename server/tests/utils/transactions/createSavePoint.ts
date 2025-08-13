import { type Kysely, type Transaction, sql } from 'kysely';

export default function createSavePoint(
  database: Kysely<any> | Transaction<any>
) {
  const name = `sp_${process.hrtime.bigint()}`;

  return {
    save: async () => {
      await sql`savepoint ${sql.raw(name)}`.execute(database);
    },
    release: async () => {
      await sql`release savepoint ${sql.raw(name)}`.execute(database);
    },
    rollback: async () => {
      await sql`rollback to savepoint ${sql.raw(name)}`.execute(database);
    },
  };
}
