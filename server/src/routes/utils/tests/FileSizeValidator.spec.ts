import { once } from 'node:events';
import ImageTooLarge from '@server/utils/errors/images/ImageTooLarge';
import { DEFAULT_MAX_FILE_SIZE } from '@server/shared/consts';
import { FileSizeValidator } from '../FileSizeValidator';

vi.mock('@server/utils/errors/images/ImageTooLarge');

describe('createFileSizeValidator', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Should allow upload if total size is within the limit', () => {
    const maxSize = 100;
    const validator = new FileSizeValidator(maxSize);

    const dataSpy = vi.fn();
    validator.on('data', dataSpy);

    const chunk1 = Buffer.alloc(50);
    const chunk2 = Buffer.alloc(50);

    validator.write(chunk1);
    validator.write(chunk2);

    expect(dataSpy).toHaveBeenCalledTimes(2);

    expect(dataSpy).toHaveBeenNthCalledWith(1, chunk1);
    expect(dataSpy).toHaveBeenNthCalledWith(2, chunk2);
  });

  it('Should emit an error if size exceeds the limit', async () => {
    const maxSize = 100;
    const validator = new FileSizeValidator(maxSize);

    const errorPromise = once(validator, 'error');

    validator.write(Buffer.alloc(100));
    validator.write(Buffer.alloc(1));

    const [error] = await errorPromise;

    expect(error).toBeInstanceOf(ImageTooLarge);
    expect(ImageTooLarge).toHaveBeenCalledWith(maxSize);
  });

  it('Should use DEFAULT_MAX_FILE_SIZE if no size is provided', async () => {
    const validator = new FileSizeValidator();

    const errorPromise = once(validator, 'error');

    const largeChunk = Buffer.alloc(DEFAULT_MAX_FILE_SIZE + 1);
    validator.write(largeChunk);

    const [error] = await errorPromise;

    expect(error).toBeInstanceOf(ImageTooLarge);
    expect(ImageTooLarge).toHaveBeenCalledWith(DEFAULT_MAX_FILE_SIZE);
  });
});
