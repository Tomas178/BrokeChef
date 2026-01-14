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

  it('Should attach user and call next when session exists', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '123' } });

    await authenticate(request as Request, res as Response, next);

    expect(request.user).toEqual({ id: '123' });
    expect(next).toHaveBeenCalled();
  });

  it('Should throw Unauthenticated if session is null', async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(
      authenticate(request as Request, res as Response, next)
    ).rejects.toThrowError(Unauthenticated);

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Unauthenticated user tried to upload image'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('Should throw Unauthenticated if getSession throws', async () => {
    mockGetSession.mockRejectedValue(new Error('fail'));

    await expect(
      authenticate(request as Request, res as Response, next)
    ).rejects.toThrowError(Unauthenticated);

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Unauthenticated user tried to upload image'
    );
    expect(next).not.toHaveBeenCalled();
  });
});
