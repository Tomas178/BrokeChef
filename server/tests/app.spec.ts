/* eslint-disable unicorn/consistent-function-scoping */
import { Readable } from 'node:stream';
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import type { Database } from '@server/database';
import { ImageFolder, type ImageFolderValues } from '@server/enums/ImageFolder';
import { gracefulShutdownManager } from '@server/utils/GracefulShutdownManager';
import ServiceUnavailable from '@server/utils/errors/general/ServiceUnavailable';

const [mockHandleFileStream, mockHandleStreamUpload] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
]);

vi.mock('@server/utils/handleFileStream', () => ({
  handleFileStream: mockHandleFileStream,
}));

vi.mock('@server/routes/utils/handleStreamUpload', () => ({
  handleStreamUpload: mockHandleStreamUpload,
}));

vi.spyOn(gracefulShutdownManager, 'isTerminating').mockReturnValue(false);

vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: 'test-user' };
    next();
  },
}));

const getFakeFileStream = () => Readable.from(['chunk1', 'chunk2']);
const fakeKey = 'uploads/test-image.jpg';
const database = {} as Database;

describe('Server health check', () => {
  it('can launch the app', async () => {
    const app = createApp(database);

    await supertest(app).get('/api/health').expect(StatusCodes.OK);
  });
});

describe('Service Unavailable check', () => {
  it('Should return 503 when server is shutting down', async () => {
    const error = new ServiceUnavailable();

    vi.spyOn(gracefulShutdownManager, 'isTerminating').mockReturnValueOnce(
      true
    );

    const app = createApp(database);

    const { body } = await supertest(app)
      .get('/api/health')
      .expect(StatusCodes.SERVICE_UNAVAILABLE);

    expect(body).toEqual({
      error: {
        message: error.message,
      },
    });
  });
});

describe('Image uploading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleStreamUpload.mockResolvedValue(fakeKey);
  });

  const testUploadError = (endpoint: string) => async () => {
    const errorMessage = 'Supported types for image are .png, .jpg or .jpeg';

    mockHandleFileStream.mockRejectedValueOnce({
      message: errorMessage,
      status: StatusCodes.BAD_REQUEST,
    });

    const app = createApp(database);

    const { body } = await supertest(app)
      .post(endpoint)
      .attach('file', Buffer.from('test'), 'document.pdf')
      .expect(StatusCodes.BAD_REQUEST);

    expect(body.error.message).toEqual(errorMessage);
  };

  const testUploadSuccess =
    (
      endpoint: string,
      responseKey: string,
      expectedFolder: ImageFolderValues
    ) =>
    async () => {
      const stream = getFakeFileStream();
      mockHandleFileStream.mockResolvedValueOnce({ stream });

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(endpoint)
        .attach('file', Buffer.from('test'), 'file.png')
        .expect(StatusCodes.OK);

      expect(mockHandleFileStream).toHaveBeenCalledOnce();
      expect(mockHandleStreamUpload).toHaveBeenCalledWith(
        stream,
        expectedFolder
      );
      expect(body).toEqual({ [responseKey]: fakeKey });
    };

  describe('Recipes', () => {
    const ENDPOINT = '/api/upload/recipe';

    it(
      'Should throw an error when an invalid file is given',
      testUploadError(ENDPOINT)
    );

    it(
      'Uploads image successfully',
      testUploadSuccess(ENDPOINT, 'imageUrl', ImageFolder.RECIPES)
    );
  });

  describe('Profiles', () => {
    const ENDPOINT = '/api/upload/profile';

    it(
      'Should throw an error when an invalid file is given',
      testUploadError(ENDPOINT)
    );

    it(
      'Uploads profile image successfully',
      testUploadSuccess(ENDPOINT, 'image', ImageFolder.PROFILES)
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
      testUploadSuccess(ENDPOINT, 'imageUrl', ImageFolder.COLLECTIONS)
    );
  });
});
