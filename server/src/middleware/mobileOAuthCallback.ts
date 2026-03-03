import type { RequestHandler } from 'express';

/**
 * Middleware that handles OAuth callbacks for mobile clients.
 *
 * Problem: When a mobile app uses Custom Tabs for OAuth, Better Auth sets the
 * session cookie during the server-side redirect chain. But the cookie lives
 * in the browser, not the mobile app. When Better Auth redirects to the deep
 * link (e.g., brokechef://auth/callback), the app has no way to access the cookie.
 *
 * Solution: This middleware intercepts the final redirect. Instead of redirecting
 * directly to the deep link, it reads the session cookie from the request and
 * appends it as a query parameter to the deep link URL.
 *
 * Flow:
 *   1. Mobile app opens: /api/auth/sign-in/social?provider=google&callbackURL=brokechef://auth/callback
 *   2. Better Auth redirects to Google, user authenticates
 *   3. Google redirects back to Better Auth callback
 *   4. Better Auth sets the session cookie and redirects to callbackURL
 *   5. THIS middleware intercepts that redirect, extracts the cookie,
 *      and changes the redirect to: brokechef://auth/callback?session_token=<token>
 *   6. Android app receives the token directly in the URL
 *
 * Usage in your Express app:
 *   app.use('/api/auth/mobile-callback', mobileOAuthCallback);
 *
 * Then set callbackURL on Android to:
 *   https://your-server.com/api/auth/mobile-callback?redirect=brokechef://auth/callback
 */
const mobileOAuthCallback: RequestHandler = async (req, res) => {
  const redirect = req.query.redirect as string | undefined;

  if (!redirect) {
    res.status(400).json({ error: 'Missing redirect parameter' });
    return;
  }

  // Extract the session token from the cookie that Better Auth set
  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('better-auth.session_token='));

  if (!sessionCookie) {
    // No session cookie — try using the Better Auth API to get the session
    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('error', 'no_session');
    res.redirect(redirectUrl.toString());
    return;
  }

  const token = decodeURIComponent(sessionCookie.split('=').slice(1).join('='));

  // Build the deep link URL with the token as a query parameter
  const redirectUrl = new URL(redirect);
  redirectUrl.searchParams.set('session_token', token);

  res.redirect(redirectUrl.toString());
};

export default mobileOAuthCallback;
