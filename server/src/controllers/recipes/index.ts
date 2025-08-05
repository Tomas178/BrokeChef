import { router } from '@server/trpc';
import create from './create';
import findAll from './findAll';
import findById from './findById';
import remove from './remove';
import findByUserId from './findByUserId';

export default router({
  create,
  findAll,
  findById,
  remove,
  findByUserId,
});
