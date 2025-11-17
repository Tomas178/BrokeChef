import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import createApp from '@server/app';
import {
  FAKE_FRIDGE_IMAGE,
  RESPONSE_IMAGES_OF_THREE,
  RESPONSE_IMAGES_OF_TWO,
  VALID_RESPONSE_SCHEMA_OF_THREE,
  VALID_RESPONSE_SCHEMA_OF_TWO,
} from '@server/utils/GoogleGenAiClient/tests/utils/generateRecipesFromImage';
import type { Database } from '@server/database';
import {
  MAX_RECIPES_TO_GENERATE_PER_REQUEST,
  MIN_RECIPES_TO_GENERATE_PER_REQUEST,
} from '@server/shared/consts';

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

describe('POST /api/recipe/generate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Should return 400 for invalid number of recipes', async () => {
    const { body } = await supertest(app)
      .post(
        `/api/recipe/generate?number=${MAX_RECIPES_TO_GENERATE_PER_REQUEST + 1}`
      )
      .attach('file', FAKE_FRIDGE_IMAGE, 'fridge.jpg')
      .expect(StatusCodes.BAD_REQUEST);

    expect(body.error.message).toMatch(/number/i);
  });

  it('Should generate recipes successfully when given number via query', async () => {
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
      .post(`/api/recipe/generate?number=${recipesCount}`)
      .attach('file', FAKE_FRIDGE_IMAGE, 'fridge.jpg')
      .expect(StatusCodes.OK);

    expect(body.recipes).toHaveLength(recipesCount);
    expect(body.recipes[0].title).toBe(
      VALID_RESPONSE_SCHEMA_OF_THREE.recipes[0].title
    );
    expect(body.recipes[1].title).toBe(
      VALID_RESPONSE_SCHEMA_OF_THREE.recipes[1].title
    );
    expect(body.recipes[2].title).toBe(
      VALID_RESPONSE_SCHEMA_OF_THREE.recipes[2].title
    );
  });

  it('Should generate recipes successfully with minimum amount of recipes when number is not provided in query', async () => {
    mockResizeImage.mockResolvedValue(FAKE_FRIDGE_IMAGE);
    mockGenerateRecipesFromImage.mockResolvedValue([
      {
        ...VALID_RESPONSE_SCHEMA_OF_TWO.recipes[0],
        image: RESPONSE_IMAGES_OF_TWO[0],
      },
      {
        ...VALID_RESPONSE_SCHEMA_OF_TWO.recipes[1],
        image: RESPONSE_IMAGES_OF_TWO[1],
      },
    ]);

    const { body } = await supertest(app)
      .post('/api/recipe/generate')
      .attach('file', FAKE_FRIDGE_IMAGE, 'fridge.jpg')
      .expect(StatusCodes.OK);

    expect(body.recipes).toHaveLength(MIN_RECIPES_TO_GENERATE_PER_REQUEST);
    expect(body.recipes[0].title).toBe(
      VALID_RESPONSE_SCHEMA_OF_TWO.recipes[0].title
    );
    expect(body.recipes[1].title).toBe(
      VALID_RESPONSE_SCHEMA_OF_TWO.recipes[1].title
    );
  });
});
