import { router } from '@server/trpc';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export const authRouter = router({
  me: authenticatedProcedure.query(({ ctx }) => {
    return ctx.authUser;
  }),
});
