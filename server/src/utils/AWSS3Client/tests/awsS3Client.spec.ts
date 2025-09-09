vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      aws: {
        s3: {
          accessIdKey: 'awsAccessIdKey',
          secretAccessKey: 'awsSecretAccessKey',
          region: 'closest-region',
        },
      },
    },
  },
}));

import { S3Client } from '@aws-sdk/client-s3';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { s3Client } from '../client';

describe('S3Client', () => {
  it('Should call S3Client with correct settings for AWS S3', () => {
    expect(S3Client).toHaveBeenCalledWith({
      region: 'closest-region',
      credentials: {
        accessKeyId: 'awsAccessIdKey',
        secretAccessKey: 'awsSecretAccessKey',
      },
    });
  });
});
