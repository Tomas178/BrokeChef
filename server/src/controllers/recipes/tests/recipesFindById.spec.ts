import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import {
  fakeIngredient,
  fakeRecipe,
  fakeTool,
  fakeUser,
} from '@server/entities/tests/fakes';
import { joinStepsToArray } from '@server/repositories/utils/joinStepsToArray';
import recipesRouter from '..';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => fakeImageUrl),
}));

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user, userOther] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
  fakeRecipe({ userId: user.id, imageUrl: fakeImageUrl }),
  fakeRecipe({ userId: userOther.id, imageUrl: fakeImageUrl }),
]);

const [ingredientOne, ingredientTwo] = await insertAll(
  database,
  'ingredients',
  [fakeIngredient(), fakeIngredient()]
);

const [toolOne, toolTwo] = await insertAll(database, 'tools', [
  fakeTool(),
  fakeTool(),
]);

await insertAll(database, 'recipesIngredients', [
  {
    recipeId: recipeOne.id,
    ingredientId: ingredientOne.id,
  },
  {
    recipeId: recipeOne.id,
    ingredientId: ingredientTwo.id,
  },
]);

await insertAll(database, 'recipesTools', [
  {
    recipeId: recipeOne.id,
    toolId: toolOne.id,
  },
  {
    recipeId: recipeOne.id,
    toolId: toolTwo.id,
  },
]);

const { findById } = createCaller({ db: database });

it('Should return a recipe', async () => {
  const recipeResponse = await findById(recipeOne.id);

  expect(recipeResponse).toMatchObject({
    ...recipeOne,
    steps: joinStepsToArray(recipeOne.steps),
    ingredients: [ingredientOne.name, ingredientTwo.name],
    tools: [toolOne.name, toolTwo.name],
  });
});

it('Should throw an error if the recipe does not exist', async () => {
  const nonExistantId = recipeOne.id + recipeTwo.id;

  await expect(findById(nonExistantId)).rejects.toThrow(/not found/i);
});
