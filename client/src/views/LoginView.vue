<script lang="ts" setup>
import AuthenticationForm from '@/components/Forms/AuthenticationForm/AuthenticationForm.vue';
import AuthActions from '@/components/Forms/AuthenticationForm/AuthActions.vue';
import { FwbInput } from 'flowbite-vue';
import { ref } from 'vue';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import useErrorMessage from '@/composables/useErrorMessage';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import useToast from '@/composables/useToast';
import { ROUTE_PATHS } from '@/router/consts/routePaths';
import { ROUTE_NAMES } from '@/router/consts/routeNames';

const { showLoading, updateToast } = useToast();

const { login } = useUserStore();

const router = useRouter();

const userForm = ref({
  email: '',
  password: '',
});

const [submitLogin, errorMessage] = useErrorMessage(
  async () => await login(userForm.value),
  true
);

async function handleLogin() {
  const id = showLoading('Logging in...');

  try {
    await submitLogin();

    updateToast(id, 'success', 'You have logged in!');

    userForm.value.email = '';
    userForm.value.password = '';

    setTimeout(async () => {
      await router.push({
        name: ROUTE_NAMES.HOME,
      });
    }, 1500);
  } catch {
    updateToast(id, 'error', errorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

const formFooter = {
  text: 'Don’t have an account? ',
  redirectPageName: 'Sign Up',
  redirectPageFullLink: ROUTE_PATHS.SIGNUP,
};
</script>

<template>
  <AuthenticationForm
    :welcome-text="true"
    heading="Sign In"
    form-label="Signin"
    @submit="handleLogin"
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

      <div
        class="text-primary-green hover:text-secondary-green justify-center text-end leading-loose"
      >
        <RouterLink :to="ROUTE_PATHS.REQUEST_RESET_PASSWORD"
          >Forgot your password?</RouterLink
        >
      </div>

      <AuthActions action-name="Sign In" :footer="formFooter" />
    </template>
  </AuthenticationForm>
</template>
