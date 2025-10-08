import type { Kysely } from 'kysely';
import { TABLES } from '../tables';

const IDX_USERS_NAME = 'idx_users_name';
const IDX_ACCOUNTS_USER_ID = 'idx_accounts_user_id';
const IDX_SESSIONS_USER_ID_TOKEN = 'idx_sessions_user_id_token';
const IDX_VERIFICATIONS_IDENTIFIER = 'idx_verifications_identifier';

export async function up(database: Kysely<any>) {
  await database.schema
    .createIndex(IDX_USERS_NAME)
    .on(TABLES.USERS)
    .column('name')
    .execute();

  await database.schema
    .createIndex(IDX_ACCOUNTS_USER_ID)
    .on(TABLES.ACCOUNTS)
    .column('user_id')
    .execute();

  await database.schema
    .createIndex(IDX_SESSIONS_USER_ID_TOKEN)
    .on(TABLES.SESSIONS)
    .columns(['user_id', 'token'])
    .execute();

  await database.schema
    .createIndex(IDX_VERIFICATIONS_IDENTIFIER)
    .on(TABLES.VERIFICATIONS)
    .column('identifier')
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropIndex(IDX_USERS_NAME).execute();

  await database.schema.dropIndex(IDX_ACCOUNTS_USER_ID).execute();

  await database.schema.dropIndex(IDX_SESSIONS_USER_ID_TOKEN).execute();

  await database.schema.dropIndex(IDX_VERIFICATIONS_IDENTIFIER).execute();
}
