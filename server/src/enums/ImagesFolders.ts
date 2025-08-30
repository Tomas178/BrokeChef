export enum ImagesFolders {
  Recipes = 'Recipes',
  Profiles = 'Profiles',
}

export type ImagesFoldersKeys =
  (typeof ImagesFolders)[keyof typeof ImagesFolders];
