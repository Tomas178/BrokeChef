import type {
  Services,
  ServicesFactories,
  ServicesKeys,
} from '@server/services';
import { middleware } from '..';

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

const none: Partial<Services> = {};

/**
 * Middleware that provides services for the specified entities in the context.
 * @param servicesFactoriesWanted An object containing the entities for which services are wanted.
 * @returns A middleware function that provides the services in the context.
 */
export default function provideServices<TKeys extends ServicesKeys>(
  servicesFactoriesWanted: Pick<ServicesFactories, TKeys>
) {
  return middleware(({ ctx, next }) => {
    const servicesAlreadyProvided = ctx.services || none;

    const servicesWantedTuples = Object.entries(
      servicesFactoriesWanted
    ) as Entries<Pick<ServicesFactories, TKeys>>;

    const servicesWanted = Object.fromEntries(
      servicesWantedTuples.map(([key, serviceFactory]) => [
        key,
        servicesAlreadyProvided[key] || serviceFactory(ctx.database),
      ])
    ) as Pick<Services, TKeys>;

    return next({
      ctx: {
        services: {
          ...servicesAlreadyProvided,
          ...servicesWanted,
        },
      },
    });
  });
}
