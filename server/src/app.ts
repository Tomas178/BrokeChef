import express from 'express';
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import { createOpenApiExpressMiddleware } from 'trpc-to-openapi';
import type { Database } from './database';
import { auth } from './auth';
import type { Context } from './trpc/index';
import { appRouter } from './controllers';
import config from './config';
import jsonErrorHandler from './middleware/jsonErrors';
import uploadRouter from './routes/uploadRouter';
import generateRecipesRouter from './routes/generateRecipesRouter';
import { gracefulShutdownManager } from './utils/GracefulShutdownManager';
import ServiceUnavailable from './utils/errors/general/ServiceUnavailable';

export default function createApp(database: Database) {
  const app = express();

  app.set('trust proxy', 'loopback');

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  app.use((_, res, next) => {
    if (gracefulShutdownManager.isTerminating()) {
      const error = new ServiceUnavailable();
      res.status(error.status).json({
        error: {
          message: error.message,
        },
      });
      return;
    }
    next();
  });

  app.all('/api/auth/{*splat}', toNodeHandler(auth));

  app.use('/api/upload', uploadRouter);

  app.use(express.json());

  app.use('/api/health', (_, res) => {
    res.status(StatusCodes.OK).send('OK');
  });

  app.use('/api/recipe', generateRecipesRouter);

  app.use(jsonErrorHandler);

  /* v8 ignore start */
  app.use(
    '/api/v1/rest',
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext({ req, res }: CreateExpressContextOptions): Context {
        return {
          database,
          req,
          res,
        };
      },
    })
  );

  app.use(
    '/api/v1/trpc',
    createExpressMiddleware({
      createContext({ req, res }: CreateExpressContextOptions): Context {
        return {
          database,
          req,
          res,
        };
      },
      router: appRouter,
    })
  );
  /* v8 ignore stop */

  return app;
}
