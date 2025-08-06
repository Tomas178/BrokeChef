import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { savedRecipesService } from '../savedRecipesService';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';

const database = await wrapInRollbacks(createTestDatabase());
const service = savedRecipesService(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: user.id })
);

describe('remove', () => {
  it('Should create a new saved recipe', async () => {
    const [savedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
    );

    const unsavedRecipe = await service.remove(
      savedRecipe.recipeId,
      savedRecipe.userId
    );

    expect(unsavedRecipe).toEqual(savedRecipe);
  });

  it('Should throw an error that recipe does not exist', async () => {
    const nonExistantId = recipe.id + 1;

    await expect(service.remove(nonExistantId, user.id)).rejects.toThrow(
      /recipe.*not found|not found.*recipe/i
    );
  });

  it('Should throw an error that saved recipe with given data does not exist', async () => {
    const [savedRecipe] = await insertAll(
      database,
      'savedRecipes',
      fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
    );

    const nonExistantUserId = user.id + 'a';

    await expect(
      service.remove(savedRecipe.recipeId, nonExistantUserId)
    ).rejects.toThrow(/Failed/i);
  });
});
