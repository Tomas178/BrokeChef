import type { Database } from '@server/database';
import { recipesService } from './recipesService';
import { savedRecipesService } from './savedRecipesService';
import { usersService } from './usersService';

export type ServiceFactory = <T>(database: Database) => T;

const services = { recipesService, savedRecipesService, usersService };

export type ServicesFactories = typeof services;
export type Services = {
  [K in keyof ServicesFactories]: ReturnType<ServicesFactories[K]>;
};

export type ServicesKeys = keyof Services;

export { services };
