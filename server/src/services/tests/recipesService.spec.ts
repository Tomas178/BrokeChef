import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
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
    const invalidRecipeData = fakeCreateRecipeData();
    const nonExistantUserId = user.id + 'a';

    await expect(
      service.createRecipe(invalidRecipeData, nonExistantUserId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should rollback if an error occurs', async () => {
    await clearTables(database, ['recipes', 'ingredients', 'tools']);

    const recipeData = fakeCreateRecipeData();
    recipeData.ingredients.push('');

    await expect(service.createRecipe(recipeData, user.id)).rejects.toThrow();

    await expect(selectAll(database, 'recipes')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'ingredients')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'tools')).resolves.toHaveLength(0);
  });
});
