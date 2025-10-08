import { Kysely } from 'kysely';
import { addTimestampColumns } from '../timestamps';
import { TABLES } from '../tables';

export async function up(database: Kysely<any>) {
  await addTimestampColumns(
    database.schema
      .createTable(TABLES.USERS)
      .addColumn('id', 'text', c => c.primaryKey())
      .addColumn('name', 'text', c => c.notNull())
      .addColumn('email', 'text', c => c.notNull().unique())
      .addColumn('email_verified', 'boolean', c => c.notNull().defaultTo(false))
      .addColumn('image', 'text')
  ).execute();

  await addTimestampColumns(
    database.schema
      .createTable(TABLES.ACCOUNTS)
      .addColumn('id', 'text', col => col.primaryKey())
      .addColumn('user_id', 'text', col =>
        col.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn('account_id', 'text', col => col.notNull())
      .addColumn('provider_id', 'text', col => col.notNull())
      .addColumn('access_token', 'text')
      .addColumn('refresh_token', 'text')
      .addColumn('access_token_expires_at', 'timestamptz')
      .addColumn('refresh_token_expires_at', 'timestamptz')
      .addColumn('scope', 'text')
      .addColumn('id_token', 'text')
      .addColumn('password', 'text')
  ).execute();

  await addTimestampColumns(
    database.schema
      .createTable(TABLES.SESSIONS)
      .addColumn('id', 'text', col => col.primaryKey())
      .addColumn('user_id', 'text', col =>
        col.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn('token', 'text', col => col.notNull().unique())
      .addColumn('expires_at', 'timestamptz', col => col.notNull())
      .addColumn('ip_address', 'text')
      .addColumn('user_agent', 'text')
  ).execute();

  await addTimestampColumns(
    database.schema
      .createTable(TABLES.VERIFICATIONS)
      .addColumn('id', 'text', col => col.primaryKey())
      .addColumn('identifier', 'text', col => col.notNull())
      .addColumn('value', 'text', col => col.notNull())
      .addColumn('expires_at', 'timestamptz', col => col.notNull())
  ).execute();
}
