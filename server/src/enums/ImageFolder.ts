export enum ImageFolder {
  RECIPES = 'Recipes',
  PROFILES = 'Profiles',
}

export type ImageFolderKeys = (typeof ImageFolder)[keyof typeof ImageFolder];
