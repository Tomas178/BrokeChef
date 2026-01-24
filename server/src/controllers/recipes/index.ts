import { router } from '@server/trpc';
import create from './create';
import findAll from './findAll';
import findById from './findById';
import remove from './remove';
import isAuthor from './isAuthor';
import totalCount from './totalCount';
import search from './search';
import findAllRecommended from './findAllRecommended';

export default router({
  create,
  search,
  findAll,
  findAllRecommended,
  findById,
  remove,
  isAuthor,
  totalCount,
});
