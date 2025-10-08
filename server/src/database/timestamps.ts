import { sql, type CreateTableBuilder } from 'kysely';
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
