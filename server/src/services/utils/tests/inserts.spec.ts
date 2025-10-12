import { fakeFullIngredient, fakeFullTool } from '@server/entities/tests/fakes';
import type { IngredientsRepository } from '@server/repositories/ingredientsRepository';
import type { ToolsRepository } from '@server/repositories/toolsRepository';
import type {
  RecipesIngredientsLink,
  RecipesIngredientsRepository,
} from '@server/repositories/recipesIngredientsRepository';
import type {
  RecipesToolsLink,
  RecipesToolsRepository,
} from '@server/repositories/recipesToolsRepository';
import type { ToolsName } from '@server/entities/tools';
import type { IngredientsName } from '@server/entities/ingredients';
import { insertIngredients, insertTools } from '../inserts';

const mockIngredientsRepoFindByNames = vi.fn();
const mockIngredientsRepoCreate = vi.fn();

const mockIngredientsRepository = {
  findByNames: mockIngredientsRepoFindByNames,
  create: mockIngredientsRepoCreate,
} as unknown as IngredientsRepository;

vi.mock('@server/repositories/ingredientsRepository', () => ({
  ingredientsRepository: () => mockIngredientsRepository,
}));

const mockRecipesIngredientsRepoCreate = vi.fn();

const mockRecipesIngredientsRepository = {
  create: mockRecipesIngredientsRepoCreate,
} as unknown as RecipesIngredientsRepository;

vi.mock('@server/repositories/recipesIngredientsRepository', () => ({
  recipesIngredientsRepository: () => mockRecipesIngredientsRepository,
}));

const mockToolsRepoFindByNames = vi.fn();
const mockToolsRepoCreate = vi.fn();

const mockToolsRepository = {
  findByNames: mockToolsRepoFindByNames,
  create: mockToolsRepoCreate,
} as unknown as ToolsRepository;

vi.mock('@server/repositories/toolsRepository', () => ({
  toolsRepository: () => mockToolsRepository,
}));

const mockRecipesToolsRepoCreate = vi.fn();

const mockRecipesToolsRepository = {
  create: mockRecipesToolsRepoCreate,
} as unknown as RecipesToolsRepository;

vi.mock('@server/repositories/recipesToolsRepository', () => ({
  recipesToolsRepository: () => mockRecipesToolsRepository,
}));

const recipeId = 123;

beforeEach(() => vi.resetAllMocks());

describe('insertTools', () => {
  it('Should not add any tools when given empty array', async () => {
    const tools: ToolsName[] = [];

    await insertTools(
      recipeId,
      tools,
      mockToolsRepository,
      mockRecipesToolsRepository
    );

    expect(mockToolsRepoFindByNames).not.toHaveBeenCalled();
  });

  it('Should add all tools when there are no duplicates and no existing ones', async () => {
    const tools = [
      fakeFullTool({ name: 'toolOne' }),
      fakeFullTool({ name: 'toolTwo' }),
    ];
    const toolsNames: ToolsName[] = tools.map(tool => tool.name);
    const toolsNamesAsObjects = toolsNames.map(name => ({ name }));
    const recipesToolsLinks: RecipesToolsLink[] = tools.map(tool => ({
      toolId: tool.id,
      recipeId,
    }));

    mockToolsRepoFindByNames.mockResolvedValueOnce([]);
    mockToolsRepoCreate.mockResolvedValueOnce(tools);

    await insertTools(
      recipeId,
      toolsNames,
      mockToolsRepository,
      mockRecipesToolsRepository
    );

    expect(mockToolsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockToolsRepoFindByNames).toHaveBeenCalledWith(toolsNames);

    expect(mockToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockToolsRepoCreate).toHaveBeenCalledWith(toolsNamesAsObjects);

    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledWith(recipesToolsLinks);
  });

  it('Should not add tools that are already in the database', async () => {
    const tools = [
      fakeFullTool({ name: 'toolOne' }),
      fakeFullTool({ name: 'toolTwo' }),
      fakeFullTool({ name: 'toolThree' }),
    ];

    const toolsNames: ToolsName[] = tools.map(tool => tool.name);
    const recipesToolsLinks: RecipesToolsLink[] = tools.map(tool => ({
      toolId: tool.id,
      recipeId,
    }));

    const existingTool = tools.pop();
    toolsNames.pop();

    const toolsNamesAsObjects = toolsNames.map(name => ({ name }));

    mockToolsRepoFindByNames.mockResolvedValueOnce([existingTool]);
    mockToolsRepoCreate.mockResolvedValueOnce(tools);

    await insertTools(
      recipeId,
      toolsNames,
      mockToolsRepository,
      mockRecipesToolsRepository
    );

    expect(mockToolsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockToolsRepoFindByNames).toHaveBeenCalledWith(toolsNames);

    expect(mockToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockToolsRepoCreate).toHaveBeenCalledWith(toolsNamesAsObjects);

    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledWith(recipesToolsLinks);
  });

  it('Should handle insertion with single duplicate without throwing', async () => {
    const tools = [
      fakeFullTool({ name: 'toolOne' }),
      fakeFullTool({ name: 'toolTwo' }),
      fakeFullTool({ name: 'toolTwo' }),
    ];

    const toolsNames: ToolsName[] = tools.map(tool => tool.name);

    mockToolsRepoFindByNames.mockResolvedValueOnce([]);
    mockToolsRepoCreate.mockResolvedValueOnce(tools);

    await insertTools(
      recipeId,
      toolsNames,
      mockToolsRepository,
      mockRecipesToolsRepository
    );

    toolsNames.pop();

    const toolsNamesAsObjects = toolsNames.map(name => ({ name }));
    const recipesToolsLinks: RecipesToolsLink[] = tools.map(tool => ({
      toolId: tool.id,
      recipeId,
    }));

    expect(mockToolsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockToolsRepoFindByNames).toHaveBeenCalledWith(toolsNames);

    expect(mockToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockToolsRepoCreate).toHaveBeenCalledWith(toolsNamesAsObjects);

    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledWith(recipesToolsLinks);
  });

  it('Should handle insertion with multiple duplicate without throwing', async () => {
    const tools = [
      fakeFullTool({ name: 'toolOne' }),
      fakeFullTool({ name: 'toolTwo' }),
      fakeFullTool({ name: 'toolOne' }),
      fakeFullTool({ name: 'toolTwo' }),
    ];

    const toolsNames: ToolsName[] = tools.map(tool => tool.name);

    mockToolsRepoFindByNames.mockResolvedValueOnce([]);
    mockToolsRepoCreate.mockResolvedValueOnce(tools);

    await insertTools(
      recipeId,
      toolsNames,
      mockToolsRepository,
      mockRecipesToolsRepository
    );

    toolsNames.pop();
    toolsNames.pop();

    const toolsNamesAsObjects = toolsNames.map(name => ({ name }));
    const recipesToolsLinks: RecipesToolsLink[] = tools.map(tool => ({
      toolId: tool.id,
      recipeId,
    }));

    expect(mockToolsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockToolsRepoFindByNames).toHaveBeenCalledWith(toolsNames);

    expect(mockToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockToolsRepoCreate).toHaveBeenCalledWith(toolsNamesAsObjects);

    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesToolsRepoCreate).toHaveBeenCalledWith(recipesToolsLinks);
  });
});

describe('insertIngredients', () => {
  it('Should not add any ingredients when given empty array', async () => {
    const ingredients: IngredientsName[] = [];

    await insertIngredients(
      recipeId,
      ingredients,
      mockToolsRepository,
      mockRecipesIngredientsRepository
    );

    expect(mockIngredientsRepoFindByNames).not.toHaveBeenCalled();
  });

  it('Should add all ingredients when there are no duplicates and no existing ones', async () => {
    const ingredients = [
      fakeFullIngredient({ name: 'ingredientOne' }),
      fakeFullIngredient({ name: 'ingredientTwo' }),
    ];
    const ingredientsNames: IngredientsName[] = ingredients.map(
      ingredient => ingredient.name
    );
    const ingredientsNamesAsObjects = ingredientsNames.map(name => ({ name }));
    const recipesToolsLinks: RecipesIngredientsLink[] = ingredients.map(
      ingredient => ({
        ingredientId: ingredient.id,
        recipeId,
      })
    );

    mockIngredientsRepoFindByNames.mockResolvedValueOnce([]);
    mockIngredientsRepoCreate.mockResolvedValueOnce(ingredients);

    await insertIngredients(
      recipeId,
      ingredientsNames,
      mockIngredientsRepository,
      mockRecipesIngredientsRepository
    );

    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledWith(
      ingredientsNames
    );

    expect(mockIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoCreate).toHaveBeenCalledWith(
      ingredientsNamesAsObjects
    );

    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledWith(
      recipesToolsLinks
    );
  });

  it('Should not add ingredients that are already in the database', async () => {
    const ingredients = [
      fakeFullIngredient({ name: 'ingredientOne' }),
      fakeFullIngredient({ name: 'ingredientTwo' }),
      fakeFullIngredient({ name: 'ingredientThree' }),
    ];

    const ingredientsNames: IngredientsName[] = ingredients.map(
      ingredient => ingredient.name
    );
    const recipesIngredientsLinks: RecipesIngredientsLink[] = ingredients.map(
      ingredient => ({
        ingredientId: ingredient.id,
        recipeId,
      })
    );

    const existingIngredient = ingredients.pop();
    ingredientsNames.pop();

    const ingredientsNamesAsObjects = ingredientsNames.map(name => ({ name }));

    mockIngredientsRepoFindByNames.mockResolvedValueOnce([existingIngredient]);
    mockIngredientsRepoCreate.mockResolvedValueOnce(ingredients);

    await insertIngredients(
      recipeId,
      ingredientsNames,
      mockIngredientsRepository,
      mockRecipesIngredientsRepository
    );

    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledWith(
      ingredientsNames
    );

    expect(mockIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoCreate).toHaveBeenCalledWith(
      ingredientsNamesAsObjects
    );

    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledWith(
      recipesIngredientsLinks
    );
  });

  it('Should handle insertion with single duplicate without throwing', async () => {
    const ingredients = [
      fakeFullIngredient({ name: 'ingredientOne' }),
      fakeFullIngredient({ name: 'ingredientTwo' }),
      fakeFullIngredient({ name: 'ingredientOne' }),
      fakeFullIngredient({ name: 'ingredientTwo' }),
    ];

    const ingredientsNames: IngredientsName[] = ingredients.map(
      ingredient => ingredient.name
    );

    mockIngredientsRepoFindByNames.mockResolvedValueOnce([]);
    mockIngredientsRepoCreate.mockResolvedValueOnce(ingredients);

    await insertIngredients(
      recipeId,
      ingredientsNames,
      mockIngredientsRepository,
      mockRecipesIngredientsRepository
    );

    ingredientsNames.pop();
    ingredientsNames.pop();

    const ingredientsNamesAsObjects = ingredientsNames.map(name => ({ name }));
    const recipesIngredientsLink: RecipesIngredientsLink[] = ingredients.map(
      ingredient => ({
        ingredientId: ingredient.id,
        recipeId,
      })
    );

    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledWith(
      ingredientsNames
    );

    expect(mockIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoCreate).toHaveBeenCalledWith(
      ingredientsNamesAsObjects
    );

    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledWith(
      recipesIngredientsLink
    );
  });

  it('Should handle insertion with multiple duplicate without throwing', async () => {
    const ingredients = [
      fakeFullIngredient({ name: 'ingredientOne' }),
      fakeFullIngredient({ name: 'ingredientTwo' }),
      fakeFullIngredient({ name: 'ingredientOne' }),
      fakeFullIngredient({ name: 'ingredientTwo' }),
    ];

    const ingredientsNames: IngredientsName[] = ingredients.map(
      ingredient => ingredient.name
    );

    mockIngredientsRepoFindByNames.mockResolvedValueOnce([]);
    mockIngredientsRepoCreate.mockResolvedValueOnce(ingredients);

    await insertIngredients(
      recipeId,
      ingredientsNames,
      mockIngredientsRepository,
      mockRecipesIngredientsRepository
    );

    ingredientsNames.pop();
    ingredientsNames.pop();

    const ingredientsNamesAsObjects = ingredientsNames.map(name => ({ name }));
    const recipesIngredientsLinks: RecipesIngredientsLink[] = ingredients.map(
      ingredient => ({
        ingredientId: ingredient.id,
        recipeId,
      })
    );

    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoFindByNames).toHaveBeenCalledWith(
      ingredientsNames
    );

    expect(mockIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockIngredientsRepoCreate).toHaveBeenCalledWith(
      ingredientsNamesAsObjects
    );

    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledOnce();
    expect(mockRecipesIngredientsRepoCreate).toHaveBeenCalledWith(
      recipesIngredientsLinks
    );
  });
});
