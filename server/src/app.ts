/* eslint-disable unicorn/prevent-abbreviations */

import express from 'express';
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import type { Database } from './database';
import { createAuth } from './auth';
import type { Context, SessionWithUser } from './trpc/index';
import { appRouter } from './controllers';
import { Pool } from 'pg';
import config from './config';

export default function createApp(database: Database) {
  const app = express();

  const pool = new Pool({ connectionString: config.database.connectionString });
  const auth = createAuth(pool);

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
      async createContext({
        req,
        res,
      }: CreateExpressContextOptions): Promise<Context> {
        const sessionResult = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        let session: SessionWithUser | undefined = undefined;

        if (sessionResult?.session && sessionResult.user) {
          session = {
            ...sessionResult.session,
            user: sessionResult.user,
          };
        }

        return {
          db: database,
          req,
          res,
          session,
        };
      },
      router: appRouter,
    })
  );

  return app;
}
