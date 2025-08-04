import type { Database } from '@server/database';
import { recipesService } from './recipesService';

export type ServiceFactory = <T>(database: Database) => T;

const services = { recipesService };

export type ServicesFactories = typeof services;
export type Services = {
  [K in keyof ServicesFactories]: ReturnType<ServicesFactories[K]>;
};

export type ServicesKeys = keyof Services;

export { services };
