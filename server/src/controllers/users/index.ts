import { router } from '@server/trpc';
import getRecipes from './getRecipes';
import findById from './findById';
import updateImage from './updateImage';
import getCreatedRecipes from './getCreatedRecipes';

export default router({
  getRecipes,
  getCreatedRecipes,
  findById,
  updateImage,
});
