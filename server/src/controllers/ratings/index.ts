import { router } from '@server/trpc';
import getUserRatingForRecipe from './getUserRatingForRecipe';
import create from './create';
import update from './update';
import remove from './remove';

export default router({
  getUserRatingForRecipe,
  create,
  update,
  remove,
});
