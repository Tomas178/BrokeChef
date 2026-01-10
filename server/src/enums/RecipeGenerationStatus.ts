import type { ObjectValues } from '@server/shared/types';

export const RecipeGenerationStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type RecipeGenerationStatusValues = ObjectValues<
  typeof RecipeGenerationStatus
>;
