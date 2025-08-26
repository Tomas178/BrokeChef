<script setup lang="ts">
import AuthenticationForm from '@/components/Forms/AuthenticationForm/AuthenticationForm.vue';
import AuthActions from '@/components/Forms/AuthenticationForm/AuthActions.vue';
import AlertError from '@/components/AlertError.vue';
import { FwbInput } from 'flowbite-vue';
import { ref } from 'vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { useUserStore } from '@/stores/user';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import { isSamePassword } from '@/utils/isSamePassword';
import { loginPath } from '@/config';

const { signup } = useUserStore();

const userForm = ref({
  username: '',
  email: '',
  password: '',
});

const repeatPassword = ref('');

const [submitSignup, errorMessage] = useErrorMessage(async () => {
  if (!isSamePassword(userForm.value.password, repeatPassword.value)) {
    throw new Error("Passwords don't match");
  }

  toast.promise(signup(userForm.value), {
    pending: 'Creating account...',
    success: {
      render() {
        userForm.value.username = '';
        userForm.value.email = '';
        userForm.value.password = '';
        repeatPassword.value = '';
        return 'You have successfully signed up! Please verify your email!';
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
  text: 'Already have an account? ',
  redirectPageName: 'Sign In',
  redirectPageFullLink: loginPath,
};
</script>

<template>
  <AuthenticationForm
    :welcome-text="true"
    heading="Sign up"
    form-label="Signup"
    @submit="submitSignup"
  >
    <template #default>
      <fwb-input
        data-testid="username"
        label="Username"
        type="text"
        :required="true"
        placeholder="Enter your username"
        v-model="userForm.username"
        class="bg-white"
      />
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

      <AuthActions action-name="Sign Up" :footer="formFooter" />
    </template>
  </AuthenticationForm>
</template>
