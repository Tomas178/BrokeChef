<script lang="ts" setup>
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm/PageForm.vue';
import SubmitButton from '@/components/PageForm/SubmitButton.vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import { sendResetPasswordLink } from '@/stores/user';
import { FwbInput } from 'flowbite-vue';
import { computed, ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const links = computed(() => [
  { label: 'Sign in', name: 'Login' },
  { label: 'Sign up', name: 'Signup' },
]);

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
  <div class="flex min-h-screen flex-col">
    <Header :links="links" />

    <PageForm
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
    </PageForm>
  </div>
</template>
