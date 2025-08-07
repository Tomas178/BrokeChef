import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import { fakeUser, fakeCreateRecipeData } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublic } from '@server/entities/users';
import { recipesService } from '../recipesService';
import { joinStepsToSingleString } from '../utils/joinStepsToSingleString';

const database = await wrapInRollbacks(createTestDatabase());
const service = recipesService(database);

const [user] = await insertAll(database, 'users', [fakeUser()]);

describe('createRecipe', () => {
  it('Should create a new recipe', async () => {
    const recipeData = fakeCreateRecipeData();

    const stepsInASingleString = joinStepsToSingleString(recipeData.steps);

    const createdRecipe = await service.createRecipe(recipeData, user.id);

    expect(createdRecipe).toMatchObject({
      id: expect.any(Number),
      ...pick(recipeData, recipesKeysPublic),
      steps: stepsInASingleString,
      author: pick(user, usersKeysPublic),
    });
  });

  it('Should throw an error if recipe with invalid data is given', async () => {
    const invalidRecipeData = fakeCreateRecipeData({ title: undefined });

    await expect(
      service.createRecipe(invalidRecipeData, user.id)
    ).rejects.toThrow(/recipe/i);
  });
});
