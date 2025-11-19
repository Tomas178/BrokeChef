<script lang="ts" setup>
import { ref } from 'vue';

defineProps<{
  description: string;
  actionName: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

function open() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

function confirm() {
  emit('confirm');
  close();
}

function cancel() {
  emit('cancel');
  close();
}

defineExpose({ open, close });
</script>

<template>
  <dialog
    ref="dialogRef"
    class="bg-background-form-light dark:bg-background-form-dark fixed top-1/2 left-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow-xl"
  >
    <p class="mb-6 text-lg lg:text-3xl dark:text-gray-300">{{ description }}</p>

    <div class="flex justify-center gap-4 font-bold">
      <button
        data-testid="dialog-cancel"
        type="button"
        @click="cancel"
        class="font-primary cursor-pointer rounded-4xl bg-red-400 px-6 py-2 text-white hover:bg-red-500 hover:outline-2 dark:bg-red-800 dark:outline-black dark:hover:bg-red-900"
      >
        Cancel
      </button>

      <button
        data-testid="dialog-confirm"
        type="button"
        @click="confirm"
        class="font-primary cursor-pointer rounded-4xl bg-green-400 px-6 py-2 text-white hover:bg-green-500 hover:outline-2 dark:bg-green-800 dark:outline-black dark:hover:bg-green-900"
      >
        {{ actionName }}
      </button>
    </div>
  </dialog>
</template>
