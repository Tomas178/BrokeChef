import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { usersService } from '../usersService';
import { clearTables, insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { initialPage } from '@tests/utils/constants';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublic } from '@server/entities/users';

const database = await wrapInRollbacks(createTestDatabase());
const service = usersService(database);

await clearTables(database, ['recipes', 'savedRecipes']);

const [user] = await insertAll(database, 'users', fakeUser());

const [createdRecipeOne, createdRecipeTwo] = await insertAll(
  database,
  'recipes',
  [fakeRecipe({ userId: user.id }), fakeRecipe({ userId: user.id })]
);

describe('getUsersRecipes', () => {
  it('Should return created and saved recipes by user', async () => {
    await insertAll(database, 'savedRecipes', [
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeOne.id }),
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeTwo.id }),
    ]);

    const { saved, created } = await service.getUsersRecipes(
      user.id,
      initialPage
    );

    const [createdNew, createdOld] = created;
    const [savedNew, savedOld] = saved;

    // Check created recipes ordered descendingly by id
    expect(createdOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublic),
    });

    expect(createdNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublic),
    });

    // Check saved recipes ordered descendingly by id
    expect(savedOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublic),
    });

    expect(savedNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublic),
    });
  });
});
