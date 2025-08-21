import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
import {
  fakeUser,
  fakeCreateRecipeData,
  fakeRecipe,
  fakeTool,
  fakeIngredient,
} from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import { ingredientsRepository as buildIngredientsRepository } from '@server/repositories/ingredientsRepository';
import { recipesIngredientsRepository as buildRecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import { toolsRepository as buildToolsRepository } from '@server/repositories/toolsRepository';
import { recipesToolsRepository as buildRecipesToolsRepository } from '@server/repositories/recipesToolsRepository';
import { joinStepsToSingleString } from '../utils/joinStepsToSingleString';
import {
  recipesService,
  insertIngredients,
  insertTools,
} from '../recipesService';

const database = await wrapInRollbacks(createTestDatabase());
const service = recipesService(database);

const ingredientsRepository = buildIngredientsRepository(database);
const recipesIngredientsRepository =
  buildRecipesIngredientsRepository(database);
const toolsRepository = buildToolsRepository(database);
const recipesToolsRepository = buildRecipesToolsRepository(database);

const [user] = await insertAll(database, 'users', [fakeUser()]);

beforeEach(
  async () => await clearTables(database, ['recipes', 'ingredients', 'tools'])
);

describe('createRecipe', () => {
  it('Should create a new recipe', async () => {
    const recipeData = fakeCreateRecipeData();

    const stepsInASingleString = joinStepsToSingleString(recipeData.steps);

    const createdRecipe = await service.createRecipe(recipeData, user.id);

    expect(createdRecipe).toMatchObject({
      id: expect.any(Number),
      ...pick(recipeData, recipesKeysPublic),
      steps: stepsInASingleString,
      author: pick(user, usersKeysPublicWithoutId),
    });
  });

  it('Should throw an error if user is not found', async () => {
    const recipeData = fakeCreateRecipeData();
    const nonExistantUserId = user.id + 'a';

    await expect(
      service.createRecipe(recipeData, nonExistantUserId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should rollback if an error occurs', async () => {
    const recipeData = fakeCreateRecipeData();
    recipeData.ingredients.push('');

    await expect(service.createRecipe(recipeData, user.id)).rejects.toThrow();

    await expect(selectAll(database, 'recipes')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'ingredients')).resolves.toHaveLength(0);
    await expect(selectAll(database, 'tools')).resolves.toHaveLength(0);
  });
});

describe('insertTools', () => {
  it('Should not add any tools when given empty array', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const tools: string[] = [];

    await insertTools(
      createdRecipe.id,
      tools,
      toolsRepository,
      recipesToolsRepository
    );

    await expect(selectAll(database, 'tools')).resolves.toHaveLength(0);
  });

  it('Should add tools', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const tools = ['toolOne', 'toolTwo'];

    await insertTools(
      createdRecipe.id,
      tools,
      toolsRepository,
      recipesToolsRepository
    );

    await expect(selectAll(database, 'tools')).resolves.toHaveLength(
      tools.length
    );
  });

  it('Should not add tools that are already in the database', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const tools = [fakeTool(), fakeTool()];

    const [insertedToolOne, insertedToolTwo] = await insertAll(
      database,
      'tools',
      tools
    );

    const existingTools = [insertedToolOne.name, insertedToolTwo.name];

    await insertTools(
      createdRecipe.id,
      existingTools,
      toolsRepository,
      recipesToolsRepository
    );

    const toolsInDatabase = await selectAll(database, 'tools');

    expect(toolsInDatabase).toHaveLength(tools.length);
    expect(toolsInDatabase).toEqual([insertedToolOne, insertedToolTwo]);
  });
});

describe('insertIngredients', () => {
  it('Should not add any ingredients when given empty array', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const ingredients: string[] = [];

    await insertIngredients(
      createdRecipe.id,
      ingredients,
      ingredientsRepository,
      recipesIngredientsRepository
    );

    await expect(selectAll(database, 'ingredients')).resolves.toHaveLength(0);
  });

  it('Should add ingredients', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const ingredients = ['ingredientOne', 'ingredientTwo'];

    await insertIngredients(
      createdRecipe.id,
      ingredients,
      ingredientsRepository,
      recipesIngredientsRepository
    );

    await expect(selectAll(database, 'ingredients')).resolves.toHaveLength(
      ingredients.length
    );
  });

  it('Should not add ingredients that are already in the database', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const ingredients = [fakeIngredient(), fakeIngredient()];

    const [insertedIngredientOne, insertedIngredientTwo] = await insertAll(
      database,
      'ingredients',
      ingredients
    );

    const existingIngredients = [
      insertedIngredientOne.name,
      insertedIngredientTwo.name,
    ];

    await insertIngredients(
      createdRecipe.id,
      existingIngredients,
      ingredientsRepository,
      recipesIngredientsRepository
    );

    const ingredientsInDatabase = await selectAll(database, 'ingredients');

    expect(ingredientsInDatabase).toHaveLength(ingredients.length);
    expect(ingredientsInDatabase).toEqual([
      insertedIngredientOne,
      insertedIngredientTwo,
    ]);
  });
});
