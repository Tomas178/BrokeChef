import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { initialPage } from '@server/shared/pagination';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import {
  usersKeysPublic,
  usersKeysPublicWithoutId,
} from '@server/entities/users';
import { usersService } from '../usersService';

const fakeImageUrl = 'https://signed-url.com/folder/image.png';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => fakeImageUrl),
}));

const database = await wrapInRollbacks(createTestDatabase());
const service = usersService(database);

const [user] = await insertAll(database, 'users', fakeUser());

const [createdRecipeOne, createdRecipeTwo] = await insertAll(
  database,
  'recipes',
  [fakeRecipe({ userId: user.id }), fakeRecipe({ userId: user.id })]
);

describe('getRecipes', () => {
  it('Should return created and saved recipes by user', async () => {
    await insertAll(database, 'savedRecipes', [
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeOne.id }),
      fakeSavedRecipe({ userId: user.id, recipeId: createdRecipeTwo.id }),
    ]);

    const { saved, created } = await service.getRecipes(user.id, initialPage);

    const [createdNew, createdOld] = created;
    const [savedNew, savedOld] = saved;

    // Check created recipes ordered descendingly by id
    expect(createdOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
    });

    expect(createdNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
    });

    // Check saved recipes ordered descendingly by id
    expect(savedOld).toEqual({
      ...pick(createdRecipeOne, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
    });

    expect(savedNew).toEqual({
      ...pick(createdRecipeTwo, recipesKeysPublic),
      author: pick(user, usersKeysPublicWithoutId),
      imageUrl: fakeImageUrl,
    });
  });
});

describe('findById', () => {
  it('Should return user by id when image url is undefined', async () => {
    const [userWithNull] = await insertAll(
      database,
      'users',
      fakeUser({ image: undefined })
    );

    const userById = await service.findById(userWithNull.id);

    expect(userById).toEqual(pick(userWithNull, usersKeysPublic));
  });

  it('Should return user by id with not signed url when image is from oauth provider', async () => {
    const userById = await service.findById(user.id);

    expect(userById).toEqual(pick(user, usersKeysPublic));
  });

  it('Should return user with signed url when url is from S3 storage', async () => {
    const [userWithS3] = await insertAll(
      database,
      'users',
      fakeUser({ image: 'image' })
    );

    const userById = await service.findById(userWithS3.id);

    expect(userById).toEqual(pick(userById, usersKeysPublic));
  });
});
