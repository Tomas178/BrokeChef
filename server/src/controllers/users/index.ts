import { router } from '@server/trpc';
import getRecipes from './getRecipes';
import findById from './findById';
import updateImage from './updateImage';
import getCreatedRecipes from './getCreatedRecipes';
import getSavedRecipes from './getSavedRecipes';
import totalCreated from './totalCreated';

export default router({
  getRecipes,
  getCreatedRecipes,
  getSavedRecipes,
  totalCreated,
  findById,
  updateImage,
});
