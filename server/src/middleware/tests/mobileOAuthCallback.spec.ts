import type { Request, Response, NextFunction } from 'express';
import { mobileOAuthCallback } from '../mobileOAuthCallback';

const [mockGetSession] = vi.hoisted(() => [vi.fn()]);

vi.mock('@server/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      betterAuth: {
        cookiePrefix: 'brokechef',
      },
    },
  },
}));

describe('mobileOAuthCallback', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

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
    next = vi.fn();
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

  it('Should redirect with error=no_session if getSession returns null', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {};
    mockGetSession.mockResolvedValue(null);

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?error=no_session'
    );
  });

  it('Should redirect with signed token from cookie when both session and cookie exist', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie: 'brokechef.session_token=signedToken123.signature',
    };
    mockGetSession.mockResolvedValue({
      session: { token: 'unsignedToken123' },
      user: { id: '1' },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe(
      'signedToken123.signature'
    );
  });

  it('Should fall back to session token when cookie is not present', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {};
    mockGetSession.mockResolvedValue({
      session: { token: 'unsignedToken123' },
      user: { id: '1' },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe('unsignedToken123');
  });

  it('Should extract session cookie when multiple cookies are present', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie:
        'some_cookie=foo; brokechef.session_token=mytoken123; another=bar',
    };
    mockGetSession.mockResolvedValue({
      session: { token: 'fallback' },
      user: { id: '1' },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe('mytoken123');
  });

  it('Should decode URL-encoded session token', async () => {
    const encodedToken = 'token%2Bwith%2Bplus%3Dand%2Fslash';
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {
      cookie: `brokechef.session_token=${encodedToken}`,
    };
    mockGetSession.mockResolvedValue({
      session: { token: 'fallback' },
      user: { id: '1' },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe(
      'token+with+plus=and/slash'
    );
  });

  it('Should preserve existing query parameters on the redirect URL', async () => {
    req.query = { redirect: 'brokechef://auth/callback?existing=param' };
    req.headers = {
      cookie: 'brokechef.session_token=mytoken',
    };
    mockGetSession.mockResolvedValue({
      session: { token: 'fallback' },
      user: { id: '1' },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('existing')).toBe('param');
    expect(url.searchParams.get('session_token')).toBe('mytoken');
  });

  it('Should redirect with error=session_error if getSession throws', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {};
    mockGetSession.mockRejectedValue(new Error('DB connection failed'));

    await mobileOAuthCallback(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith(
      'brokechef://auth/callback?error=session_error'
    );
  });

  it('Should handle empty cookie header with valid session', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = { cookie: '' };
    mockGetSession.mockResolvedValue({
      session: { token: 'sessionToken' },
      user: { id: '1' },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe('sessionToken');
  });
});
