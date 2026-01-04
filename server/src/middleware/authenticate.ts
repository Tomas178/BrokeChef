import { type Request, type Response, type NextFunction } from 'express';
import { auth } from '@server/auth';
import logger from '@server/logger';
import Unauthenticated from '@server/utils/errors/general/Unauthenticated';
import { fromNodeHeaders } from 'better-auth/node';

export async function authenticate(
  request: Request,
  _: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      logger.error('Unauthenticated user tried to upload image');
      throw new Unauthenticated();
    }

    request.user = session.user;

    next();
  } catch {
    logger.error('Unauthenticated user tried to upload image');
    throw new Unauthenticated();
  }
}
