import type OpenAI from 'openai';
import { getEmbedding } from '../getEmbedding';

const fakeEmbedding = [0.1, 0.2, 0.3];

const fakeResponse = {
  data: [
    {
      embedding: fakeEmbedding,
    },
  ],
};

const mockOpenAI = {
  embeddings: {
    create: vi.fn(() => fakeResponse),
  },
} as unknown as OpenAI;

describe('getEmbedding', () => {
  beforeEach(() => vi.resetAllMocks());

  it('Given input should return embedding', async () => {
    const embedding = await getEmbedding(mockOpenAI, 'abc');

    expect(embedding).toBe(fakeEmbedding);
  });
});
