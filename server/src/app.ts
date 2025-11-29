/* eslint-disable unicorn/prevent-abbreviations */

import express from 'express';
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import type { Database } from './database';
import { auth } from './auth';
import type { Context } from './trpc/index';
import { appRouter } from './controllers';
import config from './config';
import jsonErrorHandler from './middleware/jsonErrors';
import uploadRouter from './routes/uploadRouter';
import generateRecipesRouter from './routes/generateRecipesRouter';

export default function createApp(database: Database) {
  const app = express();

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  app.all('/api/auth/{*splat}', toNodeHandler(auth));

  app.use(express.json());

  app.use('/api/health', (_, res) => {
    res.status(StatusCodes.OK).send('OK');
  });

  app.use('/api/upload', uploadRouter);

  app.use('/api/recipe', generateRecipesRouter);

  app.use(jsonErrorHandler);

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

  return app;
}
