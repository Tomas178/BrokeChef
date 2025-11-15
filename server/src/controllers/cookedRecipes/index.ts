import { router } from '@server/trpc';
import create from './create';
import remove from './remove';
import isCooked from './isCooked';

export default router({
  mark: create,
  unmark: remove,
  isMarked: isCooked,
});
