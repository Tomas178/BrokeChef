import { formatRateLimitKey } from '../formatRateLimitKey';

describe('formatRateLimitKey', () => {
  it('Should return formatted key', () => {
    const identifier = 'identifier';
    const endpoint = 'endpoint';

    const expectedKey = `rate:${identifier}${endpoint}`;

    expect(formatRateLimitKey(identifier, endpoint)).toBe(expectedKey);
  });
});
