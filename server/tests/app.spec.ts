import { PassThrough } from 'node:stream';
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import type { Database } from '@server/database';
import { ImageFolder, type ImageFolderValues } from '@server/enums/ImageFolder';

const fakeUniqueName = 'unique-file-id';
vi.mock('@server/utils/formUniqueFilename', () => ({
  formUniqueFilename: vi.fn(() => fakeUniqueName),
}));

vi.mock('@server/utils/createTransformStream', () => ({
  createTransformStream: vi.fn(() => new PassThrough()),
}));

vi.mock('@server/utils/AWSS3Client/uploadImageStream', () => ({
  uploadImageStream: vi.fn(async () => undefined),
}));

vi.mock('@server/utils/AWSS3Client/client', () => ({
  s3Client: {},
}));

vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: 'test-user' };
    next();
  },
}));

const database = {} as Database;

describe('Server health check', () => {
  it('can launch the app', async () => {
    const app = createApp(database);
    await supertest(app).get('/api/health').expect(StatusCodes.OK);
  });
});

describe('Image uploading (Streaming)', () => {
  const fakeBuffer = Buffer.from('fake-image-data');

  const testUploadSuccess =
    (endpoint: string, folder: ImageFolderValues, responseKey: string) =>
    async () => {
      const app = createApp(database);
      const expectedKey = `${folder}/${fakeUniqueName}`;

      const { body } = await supertest(app)
        .post(endpoint)
        .set('Content-Type', 'image/jpeg')
        .send(fakeBuffer)
        .expect(StatusCodes.OK);

      expect(body).toEqual({ [responseKey]: expectedKey });
    };

  describe('Recipes', () => {
    const ENDPOINT = '/api/upload/recipe';

    it(
      'Uploads recipe image successfully',
      testUploadSuccess(ENDPOINT, ImageFolder.RECIPES, 'imageUrl')
    );
  });

  describe('Profiles', () => {
    const ENDPOINT = '/api/upload/profile';

    it(
      'Uploads profile image successfully',
      testUploadSuccess(ENDPOINT, ImageFolder.PROFILES, 'image')
    );
  });

  describe('Collections', () => {
    const ENDPOINT = '/api/upload/collection';

    it(
      'Uploads collection image successfully',
      testUploadSuccess(ENDPOINT, ImageFolder.COLLECTIONS, 'imageUrl')
    );
  });
});
