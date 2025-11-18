import type { ObjectValues } from '@server/shared/types';

export const ROUTE_PATHS = {
  HOME: '',
  SIGNUP: '/signup',
  LOGIN: '/login',
  REQUEST_RESET_PASSWORD: '/request-reset-password',
  RESET_PASSWORD: '/reset-password',
  CREATE_RECIPE: '/create-recipe',
  RECIPE: '/recipe/:id',
  MY_PROFILE: '/profile',
  USER_PROFILE: '/profile/:id',
  EDIT_MY_PROFILE: '/profile/:id/edit',
  FRIDGE_MODE: '/fridge-mode',
} as const;

export type RoutePathsValues = ObjectValues<typeof ROUTE_PATHS>;
