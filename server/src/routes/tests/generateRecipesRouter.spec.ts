import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import createApp from '@server/app';
import { FAKE_FRIDGE_IMAGE } from '@server/utils/GoogleGenAiClient/tests/utils/generateRecipesFromImage';
import type { Database } from '@server/database';
import { sseManager } from '@server/utils/SSE';
import type { Response } from 'express';
import RateLimitError from '@server/utils/errors/general/RateLimitError';

const [
  mockGenerateRecipesFromImage,
  mockResizeImage,
  mockAddRecipeJob,
  mockCheckRateLimit,
] = vi.hoisted(() => [vi.fn(), vi.fn(), vi.fn(), vi.fn()]);

vi.mock('@server/utils/GoogleGenAiClient/generateRecipesFromImage', () => ({
  generateRecipesFromImage: mockGenerateRecipesFromImage,
}));

vi.mock('@server/utils/resizeImage', () => ({ resizeImage: mockResizeImage }));

vi.mock('@server/queues/recipe', () => ({
  addRecipeJob: mockAddRecipeJob,
}));

vi.mock('@server/utils/rateLimiter', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

const trustedOrigins = vi.hoisted(() => ['http://trusted.com']);
vi.mock('@server/config', async () => {
  const actual =
    await vi.importActual<typeof import('@server/config')>('@server/config');

  return {
    default: {
      ...actual.default,
      cors: {
        origin: trustedOrigins,
      },
    },
  };
});

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

  it('Should respect allowed Origin header', async () => {
    addClientSpy.mockImplementationOnce((_id: string, res: Response) => {
      res.end();
    });

    await supertest(app)
      .get(getEndpoint)
      .set('Origin', trustedOrigins[0])
      .expect('Access-Control-Allow-Origin', trustedOrigins[0]);
  });
});

describe(`POST ${postEndpoint}`, () => {
  it('Should not queue recipes generation job because of rate limit has been exceeded', async () => {
    const errrorMessage = 'errorMessage';
    mockCheckRateLimit.mockRejectedValueOnce(new RateLimitError(errrorMessage));

    const { body } = await supertest(app)
      .post(postEndpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'fridge.jpg')
      .expect(StatusCodes.TOO_MANY_REQUESTS);

    expect(body.error.message).toBe(errrorMessage);
  });

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
