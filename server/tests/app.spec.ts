/* eslint-disable unicorn/consistent-function-scoping */
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { createTestDatabase } from './utils/database';
import { wrapInRollbacks } from './utils/transactions';

vi.mock('@server/utils/upload/recipeUpload', () => ({
  recipeUpload: {
    single: () => (request: any, _response: any, next: any) => {
      request.file = { location: 'https://mock-s3/recipe.png' };
      next();
    },
  },
}));

vi.mock('@server/utils/upload/profileUpload', () => ({
  profileUpload: {
    single: () => (request: any, _response: any, next: any) => {
      request.file = { location: 'https://mock-s3/profile.png' };
      next();
    },
  },
}));

const database = await wrapInRollbacks(createTestDatabase());
const app = createApp(database);

afterAll(() => {
  database.destroy();
});

describe('Server health check', () => {
  it('can launch the app', async () => {
    await supertest(app).get('/api/health').expect(StatusCodes.OK);
  });
});

describe('Image uploading', () => {
  it('Uploads recipe image successfully', async () => {
    const { body } = await supertest(app)
      .post('/api/upload/recipe')
      .attach('file', Buffer.from('test'), 'recipe.png')
      .expect(StatusCodes.OK);

    expect(body).toEqual({ imageUrl: 'https://mock-s3/recipe.png' });
  });

  it('Uploads profile image successfully', async () => {
    const { body } = await supertest(app)
      .post('/api/upload/profile')
      .attach('file', Buffer.from('test'), 'profile.png')
      .expect(StatusCodes.OK);

    expect(body).toEqual({ imageUrl: 'https://mock-s3/profile.png' });
  });
});
