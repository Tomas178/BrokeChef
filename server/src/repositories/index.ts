import type { Database } from '@server/database';
import { recipesRepository } from './recipesRepository';
import { ingredientsRepository } from './ingredientsRepository';
import { recipesIngredientsRepository } from './recipesIngredientsRepository';
import { toolsRepository } from './toolsRepository';
import { recipesToolsRepository } from './recipesToolsRepository';

export type RepositoryFactory = <T>(database: Database) => T;

const repositories = {
  recipesRepository,
  ingredientsRepository,
  recipesIngredientsRepository,
  toolsRepository,
  recipesToolsRepository,
};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};

export type RepositoriesKeys = keyof Repositories;

export { repositories };
