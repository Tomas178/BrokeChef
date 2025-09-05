/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/consistent-function-scoping */
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import type { Request } from 'express';
import { upload } from '@server/utils/upload';
import type { Mock } from 'vitest';
import { createTestDatabase } from './utils/database';
import { wrapInRollbacks } from './utils/transactions';

vi.mock('@server/utils/upload', () => ({
  upload: {
    single: vi.fn(() => (_request: any, _response: any, next: any) => next()),
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

const database = await wrapInRollbacks(createTestDatabase());

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
    (upload.single as unknown as Mock).mockImplementation(
      () => (request: Request, _response: any, next: () => void) => {
        request.fileValidationError = 'Invalid file type';
        next();
      }
    );

    const app = createApp(database);

    const { body } = await supertest(app)
      .post(endpoint)
      .attach('file', Buffer.from('test'), 'document.pdf')
      .expect(StatusCodes.BAD_REQUEST);

    expect(body.error.message).toEqual('Invalid file type');
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
});
