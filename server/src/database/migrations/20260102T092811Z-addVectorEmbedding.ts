import { sql, type Kysely } from 'kysely';
import { TABLES } from '../tables';

export const OPENAI_EMBEDDING_DIMENSIONS = 1536;

const COLUMN_EMBEDDING = 'embedding';
const IDX_EMBEDDING = 'idx_embedding';

export async function up(database: Kysely<any>) {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(database);

  await database.schema
    .alterTable(TABLES.RECIPES)
    .addColumn(
      COLUMN_EMBEDDING,
      sql`vector(${sql.raw(OPENAI_EMBEDDING_DIMENSIONS.toString())})`,
      c => c
    )
    .execute();

  await sql`
    CREATE INDEX ${sql.raw(IDX_EMBEDDING)}
    ON ${sql.table(TABLES.RECIPES)}
    USING hnsw (${sql.ref(COLUMN_EMBEDDING)} vector_cosine_ops)

  `.execute(database);
}

export async function down(database: Kysely<any>) {
  await sql`DROP INDEX IF EXISTS ${sql.raw(IDX_EMBEDDING)}`.execute(database);

  await database.schema
    .alterTable(TABLES.RECIPES)
    .dropColumn(COLUMN_EMBEDDING)
    .execute();

  await sql`DROP EXTENSION IF EXISTS vector`.execute(database);
}
