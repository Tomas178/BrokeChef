import type { S3Client } from '@aws-sdk/client-s3';
import { ALLOWED_MIMETYPE } from '@server/enums/AllowedMimetype';
import { ImageFolder } from '@server/enums/ImageFolder';
import { uploadImage } from '../uploadImage';

vi.mock('@server/utils/formUniqueFilename', () => ({
  formUniqueFilename: vi.fn(() => 'formed-file'),
}));

const mockSend = vi.fn();

const mockS3Client = {
  send: mockSend,
} as unknown as S3Client;

const folder = ImageFolder.PROFILES;
const fileName = 'file';
const buffer = Buffer.from(fileName, 'base64');
const contentType = ALLOWED_MIMETYPE.JPEG;

describe('uploadImage', () => {
  it('Should upload image and not return anything', async () => {
    mockSend.mockResolvedValueOnce({});

    await uploadImage(mockS3Client, folder, fileName, buffer, contentType);

    expect(mockSend).toHaveBeenCalledOnce();

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: expect.any(String),
          Key: `${folder}/formed-file`,
          Body: buffer,
          ContentType: contentType,
        },
      })
    );
  });
});
