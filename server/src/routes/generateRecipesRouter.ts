import { Router } from 'express';
import { resizeImage } from '@server/utils/resizeImage';
import { StatusCodes } from 'http-status-codes';
import { sseManager } from '@server/utils/SSE';
import { addRecipeJob } from '@server/queues/recipe';
import config from '@server/config';
import { authenticate } from '../middleware/authenticate';
import { jsonRoute } from '../utils/middleware';
import { handleFile } from '../utils/handleFile';
import logger from '../logger';

const generateRecipesRouter = Router();

const checkRequestOrigin = (origin: string) =>
  config.cors.origin.includes(origin);

generateRecipesRouter.get('/events/:userId', (req, res) => {
  const { userId } = req.params;
  const requestOrigin = req.headers.origin;
  const isAllowedOrigin = requestOrigin && checkRequestOrigin(requestOrigin);
  const allowOrigin = isAllowedOrigin ? requestOrigin : config.cors.origin[0];

  const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
  };

  res.writeHead(StatusCodes.OK, sseHeaders);

  sseManager.addClient(userId, res);

  logger.info(`SSE Connection established for user: ${userId}`);

  const heartbeatMS = 30_000;
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, heartbeatMS);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseManager.removeClient(userId);
    logger.info(`SSE Connection closed for user: ${userId}`);
  });
});

generateRecipesRouter.post(
  '/generate',
  authenticate,
  jsonRoute(async req => {
    const userId = req.user!.id;

    const fileBuffer = await handleFile(req);
    const resizedFileBuffer = await resizeImage(fileBuffer);
    const imageBase64 = resizedFileBuffer.toString('base64');

    await addRecipeJob({
      imageBase64,
      userId,
    });

    logger.info(`Recipe generation queued for user ${userId}`);

    return {
      message: 'Your recipes are being prepared!',
    };
  }, StatusCodes.ACCEPTED)
);

export default generateRecipesRouter;
