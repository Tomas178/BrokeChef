import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { recipesService } from '../recipesService';
import { insertAll } from '@tests/utils/record';
import { fakeUser } from '@server/entities/tests/fakes';
import { fakeCreateRecipeData } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublic } from '@server/entities/users';
import joinStepsToSingleString from '../utils/joinStepsToSingleString';

const db = await wrapInRollbacks(createTestDatabase());
const service = recipesService(db);

const [user] = await insertAll(db, 'users', [fakeUser()]);

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
});
