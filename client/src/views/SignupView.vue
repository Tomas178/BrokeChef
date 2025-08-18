<script setup lang="ts">
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm/PageForm.vue';
import AuthActions from '@/components/PageForm/AuthActions.vue';
import AlertError from '@/components/AlertError.vue';
import { FwbInput } from 'flowbite-vue';
// import { isLoggedIn } from '@/stores/user';
import { computed, ref } from 'vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { signup } from '@/stores/user';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '@/consts';

const links = computed(() => [{ label: 'Explore recipes', name: 'Home' }]);

const userForm = ref({
  username: '',
  email: '',
  password: '',
});

const repeatPassword = ref('');

const [submitSignup, errorMessage] = useErrorMessage(async () => {
  if (userForm.value.password !== repeatPassword.value) {
    throw new Error("Passwords don't match");
  }

  toast.promise(
    signup(userForm.value),
    {
      pending: 'Creating account...',
      success: 'You have successfully signed up! Please verify your email!',
      error: {
        render(err) {
          if (err?.data?.message) return err.data.message;
          return DEFAULT_SERVER_ERROR;
        },
      },
    },
    {
      position: toast.POSITION.TOP_RIGHT,
    }
  );
});

const formFooter = {
  text: 'Already have an account? ',
  redirectPageName: 'Sign In',
  redirectPageFullLink: '/login',
};
</script>

<template>
  <Header :links="links">
    <!-- <template #menu>
      <FwbNavbarLink v-if="isLoggedIn">Logout</FwbNavbarLink>
    </template> -->
  </Header>
  <PageForm
    :welcome-text="true"
    heading="Sign up"
    form-label="Signup"
    @submit="submitSignup"
  >
    <template #default>
      <fwb-input
        data-testId="username"
        label="Username"
        type="text"
        :required="true"
        placeholder="Enter your username"
        v-model="userForm.username"
        class="bg-white"
      />
      <fwb-input
        data-testId="email"
        label="Email"
        type="email"
        :required="true"
        placeholder="Enter your email"
        v-model="userForm.email"
        class="bg-white"
      />
      <fwb-input
        data-testId="password"
        label="Password"
        type="password"
        :required="true"
        placeholder="Enter your password"
        v-model="userForm.password"
        class="bg-white"
      />
      <fwb-input
        data-testId="repeat-password"
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
  </PageForm>
</template>
