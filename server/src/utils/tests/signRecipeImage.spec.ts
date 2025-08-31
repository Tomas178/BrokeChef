import { fakeRecipeWithAuthor } from '@server/entities/tests/fakes';
import { signRecipeImage } from '../signRecipeImages';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@server/utils/AWSS3Client/signUrl', () => ({
  signUrl: vi.fn(() => fakeImageUrl),
}));

describe('signRecipeImage', () => {
  it('Should sign all of the image urls inside the array of recipes', async () => {
    const recipes = [fakeRecipeWithAuthor(), fakeRecipeWithAuthor()];

    await signRecipeImage(recipes);

    const [recipeOne, recipeTwo] = recipes;

    expect(recipeOne).toMatchObject({ ...recipeOne, imageUrl: fakeImageUrl });
    expect(recipeTwo).toMatchObject({ ...recipeTwo, imageUrl: fakeImageUrl });
  });

  it('Should sign the image url of when given single recipe', async () => {
    const recipe = fakeRecipeWithAuthor();

    await signRecipeImage(recipe);

    expect(recipe).toMatchObject({ ...recipe, imageUrl: fakeImageUrl });
  });
});
