export const formatRateLimitKey = (identifier: string, endpoint: string) =>
  `rate:${identifier}${endpoint}`;
