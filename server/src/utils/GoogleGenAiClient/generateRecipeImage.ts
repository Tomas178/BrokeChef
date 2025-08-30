import type { GoogleGenAI } from '@google/genai';
import type { RecipesPublicAllInfo } from '@server/entities/recipes';
import { ALLOWED_MIMETYPE } from '@server/enums/AllowedMimetype';

type RecipeData = Pick<RecipesPublicAllInfo, 'title' | 'ingredients'>;

export async function generateRecipeImage(
  ai: GoogleGenAI,
  data: RecipeData
): Promise<Buffer<ArrayBuffer>> {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-fast-generate-001',
    prompt: `A realistic high-quality food photo of "${data.title}", made with ${data.ingredients.join(',')}.`,
    config: {
      numberOfImages: 1,
      outputMimeType: ALLOWED_MIMETYPE.JPEG,
      aspectRatio: '1:1',
    },
  });

  if (
    !response.generatedImages ||
    !response.generatedImages[0].image ||
    !response.generatedImages[0].image.imageBytes
  )
    throw new Error('Failed to generate recipe Image');

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;

  return Buffer.from(base64ImageBytes, 'base64');
}
