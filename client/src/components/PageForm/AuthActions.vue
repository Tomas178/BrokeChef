<script lang="ts" setup>
import SubmitButton from './SubmitButton.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();

const { actionName, footer } = defineProps<{
  actionName: string;
  footer: {
    text: string;
    redirectPageName: string;
    redirectPageFullLink: string;
  };
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-start">
        <div class="ml-1 h-0 flex-1 outline-2 outline-black"></div>
        <div class="mx-4 justify-center leading-loose text-black">Or with</div>
        <div class="mr-1 h-0 flex-1 outline-2 outline-black"></div>
      </div>

      <div class="flex items-center justify-center gap-2">
        <button
          class="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-3xl bg-white px-6 py-2"
          @click="user.socialLogin('google')"
        >
          <div class="flex items-center justify-center gap-2">
            <img src="@/assets/social-logins/Google.png" />
            <span class="text-sm text-black">Google</span>
          </div>
        </button>

        <button
          class="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-3xl bg-white px-6 py-2"
          @click="user.socialLogin('github')"
        >
          <div class="flex items-center justify-center gap-2">
            <img src="@/assets/social-logins/GitHub.png" />
            <span class="text-sm text-black">GitHub</span>
          </div>
        </button>
      </div>

      <SubmitButton :action-name="actionName" />

      <div class="justify-center self-stretch text-center">
        <span class="text-black">{{ footer.text }} </span
        ><RouterLink
          :to="footer.redirectPageFullLink"
          class="text-primary-green"
          >{{ footer.redirectPageName }}</RouterLink
        >
      </div>
    </div>
  </div>
</template>
