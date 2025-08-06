import { router } from '../trpc';
import { authRouter } from './auth';
import recipes from './recipes';
import savedRecipes from './savedRecipes';

export const appRouter = router({
  auth: authRouter, // Temporary for testing better-auth
  recipes,
  savedRecipes,
});

export type AppRouter = typeof appRouter;
