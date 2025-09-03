<script lang="ts" setup>
import AuthenticationForm from '@/components/Forms/AuthenticationForm/AuthenticationForm.vue';
import SubmitButton from '@/components/Forms/AuthenticationForm/SubmitButton.vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import { useUserStore } from '@/stores/user';
import { FwbInput } from 'flowbite-vue';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const { sendResetPasswordLink } = useUserStore();

const email = ref('');

const [submitSendLink, errorMessage] = useErrorMessage(
  async () => sendResetPasswordLink(email.value),
  true
);

async function handleSendLink() {
  const id = toast.loading('Sending link...');

  try {
    await submitSendLink();

    toast.update(id, {
      render: 'Reset link has been sent. Please check your inbox!',
      type: 'success',
      isLoading: false,
    });
  } catch {
    toast.update(id, {
      render: errorMessage.value || DEFAULT_SERVER_ERROR,
      type: 'error',
      isLoading: false,
    });
  }
}
</script>

<template>
  <AuthenticationForm
    :welcome-text="false"
    heading="Request reset password link"
    form-label="request-reset-password-link"
    @submit="handleSendLink"
  >
    <template #default>
      <div class="flex flex-col gap-8">
        <fwb-input
          data-testid="email"
          label="Email"
          type="email"
          :required="true"
          placeholder="Enter your email"
          v-model="email"
          class="bg-white"
        />

        <SubmitButton action-name="Send Link" />
      </div>
    </template>
  </AuthenticationForm>
</template>
