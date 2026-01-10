import createApp from '@server/app';
import type { Database } from '@server/database';
import { ImageFolder } from '@server/enums/ImageFolder';
import { FAKE_FRIDGE_IMAGE } from '@server/utils/GoogleGenAiClient/tests/utils/generateRecipesFromImage';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

const fakeKey = vi.hoisted(() => 'default-key');
const mockHandleStreamUpload = vi.hoisted(() => vi.fn(() => fakeKey));

vi.mock('@server/routes/utils/handleStreamUpload', () => ({
  handleStreamUpload: mockHandleStreamUpload,
}));

const userId = 'a'.repeat(32);
vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: userId };
    next();
  },
}));

const database = {} as Database;
const app = createApp(database);

const recipeEndpoint = '/api/upload/recipe';
const profileEndpoint = '/api/upload/profile';
const collectionEndpoint = '/api/upload/collection';

beforeEach(() => vi.clearAllMocks());

describe(`POST ${recipeEndpoint}`, () => {
  it('Should call handleStreamUpload with ImageFolder.RECIPES', async () => {
    await supertest(app)
      .post(recipeEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'recipe.jpg')
      .expect(StatusCodes.OK);

    expect(mockHandleStreamUpload).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      ImageFolder.RECIPES
    );
  });

  it('Should throw an error if uploading fails', async () => {
    const errorMessage = 'uploading failed';
    mockHandleStreamUpload.mockRejectedValueOnce(new Error(errorMessage));

    const { body } = await supertest(app)
      .post(recipeEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'recipe.jpg')
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(body.error.message).toBe(errorMessage);
  });

  it('Should upload the image and return the key', async () => {
    const { body } = await supertest(app)
      .post(recipeEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'recipe.jpg')
      .expect(StatusCodes.OK);

    expect(body.imageUrl).toBe(fakeKey);
  });
});

describe(`POST ${profileEndpoint}`, () => {
  it('Should call handleStreamUpload with ImageFolder.PROFILES', async () => {
    await supertest(app)
      .post(profileEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'profile-picture.jpg')
      .expect(StatusCodes.OK);

    expect(mockHandleStreamUpload).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      ImageFolder.PROFILES
    );
  });

  it('Should throw an error if uploading fails', async () => {
    const errorMessage = 'uploading failed';
    mockHandleStreamUpload.mockRejectedValueOnce(new Error(errorMessage));

    const { body } = await supertest(app)
      .post(profileEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'profile-picture.jpg')
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(body.error.message).toBe(errorMessage);
  });

  it('Should upload the image and return the key', async () => {
    const { body } = await supertest(app)
      .post(profileEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'profile-picture.jpg')
      .expect(StatusCodes.OK);

    expect(body.image).toBe(fakeKey);
  });
});

describe(`POST ${collectionEndpoint}`, () => {
  it('Should call handleStreamUpload with ImageFolder.COLLECTIONS', async () => {
    await supertest(app)
      .post(collectionEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'collection.jpg')
      .expect(StatusCodes.OK);

    expect(mockHandleStreamUpload).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      ImageFolder.COLLECTIONS
    );
  });

  it('Should throw an error if uploading fails', async () => {
    const errorMessage = 'uploading failed';
    mockHandleStreamUpload.mockRejectedValueOnce(new Error(errorMessage));

    const { body } = await supertest(app)
      .post(collectionEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'collection.jpg')
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(body.error.message).toBe(errorMessage);
  });

  it('Should upload the image and return the key', async () => {
    const { body } = await supertest(app)
      .post(collectionEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'collection.jpg')
      .expect(StatusCodes.OK);

    expect(body.imageUrl).toBe(fakeKey);
  });
});
