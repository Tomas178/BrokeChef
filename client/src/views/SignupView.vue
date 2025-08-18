<script setup lang="ts">
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm/PageForm.vue';
import AuthActions from '@/components/PageForm/AuthActions.vue';
import AlertError from '@/components/AlertError.vue';
import { FwbInput, FwbToast } from 'flowbite-vue';
// import { isLoggedIn } from '@/stores/user';
import { computed, ref } from 'vue';
import useErrorMessage from '@/composables/useErrorMessage';
import { signup } from '@/stores/user';

const links = computed(() => [{ label: 'Explore recipes', name: 'Home' }]);

const userForm = ref({
  username: '',
  email: '',
  password: '',
});

const repeatPassword = ref('');

const hasSucceeded = ref(false);

const [submitSignup, errorMessage] = useErrorMessage(async () => {
  await signup(userForm.value);

  hasSucceeded.value = true;
});

const formFooter = {
  text: 'Already have an account? ',
  redirectPageName: 'Sign In',
  redirectPageFullLink: '/login',
};
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <fwb-toast v-if="hasSucceeded" closable type="success">
      You have successfully signed up! Please verify your email!
    </fwb-toast>

    <AlertError :message="errorMessage" />
  </div>

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

      <AuthActions action-name="Sign Up" :footer="formFooter" />
    </template>
  </PageForm>
</template>
