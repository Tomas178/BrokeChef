import type { ObjectValues } from '@server/shared/types';

export const SortingTypes = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  HIGHEST_RATING: 'highestRating',
  LOWEST_RATING: 'lowestRating',
  RECOMMENDED: 'recommended',
} as const;

export type SortingTypesValues = ObjectValues<typeof SortingTypes>;
