import type { Kysely } from 'kysely';

export async function up(database: Kysely<any>) {
  await database.schema
    .createIndex('idx_users_name')
    .on('users')
    .column('name')
    .execute();

  await database.schema
    .createIndex('idx_accounts_user_id')
    .on('accounts')
    .column('user_id')
    .execute();

  await database.schema
    .createIndex('idx_sessions_user_id_token')
    .on('sessions')
    .columns(['user_id', 'token'])
    .execute();

  await database.schema
    .createIndex('idx_verifications_identifier')
    .on('verifications')
    .column('identifier')
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropIndex('idx_users_name').execute();

  await database.schema.dropIndex('idx_accounts_user_id').execute();

  await database.schema.dropIndex('idx_sessions_user_id_token').execute();

  await database.schema.dropIndex('idx_verifications_identifier').execute();
}
