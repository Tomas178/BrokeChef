import type { Request, Response } from 'express';
import mobileOAuthCallback from '../mobileOAuthCallback';

describe('mobileOAuthCallback', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const next = vi.fn();

  beforeEach(() => {
    req = {
      query: {},
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      redirect: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('Should return 400 if redirect parameter is missing', async () => {
    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing redirect parameter',
    });
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('Should redirect with error=no_session if no session cookie is present', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {};

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?error=no_session'
    );
  });

  it('Should redirect with error=no_session if cookies exist but no session cookie', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = { cookie: 'other_cookie=value; another=123' };

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?error=no_session'
    );
  });

  it('Should redirect with session_token when session cookie exists', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie: 'brokechef.session_token=abc123token',
    };

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?session_token=abc123token'
    );
  });

  it('Should extract session cookie when multiple cookies are present', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie:
        'some_cookie=foo; brokechef.session_token=mytoken123; another=bar',
    };

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?session_token=mytoken123'
    );
  });

  it('Should decode URL-encoded session token', async () => {
    const encodedToken = 'token%2Bwith%2Bplus%3Dand%2Fslash';
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie: `brokechef.session_token=${encodedToken}`,
    };

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe(
      'token+with+plus=and/slash'
    );
  });

  it('Should handle signed tokens containing equals signs', async () => {
    const signedToken = 'abc123.signature%2Bpart%3D%3D';
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie: `brokechef.session_token=${signedToken}`,
    };

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe(
      'abc123.signature+part=='
    );
  });

  it('Should preserve existing query parameters on the redirect URL', async () => {
    req.query = { redirect: 'brokechef://auth/callback?existing=param' };
    req.headers = {
      cookie: 'brokechef.session_token=mytoken',
    };

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('existing')).toBe('param');
    expect(url.searchParams.get('session_token')).toBe('mytoken');
  });

  it('Should handle empty cookie header', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = { cookie: '' };

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?error=no_session'
    );
  });
});
