import { auth } from '@server/auth';
import { publicProcedure } from '..';
import { TRPCError } from '@trpc/server';
import config from '@server/config';
import { fromNodeHeaders } from 'better-auth/node';

export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.authUser) {
      return next({
        ctx: {
          authUser: ctx.authUser,
        },
      });
    }

    if (!ctx.req) {
      const message =
        config.env === 'development' || config.env === 'test'
          ? 'Missing Express request object. If you are running tests, make sure to provide some req object in the procedure context.'
          : 'Missing Express request object.';

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
      });
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(ctx.req.headers),
    });

    if (!session?.user.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Please log in.',
      });
    }

    return next({
      ctx: {
        authUser: session.user.id,
      },
    });
  }
);
