<script setup lang="ts">
import { FwbButton, FwbInput } from 'flowbite-vue';
import useToast from '@/composables/useToast';
import type { UsersPublic } from '@server/shared/types';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { trpc } from '@/trpc';
import useErrorMessage from '@/composables/useErrorMessage';
import { useUserStore } from '@/stores/user';
import { DEFAULT_SERVER_ERROR } from '@/consts';
import { isSamePassword } from '@/utils/isSamePassword';

const { showLoading, updateToast } = useToast();

const { updatePassword, updateEmail } = useUserStore();

const router = useRouter();

const props = defineProps<{
  id?: string;
}>();

const user = ref<UsersPublic>();

const email = ref('');

const currentPassword = ref('');
const newPassword = ref('');
const repeatPassword = ref('');

const goBack = async () => {
  router.go(-1);
};

const [changePassword, passwordErrorMessage] = useErrorMessage(async () => {
  if (!isSamePassword(newPassword.value, repeatPassword.value)) {
    throw new Error("Passwords don't match");
  }

  await updatePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });
}, true);

async function handleChangePassword() {
  const id = showLoading('Changing password');

  try {
    await changePassword();

    currentPassword.value = '';
    newPassword.value = '';
    repeatPassword.value = '';

    updateToast(id, 'success', 'Password has been changed');
  } catch {
    updateToast(
      id,
      'error',
      passwordErrorMessage.value || DEFAULT_SERVER_ERROR
    );
  }
}

const [changeEmail, emailErrorMessage] = useErrorMessage(
  async () => await updateEmail(email.value),
  true
);

async function handleChangeEmail() {
  const id = showLoading('Changing email');

  try {
    await changeEmail();

    email.value = '';
    updateToast(id, 'success', 'Verify your new email and sign in again!');
  } catch {
    updateToast(id, 'error', emailErrorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

onMounted(async () => {
  user.value = await trpc.users.findById.query(props.id);
});
</script>

<template>
  <div v-if="user">
    <div
      class="bg-primary-green dark:bg-primary-green-dark relative flex h-20 w-full items-start justify-start sm:h-32 xl:h-52"
    >
      <FwbButton
        @click="goBack"
        color="green"
        class="bg-tertiary-green dark:bg-tertiary-green-dark dark:hover:bg-secondary-green-dark hover:bg-secondary-green m-4 cursor-pointer"
        pill
        square
      >
        <svg
          class="h-4 w-4 md:h-7 md:w-7"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.75 16.25H8.925L13.4625 21.7C13.6747 21.9553 13.7768 22.2844 13.7463 22.6149C13.7158 22.9455 13.5553 23.2503 13.3 23.4625C13.0447 23.6747 12.7156 23.7768 12.3851 23.7463C12.0546 23.7158 11.7497 23.5553 11.5375 23.3L5.2875 15.8C5.24545 15.7404 5.20785 15.6777 5.175 15.6125C5.175 15.55 5.175 15.5125 5.0875 15.45C5.03084 15.3067 5.00118 15.1541 5 15C5.00118 14.8459 5.03084 14.6933 5.0875 14.55C5.0875 14.4875 5.0875 14.45 5.175 14.3875C5.20785 14.3223 5.24545 14.2597 5.2875 14.2L11.5375 6.70002C11.655 6.55892 11.8022 6.44544 11.9686 6.36767C12.1349 6.28989 12.3164 6.24972 12.5 6.25002C12.7921 6.24945 13.0751 6.35117 13.3 6.53752C13.4266 6.64246 13.5312 6.77134 13.6079 6.91677C13.6846 7.0622 13.7318 7.22133 13.7469 7.38506C13.762 7.54878 13.7447 7.71387 13.6959 7.87087C13.6471 8.02788 13.5678 8.17371 13.4625 8.30002L8.925 13.75L23.75 13.75C24.0815 13.75 24.3995 13.8817 24.6339 14.1161C24.8683 14.3506 25 14.6685 25 15C25 15.3315 24.8683 15.6495 24.6339 15.8839C24.3995 16.1183 24.0815 16.25 23.75 16.25Z"
            fill="#556987"
          />
        </svg>
      </FwbButton>
    </div>

    <div class="flex min-h-screen items-center justify-center">
      <div
        class="flex w-full flex-col items-center justify-around gap-10 px-4 py-10 sm:px-36 lg:flex-row lg:items-start"
      >
        <form
          class="dark:bg-background-recipe-card-dark flex w-full max-w-md flex-col gap-4 rounded-4xl bg-white p-12 md:gap-10"
          @submit.prevent="handleChangeEmail"
        >
          <span class="text-xl font-bold dark:text-white">Change Email</span>
          <div class="flex flex-col gap-4">
            <FwbInput
              data-testid="email"
              label="Email"
              type="email"
              autocomplete="on"
              placeholder="Enter new email"
              v-model="email"
              class="bg-white"
              wrapperClass="dark:text-white"
            />
            <FwbButton
              data-testid="save-email"
              class="text-submit-text gradient-action-button h-full w-full cursor-pointer font-bold hover:outline-1 hover:outline-black"
              type="submit"
              pill
            >
              Save
            </FwbButton>
          </div>
        </form>

        <form
          class="dark:bg-background-recipe-card-dark flex w-full max-w-md flex-col gap-4 rounded-4xl bg-white p-12 md:gap-10"
          @submit.prevent="handleChangePassword"
        >
          <span class="text-xl font-bold dark:text-white">Change Password</span>
          <div class="flex flex-col gap-4">
            <FwbInput
              data-testid="current-password"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              v-model="currentPassword"
              class="bg-white"
              wrapperClass="dark:text-white"
            />
            <FwbInput
              data-testid="new-password"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              v-model="newPassword"
              class="bg-white"
              wrapperClass="dark:text-white"
            />
            <FwbInput
              data-testid="repeat-password"
              label="Repeat password"
              type="password"
              placeholder="Repeat your password"
              v-model="repeatPassword"
              class="bg-white"
              wrapperClass="dark:text-white"
            />
            <FwbButton
              data-testid="save-password"
              class="text-submit-text gradient-action-button w-full cursor-pointer font-bold hover:outline-1 hover:outline-black"
              type="submit"
              pill
            >
              Save
            </FwbButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
