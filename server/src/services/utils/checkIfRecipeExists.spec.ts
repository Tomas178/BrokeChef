import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import type { RecipesPublic } from '@server/entities/recipes';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import { pick } from 'lodash-es';
import { checkIfRecipeExists } from './checkIfRecipeExists';

const authUser = {
  id: 'a'.repeat(32),
};

const mockFindById = vi.fn(
  async (id): Promise<RecipesPublic | undefined> =>
    fakeRecipe({
      id,
      author: pick(fakeUser({ id: authUser.id + 1 }), usersKeysPublicWithoutId),
    })
);

const mockRecipeRepository = {
  findById: mockFindById,
} as unknown as RecipesRepository;

it('Should return true when recipe is found', async () => {
  await expect(
    checkIfRecipeExists(mockRecipeRepository, 1)
  ).resolves.toBeTruthy();
});

it('Should return false when recipe is not found', async () => {
  mockFindById.mockResolvedValueOnce(undefined);

  await expect(
    checkIfRecipeExists(mockRecipeRepository, 1)
  ).resolves.toBeFalsy();
});
