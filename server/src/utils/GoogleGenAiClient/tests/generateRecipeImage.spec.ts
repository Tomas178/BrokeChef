import type { GoogleGenAI } from '@google/genai';
import { generateRecipeImage } from '../generateRecipeImage';

const mockGenerateImages = vi.fn();

const mockGoogleGenAi = {
  models: {
    generateImages: mockGenerateImages,
  },
} as unknown as GoogleGenAI;

const fakeRecipeData = {
  title: 'recipe title',
  ingredients: ['first ingredient', 'second ingredient'],
};

describe('generateRecipeImage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('Should throw an error if generated images are not returned', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: undefined,
    });

    await expect(
      generateRecipeImage(mockGoogleGenAi, fakeRecipeData)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateImages).toHaveBeenCalledOnce();
  });

  it('Should throw an error if image is not returned', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: [
        {
          image: undefined,
        },
      ],
    });

    await expect(
      generateRecipeImage(mockGoogleGenAi, fakeRecipeData)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateImages).toHaveBeenCalledOnce();
  });

  it('Should throw an error if image bytes are not returned', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: [{ image: { notImageBytes: 'ss' } }],
    });

    await expect(
      generateRecipeImage(mockGoogleGenAi, fakeRecipeData)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateImages).toHaveBeenCalledOnce();
  });

  it('Should return a buffer array', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: [{ image: { imageBytes: 'ss' } }],
    });

    const response = await generateRecipeImage(mockGoogleGenAi, fakeRecipeData);

    expect(mockGenerateImages).toHaveBeenCalledOnce();

    expect(response).toBeInstanceOf(Buffer);
  });
});
