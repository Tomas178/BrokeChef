import { fakeCreateRecipeData } from '@server/entities/tests/fakes';
import { formatRecipeForEmbedding } from '../formatRecipeForEmbedding';

const recipe = fakeCreateRecipeData();
const expectedFormattedText = `Title: ${recipe.title}, duration: ${recipe.duration}, ingredients: ${recipe.ingredients.join(', ')}, tools: ${recipe.tools.join(', ')}, steps: ${recipe.steps}`;

describe('formatRecipeForEmbedding', () => {
  it('Should return formatted text', () => {
    const formattedText = formatRecipeForEmbedding(recipe);

    expect(formattedText).toBe(expectedFormattedText);
  });
});
