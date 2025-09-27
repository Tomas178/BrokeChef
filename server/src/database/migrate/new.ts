// Usage: npm run migrate:new $migrationName

import fs from 'node:fs/promises';
import logger from '@server/logger';

const migrationContent = `
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
}

export async function down(db: Kysely<any>) {
}
`.slice(1);

async function createMigrationFile(migrationName: string) {
  const timestamp = `${new Date().toISOString().replaceAll(/[.:-]/g, '').slice(0, -4)}Z`;
  const fileName = `${timestamp}-${migrationName}.ts`;
  const filePath = `./src/database/migrations/${fileName}`;

  await fs.writeFile(filePath, migrationContent);

  return filePath;
}

const migrationName = process.argv[2];
if (migrationName) {
  try {
    const filePath = await createMigrationFile(migrationName);
    logger.info(`Created new migration file: ${filePath}`);
  } catch (error) {
    logger.error('Failed to create migration file:', error);
  }
} else {
  logger.error('Please provide a migration name.');
}
