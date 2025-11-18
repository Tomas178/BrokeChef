import type { GoogleGenAI } from '@google/genai';
import { generateRecipesFromImage } from '../generateRecipesFromImage';
import {
  FAKE_FRIDGE_IMAGE,
  INVALID_RESPONSE_SCHEMA,
  RESPONSE_IMAGES_OF_THREE,
  VALID_RESPONSE_SCHEMA_OF_FOUR,
  VALID_RESPONSE_SCHEMA_OF_ONE,
  VALID_RESPONSE_SCHEMA_OF_THREE,
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
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if returned JSON schema is invalid', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: INVALID_RESPONSE_SCHEMA,
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE)
    ).rejects.toThrow(/(ai|failed).*(generate)/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if JSON parsing failed because AI returned an object not called "recipes"', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(INVALID_RESPONSE_SCHEMA),
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE)
    ).rejects.toThrow(/(invalid|failed).*(response|schema|structure)/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if it generated less recipes that it was requested', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_RESPONSE_SCHEMA_OF_ONE),
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE)
    ).rejects.toThrow(/expected/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should throw an error if it generated more recipes that it was requested', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_RESPONSE_SCHEMA_OF_FOUR),
    });

    await expect(
      generateRecipesFromImage(mockGoogleGenAi, FAKE_FRIDGE_IMAGE)
    ).rejects.toThrow(/expected/i);

    expect(mockGenerateRecipeImage).not.toHaveBeenCalled();
  });

  it('Should return recipes with their data and generated images', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_RESPONSE_SCHEMA_OF_THREE),
    });

    mockGenerateRecipeImage
      .mockResolvedValueOnce(RESPONSE_IMAGES_OF_THREE[0])
      .mockResolvedValueOnce(RESPONSE_IMAGES_OF_THREE[1])
      .mockResolvedValueOnce(RESPONSE_IMAGES_OF_THREE[2]);

    const result = await generateRecipesFromImage(
      mockGoogleGenAi,
      FAKE_FRIDGE_IMAGE
    );

    expect(result).toHaveLength(VALID_RESPONSE_SCHEMA_OF_THREE.recipes.length);

    expect(result[0]).toEqual({
      ...VALID_RESPONSE_SCHEMA_OF_THREE.recipes[0],
      image: RESPONSE_IMAGES_OF_THREE[0],
    });

    expect(result[1]).toEqual({
      ...VALID_RESPONSE_SCHEMA_OF_THREE.recipes[1],
      image: RESPONSE_IMAGES_OF_THREE[1],
    });

    expect(result[2]).toEqual({
      ...VALID_RESPONSE_SCHEMA_OF_THREE.recipes[2],
      image: RESPONSE_IMAGES_OF_THREE[2],
    });

    expect(mockGenerateRecipeImage).toHaveBeenCalledTimes(
      VALID_RESPONSE_SCHEMA_OF_THREE.recipes.length
    );
    expect(mockGenerateRecipeImage).toHaveBeenCalledWith(mockGoogleGenAi, {
      title: VALID_RESPONSE_SCHEMA_OF_THREE.recipes[0].title,
      ingredients: VALID_RESPONSE_SCHEMA_OF_THREE.recipes[0].ingredients,
    });
    expect(mockGenerateRecipeImage).toHaveBeenCalledWith(mockGoogleGenAi, {
      title: VALID_RESPONSE_SCHEMA_OF_THREE.recipes[1].title,
      ingredients: VALID_RESPONSE_SCHEMA_OF_THREE.recipes[1].ingredients,
    });
    expect(mockGenerateRecipeImage).toHaveBeenCalledWith(mockGoogleGenAi, {
      title: VALID_RESPONSE_SCHEMA_OF_THREE.recipes[2].title,
      ingredients: VALID_RESPONSE_SCHEMA_OF_THREE.recipes[2].ingredients,
    });
  });
});
