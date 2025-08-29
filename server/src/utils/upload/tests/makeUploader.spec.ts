/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import type { Mock } from 'vitest';
import type { Request } from 'express';
import { makeUploader } from '../makeUploader';

vi.mock('multer', () => ({
  default: vi.fn(() => 'mock-multer'),
}));

vi.mock('multer-s3', () => ({
  default: vi.fn((options: NonNullable<Parameters<typeof multerS3>[0]>) => {
    const fakeFile = {
      fieldname: 'file',
      originalname: 'dummy.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 123,
      destination: '',
      filename: '',
      path: '',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    options.key?.({}, fakeFile, (_error?: any, _result?: string) => void 0);
    options.metadata?.({}, fakeFile, (_error?: any, _meta?: any) => void 0);

    return 'mock-storage';
  }),
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      aws: {
        accessIdKey: 'awsAccessIdKey',
        secretAccessKey: 'awsSecretAccessKey',
        s3: {
          region: 'closest-region',
          buckets: {
            images: 'images-bucket',
          },
        },
      },
    },
  },
}));

describe('makeUploader', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Should call multerS3 with correct options for uploading recipes', () => {
    const mockS3Client = {} as S3Client;
    const uploader = makeUploader('Recipes', mockS3Client);

    expect(multerS3).toHaveBeenCalledOnce();

    expect(multerS3).toHaveBeenCalledWith(
      expect.objectContaining({
        s3: mockS3Client,
        bucket: 'images-bucket',
        key: expect.any(Function),
        metadata: expect.any(Function),
      })
    );

    expect(uploader).toBe('mock-multer');
  });

  it('Should call multerS3 with correct options for uploading profiles', () => {
    const mockS3Client = {} as unknown as S3Client;
    const uploader = makeUploader('Profiles', mockS3Client);

    expect(multerS3).toHaveBeenCalledOnce();

    expect(multerS3).toHaveBeenCalledWith(
      expect.objectContaining({
        s3: mockS3Client,
        bucket: 'images-bucket',
        key: expect.any(Function),
        metadata: expect.any(Function),
      })
    );

    expect(uploader).toBe('mock-multer');
  });

  it('Should not allow any other file mimetype other than PNG or JPEG', () => {
    const mockS33Client = {} as S3Client;
    const uploader = makeUploader('Recipes', mockS33Client);

    const multerOptions = (multer as unknown as Mock).mock.calls[0][0];
    const { fileFilter } = multerOptions;

    const request = {} as Request;
    const file = { mimetype: 'application/pdf' } as Express.MulterS3.File;
    const mockCallback = vi.fn();

    fileFilter(request, file, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, false);
    expect(request.fileValidationError).toMatch(/.png|.jpg|.jpeg/i);
  });

  it('Should allow PNG format', () => {
    const mockS33Client = {} as S3Client;
    const uploader = makeUploader('Recipes', mockS33Client);

    const multerOptions = (multer as unknown as Mock).mock.calls[0][0];
    const { fileFilter } = multerOptions;

    const request = {} as Request;
    const file = { mimetype: 'image/png' } as Express.MulterS3.File;
    const mockCallback = vi.fn();

    fileFilter(request, file, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, true);
    expect(request.fileValidationError).toBeUndefined();
  });

  it('Should allow JPEG format', () => {
    const mockS33Client = {} as S3Client;
    const uploader = makeUploader('Recipes', mockS33Client);

    const multerOptions = (multer as unknown as Mock).mock.calls[0][0];
    const { fileFilter } = multerOptions;

    const request = {} as Request;
    const file = { mimetype: 'image/jpeg' } as Express.MulterS3.File;
    const mockCallback = vi.fn();

    fileFilter(request, file, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, true);
    expect(request.fileValidationError).toBeUndefined();
  });
});
