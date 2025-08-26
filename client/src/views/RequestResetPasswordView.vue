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

const [submitSendLink] = useErrorMessage(async () => {
  toast.promise(sendResetPasswordLink(email.value), {
    pending: 'Sending link...',
    success: 'Reset link has been sent. Please check your inbox!',
    error: {
      render(err) {
        if (err?.data?.message) return err.data.message;
        return DEFAULT_SERVER_ERROR;
      },
    },
  });
});
</script>

<template>
  <AuthenticationForm
    :welcome-text="true"
    heading="Request reset password link"
    form-label="request-reset-password-link"
    @submit="submitSendLink"
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
