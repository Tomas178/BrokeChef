<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue';

const { actionName, footer } = defineProps<{
  actionName: string;
  footer: {
    text: string;
    pageName: string;
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
          >{{ actionName }}</fwb-button
        >
      </div>

      <div class="justify-center self-stretch text-center">
        <span class="text-black">{{ footer.text }} </span
        ><RouterLink to="/login" class="text-start">{{
          footer.pageName
        }}</RouterLink>
      </div>
    </div>
  </div>
</template>
