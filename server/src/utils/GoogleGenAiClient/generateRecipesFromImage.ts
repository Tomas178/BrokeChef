import { Type, type GoogleGenAI, type Schema } from '@google/genai';
import type { GeneratedRecipe } from '@server/entities/generatedRecipe';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import logger from '@server/logger';
import {
  MAX_DURATION,
  MAX_RECIPE_TITLE_LENGTH,
  MIN_DURATION,
  MIN_RECIPE_TITLE_LENGTH,
} from '@server/shared/consts';
import { generateRecipeImage } from '@server/utils/GoogleGenAiClient/generateRecipeImage';

const NUMBER_OF_RECIPES = 3;

export async function generateRecipesFromImage(
  ai: GoogleGenAI,
  image: Buffer
): Promise<GeneratedRecipe[]> {
  const base64Image = image.toString('base64');

  const prompt = `Analyze the food ingredients or dish in the provided image(s) and generate exactly ${NUMBER_OF_RECIPES} different recipe ideas.
        For each recipe, provide:
        1. A creative and appealing title
        2. Duration in minutes between ${MIN_DURATION} and ${MAX_DURATION}
        3. A complete list of ingredients with only the name of the ingredient
        4. Required cooking tools/equipment
        5. Step-by-step cooking instructions

        Return the response in the following JSON format:
        {
        "recipes": [
            {
            "title": "Recipe Title",
            "duration": 30,
            "ingredients": ['ingredient1, ingredient2'],
            "tools": ["tool1", "tool2"],
            "steps": ["step1", "step2"]
            }
        ]
        }
        Make the recipes creative, practical, and suitable for home cooking.`;

  const contents = [
    {
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: AllowedMimeType.JPEG,
            data: base64Image,
          },
        },
      ],
    },
  ];

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      recipes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Name of the recipe',
              minLength: MIN_RECIPE_TITLE_LENGTH.toString(),
              maxLength: MAX_RECIPE_TITLE_LENGTH.toString(),
            },
            duration: {
              type: Type.INTEGER,
              description: `Duration in minutes between ${MIN_DURATION} and ${MAX_DURATION}`,
              minimum: MIN_DURATION,
              maximum: MAX_DURATION,
            },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of ingredient names only',
            },
            tools: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Required cooking tools and equipment',
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step cooking instructions',
            },
          },
          required: ['title', 'duration', 'ingredients', 'tools', 'steps'],
        },
      },
    },
    required: ['recipes'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  if (!response.text) {
    throw new Error('Failed to generate recipes from Image');
  }

  let parsedData;
  try {
    parsedData = JSON.parse(response.text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error(`Invalid JSON format: ${error.message}`);
      throw new Error('AI failed to generate recipes');
    }
  }

  if (!parsedData.recipes || !Array.isArray(parsedData.recipes)) {
    throw new Error(
      'Invalid response structure: missing or invalid recipes array'
    );
  }

  if (parsedData.recipes.length !== NUMBER_OF_RECIPES) {
    throw new Error(
      `Expected exactly ${NUMBER_OF_RECIPES} recipes but received ${parsedData.recipes.length}`
    );
  }

  const recipesWithImages: GeneratedRecipe[] = await Promise.all(
    parsedData.recipes.map(async (recipe: Omit<GeneratedRecipe, 'image'>) => {
      const imageBuffer = await generateRecipeImage(ai, {
        title: recipe.title,
        ingredients: recipe.ingredients,
      });

      return {
        ...recipe,
        image: imageBuffer,
      };
    })
  );

  return recipesWithImages;
}
