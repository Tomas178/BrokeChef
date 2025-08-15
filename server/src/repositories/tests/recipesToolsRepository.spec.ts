import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeRecipeToolLinkData,
  fakeTool,
  fakeUser,
} from '@server/entities/tests/fakes';
import { recipesToolsRepository } from '../recipesToolsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = recipesToolsRepository(database);

const [user] = await insertAll(database, 'users', [fakeUser()]);
const [recipe] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: user.id }),
]);
const [toolOne, toolTwo] = await insertAll(database, 'tools', [
  fakeTool(),
  fakeTool(),
]);

describe('create', () => {
  it('Should create a new single link', async () => {
    const newLink = [
      fakeRecipeToolLinkData({
        recipeId: recipe.id,
        toolId: toolOne.id,
      }),
    ];

    const createdLink = await repository.create(newLink);

    expect(createdLink).toEqual(newLink);
  });

  it('Should create new multiple links', async () => {
    const newLinks = [
      fakeRecipeToolLinkData({
        recipeId: recipe.id,
        toolId: toolOne.id,
      }),
      fakeRecipeToolLinkData({
        recipeId: recipe.id,
        toolId: toolTwo.id,
      }),
    ];

    const createdLinks = await repository.create(newLinks);

    expect(createdLinks).toEqual(newLinks);
  });
});

describe('findByToolId', () => {
  it('Should return undefined by given recipe ID', async () => {
    const linkByRecipeId = await repository.findByRecipeId(recipe.id + 1);

    expect(linkByRecipeId).toBeUndefined();
  });

  it('Should return a link', async () => {
    await insertAll(database, 'recipesTools', [
      { recipeId: recipe.id, toolId: toolOne.id },
    ]);

    const linkByRecipeId = await repository.findByRecipeId(recipe.id);

    expect(linkByRecipeId).toEqual({
      recipeId: recipe.id,
      toolId: toolOne.id,
    });
  });
});
