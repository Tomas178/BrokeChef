import type { Request } from 'express';
import type { Sharp } from 'sharp';
import ImageTooLarge from '@server/utils/errors/images/ImageTooLarge';
import {
  createFileSizeValidator,
  DEFAULT_MAX_SIZE,
} from '../createFileSizeValidator';

vi.mock('@server/utils/errors/images/ImageTooLarge');

const [mockUnpipe, mockResume, mockDestroy] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
  vi.fn(),
]);

const mockRequest = {
  unpipe: mockUnpipe,
  resume: mockResume,
} as unknown as Request;

const mockTransformStream = {
  destroy: mockDestroy,
} as unknown as Sharp;

describe('createFileSizeValidator', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Should allow upload if total size is within the limit', () => {
    const maxSize = 100;
    const validator = createFileSizeValidator(
      mockRequest,
      mockTransformStream,
      maxSize
    );

    validator(Buffer.alloc(50));
    validator(Buffer.alloc(50));

    expect(mockDestroy).not.toHaveBeenCalled();
    expect(mockUnpipe).not.toHaveBeenCalled();
    expect(mockResume).not.toHaveBeenCalled();
  });

  it('Should destroy the stream if size exceeds the limit', () => {
    const maxSize = 100;
    const validator = createFileSizeValidator(
      mockRequest,
      mockTransformStream,
      maxSize
    );

    validator(Buffer.alloc(100));

    validator(Buffer.alloc(1));

    expect(mockUnpipe).toHaveBeenCalledWith(mockTransformStream);
    expect(mockResume).toHaveBeenCalledOnce();

    expect(mockDestroy).toHaveBeenCalledOnce();
    expect(mockDestroy).toHaveBeenCalledWith(expect.any(ImageTooLarge));

    expect(ImageTooLarge).toHaveBeenCalledWith(maxSize);
  });

  it('Should ignore subsequent chunks after destruction', () => {
    const maxSize = 100;
    const validator = createFileSizeValidator(
      mockRequest,
      mockTransformStream,
      maxSize
    );

    validator(Buffer.alloc(101));
    validator(Buffer.alloc(50));

    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it('Should use DEFAULT_MAX_SIZE if no size is provided', () => {
    const validator = createFileSizeValidator(
      mockRequest,
      mockTransformStream as unknown as Sharp
    );

    const largeChunk = Buffer.alloc(DEFAULT_MAX_SIZE + 1);
    validator(largeChunk);

    expect(mockDestroy).toHaveBeenCalledOnce();
    expect(ImageTooLarge).toHaveBeenCalledWith(DEFAULT_MAX_SIZE);
  });
});
