import sharp, { type JpegOptions, type ResizeOptions } from 'sharp';

export const DEFAULT_RESIZE_OPTIONS: ResizeOptions = {
  width: 1080,
  height: 1920,
};

export const DEFAULT_JPEG_OPTIONS: JpegOptions = {
  quality: 80,
};

export function createTransformStream(
  resize = DEFAULT_RESIZE_OPTIONS,
  jpeg = DEFAULT_JPEG_OPTIONS
) {
  return sharp({
    sequentialRead: true,
  })
    .resize(resize)
    .jpeg(jpeg);
}
