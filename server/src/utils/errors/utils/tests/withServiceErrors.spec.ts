import { TRPCError } from '@trpc/server';
import RecipeNotFound from '../../recipes/RecipeNotFound';
import { withServiceErrors } from '../withServiceErrors';

describe('withServiceErrors', () => {
  it('Should throw a mapped TRPCError when a known error is thrown', async () => {
    const ErrorClass = new RecipeNotFound();

    await expect(
      withServiceErrors(() => {
        throw ErrorClass;
      })
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
        message: ErrorClass.message,
      })
    );
  });

  it('Should throw INTERNAL_SERVER_ERROR for unknown errors', async () => {
    await expect(
      withServiceErrors(() => {
        throw new Error('something broke');
      })
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      })
    );
  });

  it('Should throw a TRPCError instance', async () => {
    await expect(
      withServiceErrors(() => {
        throw new RecipeNotFound();
      })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it('Should return the result when the function succeeds', async () => {
    const result = await withServiceErrors(() => Promise.resolve('success'));

    expect(result).toBe('success');
  });
});
