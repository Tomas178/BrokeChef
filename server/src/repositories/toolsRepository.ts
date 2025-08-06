import type { Database, Tools } from '@server/database';
import { toolsKeysPublic, type ToolsPublic } from '@server/entities/tools';
import type { Insertable } from 'kysely';

const TABLE = 'tools';

export function toolsRepository(database: Database) {
  return {
    async create(tool: Insertable<Tools>): Promise<ToolsPublic> {
      return database
        .insertInto(TABLE)
        .values(tool)
        .returning(toolsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findById(id: number): Promise<ToolsPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(toolsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByName(name: string): Promise<ToolsPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(toolsKeysPublic)
        .where('name', '=', name)
        .executeTakeFirst();
    },
  };
}
