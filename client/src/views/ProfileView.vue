<script setup lang="ts">
import { FwbButton, FwbFileInput, FwbModal } from 'flowbite-vue';
import { useRoute, useRouter } from 'vue-router';
import type {
  CollectionsPublicBasic,
  RecipesPublic,
  UsersPublic,
} from '@server/shared/types';
import { onMounted, ref, watch, computed } from 'vue';
import { trpc } from '@/trpc';
import useErrorMessage from '@/composables/useErrorMessage';
import Spinner from '@/components/Spinner.vue';
import axios from 'axios';
import { apiOrigin } from '@/config';
import { DEFAULT_SERVER_ERROR } from '../consts';
import useToast from '@/composables/useToast';
import RecipesList from '@/components/RecipesList/RecipesList.vue';
import { RECIPE_TYPE } from '@/components/RecipesList/types';
import {
  navigateToUserEditProfile,
  navigateToUserProfile,
} from '@/router/utils';
import { useUserStore } from '@/stores/user';
import { MODAL_TYPES, type ModalType } from '@/types/profile';
import CreateCollectionModal from '@/components/Modals/CreateCollectionModal.vue';
import Dialog from '@/components/Dialog.vue';
import { MAX_FILE_SIZE } from '@server/shared/consts';

const { showLoading, updateToast } = useToast();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const props = defineProps<{
  id?: string;
}>();

const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);
const collectionIdToDelete = ref<number | undefined>(undefined);

function openDeleteDialog(collectionId: number) {
  collectionIdToDelete.value = collectionId;
  dialogRef.value?.open();
}

const isLoadingProfile = ref(true);
const user = ref<UsersPublic>();
const isFollowing = ref(false);
const totalFollowing = ref<number>(0);
const totalFollowers = ref<number>(0);

const showModal = ref(false);
const modalType = ref<ModalType>(MODAL_TYPES.FOLLOWING);
const modalUsers = ref<UsersPublic[]>([]);
const isLoadingModalUsers = ref(true);

const showCollectionsModal = ref(false);
const isLoadingCollections = ref(false);
const isLoadingCollectionRecipes = ref(false);

const collections = ref<CollectionsPublicBasic[]>([]);
const selectedCollection = ref<CollectionsPublicBasic | undefined>(undefined);
const collectionRecipes = ref<RecipesPublic[]>([]);

const showCreateCollectionModal = ref(false);

const isOwnProfile = computed(() => {
  return userStore.id === user.value?.id;
});

const profileImageFile = ref<File | undefined>(undefined);
const fullEndpoint = `${apiOrigin}/api/upload/profile`;

const isLoadingImage = ref(true);

const getUserIdFromRoute = (): string | undefined => {
  if (props.id) {
    return Array.isArray(props.id) ? props.id[0] : props.id;
  }

  const routeId = route.params.id;
  if (routeId) {
    return Array.isArray(routeId) ? routeId[0] : routeId;
  }

  return undefined;
};

const [getUser] = useErrorMessage(async () => {
  const userId = getUserIdFromRoute();

  user.value = await trpc.users.findById.query(userId);
});

watch(
  () => [props.id, route.params.id],
  async () => {
    await fetchProfileData();
  }
);

const goBack = async () => {
  router.go(-1);
};

const [uploadImage, errorMessage] = useErrorMessage(async () => {
  if (!profileImageFile.value) {
    return null;
  }

  if (profileImageFile.value.size > MAX_FILE_SIZE) {
    throw new Error(
      `Image too large please upload image <= ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    );
  }

  if (profileImageFile.value.size > MAX_FILE_SIZE) {
    throw new Error(
      `Image too large please upload image <= ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    );
  }

  const formData = new FormData();
  formData.append('image', profileImageFile.value);

  const { data } = await axios.post<Pick<UsersPublic, 'image'>>(
    fullEndpoint,
    formData,
    {
      withCredentials: true,
    }
  );

  if (data.image && user.value) {
    user.value.image = await trpc.users.updateImage.mutate(data.image);
  }

  return data.image;
}, true);

async function handleUpload() {
  const id = showLoading('Changing Profile image...');

  try {
    isLoadingImage.value = true;
    await uploadImage();
    updateToast(id, 'success', 'Image updated!');
  } catch {
    updateToast(id, 'error', errorMessage.value || DEFAULT_SERVER_ERROR);
  } finally {
    isLoadingImage.value = false;
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

const [follow, followErrorMessage] = useErrorMessage(async () => {
  if (!user.value) throw new Error('User not found');
  return trpc.follows.follow.mutate(user.value.id);
}, true);

async function handleFollow() {
  const id = showLoading('Following...');

  try {
    await follow();
    isFollowing.value = true;
    totalFollowers.value += 1;

    updateToast(id, 'success', 'User followed successfully');
  } catch {
    updateToast(id, 'error', followErrorMessage.value || DEFAULT_SERVER_ERROR);
  }
}

const [unfollow, unfollowErrorMessage] = useErrorMessage(async () => {
  if (!user.value) throw new Error('User not found');
  return trpc.follows.unfollow.mutate(user.value.id);
}, true);

async function handleUnfollow() {
  const id = showLoading('Unfollowing...');

  try {
    await unfollow();
    isFollowing.value = false;
    totalFollowers.value -= 1;

    updateToast(id, 'success', 'User unfollowed successfully');
  } catch {
    updateToast(
      id,
      'error',
      unfollowErrorMessage.value || DEFAULT_SERVER_ERROR
    );
  }
}

async function fetchProfileData() {
  isLoadingProfile.value = true;
  await getUser();

  if (user.value) {
    [totalFollowing.value, totalFollowers.value, isFollowing.value] =
      await Promise.all([
        trpc.follows.totalFollowing.query(user.value.id),
        trpc.follows.totalFollowers.query(user.value.id),
        trpc.follows.isFollowing.query(user.value.id),
      ]);
  }

  isLoadingProfile.value = false;
}

const [getFollowing] = useErrorMessage(async () => {
  if (!user.value) throw new Error('User not found');
  return trpc.follows.getFollowing.query(user.value.id);
}, true);

const [getFollowers] = useErrorMessage(async () => {
  if (!user.value) throw new Error('User not found');
  return trpc.follows.getFollowers.query(user.value.id);
}, true);

async function openFollowModal(type: ModalType) {
  if (!user.value) return;

  modalType.value = type;
  showModal.value = true;
  isLoadingModalUsers.value = true;

  try {
    if (modalType.value === MODAL_TYPES.FOLLOWING) {
      modalUsers.value = await getFollowing();
    } else {
      modalUsers.value = await getFollowers();
    }
  } catch (error) {
    console.error('Error loading users:', error);
    modalUsers.value = [];
  } finally {
    isLoadingModalUsers.value = false;
  }
}

async function openCollectionsModal() {
  showCollectionsModal.value = true;
  selectedCollection.value = undefined;
  collectionRecipes.value = [];
  await fetchCollections();
}

async function fetchCollections() {
  if (!user.value) return;
  isLoadingCollections.value = true;

  try {
    collections.value = await trpc.collections.findByUserId.query();
  } finally {
    isLoadingCollections.value = false;
  }
}

async function openCollectionRecipes(collection: CollectionsPublicBasic) {
  selectedCollection.value = collection;
  isLoadingCollectionRecipes.value = true;

  try {
    collectionRecipes.value =
      await trpc.collections.findRecipesByCollectionId.query(collection.id);
  } finally {
    isLoadingCollectionRecipes.value = false;
  }
}

const [removeCollection, removeCollectionErrorMessage] = useErrorMessage(
  (async (...args: unknown[]) => {
    const collectionId = args[0] as number;

    return trpc.collections.remove.mutate(collectionId);
  }) as (...args: unknown[]) => unknown,
  true
);

async function handleConfirmDeleteCollection() {
  if (collectionIdToDelete.value === undefined) return;

  await handleRemoveCollection(collectionIdToDelete.value);
  collectionIdToDelete.value = undefined;
}

async function handleRemoveCollection(collectionId: number) {
  const id = showLoading('Removing collection...');

  try {
    await removeCollection(collectionId);

    collections.value = collections.value.filter((c) => c.id !== collectionId);

    updateToast(id, 'success', 'Collection removed successfully!');
  } catch {
    updateToast(
      id,
      'error',
      removeCollectionErrorMessage.value || DEFAULT_SERVER_ERROR
    );
  }
}

const [removeRecipeFromCollection, removeRecipeFromCollectionErrorMessage] =
  useErrorMessage(
    (async (...args: unknown[]) => {
      if (!selectedCollection.value) return;

      const recipeId = args[0] as number;

      return trpc.collectionsRecipes.unsave.mutate({
        collectionId: selectedCollection.value.id,
        recipeId,
      });
    }) as (...args: unknown[]) => unknown,
    true
  );

async function handleRemoveRecipeFromCollection(recipeId: number) {
  const id = showLoading('Removing recipe from collection...');

  try {
    await removeRecipeFromCollection(recipeId);

    collectionRecipes.value = collectionRecipes.value.filter(
      (r) => r.id !== recipeId
    );

    updateToast(id, 'success', 'Removed recipe from collection successfully');
  } catch {
    updateToast(
      id,
      'error',
      removeRecipeFromCollectionErrorMessage.value || DEFAULT_SERVER_ERROR
    );
  }
}

onMounted(async () => {
  await fetchProfileData();
});
</script>

<template>
  <div v-if="!isLoadingProfile && user">
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

      <div
        class="absolute bottom-0 left-15 h-24 w-24 translate-y-1/2 rounded-full lg:left-25 lg:h-32 lg:w-32 xl:h-42 xl:w-42"
      >
        <template v-if="user.image">
          <div class="flex h-full w-full items-center justify-center">
            <Spinner v-show="isLoadingImage" />

            <img
              data-testid="profile-picture"
              v-show="!isLoadingImage"
              :src="user.image"
              alt="Profile"
              class="h-full w-full rounded-full object-cover"
              @load="isLoadingImage = false"
            />

            <label
              v-if="isOwnProfile"
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
            data-testid="profile-picture-fallback"
            class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gray-300"
            :class="[isOwnProfile ? 'hover:scale-105' : '']"
          >
            <template v-if="isOwnProfile">
              <FwbFileInput
                data-testid="upload-profile-picture"
                v-model="profileImageFile"
                dropzone
                accept="image/*"
                class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />

              <span
                class="text-header-light pointer-events-none z-20 text-center text-sm"
              >
                Upload Image
              </span>
            </template>

            <template v-else>
              <span
                class="text-header-light pointer-events-none z-20 text-center text-sm"
              >
                No Profile Picture
              </span>
            </template>
          </div>
        </template>
      </div>
    </div>

    <div class="m-15 flex flex-col gap-10 lg:my-20 lg:ml-25 xl:my-25">
      <div
        class="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:gap-0"
      >
        <div
          data-testid="user-information"
          class="flex flex-col gap-3 dark:text-gray-500"
        >
          <div class="flex gap-1 text-xs md:text-base">
            <span
              data-testid="following"
              @click="openFollowModal(MODAL_TYPES.FOLLOWING)"
              class="cursor-pointer hover:underline"
            >
              Following: {{ totalFollowing }}
            </span>
            <span
              data-testid="followers"
              @click="openFollowModal(MODAL_TYPES.FOLLOWERS)"
              class="cursor-pointer hover:underline"
            >
              Followers: {{ totalFollowers }}
            </span>
          </div>
          <span data-testid="username" class="text-xl lg:text-2xl">
            {{ user.name }}
          </span>
        </div>

        <template v-if="isOwnProfile">
          <FwbButton
            data-testid="change-credentials"
            @click="navigateToUserEditProfile({ id: user.id })"
            class="text-primary-green inline-flex cursor-pointer self-start rounded-3xl bg-white px-2 py-1 text-lg font-bold shadow-md hover:bg-white hover:outline-2 lg:px-6 lg:py-2 lg:text-3xl dark:text-white dark:hover:text-black"
            color="light"
            pill
            square
          >
            Change Credentials
          </FwbButton>
        </template>

        <template v-else>
          <FwbButton
            v-if="!isFollowing"
            data-testid="follow"
            @click="handleFollow"
            class="text-primary-green inline-flex cursor-pointer self-start rounded-3xl bg-white px-2 py-1 text-lg font-bold shadow-md hover:bg-white hover:outline-2 lg:px-6 lg:py-2 lg:text-3xl dark:text-white dark:hover:outline-white"
            color="dark"
            pill
            square
          >
            Follow
          </FwbButton>

          <FwbButton
            v-else
            data-testid="unfollow"
            @click="handleUnfollow"
            class="text-primary-green inline-flex cursor-pointer self-start rounded-3xl bg-white px-2 py-1 text-lg font-bold shadow-md hover:bg-white hover:outline-2 lg:px-6 lg:py-2 lg:text-3xl dark:text-white dark:hover:outline-white"
            color="dark"
            pill
            square
          >
            Unfollow
          </FwbButton>
        </template>
      </div>

      <div>
        <div
          v-if="isOwnProfile"
          class="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <FwbButton
            data-testid="open-collections-modal"
            @click="openCollectionsModal"
            class="text-primary-green inline-flex cursor-pointer rounded-3xl bg-white px-4 py-2 text-lg font-bold shadow-md hover:bg-white hover:outline-2 dark:text-white dark:hover:text-black"
            color="light"
          >
            View Collections
          </FwbButton>

          <FwbButton
            data-testid="create-collection-button"
            @click="showCreateCollectionModal = true"
            class="text-primary-green inline-flex cursor-pointer rounded-3xl bg-white px-4 py-2 text-lg font-bold shadow-md hover:bg-white hover:outline-2 dark:text-white dark:hover:text-black"
            color="light"
            pill
            square
          >
            <div class="flex items-center justify-center">
              <span class="material-symbols-outlined">add</span>
              Create Collection
            </div>
          </FwbButton>
        </div>

        <div class="flex flex-col gap-10 dark:mt-2">
          <RecipesList
            data-testid="saved-recipes"
            title="Saved Recipes"
            :recipeType="RECIPE_TYPE.SAVED"
            :user-id="user.id"
          />

          <RecipesList
            data-testid="created-recipes"
            title="Created Recipes"
            :recipeType="RECIPE_TYPE.CREATED"
            :user-id="user.id"
          />
        </div>
      </div>

      <FwbModal
        v-if="showModal"
        data-testid="follow-modal"
        @close="showModal = false"
        focus-trap
      >
        <template #header>
          <div
            data-testid="follow-modal-header"
            class="flex items-center gap-2"
          >
            <h3 class="text-xl font-semibold">
              {{
                modalType === MODAL_TYPES.FOLLOWING
                  ? MODAL_TYPES.FOLLOWING
                  : MODAL_TYPES.FOLLOWERS
              }}
            </h3>
          </div>
        </template>
        <template #body>
          <div
            v-if="isLoadingModalUsers"
            data-testid="follow-modal-loading-state"
            class="flex justify-center py-8"
          >
            <Spinner />
          </div>

          <div
            v-else-if="modalUsers.length === 0"
            data-testid="follow-modal-empty-state"
            class="py-8 text-center text-gray-500"
          >
            No
            {{
              modalType === MODAL_TYPES.FOLLOWING
                ? MODAL_TYPES.FOLLOWING
                : MODAL_TYPES.FOLLOWERS
            }}
            yet
          </div>

          <ul
            v-else
            data-testid="follow-modal-loaded-state"
            class="flex max-h-96 flex-col gap-3 overflow-y-auto pr-2"
          >
            <li
              v-for="modalUser in modalUsers"
              :key="modalUser.id"
              @click="
                {
                  (navigateToUserProfile({ id: modalUser.id }),
                    (showModal = false));
                }
              "
              class="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-100"
            >
              <div
                :data-testid="`follow-modal-user-${modalUser.id}`"
                class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-300"
              >
                <img
                  v-if="modalUser.image"
                  data-testid="follow-modal-user-image"
                  :src="modalUser.image"
                  :alt="modalUser.name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  data-testid="follow-modal-user-image-fallback"
                  class="flex h-full w-full items-center justify-center text-xs text-gray-600"
                >
                  {{ modalUser.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <span
                data-testid="follow-modal-user-username"
                class="text-base font-medium"
                >{{ modalUser.name }}</span
              >
            </li>
          </ul>
        </template>
      </FwbModal>

      <FwbModal
        v-if="showCollectionsModal"
        data-testid="collections-modal"
        @close="showCollectionsModal = false"
        focus-trap
      >
        <template #header>
          <h3 class="text-xl font-semibold">
            {{
              selectedCollection ? selectedCollection.title : 'My Collections'
            }}
          </h3>
        </template>

        <template #body>
          <div v-if="!selectedCollection">
            <div v-if="isLoadingCollections" class="flex justify-center py-8">
              <Spinner />
            </div>

            <div
              v-else-if="collections.length === 0"
              class="py-8 text-center text-gray-500"
            >
              You don't have any collections yet.
            </div>

            <ul
              v-else
              class="flex max-h-96 flex-col gap-3 overflow-y-auto pr-2"
            >
              <li
                v-for="collection in collections"
                :key="collection.id"
                class="cursor-pointer rounded-lg p-3 hover:bg-gray-100"
                @click="openCollectionRecipes(collection)"
              >
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 overflow-hidden rounded bg-gray-300">
                    <img
                      v-if="collection.imageUrl"
                      :src="collection.imageUrl"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-xs text-gray-600"
                    >
                      {{ collection.title.charAt(0).toUpperCase() }}
                    </div>
                  </div>

                  <span class="text-lg font-medium">
                    {{ collection.title }}
                  </span>
                </div>

                <button
                  class="cursor-pointer text-red-600 hover:underline"
                  @click.stop="openDeleteDialog(collection.id)"
                >
                  Remove
                </button>
              </li>
            </ul>

            <Dialog
              ref="dialogRef"
              description="Are you sure you want to delete this collection? This action cannot be undone."
              action-name="Delete"
              @confirm="handleConfirmDeleteCollection"
            />
          </div>

          <div v-else>
            <FwbButton
              class="mb-4 cursor-pointer dark:text-white dark:hover:text-black"
              color="light"
              @click="selectedCollection = undefined"
            >
              ← Back to Collections
            </FwbButton>

            <div
              v-if="isLoadingCollectionRecipes"
              class="flex justify-center py-8"
            >
              <Spinner />
            </div>

            <div
              v-else-if="collectionRecipes.length === 0"
              class="py-8 text-center text-gray-500"
            >
              No recipes in this collection.
            </div>

            <ul
              v-else
              class="flex max-h-96 flex-col gap-3 overflow-y-auto pr-2"
            >
              <li
                v-for="recipe in collectionRecipes"
                :key="recipe.id"
                class="cursor-pointer rounded-lg p-3 hover:bg-gray-100"
                @click="router.push(`/recipe/${recipe.id}`)"
              >
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 overflow-hidden rounded bg-gray-300">
                    <img
                      v-if="recipe.imageUrl"
                      :src="recipe.imageUrl"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-xs text-gray-600"
                    >
                      {{ recipe.title.charAt(0).toUpperCase() }}
                    </div>
                  </div>

                  <span class="text-lg font-medium">{{ recipe.title }}</span>
                </div>

                <button
                  class="cursor-pointer text-red-600 hover:underline"
                  @click.stop="handleRemoveRecipeFromCollection(recipe.id)"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>
        </template>
      </FwbModal>
    </div>

    <CreateCollectionModal
      :show="showCreateCollectionModal"
      @close="showCreateCollectionModal = false"
    />
  </div>
</template>
