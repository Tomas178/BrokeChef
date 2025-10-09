import { router } from '../trpc';
import recipes from './recipes';
import savedRecipes from './savedRecipes';
import users from './users';
import ratings from './ratings';
import follows from './follows';

export const appRouter = router({
  recipes,
  savedRecipes,
  users,
  ratings,
  follows,
});

export type AppRouter = typeof appRouter;
