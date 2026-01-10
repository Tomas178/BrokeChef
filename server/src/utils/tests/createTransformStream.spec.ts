import sharp from 'sharp';
import {
  createTransformStream,
  DEFAULT_JPEG_OPTIONS,
  DEFAULT_RESIZE_OPTIONS,
} from '../createTransformStream';

const mockSharpInstance = {
  resize: vi.fn().mockReturnThis(),
  jpeg: vi.fn().mockReturnThis(),
};

vi.mock('sharp', () => ({
  default: vi.fn(() => mockSharpInstance),
}));

describe('createTransformStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should create a sharp instance with DEFAULT options when no args provided', () => {
    const stream = createTransformStream();

    expect(sharp).toHaveBeenCalledTimes(1);

    expect(mockSharpInstance.resize).toHaveBeenCalledTimes(1);
    expect(mockSharpInstance.resize).toHaveBeenCalledWith(
      DEFAULT_RESIZE_OPTIONS
    );

    expect(mockSharpInstance.jpeg).toHaveBeenCalledTimes(1);
    expect(mockSharpInstance.jpeg).toHaveBeenCalledWith(DEFAULT_JPEG_OPTIONS);

    expect(stream).toBe(mockSharpInstance);
  });

  it('Should use CUSTOM options when provided', () => {
    const customResize = { width: 500, height: 500 };
    const customJpeg = { quality: 50 };

    createTransformStream(customResize, customJpeg);

    expect(mockSharpInstance.resize).toHaveBeenCalledWith(customResize);
    expect(mockSharpInstance.jpeg).toHaveBeenCalledWith(customJpeg);
  });

  it('Should allow partial overrides (e.g. only resizing)', () => {
    const customResize = { width: 100 };

    createTransformStream(customResize);

    expect(mockSharpInstance.resize).toHaveBeenCalledWith(customResize);
    expect(mockSharpInstance.jpeg).toHaveBeenCalledWith(DEFAULT_JPEG_OPTIONS);
  });
});
