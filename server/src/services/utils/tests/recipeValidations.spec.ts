import { fakeRecipeAllInfo, fakeUser } from '@server/entities/tests/fakes';
import { usersKeysPublicWithoutId } from '@server/entities/users';
import { pick } from 'lodash-es';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import type { RecipesPublic } from '@server/entities/recipes';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import {
  validateRecipeAndUserIsNotAuthor,
  validateRecipeExists,
} from '../recipeValidations';

const authorId = 'a'.repeat(32);
const nonAuthorId = authorId + 'a';
const recipeId = 1;

const mockFindById = vi.fn(
  async (id): Promise<RecipesPublic | undefined> =>
    fakeRecipeAllInfo({
      id,
      userId: authorId,
      author: pick(fakeUser(), usersKeysPublicWithoutId),
    })
);

const mockRecipeRepository = {
  findById: mockFindById,
} as unknown as RecipesRepository;

describe('validateRecipeExists', () => {
  it('Should return recipe when recipe exists', async () => {
    const recipe = await validateRecipeExists(mockRecipeRepository, recipeId);

    expect(recipe).toMatchObject({
      id: recipeId,
      userId: authorId,
    });
  });

  it('Should throw an error when recipe does not exist', async () => {
    mockFindById.mockResolvedValueOnce(undefined);

    await expect(
      validateRecipeExists(mockRecipeRepository, recipeId)
    ).rejects.toThrow(/not found/i);
  });
});

describe('validateRecipeAndUserIsNotAuthor', () => {
  it('Should return recipe', async () => {
    const recipe = await validateRecipeAndUserIsNotAuthor(
      mockRecipeRepository,
      recipeId,
      nonAuthorId,
      CannotRateOwnRecipe
    );

    expect(recipe).toMatchObject({
      id: recipeId,
      userId: authorId,
    });
  });

  it('Should throw an error when recipe does not exist', async () => {
    mockFindById.mockResolvedValueOnce(undefined);

    await expect(
      validateRecipeAndUserIsNotAuthor(
        mockRecipeRepository,
        recipeId,
        nonAuthorId,
        CannotRateOwnRecipe
      )
    ).rejects.toThrow(/not found/i);
  });

  it('Should throw an error when author is trying to rate his own recipe', async () => {
    await expect(
      validateRecipeAndUserIsNotAuthor(
        mockRecipeRepository,
        recipeId,
        authorId,
        CannotRateOwnRecipe
      )
    ).rejects.toThrowError(CannotRateOwnRecipe);
  });

  it('Should throw an error when author is trying to save his own recipe', async () => {
    await expect(
      validateRecipeAndUserIsNotAuthor(
        mockRecipeRepository,
        recipeId,
        authorId,
        CannotSaveOwnRecipe
      )
    ).rejects.toThrowError(CannotSaveOwnRecipe);
  });
});
