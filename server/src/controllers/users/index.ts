import { router } from '@server/trpc';
import getRecipes from './getRecipes';
import findById from './findById';

export default router({
  getRecipes,
  findById,
});
