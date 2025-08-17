<script setup lang="ts">
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm.vue';
import { FwbInput } from 'flowbite-vue';
// import { isLoggedIn } from '@/stores/user';
import { computed, ref } from 'vue';

const links = computed(() => [{ label: 'Explore recipes', name: 'Home' }]);

const userForm = ref({
  username: '',
  email: '',
  password: '',
});
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
        placeholder="Enter you username"
        v-model="userForm.username"
      />
    </template>
  </PageForm>
</template>
