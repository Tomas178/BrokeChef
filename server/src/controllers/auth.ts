import { router, publicProcedure } from '@server/trpc';

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.session) {
      throw new Error('Not authenticated');
    }
    return ctx.session;
  }),
});
