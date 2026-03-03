import config from '@server/config';
import type { RequestHandler } from 'express';

const COOKIE_NAME = `${config.auth.betterAuth.cookiePrefix}.session_token`;

const mobileOAuthCallback: RequestHandler = async (req, res) => {
  const redirect = req.query.redirect as string | undefined;

  if (!redirect) {
    res.status(400).json({ error: 'Missing redirect parameter' });
    return;
  }

  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${COOKIE_NAME}=`));

  if (!sessionCookie) {
    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('error', 'no_session');
    res.redirect(redirectUrl.toString());
    return;
  }

  const token = decodeURIComponent(sessionCookie.split('=').slice(1).join('='));

  const redirectUrl = new URL(redirect);
  redirectUrl.searchParams.set('session_token', token);

  res.redirect(redirectUrl.toString());
};

export default mobileOAuthCallback;
