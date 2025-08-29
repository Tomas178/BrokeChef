import * as makeUploaderModule from '../makeUploader';
import * as AWSS3ClientModule from '../../AWSS3Client/client';

vi.mock('../makeUploader', () => ({
  makeUploader: vi.fn(() => 'mock-uploader'),
}));

vi.mock('../../AWSS3Client/client', () => ({
  s3Client: {},
}));

import { recipeUpload } from '../recipeUpload';

describe('recipeUpload', () => {
  it("Should call recipeUpload with 'Profiles' and 's3Client'", () => {
    const mockS3Client = AWSS3ClientModule.s3Client;

    expect(makeUploaderModule.makeUploader).toHaveBeenCalledOnce();
    expect(makeUploaderModule.makeUploader).toHaveBeenCalledWith(
      'Recipes',
      mockS3Client
    );

    expect(recipeUpload).toBe('mock-uploader');
  });
});
