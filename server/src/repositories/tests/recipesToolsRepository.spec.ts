import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { recipesToolsRepository } from '../recipesToolsRepository';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeTool, fakeUser } from '@server/entities/tests/fakes';

const db = await wrapInRollbacks(createTestDatabase());
const repository = recipesToolsRepository(db);

const [user] = await insertAll(db, 'users', [fakeUser()]);
const [recipe] = await insertAll(db, 'recipes', [
  fakeRecipe({ userId: user.id }),
]);
const [tool] = await insertAll(db, 'tools', [fakeTool()]);

describe('create', () => {
  it('Should create a new link in recipesTools table', async () => {
    const createdLink = await repository.create({
      recipeId: recipe.id,
      toolId: tool.id,
    });

    expect(createdLink).toEqual({
      recipeId: recipe.id,
      toolId: tool.id,
    });
  });
});

describe('findByToolId', () => {
  it('Should return undefined by given recipe ID', async () => {
    const linkByRecipeId = await repository.findByRecipeId(recipe.id + 1);

    expect(linkByRecipeId).toBeUndefined();
  });

  it('Should return a link', async () => {
    await insertAll(db, 'recipesTools', [
      { recipeId: recipe.id, toolId: tool.id },
    ]);

    const linkByRecipeId = await repository.findByRecipeId(recipe.id);

    expect(linkByRecipeId).toEqual({
      recipeId: recipe.id,
      toolId: tool.id,
    });
  });
});
