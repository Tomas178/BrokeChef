import type { GoogleGenAI } from '@google/genai';
import { generateRecipesFromImage } from '../generateRecipesFromImage';
import {
  FAKE_FRIDGE_IMAGE,
  INVALID_RESPONSE_SCHEMA,
  RESPONSE_IMAGES_OF_TWO,
  RESPONSE_RECIPE_ONE,
  RESPONSE_RECIPE_TWO,
  VALID_RESPONSE_SCHEMA_OF_ONE,
  VALID_RESPONSE_SCHEMA_OF_THREE,
  VALID_RESPONSE_SCHEMA_OF_TWO,
} from './utils/generateRecipesFromImage';

const mockGenerateContent = vi.fn();
const mockGenerateRecipeImage = vi.hoisted(() => vi.fn());

const mockGoogleGenAi = {
  models: {
    generateContent: mockGenerateContent,
  },
} as unknown as GoogleGenAI;

vi.mock('@server/utils/GoogleGenAiClient/generateRecipeImage', () => ({
  generateRecipeImage: mockGenerateRecipeImage,
}));

describe('generateRecipesFromImage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('Should throw an error if AI returned empty response', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: undefined });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE, 3)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if returned JSON schema is invalid', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: INVALID_RESPONSE_SCHEMA,
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE, 3)
    ).rejects.toThrow(/(ai|failed).*(generate)/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if JSON parsing failed because AI returned an object not called "recipes"', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(INVALID_RESPONSE_SCHEMA),
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE, 3)
    ).rejects.toThrow(/(invalid|failed).*(response|schema|structure)/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if it generated less recipes that it was requested', async () => {
    const recipesCount = 2;
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_RESPONSE_SCHEMA_OF_ONE),
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE, recipesCount)
    ).rejects.toThrow(/expected/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if it generated more recipes that it was requested', async () => {
    const recipesCount = 2;
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_RESPONSE_SCHEMA_OF_THREE),
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE, recipesCount)
    ).rejects.toThrow(/expected/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should return recipes with their data and generated images', async () => {
    const numberOfRecipes = 2;

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_RESPONSE_SCHEMA_OF_TWO),
    });

    mockGenerateRecipeImage
      .mockResolvedValueOnce(RESPONSE_IMAGES_OF_TWO[0])
      .mockResolvedValueOnce(RESPONSE_IMAGES_OF_TWO[1]);

    const result = await generateRecipesFromImage(
      mockGoogleGenAi,
      FAKE_FRIDGE_IMAGE,
      numberOfRecipes
    );

    expect(result).toHaveLength(numberOfRecipes);

    expect(result[0]).toEqual({
      ...RESPONSE_RECIPE_ONE,
      image: RESPONSE_IMAGES_OF_TWO[0],
    });

    expect(result[1]).toEqual({
      ...RESPONSE_RECIPE_TWO,
      image: RESPONSE_IMAGES_OF_TWO[1],
    });

    expect(mockGenerateRecipeImage).toHaveBeenCalledTimes(numberOfRecipes);
    expect(mockGenerateRecipeImage).toHaveBeenCalledWith(mockGoogleGenAi, {
      title: RESPONSE_RECIPE_ONE.title,
      ingredients: RESPONSE_RECIPE_ONE.ingredients,
    });
    expect(mockGenerateRecipeImage).toHaveBeenCalledWith(mockGoogleGenAi, {
      title: RESPONSE_RECIPE_TWO.title,
      ingredients: RESPONSE_RECIPE_TWO.ingredients,
    });
  });
});
