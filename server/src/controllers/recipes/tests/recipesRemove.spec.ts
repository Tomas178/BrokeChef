import { createCallerFactory } from '@server/trpc';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { usersKeysPublic } from '@server/entities/users';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);

const authUser = {
  id: 'a'.repeat(32),
};

const repos = {
  recipesRepository: {
    isAuthor: vi.fn(async (): Promise<boolean> => true),
    remove: vi.fn(async (id: number) =>
      fakeRecipe({
        id,
        userId: authUser.id,
        author: pick(fakeUser({ id: authUser.id + 1 }), usersKeysPublic),
      })
    ),
  } satisfies Partial<RecipesRepository>,
};

const { remove } = createCaller({ repos, authUser } as any);

const recipeId = 26;

it('Should remove a recipe', async () => {
  const removedRecipe = await remove(recipeId);

  expect(removedRecipe).toBeUndefined();
});

it('Should throw an error if recipe does not exist', async () => {
  repos.recipesRepository.remove.mockRejectedValueOnce(new RecipeNotFound(1));

  await expect(remove(recipeId)).rejects.toThrow(
    /recipe.*not found|not found.*recipe/i
  );
});

it('Should throw an error if user is not an owner of recipe', async () => {
  repos.recipesRepository.isAuthor.mockResolvedValueOnce(false);

  await expect(remove(recipeId)).rejects.toThrow(/recipe/i);
});
