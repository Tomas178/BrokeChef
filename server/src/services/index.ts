import type { Database } from '@server/database';
import { recipesService } from './recipesService';
import { savedRecipesService } from './savedRecipesService';

export type ServiceFactory = <T>(database: Database) => T;

const services = { recipesService, savedRecipesService };

export type ServicesFactories = typeof services;
export type Services = {
  [K in keyof ServicesFactories]: ReturnType<ServicesFactories[K]>;
};

export type ServicesKeys = keyof Services;

export { services };
