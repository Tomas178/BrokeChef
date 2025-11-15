import { fakeSavedRecipe } from '@server/entities/tests/fakes';
import type { Database } from '@server/database';
import type {
  SavedRecipesLink,
  SavedRecipesRepository,
} from '@server/repositories/savedRecipesRepository';
import { PostgresError } from 'pg-error-enum';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import { NoResultError } from 'kysely';
import { USER_ID_LENGTH } from '@server/entities/shared';
import { savedRecipesService } from '../savedRecipesService';

vi.mock('@server/utils/errors', () => ({
  assertPostgresError: vi.fn(),
  assertError: vi.fn(),
}));

const mockSavedRecipesRepoCreate = vi.fn();
const mockSavedRecipesRepoRemove = vi.fn();

const mockSavedRecipesRepository = {
  create: mockSavedRecipesRepoCreate,
  remove: mockSavedRecipesRepoRemove,
} as Partial<SavedRecipesRepository>;

vi.mock('@server/repositories/savedRecipesRepository', () => ({
  savedRecipesRepository: () => mockSavedRecipesRepository,
}));

const [mockValidateRecipesAndUserIsNotAuthor, mockValidateRecipeExists] =
  vi.hoisted(() => [vi.fn(), vi.fn()]);

vi.mock('@server/services/utils/recipeValidations', () => ({
  validateRecipeAndUserIsNotAuthor: mockValidateRecipesAndUserIsNotAuthor,
  validateRecipeExists: mockValidateRecipeExists,
}));

const database = {} as Database;
const service = savedRecipesService(database);

const userId = 'a'.repeat(USER_ID_LENGTH);
const recipeId = 123;
const link: SavedRecipesLink = { userId, recipeId };
const savedRecipeLink = fakeSavedRecipe(link);

beforeEach(() => vi.resetAllMocks());

describe('create', () => {
  it('Should create a new saved recipe', async () => {
    mockSavedRecipesRepoCreate.mockResolvedValueOnce(savedRecipeLink);
    const savedRecipe = await service.create(link);

    expect(mockSavedRecipesRepoCreate).toHaveBeenCalledOnce();
    expect(savedRecipe).toEqual(savedRecipeLink);
  });

  it('Should throw an error of duplicate', async () => {
    mockSavedRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(service.create(link)).rejects.toThrow(/saved/i);
  });

  it('Should throw an error that recipe does not exist', async () => {
    mockValidateRecipesAndUserIsNotAuthor.mockRejectedValueOnce(
      new RecipeNotFound()
    );

    await expect(service.create(link)).rejects.toThrow(
      /recipe.*not found|not found.* recipe/i
    );
  });

  it('Should throw an error because user tries to save his own recipe', async () => {
    mockValidateRecipesAndUserIsNotAuthor.mockRejectedValueOnce(
      new CannotSaveOwnRecipe()
    );

    await expect(service.create(link)).rejects.toThrow(/own.*save|save.*own/i);
  });
});

describe('remove', () => {
  it('Should unsave a recipe', async () => {
    mockSavedRecipesRepoRemove.mockResolvedValueOnce(savedRecipeLink);

    const unsavedRecipe = await service.remove(link);

    expect(mockSavedRecipesRepoRemove).toHaveBeenCalledOnce();
    expect(unsavedRecipe).toEqual(savedRecipeLink);
  });

  it('Should throw an error that recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(service.remove(link)).rejects.toThrow(
      /recipe.*not found|not found.*recipe/i
    );
    expect(mockSavedRecipesRepoRemove).not.toHaveBeenCalled();
  });

  it('Should throw an error that saved recipe with given data does not exist', async () => {
    mockSavedRecipesRepoRemove.mockRejectedValueOnce(
      new NoResultError({} as any)
    );

    await expect(service.remove(link)).rejects.toThrow(/not found/i);
  });
});
