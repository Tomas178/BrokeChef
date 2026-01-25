import type { RecipesPublic } from '@server/entities/recipes';
import { fakeRecipe } from '@server/entities/tests/fakes';
import { assignSignedUrls } from '../assignSignedUrls';

const fakeUrl = 'fake-url';

const mockSignImages = vi.hoisted(() =>
  vi.fn((images: string | string[]) => {
    if (Array.isArray(images)) {
      return images.map(img => (img ? fakeUrl : ''));
    }

    return fakeUrl;
  })
);

vi.mock('@server/utils/signImages', () => ({
  signImages: mockSignImages,
}));

const getRecipes = (count: number) =>
  Array.from({ length: count }, () => fakeRecipe() as RecipesPublic);

beforeEach(() => vi.resetAllMocks());

describe('assignSignedUrls', () => {
  it('Should return an empty array if given an empty array', async () => {
    const recipes = [] as RecipesPublic[];

    const assignedRecipes = await assignSignedUrls(recipes);

    expect(assignedRecipes).toBe(recipes);
    expect(mockSignImages).not.toHaveBeenCalled();
  });

  it('Should call signImages with correct array of image urls', async () => {
    const recipes = getRecipes(3);
    recipes.at(-1)!.imageUrl = '';

    const expectedUrlsForSignImages = recipes.map(recipe => recipe.imageUrl);

    const assignedRecipes = await assignSignedUrls(recipes);

    expect(mockSignImages).toHaveBeenCalledExactlyOnceWith(
      expectedUrlsForSignImages
    );

    expect(assignedRecipes.at(-1)!.imageUrl).toBe('');
  });

  it('Should return recipes with assigned images', async () => {
    const recipes = getRecipes(2);

    const assignedRecipes = await assignSignedUrls(recipes);

    expect(mockSignImages).toHaveBeenCalledOnce();

    expect(assignedRecipes).toHaveLength(recipes.length);

    expect(assignedRecipes[0]).toStrictEqual({
      ...recipes[0],
      imageUrl: fakeUrl,
    });

    expect(assignedRecipes[1]).toStrictEqual({
      ...recipes[1],
      imageUrl: fakeUrl,
    });
  });
});
