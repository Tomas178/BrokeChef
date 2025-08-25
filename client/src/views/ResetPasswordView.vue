<script setup lang="ts">
import AlertError from '@/components/AlertError.vue';
import PageForm from '@/components/PageForm/PageForm.vue';
import SubmitButton from '@/components/PageForm/SubmitButton.vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { loginPath } from '@/config';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import { resetPassword } from '@/stores/user';
import { isSamePassword } from '@/utils/isSamePassword';
import { FwbInput } from 'flowbite-vue';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const password = ref('');
const repeatPassword = ref('');

const [submitResetPassword, errorMessage] = useErrorMessage(async () => {
  if (!isSamePassword(password.value, repeatPassword.value)) {
    throw new Error("Passwords don't match");
  }

  toast.promise(resetPassword(password.value), {
    pending: 'Resetting password...',
    success: 'Password has been changed now you can log in!',
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
  <PageForm
    :welcome-text="true"
    heading="Reset Password"
    form-label="reset-password"
    @submit="submitResetPassword"
  >
    <template #default>
      <fwb-input
        data-testid="password"
        label="Password"
        type="password"
        :required="true"
        placeholder="Enter your password"
        v-model="password"
        class="bg-white"
      />

      <fwb-input
        data-testid="repeat-password"
        label="Repeat Password"
        type="password"
        :required="true"
        placeholder="Repeat your password"
        v-model="repeatPassword"
        class="bg-white"
      />

      <div class="inline-flex">
        <AlertError :message="errorMessage" @clear="errorMessage = ''" />
      </div>

      <SubmitButton action-name="Reset Password" />

      <div class="justify-end self-stretch text-center">
        <RouterLink :to="loginPath" class="text-primary-green">
          Sign in
        </RouterLink>
      </div>
    </template>
  </PageForm>
</template>
