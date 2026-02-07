import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { appRouter } from '@server/controllers';
import { generateOpenApiDocument } from 'trpc-to-openapi';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'BrokeChef API',
  description: 'OpenAPI Documentation for the BrokeChef tRPC API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api/v1',
});

const outputPath = path.resolve(
  fileURLToPath(import.meta.url),
  '../openapi-spec.json'
);

try {
  fs.writeFileSync(outputPath, JSON.stringify(openApiDocument, undefined, 2));
  console.log('OpenAPI document generated successfully at:', outputPath);
} catch (error) {
  console.error('Failed to generate OpenAPI document:', error);
}
