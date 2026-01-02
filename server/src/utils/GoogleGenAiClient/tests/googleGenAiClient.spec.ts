import { GoogleGenAI } from '@google/genai';

const fakeAPIKey = vi.hoisted(() => 'gemini-api-key');

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      google: {
        geminiApiKey: fakeAPIKey,
      },
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ai } from '../client';

describe('GoogleGenAiClient', () => {
  it('Should call Google Gen Ai Client with correct settings', () => {
    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: fakeAPIKey,
    });
  });
});
