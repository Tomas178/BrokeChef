import { SortingTypes } from '@server/enums/SortingTypes';
import * as z from 'zod';

export const USER_ID_LENGTH = 32;

export const integerIdSchema = z.number().int().positive();

export const oauthUserIdSchema = z.string().length(USER_ID_LENGTH);

export const arrayStringSchema = z.array(z.string().nonempty().max(100).trim());

export const createdAtSchema = z.date().default(() => new Date());
export const updatedAtSchema = z.date().default(() => new Date());
export const expiresAtSchema = z.date().default(() => new Date());

const POSTGRES_INT_MAX = 2_141_483_647;

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 5;

export const paginationSchema = z.object({
  offset: z.number().int().min(0).max(POSTGRES_INT_MAX).default(DEFAULT_OFFSET),
  limit: z.number().int().min(1).max(100).default(DEFAULT_LIMIT),
});

export const paginationWithSortSchema = paginationSchema.extend({
  sort: z.enum(SortingTypes).default(SortingTypes.NEWEST),
});

export const paginationWithUserInput = paginationSchema.extend({
  userInput: z.string().nonempty(),
});

export const initialPage = {
  offset: DEFAULT_OFFSET,
  limit: DEFAULT_LIMIT,
};

export const initialPageWithSort = {
  ...initialPage,
  sort: SortingTypes.NEWEST,
};

export const userWithPaginationSchema = paginationSchema.extend({
  userId: oauthUserIdSchema.optional(),
});

export type PaginationWithSort = z.infer<typeof paginationWithSortSchema>;
export type UserWithPagination = z.infer<typeof userWithPaginationSchema>;
export type PaginationWithUserInput = z.infer<typeof paginationWithUserInput>;
