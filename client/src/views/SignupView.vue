<script setup lang="ts">
import Header from '@/components/Header.vue';
import PageForm from '@/components/PageForm.vue';
import { FwbInput, FwbButton } from 'flowbite-vue';
// import { isLoggedIn } from '@/stores/user';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

const links = computed(() => [{ label: 'Explore recipes', name: 'Home' }]);

const userForm = ref({
  username: '',
  email: '',
  password: '',
});

const repeatPassword = ref('');
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
      />
      <fwb-input
        data-testId="email"
        label="Email"
        type="email"
        :required="true"
        placeholder="Enter your email"
        v-model="userForm.email"
      />
      <fwb-input
        data-testId="password"
        label="Password"
        type="password"
        :required="true"
        placeholder="Enter your password"
        v-model="userForm.password"
      />
      <fwb-input
        data-testId="repeat-password"
        label="Repeat Password"
        type="password"
        :required="true"
        placeholder="Repeat your password"
        v-model="repeatPassword"
      />

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-6">
          <div class="flex items-center justify-start">
            <div class="ml-1 h-0 flex-1 outline-2 outline-black"></div>
            <div class="mx-4 justify-center leading-loose text-black">
              Or with
            </div>
            <div class="mr-1 h-0 flex-1 outline-2 outline-black"></div>
          </div>

          <div class="flex items-center justify-center gap-2">
            <div
              class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-3xl bg-white px-6 py-2"
            >
              <div class="flex items-center justify-center gap-2">
                <img src="@/assets/social-logins/Google.png" />
                <div class="text-sm text-black">Google</div>
              </div>
            </div>

            <div
              class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-3xl bg-white px-6 py-2"
            >
              <div class="flex items-center justify-center gap-2">
                <img src="@/assets/social-logins/GitHub.png" />
                <div class="text-sm text-black">GitHub</div>
              </div>
            </div>
          </div>

          <div>
            <fwb-button
              class="from-start text-submit-text via-mid to-end mr-3 w-full rounded-4xl bg-gradient-to-r font-bold"
              type="submit"
              size="xl"
              pill
              >Sign Up</fwb-button
            >
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="justify-center self-stretch text-center">
        <span class="text-black">Already have an account? </span
        ><RouterLink to="/login" class="text-start">Sign In</RouterLink>
      </div>
    </template>
  </PageForm>
</template>
