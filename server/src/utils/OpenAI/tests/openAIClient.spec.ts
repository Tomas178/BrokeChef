import OpenAI from 'openai';

const fakeAPIKey = vi.hoisted(() => 'openai-api-key');

vi.mock('openai', () => ({
  default: vi.fn(),
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      openai: {
        apiKey: fakeAPIKey,
      },
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { openai } from '../client';

describe('OpenAIClient', () => {
  it('Should call OpenAI Client with correct settings', () => {
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: fakeAPIKey });
  });
});
