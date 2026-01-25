import { fakeUser } from '@server/entities/tests/fakes';
import type { UsersPublic } from '@server/entities/users';
import { assignProfileSignedUrls } from '../assignProfileSignedUrls';

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

const mockIsOAuthProviderImage = vi.hoisted(() => vi.fn(() => false));

vi.mock('@server/services/utils/isOAuthProviderImage', () => ({
  isOAuthProviderImage: mockIsOAuthProviderImage,
}));

const getUsers = (count: number) =>
  Array.from({ length: count }, () => fakeUser() as UsersPublic);

beforeEach(() => vi.resetAllMocks());

describe('assignProfileSignedUrls', () => {
  it('Should return an empty array if given an empty array', async () => {
    const users = [] as UsersPublic[];

    const assignedUsers = await assignProfileSignedUrls(users);

    expect(assignedUsers).toBe(users);
    expect(mockSignImages).not.toHaveBeenCalled();
  });

  it('Should call signImages only with valid, non-empty image URLs', async () => {
    const users = getUsers(3);
    users.at(-1)!.image = '';

    const expectedUrlsForSignImages = users
      .map(user => user.image)
      .filter((img): img is string => !!img);

    const assignedUsers = await assignProfileSignedUrls(users);

    expect(mockSignImages).toHaveBeenCalledExactlyOnceWith(
      expectedUrlsForSignImages
    );

    expect(assignedUsers.at(-1)!.image).toBe('');
  });

  it('Should set image to null if signedImages returns fewer items than expected', async () => {
    const users = getUsers(1);
    users[0].image = 'valid-image-url';

    mockSignImages.mockReturnValueOnce([]);

    const assignedUsers = await assignProfileSignedUrls(users);

    expect(assignedUsers[0].image).toBeNull();
  });

  it('Should return recipes with assigned images', async () => {
    const recipes = getUsers(2);

    const assignedUsers = await assignProfileSignedUrls(recipes);

    expect(mockSignImages).toHaveBeenCalledOnce();

    expect(assignedUsers).toHaveLength(recipes.length);

    expect(assignedUsers[0]).toStrictEqual({
      ...recipes[0],
      image: fakeUrl,
    });

    expect(assignedUsers[1]).toStrictEqual({
      ...recipes[1],
      image: fakeUrl,
    });
  });
});
