import type { GoogleGenAI } from '@google/genai';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';

export async function generateCollectionImage(
  ai: GoogleGenAI,
  title: string
): Promise<Buffer<ArrayBuffer>> {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-fast-generate-001',
    prompt: `A realistic, high-quality top-down food photography scene representing the "${title}" recipe collection.
                Show an assortment of dishes that match the theme, arranged neatly on a table with good lighting.
                Vibrant colors, appetizing presentation. No text.`,
    config: {
      numberOfImages: 1,
      outputMimeType: AllowedMimeType.JPEG,
      aspectRatio: '1:1',
    },
  });

  if (
    !response.generatedImages ||
    !response.generatedImages[0].image ||
    !response.generatedImages[0].image.imageBytes
  )
    throw new Error('Failed to generate collection Image');

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;

  return Buffer.from(base64ImageBytes, 'base64');
}
