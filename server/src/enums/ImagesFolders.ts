export enum ImagesFolders {
  RECIPES = 'Recipes',
  PROFILES = 'Profiles',
}

export type ImagesFoldersKeys =
  (typeof ImagesFolders)[keyof typeof ImagesFolders];
