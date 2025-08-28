import * as z from 'zod';
import type { Tools } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, arrayStringSchema, integerIdSchema } from './shared';

export const toolsSchema = z.object({
  id: integerIdSchema,
  name: arrayStringSchema,
  createdAt: createdAtSchema,
});

export const toolsKeysAll = Object.keys(toolsSchema.shape) as (keyof Tools)[];

export const toolsKeysPublic = toolsKeysAll;

export type ToolsPublic = Pick<
  Selectable<Tools>,
  (typeof toolsKeysPublic)[number]
>;

export type ToolsName = Pick<ToolsPublic, 'name'>['name'];
