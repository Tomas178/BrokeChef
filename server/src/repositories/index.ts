import type { Database } from '@server/database';
import { recipesRepository } from './recipesRepository';
import { ingredientsRepository } from './ingredientsRepository';
import { recipesIngredientsRepository } from './recipesIngredientsRepository';
import { toolsRepository } from './toolsRepository';
import { recipesToolsRepository } from './recipesToolsRepository';
import { savedRecipesRepository } from './savedRecipesRepository';
import { usersRepository } from './usersRepository';
import { ratingsRepository } from './ratingsRepository';
import { followsRepository } from './followsRepository';
import { cookedRecipesRepository } from './cookedRecipesRepository';

export type RepositoryFactory = <T>(database: Database) => T;

const repositories = {
  recipesRepository,
  ingredientsRepository,
  recipesIngredientsRepository,
  toolsRepository,
  recipesToolsRepository,
  savedRecipesRepository,
  usersRepository,
  ratingsRepository,
  followsRepository,
  cookedRecipesRepository,
};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};

export type RepositoriesKeys = keyof Repositories;

export { repositories };
