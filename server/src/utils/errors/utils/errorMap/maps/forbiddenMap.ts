import type { TRPC_ERROR_CODE_KEY } from '@trpc/server';
import CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';

const forbiddenErrors = [
  CannotRateOwnRecipe,
  CannotSaveOwnRecipe,
  CannotMarkOwnRecipeAsCooked,
] as const;

export const ERRORS_FORBIDDEN = new Map<
  new (...args: never[]) => Error,
  Extract<TRPC_ERROR_CODE_KEY, 'FORBIDDEN'>
>(forbiddenErrors.map(ErrorClass => [ErrorClass, 'FORBIDDEN']));
