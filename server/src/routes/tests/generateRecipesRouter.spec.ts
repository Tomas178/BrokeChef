import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import createApp from '@server/app';
import { FAKE_FRIDGE_IMAGE } from '@server/utils/GoogleGenAiClient/tests/utils/generateRecipesFromImage';
import type { Database } from '@server/database';
import { sseManager } from '@server/utils/SSE';
import type { Response } from 'express';

const [mockGenerateRecipesFromImage, mockResizeImage, mockAddRecipeJob] =
  vi.hoisted(() => [vi.fn(), vi.fn(), vi.fn()]);

vi.mock('@server/utils/GoogleGenAiClient/generateRecipesFromImage', () => ({
  generateRecipesFromImage: mockGenerateRecipesFromImage,
}));

vi.mock('@server/utils/resizeImage', () => ({ resizeImage: mockResizeImage }));

vi.mock('@server/queues/recipe', () => ({
  addRecipeJob: mockAddRecipeJob,
}));

const userId = 'a'.repeat(32);
vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: userId };
    next();
  },
}));

const addClientSpy = vi.spyOn(sseManager, 'addClient');
const removeClientSpy = vi.spyOn(sseManager, 'removeClient');

const database = {} as Database;
const app = createApp(database);

const getEndpoint = `/api/recipe/events/${userId}`;
const postEndpoint = '/api/recipe/generate';

beforeEach(() => {
  vi.resetAllMocks();
});

describe(`GET ${getEndpoint}`, () => {
  it('Should establish SSE connection and register the client', async () => {
    addClientSpy.mockImplementationOnce((id: string, res: Response) => {
      res.end();
    });

    await supertest(app)
      .get(getEndpoint)
      .expect('Content-Type', 'text/event-stream')
      .expect('Connection', 'keep-alive')
      .expect('Cache-Control', 'no-cache');

    expect(addClientSpy).toHaveBeenCalledWith(userId, expect.anything());
  });

  it('Should remove client when connection closes', async () => {
    addClientSpy.mockImplementationOnce((_id: string, res: Response) => {
      setTimeout(() => {
        res.req.emit('close');

        res.end();
      }, 20);
    });

    await supertest(app).get(getEndpoint).expect(StatusCodes.OK);

    expect(removeClientSpy).toHaveBeenCalledWith(userId);
  });
});

describe(`POST ${postEndpoint}`, () => {
  it('Should queue recipes generations job successfully', async () => {
    mockResizeImage.mockResolvedValue(FAKE_FRIDGE_IMAGE);

    const { body } = await supertest(app)
      .post(postEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'fridge.jpg')
      .expect(StatusCodes.ACCEPTED);

    expect(mockAddRecipeJob).toHaveBeenCalledWith({
      imageBase64: FAKE_FRIDGE_IMAGE.toString('base64'),
      userId,
    });

    expect(body).toMatchObject({
      message: 'Your recipes are being prepared!',
    });
  });
});
