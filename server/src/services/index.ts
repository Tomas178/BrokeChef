import type { Database } from '@server/database';
import { recipesService } from './recipesService';
import { savedRecipesService } from './savedRecipesService';
import { usersService } from './usersService';
import { ratingsService } from './ratingsService';
import { followsService } from './followsService';
import { cookedRecipesService } from './cookedRecipesService';

export type ServiceFactory = <T>(database: Database) => T;

const services = {
  recipesService,
  savedRecipesService,
  usersService,
  ratingsService,
  followsService,
  cookedRecipesService,
};

export type ServicesFactories = typeof services;
export type Services = {
  [K in keyof ServicesFactories]: ReturnType<ServicesFactories[K]>;
};

export type ServicesKeys = keyof Services;

export { services };
