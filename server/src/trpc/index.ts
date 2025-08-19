import type { Database } from '@server/database';
import type { AuthUser } from '@server/entities/users';
import type { Repositories } from '@server/repositories';
import type { Services } from '@server/services';
import { initTRPC } from '@trpc/server';
import type { Request, Response } from 'express';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

export interface Context {
  db: Database;
  req?: Request;
  res?: Response;
  repos?: Partial<Repositories>;
  services?: Partial<Services>;
  authUser?: AuthUser;
}

export type ContextMinimal = Pick<Context, 'db'>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(options) {
    const { shape, error } = options;

    if (error.cause instanceof ZodError) {
      const validationError = fromError(error.cause);

      return {
        ...shape,
        data: {
          message: validationError.message,
        },
      };
    }

    return shape;
  },
});

export const {
  createCallerFactory,
  mergeRouters,
  middleware,
  procedure: publicProcedure,
  router,
} = t;
