import { router } from '@server/trpc';
import create from './create';
import findById from './findById';
import findByUserId from './findByUserId';
import findRecipesByCollectionId from './findRecipesByCollectionId';
import totalCollectionsByUser from './totalCollectionsByUser';
import remove from './remove';

export default router({
  create,
  findById,
  findByUserId,
  findRecipesByCollectionId,
  totalCollectionsByUser,
  remove,
});
