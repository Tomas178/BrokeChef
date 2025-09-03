<script lang="ts" setup>
import AuthenticationForm from '@/components/Forms/AuthenticationForm/AuthenticationForm.vue';
import SubmitButton from '@/components/Forms/AuthenticationForm/SubmitButton.vue';
import useErrorMessage from '@/composables/useErrorMessage';
import useToast from '@/composables/useToast';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import { useUserStore } from '@/stores/user';
import { FwbInput } from 'flowbite-vue';
import { ref } from 'vue';

const { showLoading, updateToast } = useToast();

const { sendResetPasswordLink } = useUserStore();

const email = ref('');

const [submitSendLink, errorMessage] = useErrorMessage(
  async () => sendResetPasswordLink(email.value),
  true
);

async function handleSendLink() {
  const id = showLoading('Sending link...');

  try {
    await submitSendLink();

    updateToast(
      id,
      'success',
      'Reset link has been sent. Please check your inbox!'
    );
  } catch {
    updateToast(id, 'error', errorMessage.value || DEFAULT_SERVER_ERROR);
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
