import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import config from '../config';

const COOKIE_NAME = `${config.auth.betterAuth.cookiePrefix}.session_token`;

export async function mobileOAuthCallback(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const redirect = req.query.redirect as string | undefined;

  if (!redirect) {
    res.status(400).json({ error: 'Missing redirect parameter' });
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      const redirectUrl = new URL(redirect);
      redirectUrl.searchParams.set('error', 'no_session');
      res.redirect(redirectUrl.toString());
      return;
    }

    const cookies = req.headers.cookie || '';
    const sessionCookie = cookies
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith(`${COOKIE_NAME}=`));

    const token = sessionCookie
      ? decodeURIComponent(sessionCookie.split('=').slice(1).join('='))
      : session.session.token;

    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('session_token', token);
    res.redirect(redirectUrl.toString());
  } catch {
    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('error', 'session_error');
    res.redirect(redirectUrl.toString());
  }
}
