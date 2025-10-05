import {
  fakeIngredient,
  fakeRecipe,
  fakeTool,
  fakeUser,
} from '@server/entities/tests/fakes';
import { clearTables, insertAll, selectAll } from '@tests/utils/record';
import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { toolsRepository as buildToolsRepository } from '@server/repositories/toolsRepository';
import { recipesToolsRepository as buildRecipesToolsRepository } from '@server/repositories/recipesToolsRepository';
import { ingredientsRepository as buildIngredientsRepository } from '@server/repositories/ingredientsRepository';
import { recipesIngredientsRepository as buildRecipesIngredientsRepository } from '@server/repositories/recipesIngredientsRepository';
import { insertIngredients, insertTools } from '../inserts';

const database = await wrapInRollbacks(createTestDatabase());

const toolsRepository = buildToolsRepository(database);
const recipesToolsRepository = buildRecipesToolsRepository(database);

const ingredientsRepository = buildIngredientsRepository(database);
const recipesIngredientsRepository =
  buildRecipesIngredientsRepository(database);

const [user] = await insertAll(database, 'users', [fakeUser()]);

beforeAll(
  async () =>
    await clearTables(database, [
      'recipes',
      'tools',
      'recipesTools',
      'ingredients',
      'recipesIngredients',
    ])
);

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

  it('Should handle insertion with single duplicate without throwing', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const [toolOne, toolTwo] = [fakeTool(), fakeTool()];

    const toolsWithDuplicates: string[] = [
      toolOne.name,
      toolTwo.name,
      toolOne.name, // duplicate
    ];

    await insertTools(
      createdRecipe.id,
      toolsWithDuplicates,
      toolsRepository,
      recipesToolsRepository
    );

    const toolsInDatabase = await selectAll(database, 'tools');

    expect(toolsInDatabase).toHaveLength(toolsWithDuplicates.length - 1);

    expect(toolsInDatabase[0]).toMatchObject({ name: toolOne.name });
    expect(toolsInDatabase[1]).toMatchObject({ name: toolTwo.name });
  });

  it('Should handle insertion with multiple duplicate without throwing', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const [toolOne, toolTwo] = [fakeTool(), fakeTool()];

    const toolsWithDuplicates: string[] = [
      toolOne.name,
      toolTwo.name,
      toolOne.name, // first duplicate
      toolTwo.name, // second duplicate
    ];

    await insertTools(
      createdRecipe.id,
      toolsWithDuplicates,
      toolsRepository,
      recipesToolsRepository
    );

    const toolsInDatabase = await selectAll(database, 'tools');

    expect(toolsInDatabase).toHaveLength(toolsWithDuplicates.length - 2);

    expect(toolsInDatabase[0]).toMatchObject({ name: toolOne.name });
    expect(toolsInDatabase[1]).toMatchObject({ name: toolTwo.name });
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

  it('Should handle insertion with single duplicate without throwing', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const [ingredientOne, ingredientTwo] = [fakeIngredient(), fakeIngredient()];

    const ingredientsWithDuplicates: string[] = [
      ingredientOne.name,
      ingredientTwo.name,
      ingredientOne.name, // duplicate
    ];

    await insertIngredients(
      createdRecipe.id,
      ingredientsWithDuplicates,
      ingredientsRepository,
      recipesIngredientsRepository
    );

    const ingredientsInDatabase = await selectAll(database, 'ingredients');

    expect(ingredientsInDatabase).toHaveLength(
      ingredientsWithDuplicates.length - 1
    );

    expect(ingredientsInDatabase[0]).toMatchObject({
      name: ingredientOne.name,
    });
    expect(ingredientsInDatabase[1]).toMatchObject({
      name: ingredientTwo.name,
    });
  });

  it('Should handle insertion with multiple duplicate without throwing', async () => {
    const [createdRecipe] = await insertAll(
      database,
      'recipes',
      fakeRecipe({ userId: user.id })
    );

    const [ingredientOne, ingredientTwo] = [fakeIngredient(), fakeIngredient()];

    const ingredientsWithDuplicates: string[] = [
      ingredientOne.name,
      ingredientTwo.name,
      ingredientOne.name, // first duplicate
      ingredientTwo.name, // second duplicate
    ];

    await insertIngredients(
      createdRecipe.id,
      ingredientsWithDuplicates,
      ingredientsRepository,
      recipesIngredientsRepository
    );

    const ingredientsInDatabase = await selectAll(database, 'ingredients');

    expect(ingredientsInDatabase).toHaveLength(
      ingredientsWithDuplicates.length - 2
    );

    expect(ingredientsInDatabase[0]).toMatchObject({
      name: ingredientOne.name,
    });
    expect(ingredientsInDatabase[1]).toMatchObject({
      name: ingredientTwo.name,
    });
  });
});
