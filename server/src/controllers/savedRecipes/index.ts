import { router } from '@server/trpc';
import create from './create';
import remove from './remove';
import isSaved from './isSaved';

export default router({
  save: create,
  unsave: remove,
  isSaved,
});
