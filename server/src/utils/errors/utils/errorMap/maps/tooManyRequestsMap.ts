import RateLimitError from '@server/utils/errors/general/RateLimitError';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server';

const tooManyRequestsErrors = [RateLimitError] as const;

export const ERRORS_TOO_MANY_REQUESTS = new Map<
  new (...args: never[]) => Error,
  Extract<TRPC_ERROR_CODE_KEY, 'FORBIDDEN'>
>(tooManyRequestsErrors.map(ErrorClass => [ErrorClass, 'FORBIDDEN']));
