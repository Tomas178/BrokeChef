import 'dotenv/config';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  FileMigrationProvider,
  Kysely,
  type MigrationProvider,
  Migrator,
} from 'kysely';
import config from '@server/config';
import logger from '@server/logger';
import { createDatabase } from '..';

const MIGRATIONS_PATH = '../migrations';

async function migrateLatest(database: Kysely<any>) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const nodeProvider = new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(dirname, MIGRATIONS_PATH),
  });

  const { results, error } = await migrateToLatest(nodeProvider, database);

  if (!results?.length && !error) {
    logger.info('No migrations to run.');
  }

  if (results)
    for (const it of results) {
      if (it.status === 'Success') {
        logger.info(
          `Migration "${it.migrationName}" was executed successfully.`
        );
      } else if (it.status === 'Error') {
        logger.error(`Failed to execute migration "${it.migrationName}".`);
      }
    }

  if (error) {
    logger.error('Failed to migrate.');
    logger.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

export async function migrateToLatest(
  provider: MigrationProvider,
  database: Kysely<any>
) {
  const migrator = new Migrator({
    db: database,
    provider,
  });

  return migrator.migrateToLatest();
}

const pathToThisFile = path.resolve(fileURLToPath(import.meta.url));
const pathPassedToNode = path.resolve(process.argv[1]);
const isFileRunDirectly = pathToThisFile.includes(pathPassedToNode);

if (isFileRunDirectly) {
  const database = createDatabase(config.database);

  await migrateLatest(database);
}
