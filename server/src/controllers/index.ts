import { router } from '../trpc';
import { authRouter } from './auth';
import recipes from './recipes';

export const appRouter = router({
  auth: authRouter, // Temporary for testing better-auth
  recipes,
});

export type AppRouter = typeof appRouter;
