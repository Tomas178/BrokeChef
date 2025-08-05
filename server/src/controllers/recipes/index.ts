import { router } from '@server/trpc';
import create from './create';
import findAll from './findAll';

export default router({
  create,
  findAll,
});
