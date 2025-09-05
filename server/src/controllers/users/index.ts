import { router } from '@server/trpc';
import getRecipes from './getRecipes';
import findById from './findById';
import updateImage from './updateImage';
import getCreatedRecipes from './getCreatedRecipes';
import getSavedRecipes from './getSavedRecipes';
import totalCreated from './totalCreated';
import totalSaved from './totalSaved';

export default router({
  getRecipes,
  getCreatedRecipes,
  getSavedRecipes,
  totalCreated,
  totalSaved,
  findById,
  updateImage,
});
