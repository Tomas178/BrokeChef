import { TRPCError } from '@trpc/server';
import RecipeNotFound from '../../recipes/RecipeNotFound';
import { withServiceErrors } from '../withServiceErrors';
import type { ErrorOverride } from '../handleServiceErrors';

class ExternalLibraryError extends Error {
  constructor(detail: string) {
    super(`External: ${detail}`);
  }
}

describe('withServiceErrors', () => {
  it('Should throw a mapped TRPCError when a known error is thrown', async () => {
    const error = new RecipeNotFound();

    await expect(
      withServiceErrors(() => {
        throw error;
      })
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
        message: error.message,
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

  it('Should use override when error matches an override entry', async () => {
    const overrides: ErrorOverride[] = [
      {
        errorClass: ExternalLibraryError,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Custom override message',
      },
    ];

    await expect(
      withServiceErrors(() => {
        throw new ExternalLibraryError('something');
      }, overrides)
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Custom override message',
      })
    );
  });

  it('Should prioritize overrides over the default error map', async () => {
    const overrides: ErrorOverride[] = [
      {
        errorClass: RecipeNotFound,
        code: 'BAD_REQUEST',
        message: 'Overridden message',
      },
    ];

    await expect(
      withServiceErrors(() => {
        throw new RecipeNotFound();
      }, overrides)
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'Overridden message',
      })
    );
  });

  it('Should fall through to default error map when no override matches', async () => {
    const overrides: ErrorOverride[] = [
      {
        errorClass: ExternalLibraryError,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Not relevant',
      },
    ];

    const error = new RecipeNotFound();

    await expect(
      withServiceErrors(() => {
        throw error;
      }, overrides)
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
        message: error.message,
      })
    );
  });
});
