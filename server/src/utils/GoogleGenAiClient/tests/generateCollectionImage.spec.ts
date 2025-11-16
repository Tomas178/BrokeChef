import type { GoogleGenAI } from '@google/genai';
import { generateCollectionImage } from '../generateCollectionImage';

const mockGenerateImages = vi.fn();

const mockGoogleGenAi = {
  models: {
    generateImages: mockGenerateImages,
  },
} as unknown as GoogleGenAI;

const fakeTitle = 'Fake Title';

describe('generateCollectionImage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('Should throw an error if generated images are not returned', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: undefined,
    });

    await expect(
      generateCollectionImage(mockGoogleGenAi, fakeTitle)
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
      generateCollectionImage(mockGoogleGenAi, fakeTitle)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateImages).toHaveBeenCalledOnce();
  });

  it('Should throw an error if image bytes are not returned', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: [{ image: { notImageBytes: 'ss' } }],
    });

    await expect(
      generateCollectionImage(mockGoogleGenAi, fakeTitle)
    ).rejects.toThrow(/failed/i);

    expect(mockGenerateImages).toHaveBeenCalledOnce();
  });

  it('Should return a buffer array', async () => {
    mockGenerateImages.mockResolvedValueOnce({
      generatedImages: [{ image: { imageBytes: 'ss' } }],
    });

    const response = await generateCollectionImage(mockGoogleGenAi, fakeTitle);

    expect(mockGenerateImages).toHaveBeenCalledOnce();

    expect(response).toBeInstanceOf(Buffer);
  });
});
