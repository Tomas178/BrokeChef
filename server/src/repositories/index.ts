import type { Database } from '@server/database';
import { recipesRepository } from './recipesRepository';

export type RepositoryFactory = <T>(database: Database) => T;

const repositories = { recipesRepository };

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};

export type RepositoriesKeys = keyof Repositories;

export { repositories };
