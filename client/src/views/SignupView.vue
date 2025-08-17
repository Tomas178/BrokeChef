<script setup lang="ts">
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm/PageForm.vue';
import AuthActions from '@/components/PageForm/AuthActions.vue';
import { FwbInput } from 'flowbite-vue';
// import { isLoggedIn } from '@/stores/user';
import { computed, ref } from 'vue';

const links = computed(() => [{ label: 'Explore recipes', name: 'Home' }]);

const userForm = ref({
  username: '',
  email: '',
  password: '',
});

const repeatPassword = ref('');

const formFooter = {
  text: 'Already have an account? ',
  pageName: 'Sign In',
};
</script>

<template>
  <Header :links="links">
    <!-- <template #menu>
      <FwbNavbarLink v-if="isLoggedIn">Logout</FwbNavbarLink>
    </template> -->
  </Header>
  <PageForm :welcome-text="true" heading="Sign up" form-label="Signup">
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
