import jsonErrors from '@server/middleware/jsonErrors';
import type { $ZodStringDef } from 'better-auth';
import { StatusCodes } from 'http-status-codes';
import { ZodString } from 'zod';

describe('jsonErrors middleware', () => {
  let res: any;
  let next: any;

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('Should respond with error.status if present', () => {
    const statusCode = 401;
    const errorMessage = 'error';

    const error = { message: errorMessage, status: statusCode };
    jsonErrors(error as any, {} as any, res, next);

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: errorMessage,
      },
    });
  });

  it('Should respond with 400 for ZodError', () => {
    const zodError = new ZodString({} as $ZodStringDef)
      .min(5)
      .safeParse('abc').error!;
    jsonErrors(zodError, {} as any, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: zodError.message,
      }),
    });
  });

  it('Should respond with 500 for generic errors', () => {
    const error = new Error('Something went wrong');
    jsonErrors(error, {} as any, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Something went wrong',
      }),
    });
  });
});
