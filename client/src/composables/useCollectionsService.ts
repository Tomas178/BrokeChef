import { trpc } from '@/trpc';
import useToast from './useToast';
import {
  type CollectionsPublicBasic,
  type CreateCollectionRequest,
} from '@server/shared/types';
import { reactive, ref } from 'vue';
import { apiOrigin } from '@/config';
import axios from 'axios';
import useErrorMessage from './useErrorMessage';
import { DEFAULT_SERVER_ERROR } from '@/consts';

export function useCollectionsService() {
  const { showLoading, updateToast } = useToast();

  const userCollections = ref<CollectionsPublicBasic[]>();

  const collectionForm = reactive<CreateCollectionRequest>({
    title: '',
    imageUrl: undefined,
  });

  const collectionImageFile = ref<File | undefined>(undefined);
  const uploadEndpoint = `${apiOrigin}/api/upload/collection`;

  async function uploadCollectionImage(): Promise<string | undefined> {
    if (!collectionImageFile.value) {
      return undefined;
    }

    const { data } = await axios.post<Pick<CollectionsPublicBasic, 'imageUrl'>>(
      uploadEndpoint,
      collectionImageFile.value,
      {
        withCredentials: true,
        headers: {
          'Content-Type': collectionImageFile.value.type,
        },
      }
    );

    return data.imageUrl;
  }

  function resetForm() {
    collectionForm.title = '';
    collectionImageFile.value = undefined;
  }

  const [createCollection, createErrorMessage] = useErrorMessage(async () => {
    collectionForm.imageUrl = await uploadCollectionImage();
    return trpc.collections.create.mutate(collectionForm);
  }, true);

  async function handleCreateCollection() {
    const id = showLoading('Creating collection...');

    try {
      const newCollection = await createCollection();

      if (!newCollection) {
        updateToast(
          id,
          'error',
          createErrorMessage.value || DEFAULT_SERVER_ERROR
        );
        return;
      }

      updateToast(id, 'success', 'Collection has been created!');
      resetForm();
    } catch {
      updateToast(
        id,
        'error',
        createErrorMessage.value || DEFAULT_SERVER_ERROR
      );
    }
  }

  async function fetchUserCollections() {
    userCollections.value = await trpc.collections.findByUserId.query();
  }

  return {
    userCollections,
    fetchUserCollections,

    // Create Collection
    collectionForm,
    collectionImageFile,
    resetForm,
    handleCreateCollection,
  };
}
