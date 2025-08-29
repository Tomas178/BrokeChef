/* eslint-disable unicorn/consistent-function-scoping */
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { recipeUpload } from '@server/utils/upload/recipeUpload';
import { profileUpload } from '@server/utils/upload/profileUpload';
import type { Request } from 'express';
import { createTestDatabase } from './utils/database';
import { wrapInRollbacks } from './utils/transactions';

vi.mock('@server/utils/upload/recipeUpload', () => ({
  recipeUpload: {
    single: vi.fn(() => (_request: any, _response: any, next: any) => next()),
  },
}));

vi.mock('@server/utils/upload/profileUpload', () => ({
  profileUpload: {
    single: vi.fn(() => (_request: any, _response: any, next: any) => next()),
  },
}));

const database = await wrapInRollbacks(createTestDatabase());

describe('Server health check', () => {
  it('can launch the app', async () => {
    const app = createApp(database);

    await supertest(app).get('/api/health').expect(StatusCodes.OK);
  });
});

describe('Image uploading', () => {
  describe('Recipes', () => {
    const ENDPOINT = '/api/upload/recipe';

    it('Should throw an error when an invalid file is given', async () => {
      (recipeUpload.single as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => (request: Request, _response: any, next: () => void) => {
          request.fileValidationError = 'Invalid file type';
          next();
        }
      );

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(ENDPOINT)
        .attach('file', Buffer.from('test'), 'document.pdf')
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.error.message).toEqual('Invalid file type');
    });

    it('Uploads image successfully', async () => {
      (
        recipeUpload.single as unknown as ReturnType<typeof vi.fn>
      ).mockImplementationOnce(
        () => (request: any, _response: any, next: () => void) => {
          request.file = { location: 'https://mock-s3/recipe.png' };
          next();
        }
      );

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(ENDPOINT)
        .attach('file', Buffer.from('test'), 'recipe.png')
        .expect(StatusCodes.OK);

      expect(body).toEqual({ imageUrl: 'https://mock-s3/recipe.png' });
    });
  });
  describe('Profiles', () => {
    const ENDPOINT = '/api/upload/profile';

    it('Should throw an error when an invalid file is given', async () => {
      (profileUpload.single as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => (request: Request, _response: any, next: () => void) => {
          request.fileValidationError = 'Invalid file type';
          next();
        }
      );

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(ENDPOINT)
        .attach('file', Buffer.from('test'), 'document.pdf')
        .expect(StatusCodes.BAD_REQUEST);

      expect(body.error.message).toEqual('Invalid file type');
    });

    it('Uploads profile image successfully', async () => {
      (
        profileUpload.single as unknown as ReturnType<typeof vi.fn>
      ).mockImplementationOnce(
        () => (request: any, _response: any, next: () => void) => {
          request.file = { location: 'https://mock-s3/profile.png' };
          next();
        }
      );

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(ENDPOINT)
        .attach('file', Buffer.from('test'), 'profile.png')
        .expect(StatusCodes.OK);

      expect(body).toEqual({ imageUrl: 'https://mock-s3/profile.png' });
    });
  });
});
