import type { TRPC_ERROR_CODE_KEY } from '@trpc/server';
import { ERRORS_NOT_FOUND } from './maps/notFoundMap';
import { ERRORS_FORBIDDEN } from './maps/forbiddenMap';
import { ERRORS_CONFLICTS } from './maps/conflictMap';
import { ERRORS_TOO_MANY_REQUESTS } from './maps/tooManyRequestsMap';

export const ERROR_MAP = new Map<new () => Error, TRPC_ERROR_CODE_KEY>([
  ...ERRORS_FORBIDDEN,
  ...ERRORS_NOT_FOUND,
  ...ERRORS_CONFLICTS,
  ...ERRORS_TOO_MANY_REQUESTS,
]);
