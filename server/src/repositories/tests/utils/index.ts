import { OPENAI_EMBEDDING_DIMENSIONS } from '@server/database/migrations/20260102T092811Z-addVectorEmbedding';

export const getVector = (fillValue: number) =>
  Array.from<number>({ length: OPENAI_EMBEDDING_DIMENSIONS }).fill(fillValue);
