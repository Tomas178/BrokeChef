import { GoogleGenAI } from '@google/genai';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      google: {
        geminiApiKey: 'gemini-api-key',
      },
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ai } from '../client';

describe('GoogleGenAiClient', () => {
  it('Should call Google Gen Ai Client with correct settings', () => {
    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'gemini-api-key',
    });
  });
});
