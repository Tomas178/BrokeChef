/* eslint-disable unicorn/prevent-abbreviations */

import express from 'express';
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import { renderTrpcPanel } from 'trpc-ui';
import type { Database } from './database';
import { auth } from './auth';
import type { Context } from './trpc/index';
import { appRouter } from './controllers';
import config from './config';
import { resizeImage } from './utils/resizeImage';
import { ImageFolder } from './enums/ImageFolder';
import { uploadImage } from './utils/AWSS3Client/uploadImage';
import { s3Client } from './utils/AWSS3Client/client';
import { AllowedMimeType } from './enums/AllowedMimetype';
import logger from './logger';
import { jsonRoute } from './utils/middleware';
import jsonErrorHandler from './middleware/jsonErrors';
import { authenticate } from './middleware/authenticate';
import { handleFile } from './utils/handleFile';

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

  app.post(
    '/api/upload/recipe',
    authenticate,
    jsonRoute(async req => {
      const file = await handleFile(req);
      const resizedFileBuffer = await resizeImage(file);
      const key = await uploadImage(
        s3Client,
        ImageFolder.RECIPES,
        resizedFileBuffer,
        AllowedMimeType.JPEG
      );

      logger.info(`Recipe image object created in S3: ${key}`);
      return { imageUrl: key };
    })
  );

  app.post(
    '/api/upload/profile',
    authenticate,
    jsonRoute(async req => {
      const file = await handleFile(req);
      const resizedFileBuffer = await resizeImage(file);
      const key = await uploadImage(
        s3Client,
        ImageFolder.PROFILES,
        resizedFileBuffer,
        AllowedMimeType.JPEG
      );

      logger.info(`Profile image object created in S3: ${key}`);
      return { image: key };
    })
  );

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

  if (config.env === 'development') {
    app.use('/api/v1/trpc-panel', (_, res) =>
      res.send(
        renderTrpcPanel(appRouter, {
          url: `http://localhost:${config.port}/api/v1/trpc`,
          transformer: 'superjson',
        })
      )
    );
  }

  return app;
}
