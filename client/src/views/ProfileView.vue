<script setup lang="ts">
import { FwbButton, FwbFileInput } from 'flowbite-vue';
import { useRouter } from 'vue-router';
import type { UsersPublic } from '@server/shared/types';
import { onMounted, ref, watch } from 'vue';
import { trpc } from '@/trpc';
import useErrorMessage from '@/composables/useErrorMessage';
import Spinner from '@/components/Spinner.vue';
import axios from 'axios';
import { apiOrigin } from '@/config';
import { DEFAULT_SERVER_ERROR } from '../consts';
import useToast from '@/composables/useToast';
import RecipesList from '@/components/RecipesList/RecipesList.vue';
import { RECIPE_TYPE } from '@/components/RecipesList/types';

const { showLoading, updateToast } = useToast();

const router = useRouter();

const props = defineProps<{
  id?: string;
}>();

const profileImageFile = ref<File | undefined>(undefined);
const fullEndpoint = `${apiOrigin}/api/upload/profile`;

const user = ref<UsersPublic>();

const isLoadingImage = ref(true);

const [getUser] = useErrorMessage(async () => {
  user.value = await trpc.users.findById.query(props.id);

  console.log(user.value);
});

const goBack = async () => {
  router.go(-1);
};

const [uploadImage, errorMessage] = useErrorMessage(async () => {
  if (!profileImageFile.value) return null;

  isLoadingImage.value = true;

  const formData = new FormData();
  formData.append('file', profileImageFile.value);

  const { data } = await axios.post<Pick<UsersPublic, 'image'>>(
    fullEndpoint,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  if (data.image && user.value) {
    user.value.image = await trpc.users.updateImage.mutate(data.image);
  }
});

async function handleUpload() {
  const id = showLoading('Changing Profile image...');

  try {
    await uploadImage();

    updateToast(id, 'success', 'Image updated!');
  } catch {
    updateToast(id, 'error', errorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

watch(
  () => user.value?.image,
  (newImage, oldImage) => {
    if (newImage && newImage !== oldImage) {
      isLoadingImage.value = false;
    }
  }
);

watch(profileImageFile, async (newFile) => {
  if (!newFile) return;

  await handleUpload();
  profileImageFile.value = undefined;
});

onMounted(async () => {
  await getUser();

  if (!user.value) {
    console.log('User not found');
    return;
  }
});
</script>

<template>
  <div v-if="user">
    <div
      class="bg-primary-green relative flex h-20 w-full items-start justify-start sm:h-32 xl:h-52"
    >
      <FwbButton
        @click="goBack"
        color="green"
        class="bg-tertiary-green hover:bg-secondary-green m-4 cursor-pointer"
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

      <div
        class="absolute bottom-0 left-15 h-24 w-24 translate-y-1/2 rounded-full lg:left-25 lg:h-32 lg:w-32 xl:h-42 xl:w-42"
      >
        <template v-if="user.image">
          <div class="flex h-full w-full items-center justify-center">
            <Spinner v-show="isLoadingImage" />

            <img
              v-show="!isLoadingImage"
              :src="user.image"
              alt="Profile"
              class="h-full w-full rounded-full object-cover"
              @load="isLoadingImage = false"
            />

            <label
              class="absolute inset-0 flex scale-100 cursor-pointer items-center justify-center opacity-0 transition-all duration-300 hover:scale-105 hover:opacity-100"
            >
              <FwbFileInput
                v-model="profileImageFile"
                dropzone
                accept="image/*"
                class="hidden"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="h-10 w-10 rounded-full bg-black/50 p-2 lg:h-15 lg:w-15"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536M16.5 3.5a2.121 2.121 0 113 3L7.5 18.5l-4 1 1-4 12-12z"
                />
              </svg>
            </label>
          </div>
        </template>

        <template v-else>
          <div
            class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gray-300 hover:scale-105"
          >
            <FwbFileInput
              v-model="profileImageFile"
              dropzone
              accept="image/*"
              class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />

            <span
              class="text-header pointer-events-none z-20 text-center text-sm"
            >
              Upload Image
            </span>
          </div>
        </template>
      </div>
    </div>

    <div class="m-15 flex flex-col gap-10 lg:my-20 lg:ml-25 xl:my-25">
      <div
        class="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:gap-0"
      >
        <span class="text-xl lg:text-2xl">{{ user.name }}</span>

        <FwbButton
          @click="router.push(`/profile/${user.id}/edit`)"
          class="text-primary-green inline-flex cursor-pointer self-start rounded-3xl bg-white px-2 py-1 text-lg font-bold shadow-md hover:bg-white hover:outline-2 lg:px-6 lg:py-2 lg:text-3xl"
          pill
          square
        >
          Change Credentials
        </FwbButton>
      </div>
      <div>
        <div class="flex flex-col gap-10">
          <RecipesList
            title="Saved Recipes"
            :recipeType="RECIPE_TYPE.SAVED"
            :user-id="user.id"
          />

          <RecipesList
            title="Created Recipes"
            :recipeType="RECIPE_TYPE.CREATED"
            :user-id="user.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>
