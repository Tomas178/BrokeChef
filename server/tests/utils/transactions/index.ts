/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, Transaction } from 'kysely';
import beginTransaction from './beginTransaction';
import createSavePoint from './createSavePoint';

// NOTE: This module has been added to the template to allow using rollbacked
// tests without the need to restructure the tests or think about transactions
// while handling some tricky nested transaction logic.
// It contains various JS/TS concepts that even intermediate developers would
// not be familiar with. You can treat it as a black box and just use the
// wrapInRollbacks function in your tests.

const symbolOriginal = Symbol('original');
const symbolSetInstance = Symbol('setInstance');
const symbolOverride = Symbol('override');

type DatabaseProxy<T, N extends T = any> = T & {
  [symbolOriginal]: T;
  [symbolSetInstance]: (replacement: N) => void;
  [symbolOverride]: (name: keyof T, value: any) => void;
};

/**
 * Sets up Vitest hooks for a Kysely database instance to
 * use a transaction for the test suite and individual savepoints
 * for each test.
 * Original transaction behavior is overridden to use savepoints.
 * This must be run before any database queries that you want to be
 * rollbacked after the test suite.
 */
export async function wrapInRollbacks<T = any, K extends Kysely<T> = any>(
  database: K
): Promise<K> {
  const databaseProxy = wrapInProxy(database);
  const transaction = await beginTransaction(databaseProxy[symbolOriginal]);

  // Swap out the database instance with the transaction instance.
  databaseProxy[symbolSetInstance](transaction.trx);

  beforeEach(async () => {
    const preTestState = createSavePoint(databaseProxy);

    await preTestState.save();

    // Override the transaction method to use savepoints for nested transactions.
    // This allows using transactions inside our application code without
    // worrying about the test suite's transaction.
    databaseProxy[symbolOverride]('transaction', () => ({
      isTransaction: () => true,
      execute: async <N>(function_: (trx: Transaction<T>) => N) => {
        const innerState = createSavePoint(databaseProxy);
        await innerState.save();

        try {
          const result = await function_(databaseProxy as any);
          await innerState.release();
          return result;
        } catch (error) {
          await innerState.rollback();
          throw error;
        }
      },
    }));

    // Vitest uses the returned function in the afterEach hook
    return preTestState.rollback;
  });

  afterAll(transaction.rollback);

  return databaseProxy;
}

/**
 * Creates a proxy for a database instance which allows hot-swapping
 * the database instance with a transaction instance at runtime.
 * This allows the same database instance to be used for multiple tests
 * without having to create a new instance for each test.
 */
function wrapInProxy<T extends object, N extends T>(
  databaseBase: T
): DatabaseProxy<T> {
  let instance = databaseBase;
  const overrides = new Map();

  return new Proxy(instance, {
    get(_, property) {
      if (property === symbolOriginal) {
        return databaseBase;
      }

      if (property === symbolSetInstance) {
        return (instanceNew: N) => {
          instance = instanceNew;
        };
      }

      if (property === symbolOverride) {
        return overrides.set.bind(overrides);
      }

      if (overrides.has(property)) {
        return overrides.get(property);
      }

      const value = instance[property as keyof typeof instance];

      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }) as DatabaseProxy<T>;
}
