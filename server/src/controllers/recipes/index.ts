import { router } from '@server/trpc';
import create from './create';
import findAll from './findAll';
import findById from './findById';
import remove from './remove';

export default router({
  create,
  findAll,
  findById,
  remove,
});
