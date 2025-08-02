import type { Database } from '@server/database';

export type RepositoryFactory = <T>(database: Database) => T;

const repositories = {};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};

export type RepositoriesKeys = keyof Repositories;

export { repositories };
