import { router } from '@server/trpc';
import create from './create';
import findAll from './findAll';
import findById from './findById';
import remove from './remove';
import findCreated from './findCreated';
import findSaved from './findSaved';
import isAuthor from './isAuthor';
import totalCount from './totalCount';

export default router({
  create,
  findAll,
  findById,
  remove,
  findCreated,
  findSaved,
  isAuthor,
  totalCount,
});
