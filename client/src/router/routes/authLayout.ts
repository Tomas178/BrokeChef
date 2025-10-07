import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_PATHS } from '../consts/routePaths';
import { ROUTE_NAMES } from '../consts/routeNames';

export const authLayoutRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.SIGNUP,
    name: ROUTE_NAMES.SIGNUP,
    component: () => import('@/views/SignupView.vue'),
  },
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: ROUTE_PATHS.REQUEST_RESET_PASSWORD,
    name: ROUTE_NAMES.REQUEST_RESET_PASSWORD,
    component: () => import('@/views/RequestResetPasswordView.vue'),
  },
  {
    path: ROUTE_PATHS.RESET_PASSWORD,
    name: ROUTE_NAMES.RESET_PASSWORD,
    component: () => import('@/views/ResetPasswordView.vue'),
  },
];
