import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

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

    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('session_token', session.session.token);
    redirectUrl.searchParams.set('user_id', session.user.id);
    redirectUrl.searchParams.set('user_name', session.user.name);
    redirectUrl.searchParams.set('user_email', session.user.email);
    if (session.user.image) {
      redirectUrl.searchParams.set('user_image', session.user.image);
    }
    res.redirect(redirectUrl.toString());
  } catch {
    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('error', 'session_error');
    res.redirect(redirectUrl.toString());
  }
}
