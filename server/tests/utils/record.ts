import {
  sql,
  type ExpressionOrFactory,
  type Insertable,
  type Kysely,
  type SqlBool,
  SqliteAdapter,
} from 'kysely';
import type { DB } from '@server/database';
import { Pool } from 'pg';

type DatabaseTypes<N extends keyof DB> = { [P in N]: DB[P] };

export const clearPoolTables = async (pool: Pool, tables: string[]) => {
  const tableList = tables.map(t => `"${t}"`).join(', ');
  await pool.query(`TRUNCATE TABLE ${tableList} CASCADE`);
};

/**
 * Clears the records from the specified tables in the database.
 * If the database is SQLite, it deletes all records from the tables.
 * If the database is PostgreSQL, it truncates all tables.
 */
export const clearTables = async <
  N extends keyof DB,
  T extends DatabaseTypes<N>,
>(
  database: Kysely<T>,
  tableNames: N[]
): Promise<void> => {
  // if SQLite, just delete all records
  if (database.getExecutor().adapter instanceof SqliteAdapter) {
    await Promise.all(
      tableNames.map(tableName =>
        sql`DELETE FROM ${sql.table(tableName)};`.execute(database)
      )
    );

    return;
  }

  // assume PostgreSQL, truncate all tables
  const tableNamesSql = sql.join(
    tableNames.map(element => sql.table(element)),
    sql.raw(', ')
  );

  await sql`TRUNCATE TABLE ${tableNamesSql} CASCADE;`.execute(database);
};

/**
 * Given a database instance and a table name, inserts records into that table.
 * @param db Kysely database instance
 * @param tableName Name of the table
 */
export const insertAll = <N extends keyof DB, T extends DatabaseTypes<N>>(
  database: Kysely<T>,
  tableName: N,
  records: Insertable<DB[N]> | Insertable<DB[N]>[]
) =>
  database
    .insertInto(tableName)
    .values(records as any)
    .returningAll()
    .execute();

/**
 * Given a database instance and a table name, selects all records from that table.
 * @param db Kysely database instance
 * @param tableName Name of the table
 */
export const selectAll = <N extends keyof DB, T extends DatabaseTypes<N>>(
  database: Kysely<T>,
  tableName: N,
  expression?: ExpressionOrFactory<DB, N, SqlBool>
) => {
  const query = database.selectFrom(tableName).selectAll();

  return expression
    ? (query.where as any)(expression).execute()
    : query.execute();
};
