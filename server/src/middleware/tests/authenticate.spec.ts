import type { NextFunction, Request, Response } from 'express';
import Unauthenticated from '@server/utils/errors/general/Unauthenticated';
import { authenticate } from '../authenticate';

const [mockGetSession, mockLoggerError] = vi.hoisted(() => [vi.fn(), vi.fn()]);

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

vi.mock('@server/logger', () => ({
  default: {
    error: mockLoggerError,
  },
}));

describe('authenticate middleware', () => {
  let request: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    request = { headers: {} };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('Should attach user and call next when session exists via cookie', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '123' } });

    await authenticate(request as Request, res as Response, next);

    expect(request.user).toEqual({ id: '123' });
    expect(next).toHaveBeenCalled();
  });

  it('Should attach user and call next when session exists via Bearer token', async () => {
    request.headers = { authorization: 'Bearer mytoken123' };
    mockGetSession.mockResolvedValue({ user: { id: '456' } });

    await authenticate(request as Request, res as Response, next);

    expect(request.user).toEqual({ id: '456' });
    expect(next).toHaveBeenCalled();
    expect(mockGetSession).toHaveBeenCalledWith({
      headers: new Headers({
        cookie: 'brokechef.session_token=mytoken123',
      }),
    });
  });

  it('Should construct cookie header from Bearer token', async () => {
    request.headers = { authorization: 'Bearer abc123' };
    mockGetSession.mockResolvedValue({ user: { id: '1' } });

    await authenticate(request as Request, res as Response, next);

    const calledHeaders = mockGetSession.mock.calls[0][0].headers;
    expect(calledHeaders.get('cookie')).toBe('brokechef.session_token=abc123');
  });

  it('Should throw Unauthenticated if session is null', async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(
      authenticate(request as Request, res as Response, next)
    ).rejects.toThrowError(Unauthenticated);

    expect(mockLoggerError).toHaveBeenCalledWith('Unauthenticated request');
    expect(next).not.toHaveBeenCalled();
  });

  it('Should throw Unauthenticated if getSession throws', async () => {
    mockGetSession.mockRejectedValue(new Error('fail'));

    await expect(
      authenticate(request as Request, res as Response, next)
    ).rejects.toThrowError(Unauthenticated);

    expect(mockLoggerError).toHaveBeenCalledWith('Unauthenticated request');
    expect(next).not.toHaveBeenCalled();
  });

  it('Should throw Unauthenticated when Bearer token is invalid', async () => {
    request.headers = { authorization: 'Bearer invalidtoken' };
    mockGetSession.mockResolvedValue(null);

    await expect(
      authenticate(request as Request, res as Response, next)
    ).rejects.toThrowError(Unauthenticated);

    expect(next).not.toHaveBeenCalled();
  });

  it('Should use fromNodeHeaders for non-Bearer auth', async () => {
    request.headers = {
      cookie: 'brokechef.session_token=signedtoken.signature',
    };
    mockGetSession.mockResolvedValue({ user: { id: '789' } });

    await authenticate(request as Request, res as Response, next);

    expect(request.user).toEqual({ id: '789' });
    expect(next).toHaveBeenCalled();
  });
});
