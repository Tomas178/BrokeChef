import { router } from '@server/trpc';
import getRecipes from './getRecipes';
import findById from './findById';
import updateImage from './updateImage';

export default router({
  getRecipes,
  findById,
  updateImage,
});
