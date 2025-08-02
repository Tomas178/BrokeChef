import type { Database } from '@server/database';
import type { Repositories } from '@server/repositories';
import { initTRPC } from '@trpc/server';
import type { Session, User } from 'better-auth';
import type { Request, Response } from 'express';
import { SuperJSON } from 'superjson';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

export type SessionWithUser = Session & {
  user: User;
};

export interface Context {
  db: Database;
  req?: Request;
  res?: Response;
  repos?: Partial<Repositories>;
  session?: SessionWithUser | null;
}

export type ContextMinimal = Pick<Context, 'db'>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter(options) {
    const { shape, error } = options;

    if (error.cause instanceof ZodError) {
      const validationError = fromZodError(error.cause);

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
