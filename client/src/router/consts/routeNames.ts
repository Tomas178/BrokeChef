import type { ObjectValues } from '@server/shared/types';

export const ROUTE_NAMES = {
  HOME: 'Home',
  SIGNUP: 'Signup',
  LOGIN: 'Login',
  REQUEST_RESET_PASSWORD: 'RequestResetPassword',
  RESET_PASSWORD: 'ResetPassword',
  CREATE_RECIPE: 'CreateRecipe',
  RECIPE: 'Recipe',
  MY_PROFILE: 'MyProfile',
  USER_PROFILE: 'UserProfile',
  EDIT_MY_PROFILE: 'EditMyProfile',
} as const;

export type RouteNamesValues = ObjectValues<typeof ROUTE_NAMES>;
