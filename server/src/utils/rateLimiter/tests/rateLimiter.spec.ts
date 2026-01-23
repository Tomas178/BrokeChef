import RateLimitError from '@server/utils/errors/general/RateLimitError';
import { checkRateLimit, type RateLimitConfig } from '..';

const fakeEndpoint = 'fake-endpoint';
const fakeRateLimit = 10;
const fakeWindowSeconds = 3600;

const fakeRateLimitConfig: RateLimitConfig = {
  endpoint: fakeEndpoint,
  rateLimit: fakeRateLimit,
  windowSeconds: fakeWindowSeconds,
};

const [mockIncr, mockExpire, mockTTL] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
  vi.fn(),
]);

vi.mock('@server/utils/redis/client', () => ({
  redis: {
    incr: mockIncr,
    expire: mockExpire,
    ttl: mockTTL,
  },
}));

beforeEach(() => vi.resetAllMocks());

describe('checkRateLimit', () => {
  it('Should throw a RateLimitError', async () => {
    mockIncr.mockResolvedValueOnce(fakeRateLimit + 1);

    await expect(
      checkRateLimit('something', fakeRateLimitConfig)
    ).rejects.toThrowError(RateLimitError);
  });

  it('Should set expiration time for key if its the first instance of it', async () => {
    mockIncr.mockResolvedValueOnce(1);
    const identifier = 'random-key';

    await checkRateLimit(identifier, fakeRateLimitConfig);

    const expectedKey = `rate:${identifier}${fakeEndpoint}`;
    expect(mockExpire).toHaveBeenCalledExactlyOnceWith(
      expectedKey,
      fakeWindowSeconds
    );
  });

  it('Should allow request if the limit is not excedeed', async () => {
    mockIncr.mockResolvedValueOnce(fakeRateLimit - 1);

    await expect(
      checkRateLimit('something', fakeRateLimitConfig)
    ).resolves.not.toThrow();
  });
});
