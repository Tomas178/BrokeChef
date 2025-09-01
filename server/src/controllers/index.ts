import { router } from '../trpc';
import recipes from './recipes';
import savedRecipes from './savedRecipes';
import users from './users';

export const appRouter = router({
  recipes,
  savedRecipes,
  users,
});

export type AppRouter = typeof appRouter;
