import { Readable } from 'node:stream';
import type { S3Client } from '@aws-sdk/client-s3';
import {
  AllowedMimeType,
  allowedMimetypesArray,
} from '@server/enums/AllowedMimetype';
import { Upload } from '@aws-sdk/lib-storage';
import { uploadImageStream } from '../uploadImageStream';

const mockDone = vi.fn().mockResolvedValueOnce({});

vi.mock('@aws-sdk/lib-storage', () => {
  return {
    Upload: vi.fn().mockImplementation(() => {
      return {
        done: mockDone,
      };
    }),
  };
});

const fakeKey = 'fake-key';

const fakeImagesBucket = vi.hoisted(() => 'fake-bucket');
vi.mock('@server/config', () => ({
  default: {
    auth: {
      aws: {
        s3: {
          buckets: {
            images: fakeImagesBucket,
          },
        },
      },
    },
  },
}));

const s3Client = {} as S3Client;

const contentType = AllowedMimeType.JPEG;

beforeEach(() => vi.clearAllMocks());

const createDummyStream = () =>
  Readable.from([Buffer.from('chunk1'), Buffer.from('chunk2')]);

describe('uploadImageStream', () => {
  it('Should call the Upload class with correct parameters', async () => {
    const dummyStream = createDummyStream();

    await uploadImageStream(s3Client, fakeKey, dummyStream, contentType);

    expect(Upload).toHaveBeenCalledExactlyOnceWith({
      client: s3Client,
      params: {
        Bucket: fakeImagesBucket,
        Key: fakeKey,
        Body: dummyStream,
        ContentType: expect.toBeOneOf(allowedMimetypesArray),
      },
    });
  });

  it('Should return the promise that can be awaited', async () => {
    const dummyStream = createDummyStream();

    const uploadTask = uploadImageStream(
      s3Client,
      fakeKey,
      dummyStream,
      contentType
    );

    expect(mockDone).toHaveBeenCalledOnce();
    expect(uploadTask).toBeUndefined();
  });
});
