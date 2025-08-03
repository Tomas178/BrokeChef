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

export default function createApp(db: Database) {
  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );

  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.use(express.json());

  app.use('/api/health', (_, res) => {
    res.status(StatusCodes.OK).send('OK');
  });

  app.use(
    '/api/v1/trpc',
    createExpressMiddleware({
      createContext({ req, res }: CreateExpressContextOptions): Context {
        return {
          db,
          req,
          res,
        };
      },
      router: appRouter,
    })
  );

  return app;
}
