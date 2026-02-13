import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { TRPCError } from '@trpc/server';
import { handleServiceErrors } from '../handleServiceErrors';

describe('handleServiceErrors', () => {
  it('Should throw the custom class as TRPCError when it occured', () => {
    const ErrorClass = new RecipeNotFound();

    expect(() => handleServiceErrors(ErrorClass)).toThrowError(TRPCError);
  });

  it('Should throw the custom class as TRPCError with the custom class message', () => {
    const ErrorClass = new RecipeNotFound();

    expect(() => handleServiceErrors(ErrorClass)).toThrow(ErrorClass.message);
  });

  it('Should throw INTERNAL_SERVER_ERROR for any other error that is not defined specifically', () => {
    expect(() => handleServiceErrors(new Error('Something happened'))).toThrow(
      /unexpected/i
    );
  });
});
