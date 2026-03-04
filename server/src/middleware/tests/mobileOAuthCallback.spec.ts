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

  it('Should redirect with session token and user data when session exists', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {};
    mockGetSession.mockResolvedValue({
      session: { token: 'abc123token' },
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@test.com',
        image: 'https://example.com/avatar.jpg',
      },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe('abc123token');
    expect(url.searchParams.get('user_id')).toBe('user-1');
    expect(url.searchParams.get('user_name')).toBe('Test User');
    expect(url.searchParams.get('user_email')).toBe('test@test.com');
    expect(url.searchParams.get('user_image')).toBe(
      'https://example.com/avatar.jpg'
    );
  });

  it('Should omit user_image when not present', async () => {
    req.query = { redirect: 'brokechef://auth/callback' };
    req.headers = {};
    mockGetSession.mockResolvedValue({
      session: { token: 'abc123token' },
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@test.com',
        image: null,
      },
    });

    await mobileOAuthCallback(req as Request, res as Response, next);

    const redirectUrl = (res.redirect as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    const url = new URL(redirectUrl);
    expect(url.searchParams.get('session_token')).toBe('abc123token');
    expect(url.searchParams.get('user_id')).toBe('user-1');
    expect(url.searchParams.has('user_image')).toBe(false);
  });

  it('Should preserve existing query parameters on the redirect URL', async () => {
    req.query = { redirect: 'brokechef://auth/callback?existing=param' };
    req.headers = {};
    mockGetSession.mockResolvedValue({
      session: { token: 'mytoken' },
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@test.com',
        image: null,
      },
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
});
