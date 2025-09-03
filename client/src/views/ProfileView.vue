<script setup lang="ts">
import { FwbButton, FwbFileInput } from 'flowbite-vue';
import { useRouter } from 'vue-router';
import type {
  RecipesPublic,
  UsersPublic,
  UserWithPagination,
} from '@server/shared/types';
import { onMounted, reactive, ref, watch } from 'vue';
import RecipeCard from '@/components/RecipeCard.vue';
import { trpc } from '@/trpc';
import useErrorMessage from '@/composables/useErrorMessage';
import Spinner from '@/components/Spinner.vue';
import axios from 'axios';
import { apiOrigin } from '@/config';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { DEFAULT_SERVER_ERROR } from '../consts';

const props = defineProps<{
  id?: string;
}>();

const userWithPagination = reactive<UserWithPagination>({
  offset: 0,
  limit: 5,
  userId: undefined,
});

const profileImageFile = ref<File | undefined>(undefined);
const fullEndpoint = `${apiOrigin}/api/upload/profile`;

const router = useRouter();

const user = ref<UsersPublic>();
const recipesSaved = ref<RecipesPublic[]>([]);
const recipesCreated = ref<RecipesPublic[]>([]);

const isLoadingImage = ref(true);

const [getUser] = useErrorMessage(async () => {
  userWithPagination.userId = props.id;

  user.value = await (userWithPagination.userId
    ? trpc.users.findById.query(userWithPagination.userId)
    : trpc.users.findById.query());

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
  const id = toast.loading('Changing Profile image...');

  try {
    await uploadImage();

    toast.update(id, {
      render: 'Image updated!',
      type: 'success',
      isLoading: false,
    });
  } catch {
    toast.update(id, {
      render: errorMessage.value || DEFAULT_SERVER_ERROR,
      type: 'error',
      isLoading: false,
    });
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

  const { created, saved } =
    await trpc.users.getRecipes.query(userWithPagination);

  recipesCreated.value = created;
  recipesSaved.value = saved;

  console.log(recipesCreated.value);
  console.log(recipesSaved.value);
});
</script>

<template>
  <div v-if="user">
    <div>
      <div
        class="bg-primary-green relative flex h-20 w-full items-start justify-start sm:h-32 xl:h-52"
      >
        <FwbButton
          @click="goBack"
          color="green"
          class="bg-tertiary-green m-4 cursor-pointer"
          pill
          square
        >
          <svg
            class="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8"
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
            <Spinner v-show="isLoadingImage" />

            <img
              v-show="!isLoadingImage"
              :src="user.image"
              alt="Profile"
              class="h-full w-full rounded-full object-cover"
              @load="isLoadingImage = false"
            />
          </template>

          <template v-else>
            <div class="relative h-full w-full overflow-hidden rounded-full">
              <FwbFileInput
                v-model="profileImageFile"
                dropzone
                accept="image/*"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
              </FwbFileInput>
              <div
                class="text-header absolute inset-0 flex items-center justify-center rounded-full bg-gray-300 text-sm font-medium"
              >
                <span>Upload Image</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="mt-15 ml-15 flex flex-col gap-10 lg:mt-20 lg:ml-25 xl:mt-25">
        <span>{{ user.name }}</span>
        <div>
          <div class="flex flex-col gap-10">
            <span>Saved Recipes</span>
            <div class="flex gap-5 overflow-x-auto">
              <RecipeCard
                v-for="saved in recipesSaved"
                :key="saved.id"
                :recipe="saved"
              />
            </div>
            <span>Created Recipes</span>
            <div class="flex gap-5 overflow-x-auto">
              <RecipeCard
                v-for="created in recipesCreated"
                :key="created.id"
                :recipe="created"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
