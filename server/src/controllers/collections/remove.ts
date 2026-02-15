import { collectionAuthorProcedure } from '@server/trpc/collectionAuthorProcedure';
import provideServices from '@server/trpc/provideServices';
import { collectionsService } from '@server/services/collectionsService';
import { S3ServiceException } from '@aws-sdk/client-s3';
import { voidSchema } from '@server/controllers/outputSchemas/shared';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';
import type { ErrorOverride } from '@server/utils/errors/utils/handleServiceErrors';

const errorsOverrideList: ErrorOverride[] = [
  {
    errorClass: S3ServiceException,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to delete the collection',
  },
];

export default collectionAuthorProcedure
  .use(provideServices({ collectionsService }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/collections/{id}',
      summary: 'Deletes the collection',
      tags: ['Collections'],
      protect: true,
    },
  })
  .output(voidSchema)
  .mutation(async ({ input: { id: collectionId }, ctx: { services } }) =>
    withServiceErrors(async () => {
      await services.collectionsService.remove(collectionId);

      return;
    }, errorsOverrideList)
  );
