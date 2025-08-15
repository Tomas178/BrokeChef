import type { Database, Tools } from '@server/database';
import { toolsKeysPublic, type ToolsPublic } from '@server/entities/tools';
import type { Insertable } from 'kysely';

const TABLE = 'tools';

export interface ToolsRepository {
  create: (tools: Insertable<Tools>[]) => Promise<ToolsPublic[]>;
  findById: (id: number) => Promise<ToolsPublic | undefined>;
  findByNames: (names: string[]) => Promise<ToolsPublic[] | undefined>;
}

export function toolsRepository(database: Database): ToolsRepository {
  return {
    async create(tools) {
      return database
        .insertInto(TABLE)
        .values(tools)
        .returning(toolsKeysPublic)
        .execute();
    },

    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(toolsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByNames(names) {
      if (names.length === 0) return;

      return database
        .selectFrom(TABLE)
        .select(toolsKeysPublic)
        .where('name', 'in', names)
        .execute();
    },
  };
}
