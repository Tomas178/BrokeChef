import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

import { ROUTE_PATHS } from '@/router/consts/routePaths';
import { expect, test, User } from './fixtures/fullAuth';
import { ImageData } from './utils/recipe';
import { checkLocator, getToastContainer } from './utils/toast';
import { fullLoginProcedure } from './utils/auth';
import { Locator } from '@playwright/test';
import {
  checkFollowsModalEmptyState,
  checkFollowsModalHeader,
  FOLLOW_MODAL_TEST_IDS,
  goToFollowModal,
  PAGE_TEST_IDS,
} from './utils/profile';
import { MODAL_TYPES } from '@/types/profile';

test.describe.serial('Profile page actions', () => {
  let user: User;

  test('Signup the User Saver and go My Profile', async ({ auth }) => {
    const { page, user: signupedUser } = auth;
    user = signupedUser;

    await page.goto(ROUTE_PATHS.MY_PROFILE);
    await expect(page).toHaveURL(ROUTE_PATHS.MY_PROFILE);
  });

  test.describe('Check User Saver dispalyed information when no other actions were done', () => {
    test.beforeEach(async ({ page }) => {
      await fullLoginProcedure(page, user);
      await page.goto(ROUTE_PATHS.MY_PROFILE);
    });

    test('Check profile picture which should display empty state', async ({
      page,
    }) => {
      const profilePictureFallback = page.getByTestId(
        'profile-picture-fallback'
      );

      await expect(profilePictureFallback).toBeVisible();
      await expect(profilePictureFallback).toContainText(
        /upload|add|create|insert/i
      );
    });

    test('Upload the picture', async ({ page }) => {
      const toastContainer = await getToastContainer(page);

      const fileUploadInput = page
        .getByTestId('upload-profile-picture')
        .locator('input[type="file"]');
      const profileImageData: ImageData = {
        filePath: './assets/test-image.png',
        mimeType: 'image/png',
      };

      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const imagePath = path.resolve(__dirname, profileImageData.filePath);
      const buffer = await readFile(imagePath);

      await fileUploadInput.setInputFiles({
        name: 'test-image',
        mimeType: profileImageData.mimeType,
        buffer,
      });

      await checkLocator(
        toastContainer,
        /(creat|updat)ed/i,
        /(chang|load|creat|updat)ing/i
      );

      await expect(page.getByTestId('profile-picture')).toBeVisible();
    });

    test.describe('User information', () => {
      let userInformationLocator: Locator;

      test.beforeEach(({ page }) => {
        userInformationLocator = page.getByTestId(
          PAGE_TEST_IDS.USER_INFORMATION
        );
      });

      test('Following counts should be 0', async () => {
        const followingLocator = userInformationLocator.getByTestId(
          PAGE_TEST_IDS.FOLLOWING
        );

        await expect(followingLocator).toBeVisible();
        await expect(followingLocator).toContainText('0');
      });

      test('Followers counts should be 0', async () => {
        const followersLocator = userInformationLocator.getByTestId(
          PAGE_TEST_IDS.FOLLOWERS
        );

        await expect(followersLocator).toBeVisible();
        await expect(followersLocator).toContainText('0');
      });

      test('Username should be displayed', async () => {
        const usernameLocator = userInformationLocator.getByTestId('username');

        await expect(usernameLocator).toBeVisible();
        await expect(usernameLocator).toContainText(user.name);
      });
    });

    test.describe('Following/follows modal', () => {
      test('Following modal should display empty state', async ({ page }) => {
        const followModal = await goToFollowModal(page, true);

        await checkFollowsModalHeader(followModal, MODAL_TYPES.FOLLOWING);

        await checkFollowsModalEmptyState(followModal, MODAL_TYPES.FOLLOWING);

        await expect(
          followModal.getByTestId(FOLLOW_MODAL_TEST_IDS.LOADED_STATE)
        ).toBeHidden();
      });

      test('Followers modal should display empty state', async ({ page }) => {
        const followModal = await goToFollowModal(page, false);

        await checkFollowsModalHeader(followModal, MODAL_TYPES.FOLLOWERS);

        await checkFollowsModalEmptyState(followModal, MODAL_TYPES.FOLLOWERS);

        await expect(
          followModal.getByTestId(FOLLOW_MODAL_TEST_IDS.LOADED_STATE)
        ).toBeHidden();
      });
    });
  });
});
