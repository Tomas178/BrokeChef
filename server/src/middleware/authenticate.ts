import { type Request, type Response, type NextFunction } from 'express';
import { auth } from '@server/auth';
import config from '@server/config';
import logger from '@server/logger';
import Unauthenticated from '@server/utils/errors/general/Unauthenticated';
import { fromNodeHeaders } from 'better-auth/node';

export async function authenticate(
  request: Request,
  _: Response,
  next: NextFunction
) {
  try {
    let headers: Headers;

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const cookieName = `${config.auth.betterAuth.cookiePrefix}.session_token`;
      headers = new Headers({
        cookie: `${cookieName}=${token}`,
      });
    } else {
      headers = fromNodeHeaders(request.headers);
    }

    const session = await auth.api.getSession({ headers });

    if (!session) {
      logger.error('Unauthenticated request');
      throw new Unauthenticated();
    }

    request.user = session.user;

    next();
  } catch {
    logger.error('Unauthenticated request');
    throw new Unauthenticated();
  }
}
