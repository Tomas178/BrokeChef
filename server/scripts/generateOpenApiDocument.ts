import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { appRouter } from '@server/controllers';
import { generateOpenApiDocument } from 'trpc-to-openapi';

const OPENAPI_FOLDER_NAME = 'openapi';
const FILENAME = 'openapi-spec.json';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'BrokeChef API',
  description: 'OpenAPI Documentation for the BrokeChef tRPC API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api/v1',
});

const OUTPUT_PATH = path.resolve(
  fileURLToPath(import.meta.url),
  `../../${OPENAPI_FOLDER_NAME}/${FILENAME}`
);

try {
  const OUTPUT_DIRECTORY = path.dirname(OUTPUT_PATH);

  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(openApiDocument, undefined, 2));
  console.log('OpenAPI document generated successfully at:', OUTPUT_PATH);
} catch (error) {
  console.error('Failed to generate OpenAPI document:', error);
}
