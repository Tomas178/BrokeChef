import { expect, Locator, Page } from '@playwright/test';
import { ModalType } from '@/types/profile';

export const PAGE_TEST_IDS = {
  USER_INFORMATION: 'user-information',
  FOLLOWING: 'following',
  FOLLOWERS: 'followers',
} as const;

export const FOLLOW_MODAL_TEST_IDS = {
  LOADING_STATE: 'follow-modal-loading-state',
  EMPTY_STATE: 'follow-modal-empty-state',
  LOADED_STATE: 'follow-modal-loaded-state',
} as const;

export async function checkFollowsModalHeader(modal: Locator, text: ModalType) {
  const header = modal.getByTestId('follow-modal-header');

  await expect(header).toBeVisible();
  await expect(header).toContainText(text);
}

export async function checkFollowsModalEmptyState(
  modal: Locator,
  text: ModalType
) {
  const emptyState = modal.getByTestId(FOLLOW_MODAL_TEST_IDS.EMPTY_STATE);

  await expect(emptyState).toBeVisible();
  await expect(emptyState).toContainText(/no/i);
  await expect(emptyState).toContainText(text);
}

export async function goToFollowModal(page: Page, following: boolean) {
  const userInformationLocator = page.getByTestId(
    PAGE_TEST_IDS.USER_INFORMATION
  );

  await userInformationLocator
    .getByTestId(following ? PAGE_TEST_IDS.FOLLOWING : PAGE_TEST_IDS.FOLLOWERS)
    .click();

  const followModal = page.getByTestId('follow-modal');

  return followModal;
}

export async function checkRecipesSectionTitle(
  section: Locator,
  titleMessage: string | RegExp
) {
  const title = section.getByTestId('title');
  await expect(title).toBeVisible();
  await expect(title).toContainText(titleMessage);
}

export async function checkNoRecipesState(
  section: Locator,
  message: string | RegExp
) {
  const noRecipesLocator = section.getByTestId('no-recipes');

  await expect(noRecipesLocator).toBeVisible();
  await expect(noRecipesLocator).toContainText(message);
}
