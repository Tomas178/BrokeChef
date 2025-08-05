import { router } from '@server/trpc';
import create from './create';
import findAll from './findAll';
import findById from './findById';

export default router({
  create,
  findAll,
  findById,
});
