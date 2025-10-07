import { useRouter } from 'vue-router';
import type {
  HomeQueryParams,
  RecipeRouteParams,
  UserProfileRouteParams,
} from './types';
import { ROUTE_NAMES } from './consts/routeNames';

const router = useRouter();

const delayedNavigate = async (
  navigationFn: () => Promise<void>,
  delay?: number
): Promise<void> => {
  if (delay && delay > 0) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await navigationFn();
        resolve();
      }, delay);
    });
  }
  return navigationFn();
};

export const navigateToHome = async (
  query?: HomeQueryParams,
  delay?: number
) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.HOME,
      query,
    });
  }, delay);
};

export const navigateToLogin = async (delay?: number) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.LOGIN,
    });
  }, delay);
};

export const navigateToSignup = async (delay?: number) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.SIGNUP,
    });
  }, delay);
};

export const navigateToRequestResetPassword = async (delay?: number) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.REQUEST_RESET_PASSWORD,
    });
  }, delay);
};

export const navigateToResetPassword = async (delay?: number) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.RESET_PASSWORD,
    });
  }, delay);
};

export const navigateToRecipe = async (
  params: RecipeRouteParams,
  delay?: number
) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.RECIPE,
      params,
    });
  }, delay);
};

export const navigateToCreateRecipe = async (delay?: number) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.CREATE_RECIPE,
    });
  }, delay);
};

export const navigateToMyProfile = async (delay?: number) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.MY_PROFILE,
    });
  }, delay);
};

export const navigateToUserProfile = async (
  params: UserProfileRouteParams,
  delay?: number
) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.USER_PROFILE,
      params,
    });
  }, delay);
};

export const navigateToUserEditProfile = async (
  params: UserProfileRouteParams,
  delay?: number
) => {
  return delayedNavigate(async () => {
    await router.push({
      name: ROUTE_NAMES.EDIT_MY_PROFILE,
      params,
    });
  }, delay);
};
