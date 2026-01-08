import { Readable } from 'node:stream';
import type { S3Client } from '@aws-sdk/client-s3';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import { ImageFolder } from '@server/enums/ImageFolder';
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

const fakeUniqueFileName = vi.hoisted(() => 'formed-name');
vi.mock('@server/utils/formUniqueFilename', () => ({
  formUniqueFilename: vi.fn(() => fakeUniqueFileName),
}));

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

const folder = ImageFolder.PROFILES;
const contentType = AllowedMimeType.JPEG;

beforeEach(() => vi.clearAllMocks());

describe('uploadImageStream', () => {
  const dummyStream = Readable.from([
    Buffer.from('chunk1'),
    Buffer.from('chunk2'),
  ]);

  const expectedKey = `${folder}/${fakeUniqueFileName}`;

  it('Should call the Upload class with correct parameters', async () => {
    await uploadImageStream(s3Client, folder, dummyStream, contentType);

    expect(Upload).toHaveBeenCalledExactlyOnceWith({
      client: s3Client,
      params: {
        Bucket: fakeImagesBucket,
        Key: expectedKey,
        Body: dummyStream,
        ContentType: contentType,
      },
    });
  });

  it('Should successfully upload the image while streaming and return the key', async () => {
    const key = await uploadImageStream(
      s3Client,
      folder,
      dummyStream,
      contentType
    );

    expect(key).toBe(expectedKey);
  });

  it('Should await until the upload is done', async () => {
    await uploadImageStream(s3Client, folder, dummyStream, contentType);

    expect(mockDone).toHaveBeenCalledOnce();
  });
});
