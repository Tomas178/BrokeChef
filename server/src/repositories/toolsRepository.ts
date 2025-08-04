import type { Database, Tools } from '@server/database';
import { toolsKeysPublic, type ToolsPublic } from '@server/entities/tools';
import type { Insertable } from 'kysely';

const TABLE = 'tools';

export function toolsRepository(db: Database) {
  return {
    async create(tool: Insertable<Tools>): Promise<ToolsPublic> {
      return db
        .insertInto(TABLE)
        .values(tool)
        .returning(toolsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findById(id: number): Promise<ToolsPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(toolsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByName(name: string): Promise<ToolsPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(toolsKeysPublic)
        .where('name', '=', name)
        .executeTakeFirst();
    },
  };
}
