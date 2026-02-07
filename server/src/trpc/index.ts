import type { Database } from '@server/database';
import type { AuthUser } from '@server/entities/users';
import type { Repositories } from '@server/repositories';
import type { Services } from '@server/services';
import { initTRPC } from '@trpc/server';
import type { Request, Response } from 'express';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';
import type { OpenApiMeta } from 'trpc-to-openapi';

export interface Context {
  database: Database;
  req?: Request;
  res?: Response;
  repos?: Partial<Repositories>;
  services?: Partial<Services>;
  authUser?: AuthUser;
}

export type ContextMinimal = Pick<Context, 'database'>;

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
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
