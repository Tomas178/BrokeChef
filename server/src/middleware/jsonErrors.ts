import config from '@server/config';
import logger from '@server/logger';
import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

const isTest = config.env === 'test';

const jsonErrors: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = getErrorStatusCode(error);

  /* v8 ignore next */
  if (!isTest) logger.error(error);

  response.status(statusCode).json({
    error: {
      message: error.message ?? 'Internal server error',
      ...error,
    },
  });
};

function getErrorStatusCode(error: Error) {
  if ('status' in error && typeof error.status === 'number') {
    return error.status;
  }

  if (error instanceof ZodError) return StatusCodes.BAD_REQUEST;

  return StatusCodes.INTERNAL_SERVER_ERROR;
}

export default jsonErrors;
