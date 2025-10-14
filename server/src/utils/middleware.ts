/* eslint-disable unicorn/prevent-abbreviations */
import type { Response, Request, NextFunction, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

type JsonHandler<T> = (
  request: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

export function jsonRoute<T>(
  handler: JsonHandler<T>,
  statusCode = StatusCodes.OK
): RequestHandler {
  return async (request, res, next) => {
    try {
      const result = await handler(request, res, next);
      res.status(statusCode);
      res.json(result as T);
    } catch (error) {
      next(error);
    }
  };
}
