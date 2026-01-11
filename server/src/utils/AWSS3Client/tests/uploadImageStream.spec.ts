import { Readable } from 'node:stream';
import type { S3Client } from '@aws-sdk/client-s3';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import { uploadImageStream } from '../uploadImageStream';

const mockDone = vi.fn().mockResolvedValue({});

const mockUpload = vi.hoisted(() => vi.fn());

vi.mock('@aws-sdk/lib-storage', () => {
  return {
    Upload: mockUpload,
  };
});

const fakeKey = 'fake-key';
const fakeImagesBucket = 'fake-bucket';

vi.mock('@server/config', () => ({
  default: {
    auth: {
      aws: {
        s3: {
          buckets: {
            images: 'fake-bucket',
          },
        },
      },
    },
  },
}));

const s3Client = {} as S3Client;
const contentType = AllowedMimeType.JPEG;

const createFakeStream = () =>
  Readable.from([Buffer.from('chunk1'), Buffer.from('chunk2')]);

describe('uploadImageStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockImplementation(() => ({
      done: mockDone,
    }));
  });

  it('Should call the Upload class with correct parameters', async () => {
    const fakeStream = createFakeStream();

    uploadImageStream(s3Client, fakeKey, fakeStream, contentType);

    expect(mockUpload).toHaveBeenCalledWith({
      client: s3Client,
      params: {
        Bucket: fakeImagesBucket,
        Key: fakeKey,
        Body: fakeStream,
        ContentType: contentType,
      },
    });
  });

  it('Should return the Upload instance (mocked object)', () => {
    const fakeStream = createFakeStream();

    const result = uploadImageStream(
      s3Client,
      fakeKey,
      fakeStream,
      contentType
    );

    expect(result).toEqual(
      expect.objectContaining({
        done: mockDone,
      })
    );

    expect(mockUpload).toHaveBeenCalledOnce();
  });
});
