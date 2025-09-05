import { router } from '@server/trpc';
import getRecipes from './getRecipes';
import findById from './findById';
import updateImage from './updateImage';
import getCreatedRecipes from './getCreatedRecipes';
import getSavedRecipes from './getSavedRecipes';

export default router({
  getRecipes,
  getCreatedRecipes,
  getSavedRecipes,
  findById,
  updateImage,
});
