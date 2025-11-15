import type { Database } from '@server/database';
import type {
  CookedRecipesLink,
  CookedRecipesRepository,
} from '@server/repositories/cookedRecipesRepository';
import { USER_ID_LENGTH } from '@server/entities/shared';
import { fakeCookedRecipe } from '@server/entities/tests/fakes';
import { PostgresError } from 'pg-error-enum';
import RecipeAlreadyCooked from '@server/utils/errors/recipes/RecipeAlreadyCooked';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';
import { NoResultError } from 'kysely';
import CookedRecipeNotFound from '@server/utils/errors/recipes/CookedRecipeNotFound';
import { cookedRecipesService } from '../cookedRecipesService';

vi.mock('@server/utils/errors', () => ({
  assertPostgresError: vi.fn(),
  assertError: vi.fn(),
}));

const [mockValidateRecipesAndUserIsNotAuthor, mockValidateRecipeExists] =
  vi.hoisted(() => [vi.fn(), vi.fn()]);

vi.mock('@server/services/utils/recipeValidations', () => ({
  validateRecipeAndUserIsNotAuthor: mockValidateRecipesAndUserIsNotAuthor,
  validateRecipeExists: mockValidateRecipeExists,
}));

const mockCookedRecipesRepoCreate = vi.fn();
const mockCookedRecipesRepoRemove = vi.fn();

const mockCookedRecipesRepository = {
  create: mockCookedRecipesRepoCreate,
  remove: mockCookedRecipesRepoRemove,
} as Partial<CookedRecipesRepository>;

vi.mock('@server/repositories/cookedRecipesRepository', () => ({
  cookedRecipesRepository: () => mockCookedRecipesRepository,
}));

const database = {} as Database;
const service = cookedRecipesService(database);

const userId = 'a'.repeat(USER_ID_LENGTH);
const recipeId = 123;
const link: CookedRecipesLink = { userId, recipeId };
const cookedRecipeLink = fakeCookedRecipe(link);

beforeEach(() => vi.resetAllMocks());

describe('create', () => {
  it('Should throw an error that recipe does not exist', async () => {
    mockValidateRecipesAndUserIsNotAuthor.mockRejectedValueOnce(
      new RecipeNotFound()
    );

    await expect(service.create(link)).rejects.toThrow(
      /recipe.*not found|not found.* recipe/i
    );
  });

  it('Should throw an error because user tries to mark his own recipe as already cooked', async () => {
    mockValidateRecipesAndUserIsNotAuthor.mockRejectedValueOnce(
      new CannotMarkOwnRecipeAsCooked()
    );

    await expect(service.create(link)).rejects.toThrowError(
      CannotMarkOwnRecipeAsCooked
    );
  });

  it('Should throw an error of duplicate record', async () => {
    mockCookedRecipesRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(service.create(link)).rejects.toThrowError(
      RecipeAlreadyCooked
    );
  });

  it('Should create a new cooked recipe link', async () => {
    mockCookedRecipesRepoCreate.mockResolvedValueOnce(cookedRecipeLink);
    const cookedRecipe = await service.create(link);

    expect(mockCookedRecipesRepoCreate).toHaveBeenCalledExactlyOnceWith(link);
    expect(cookedRecipe).toEqual(cookedRecipeLink);
  });
});

describe('remove', () => {
  it('Should throw an error that recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(service.remove(link)).rejects.toThrowError(RecipeNotFound);
    expect(mockCookedRecipesRepoRemove).not.toHaveBeenCalled();
  });

  it('Should throw an error that link with given data of cooked recipe does not exist', async () => {
    mockCookedRecipesRepoRemove.mockRejectedValueOnce(
      new NoResultError({} as any)
    );

    await expect(service.remove(link)).rejects.toThrowError(
      CookedRecipeNotFound
    );
  });

  it('Should remove the cooked recipe record', async () => {
    mockCookedRecipesRepoRemove.mockResolvedValueOnce(cookedRecipeLink);

    const unmarkedRecipe = await service.remove(link);

    expect(mockCookedRecipesRepoRemove).toHaveBeenCalledExactlyOnceWith(link);
    expect(unmarkedRecipe).toEqual(cookedRecipeLink);
  });
});
