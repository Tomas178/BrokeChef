import { TRPCError } from '@trpc/server';
import { ERROR_MAP } from './errorMap';

export function handleServiceErrors(error: unknown): never {
  if (error instanceof Error) {
    for (const [ErrorClass, statusCode] of ERROR_MAP) {
      if (error instanceof ErrorClass) {
        throw new TRPCError({
          code: statusCode,
          message: error.message,
        });
      }
    }
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}
