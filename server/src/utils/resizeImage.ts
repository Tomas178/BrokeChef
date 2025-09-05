import sharp from 'sharp';

export async function resizeImage(file: Express.Multer.File) {
  const buffer = await sharp(file.buffer)
    .resize({
      height: 1920,
      width: 1080,
      fit: 'contain',
    })
    .toFormat('jpeg')
    .toBuffer();

  return buffer;
}
