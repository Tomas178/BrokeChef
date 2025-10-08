import { sql, type Kysely } from 'kysely';
import { addCreatedAtColumn } from '../timestamps';
import { TABLES } from '../tables';

const FOLLOWER_ID = 'follower_id';
const FOLLOWED_ID = 'followed_id';

const IDX_FOLLOWS_FOLLOWED_ID = 'idx_follows_followed_id';

export async function up(database: Kysely<any>) {
  await addCreatedAtColumn(
    database.schema
      .createTable('TABLES.FOLLOWS')
      .addColumn(FOLLOWER_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addColumn(FOLLOWED_ID, 'text', c =>
        c.notNull().references(`${TABLES.USERS}.id`).onDelete('cascade')
      )
      .addPrimaryKeyConstraint('follows_primary_key', [
        FOLLOWER_ID,
        FOLLOWED_ID,
      ])
      .addCheckConstraint(
        'check_no_self_follow',
        sql`${sql.ref(FOLLOWER_ID)} <> ${sql.ref(FOLLOWED_ID)}`
      )
  ).execute();

  await database.schema
    .createIndex(IDX_FOLLOWS_FOLLOWED_ID)
    .on(TABLES.FOLLOWS)
    .column(FOLLOWED_ID)
    .execute();
}

export async function down(database: Kysely<any>) {
  await database.schema.dropIndex(IDX_FOLLOWS_FOLLOWED_ID).execute();

  await database.schema.dropTable(TABLES.FOLLOWS).execute();
}
