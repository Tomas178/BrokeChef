<script lang="ts" setup>
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm/PageForm.vue';
import AuthActions from '@/components/PageForm/AuthActions.vue';
import { FwbInput } from 'flowbite-vue';
import { computed, ref } from 'vue';

const links = computed(() => [
  { label: 'Explore recipes', name: 'Home' },
  {
    label: 'Explore recipes',
    name: 'Home',
  },
]);

const userForm = ref({
  email: '',
  password: '',
});

const formFooter = {
  text: 'Don’t have an account? ',
  redirectPageName: 'Sign Up',
  redirectPageFullLink: '/signup',
};
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Header :links="links" />

    <PageForm :welcome-text="true" heading="Sign In" form-label="Signin">
      <template #default>
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
        <div class="text-primary-green justify-center text-end leading-loose">
          <RouterLink to="/password-reset">Forgot your password?</RouterLink>
        </div>
        <AuthActions action-name="Sign In" :footer="formFooter" />
      </template>
    </PageForm>
  </div>
</template>
