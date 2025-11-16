import { router } from '../trpc';
import recipes from './recipes';
import savedRecipes from './savedRecipes';
import users from './users';
import ratings from './ratings';
import follows from './follows';
import cookedRecipes from './cookedRecipes';
import collections from './collections';

export const appRouter = router({
  recipes,
  savedRecipes,
  users,
  ratings,
  follows,
  cookedRecipes,
  collections,
});

export type AppRouter = typeof appRouter;
