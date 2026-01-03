import type { ObjectValues } from '@server/shared/types';

export const ImageFolder = {
  RECIPES: 'Recipes',
  PROFILES: 'Profiles',
  COLLECTIONS: 'Collections',
} as const;

export type ImageFolderValues = ObjectValues<typeof ImageFolder>;
