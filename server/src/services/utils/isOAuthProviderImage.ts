export function isOAuthProviderImage(imageUrl: string | null): boolean {
  if (!imageUrl) return false;

  return /googleusercontent|githubusercontent/i.test(imageUrl);
}
