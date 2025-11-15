/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql, type CreateTableBuilder } from 'kysely';
import type { TablesValues } from './tables';

export const CREATED_AT = 'created_at';
export const UPDATED_AT = 'updated_at';

export function addCreatedAtColumn<TB extends TablesValues, C extends string>(
  tableBuilder: CreateTableBuilder<TB, C>
) {
  return tableBuilder.addColumn(CREATED_AT, 'timestamptz', c =>
    c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
  );
}

export function addUpdatedAtColumn<TB extends TablesValues, C extends string>(
  tableBuilder: CreateTableBuilder<TB, C>
) {
  return tableBuilder.addColumn(UPDATED_AT, 'timestamptz', c =>
    c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
  );
}

export function addTimestampColumns<TB extends TablesValues, C extends string>(
  tableBuilder: CreateTableBuilder<TB, C>
) {
  return addCreatedAtColumn(addUpdatedAtColumn(tableBuilder));
}

export async function addUpdatedAtTrigger(
  database: Kysely<any>,
  tableName: string
) {
  await sql`
    CREATE OR REPLACE TRIGGER tg_update_timestamp BEFORE UPDATE ON ${sql.table(tableName)}
    FOR EACH ROW EXECUTE FUNCTION moddatetime(${sql.raw(UPDATED_AT)});
  `.execute(database);
}

export async function dropUpdatedAtTrigger(
  database: Kysely<any>,
  tableName: string
) {
  await sql`DROP TRIGGER IF EXISTS tg_update_timestamp ON ${sql.table(tableName)};`.execute(
    database
  );
}
