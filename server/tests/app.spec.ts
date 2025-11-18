/* eslint-disable unicorn/consistent-function-scoping */
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import type { Request } from 'express';
import { upload } from '@server/utils/upload';
import type { Mock } from 'vitest';
import type { Database } from '@server/database';

vi.mock('@server/utils/upload', () => ({
  upload: {
    single: vi.fn(() => (_request: any, _response: any, next: any) => next()),
  },
}));

vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: 'test-user' };
    next();
  },
}));

const fakeBuffer = Buffer.from('fake');
const fakeKey = 'fakeKey';

vi.mock('@server/utils/resizeImage', () => ({
  resizeImage: vi.fn(async (_file: any, _folder: any) => fakeBuffer),
}));

vi.mock('@server/utils/AWSS3Client/uploadImage', () => ({
  uploadImage: vi.fn(() => fakeKey),
}));

const database = {} as Database;

describe('Server health check', () => {
  it('can launch the app', async () => {
    const app = createApp(database);

    await supertest(app).get('/api/health').expect(StatusCodes.OK);
  });
});

describe('Image uploading', () => {
  beforeEach(() => {
    (upload.single as unknown as Mock).mockReset();
  });

  const testUploadError = (endpoint: string) => async () => {
    (upload.single as Mock<(field: string) => any>).mockImplementation(
      (_field: string) =>
        (request: Request, _response: any, next: () => void) => {
          next();
        }
    );

    const app = createApp(database);

    const { body } = await supertest(app)
      .post(endpoint)
      .attach('file', Buffer.from('test'), 'document.pdf')
      .expect(StatusCodes.BAD_REQUEST);

    expect(body.error.message).toEqual(
      'Supported types for image are .png, .jpg or .jpeg'
    );
  };

  const testUploadSuccess =
    (endpoint: string, responseKey: string) => async () => {
      (upload.single as unknown as Mock).mockImplementation(
        () => (request: any, _response: any, next: () => void) => {
          request.file = {};
          next();
        }
      );

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(endpoint)
        .attach('file', Buffer.from('test'), 'file.png')
        .expect(StatusCodes.OK);

      expect(body).toEqual({ [responseKey]: fakeKey });
    };

  describe('Recipes', () => {
    const ENDPOINT = '/api/upload/recipe';

    it(
      'Should throw an error when an invalid file is given',
      testUploadError(ENDPOINT)
    );

    it('Uploads image successfully', testUploadSuccess(ENDPOINT, 'imageUrl'));
  });

  describe('Profiles', () => {
    const ENDPOINT = '/api/upload/profile';

    it(
      'Should throw an error when an invalid file is given',
      testUploadError(ENDPOINT)
    );

    it(
      'Uploads profile image successfully',
      testUploadSuccess(ENDPOINT, 'image')
    );
  });

  describe('Collections', () => {
    const ENDPOINT = '/api/upload/collection';

    it(
      'Should throw an error when an invalid file is given',
      testUploadError(ENDPOINT)
    );

    it(
      'Uploads collection image successfully',
      testUploadSuccess(ENDPOINT, 'imageUrl')
    );
  });
});
