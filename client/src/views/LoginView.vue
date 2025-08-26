<script lang="ts" setup>
import AuthenticationForm from '@/components/Forms/AuthenticationForm/AuthenticationForm.vue';
import AuthActions from '@/components/Forms/AuthenticationForm/AuthActions.vue';
import { FwbInput } from 'flowbite-vue';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import useErrorMessage from '@/composables/useErrorMessage';
import { useUserStore } from '@/stores/user';
import { requestResetPasswordPath, signupPath } from '@/config';

const { login } = useUserStore();

const userForm = ref({
  email: '',
  password: '',
});

const [submitLogin] = useErrorMessage(async () => {
  toast.promise(login(userForm.value), {
    pending: 'Logging in...',
    success: {
      render() {
        userForm.value.email = '';
        userForm.value.password = '';
        return 'You have logged in!';
      },
    },
    error: {
      render(err) {
        if (err?.data?.message) return err.data.message;
        return DEFAULT_SERVER_ERROR;
      },
    },
  });
});

const formFooter = {
  text: 'Don’t have an account? ',
  redirectPageName: 'Sign Up',
  redirectPageFullLink: signupPath,
};
</script>

<template>
  <AuthenticationForm
    :welcome-text="true"
    heading="Sign In"
    form-label="Signin"
    @submit="submitLogin"
  >
    <template #default>
      <fwb-input
        data-testid="email"
        label="Email"
        type="email"
        :required="true"
        placeholder="Enter your email"
        v-model="userForm.email"
        class="bg-white"
      />
      <fwb-input
        data-testid="password"
        label="Password"
        type="password"
        :required="true"
        placeholder="Enter your password"
        v-model="userForm.password"
        class="bg-white"
      />

      <div class="text-primary-green justify-center text-end leading-loose">
        <RouterLink :to="requestResetPasswordPath"
          >Forgot your password?</RouterLink
        >
      </div>

      <AuthActions action-name="Sign In" :footer="formFooter" />
    </template>
  </AuthenticationForm>
</template>
