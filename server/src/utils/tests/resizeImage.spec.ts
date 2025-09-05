import sharp from 'sharp';
import { resizeImage } from '../resizeImage';

const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from('mocked image'));
const mockToFormat = vi.fn(() => ({ toBuffer: mockToBuffer }));
const mockResize = vi.fn(() => ({ toFormat: mockToFormat }));

vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      resize: mockResize,
    })),
  };
});

describe('resizeImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call sharp with the file buffer and chain methods correctly', async () => {
    const mockFile = {
      buffer: Buffer.from('fake image data'),
      originalname: 'image.png',
      mimetype: 'image/png',
      size: 100,
    } as Express.Multer.File;

    const result = await resizeImage(mockFile);

    expect(sharp).toHaveBeenCalledWith(mockFile.buffer);

    expect(mockResize).toHaveBeenCalledWith({
      height: 1920,
      width: 1080,
      fit: 'contain',
    });
    expect(mockToFormat).toHaveBeenCalledWith('jpeg');
    expect(mockToBuffer).toHaveBeenCalled();

    expect(result).toEqual(Buffer.from('mocked image'));
  });
});
