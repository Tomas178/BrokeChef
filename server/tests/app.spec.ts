/* eslint-disable unicorn/consistent-function-scoping */
import createApp from '@server/app';
import supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import type { Database } from '@server/database';
import { ImageFolder, type ImageFolderValues } from '@server/enums/ImageFolder';

const [mockHandleFile, mockHandleStreamUpload] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
]);

vi.mock('@server/utils/handleFile', () => ({
  handleFile: mockHandleFile,
}));

vi.mock('@server/routes/utils/handleStreamUpload', () => ({
  handleStreamUpload: mockHandleStreamUpload,
}));

vi.mock('@server/middleware/authenticate', () => ({
  authenticate: (request: any, _: any, next: any) => {
    request.user = { id: 'test-user' };
    next();
  },
}));

const fakeBuffer = Buffer.from('fake image');
const fakeKey = 'uploads/test-image.jpg';

const database = {} as Database;

describe('Server health check', () => {
  it('can launch the app', async () => {
    const app = createApp(database);

    await supertest(app).get('/api/health').expect(StatusCodes.OK);
  });
});

describe('Image uploading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleStreamUpload.mockResolvedValue(fakeKey);
  });

  const testUploadError = (endpoint: string) => async () => {
    const errorMessage = 'Supported types for image are .png, .jpg or .jpeg';

    mockHandleFile.mockRejectedValueOnce({
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
      mockHandleFile.mockResolvedValueOnce({ buffer: fakeBuffer });

      const app = createApp(database);

      const { body } = await supertest(app)
        .post(endpoint)
        .attach('file', Buffer.from('test'), 'file.png')
        .expect(StatusCodes.OK);

      expect(mockHandleFile).toHaveBeenCalledOnce();
      expect(mockHandleStreamUpload).toHaveBeenCalledWith(
        fakeBuffer,
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
