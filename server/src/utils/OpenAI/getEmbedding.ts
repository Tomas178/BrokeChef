import type OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';

export async function getEmbedding(openai: OpenAI, input: string) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });

  return response.data[0].embedding;
}
