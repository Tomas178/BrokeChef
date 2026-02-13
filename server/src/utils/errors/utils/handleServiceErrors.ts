import { TRPCError, type TRPC_ERROR_CODE_KEY } from '@trpc/server';
import { ERROR_MAP } from './errorMap';

export interface ErrorOverride {
  errorClass: new (...args_: never[]) => Error;
  code: TRPC_ERROR_CODE_KEY;
  message: string;
}

export function handleServiceErrors(
  error: unknown,
  overrides?: ErrorOverride[]
): never {
  if (error instanceof Error) {
    if (overrides) {
      for (const override of overrides) {
        if (error instanceof override.errorClass) {
          throw new TRPCError({
            code: override.code,
            message: override.message,
          });
        }
      }
    }

    for (const [ErrorClass, code] of ERROR_MAP) {
      if (error instanceof ErrorClass) {
        throw new TRPCError({ code, message: error.message });
      }
    }
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}
