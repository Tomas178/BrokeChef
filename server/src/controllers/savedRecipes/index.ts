import { router } from '@server/trpc';
import create from './create';
import remove from './remove';

export default router({
  save: create,
  unsave: remove,
});
