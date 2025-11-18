import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import createApp from '@server/app';
import {
  FAKE_FRIDGE_IMAGE,
  RESPONSE_IMAGES_OF_THREE,
  VALID_RESPONSE_SCHEMA_OF_THREE,
} from '@server/utils/GoogleGenAiClient/tests/utils/generateRecipesFromImage';
import type { Database } from '@server/database';

const [mockGenerateRecipesFromImage, mockResizeImage] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
]);

vi.mock('@server/utils/GoogleGenAiClient/generateRecipesFromImage', () => ({
  generateRecipesFromImage: mockGenerateRecipesFromImage,
}));

vi.mock('@server/utils/resizeImage', () => ({ resizeImage: mockResizeImage }));

vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: 'test-user' };
    next();
  },
}));

const database = {} as Database;
const app = createApp(database);

const endpoint = '/api/recipe/generate';

describe(`POST ${endpoint}`, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Should generate recipes successfully', async () => {
    const recipesCount = VALID_RESPONSE_SCHEMA_OF_THREE.recipes.length;

    mockResizeImage.mockResolvedValue(FAKE_FRIDGE_IMAGE);
    mockGenerateRecipesFromImage.mockResolvedValue([
      {
        ...VALID_RESPONSE_SCHEMA_OF_THREE.recipes[0],
        image: RESPONSE_IMAGES_OF_THREE[0],
      },
      {
        ...VALID_RESPONSE_SCHEMA_OF_THREE.recipes[1],
        image: RESPONSE_IMAGES_OF_THREE[1],
      },
      {
        ...VALID_RESPONSE_SCHEMA_OF_THREE.recipes[2],
        image: RESPONSE_IMAGES_OF_THREE[2],
      },
    ]);

    const { body } = await supertest(app)
      .post(endpoint)
      .attach('file', FAKE_FRIDGE_IMAGE, 'fridge.jpg')
      .expect(StatusCodes.OK);

    expect(body).toHaveLength(recipesCount);
    expect(body[0].title).toBe(VALID_RESPONSE_SCHEMA_OF_THREE.recipes[0].title);
    expect(body[1].title).toBe(VALID_RESPONSE_SCHEMA_OF_THREE.recipes[1].title);
    expect(body[2].title).toBe(VALID_RESPONSE_SCHEMA_OF_THREE.recipes[2].title);
  });
});
