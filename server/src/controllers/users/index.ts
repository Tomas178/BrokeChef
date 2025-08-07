import { router } from '@server/trpc';
import getRecipes from './getRecipes';

export default router({
  getRecipes,
});
