export function imageUrlToBucketKey(url: string) {
  return url.split('/').splice(-2).join('/');
}
