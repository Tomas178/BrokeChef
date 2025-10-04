import { router } from '../trpc';
import recipes from './recipes';
import savedRecipes from './savedRecipes';
import users from './users';
import ratings from './ratings';

export const appRouter = router({
  recipes,
  savedRecipes,
  users,
  ratings,
});

export type AppRouter = typeof appRouter;
