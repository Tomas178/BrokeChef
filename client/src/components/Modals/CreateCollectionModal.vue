<script setup lang="ts">
import {
  MAX_COLLECTION_TITLE_LENGTH,
  MIN_COLLECTION_TITLE_LENGTH,
} from '@server/shared/consts';
import { FwbButton, FwbFileInput, FwbInput, FwbModal } from 'flowbite-vue';
import { useCollectionsService } from '@/composables/useCollectionsService';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { collectionForm, collectionImageFile, handleCreateCollection } =
  useCollectionsService();

function handleClose() {
  emit('close');
}

async function handleCreate() {
  if (!collectionForm.title.trim()) {
    return;
  }

  await handleCreateCollection();
  handleClose();
}
</script>

<template>
  <FwbModal
    v-if="show"
    data-testid="create-collection-modal"
    @close="handleClose"
    focus-trap
  >
    <template #header>
      <div
        data-testid="create-collection-modal-header"
        class="flex items-center gap-2"
      >
        <h3 class="text-xl font-semibold">Create Collection</h3>
      </div>
    </template>

    <template #body>
      <div
        data-testid="create-collection-modal-body"
        class="flex flex-col gap-6"
      >
        <div class="flex flex-col gap-2">
          <div class="flex">
            <FwbFileInput
              data-testid="collection-image"
              v-model="collectionImageFile"
              accept="image/*"
              class="w-full"
            >
              <p
                class="text-primary-green !mt-1 text-sm font-bold tracking-wide dark:text-gray-300"
              >
                If you do not provide an image then AI will create one :)
              </p>
            </FwbFileInput>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label
            for="collection-title"
            class="text-sm font-medium text-gray-700"
          >
            Collection Title <span class="text-red-500">*</span>
          </label>
          <FwbInput
            id="collection-title"
            v-model="collectionForm.title"
            data-testid="collection-title"
            type="text"
            placeholder="Enter the collection title"
            class="bg-white"
            :minlength="MIN_COLLECTION_TITLE_LENGTH"
            :maxlength="MAX_COLLECTION_TITLE_LENGTH"
            :required="true"
          />
          <p class="text-xs text-gray-500">
            {{ collectionForm.title.length }}/{{ MAX_COLLECTION_TITLE_LENGTH }}
            characters
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <FwbButton
          @click="handleClose"
          color="alternative"
          data-testid="cancel-button"
        >
          Cancel
        </FwbButton>
        <FwbButton
          @click="handleCreate"
          :disabled="
            !collectionForm.title.trim() ||
            collectionForm.title.length < MIN_COLLECTION_TITLE_LENGTH
          "
          data-testid="create-button"
          class="bg-primary-green hover:bg-secondary-green"
        >
          Create Collection
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
