import { fakeUser } from '@server/entities/tests/fakes';
import { authContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { createCallerFactory, router } from '..';
import { recipeAuthorProcedure } from '.';

const routes = router({
  testCall: recipeAuthorProcedure.query(() => 'passed'),
});

const mockIsAuthor = vi.fn();

const mockRecipesRepo: Partial<RecipesRepository> = {
  isAuthor: mockIsAuthor,
};

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepo,
}));

const database = {} as Database;

const userOne = fakeUser();
const recipeId = 123;

const createCaller = createCallerFactory(routes);
const authenticated = createCaller(authContext({ database }, userOne));

it('Should pass if recipe belongs to the user', async () => {
  mockIsAuthor.mockResolvedValueOnce(true);
  const response = await authenticated.testCall({ id: recipeId });

  expect(response).toEqual('passed');
});

it('Should throw an error if recipeId is not provided', async () => {
  await expect((authenticated.testCall as any)({})).rejects.toThrow(/id/i);
});

it('Should throw an error if user provides a non-existing recipeId', async () => {
  await expect(authenticated.testCall({ id: recipeId })).rejects.toThrow(
    /recipe/i
  );
});

it('Should throw an error if user provides undefined recipeId', async () => {
  await expect(
    (authenticated.testCall as any)({ recipeId: undefined })
  ).rejects.toThrow(/id/i);
});

it('Should throw an error if recipe does not belong to the user', async () => {
  mockIsAuthor.mockResolvedValueOnce(false);

  await expect(authenticated.testCall({ id: recipeId + 1 })).rejects.toThrow(
    /recipe/i
  );
});
