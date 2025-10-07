import type { RouteRecordRaw } from 'vue-router';
import { authenticate } from '@/router/guards';
import { ROUTE_NAMES } from '@/router/consts/routeNames';
import { ROUTE_PATHS } from '@/router/consts/routePaths';
import HomeView from '@/views/HomeView.vue';

export const mainLayoutRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: ROUTE_NAMES.HOME,
    component: HomeView,
  },
  {
    beforeEnter: [authenticate],
    path: ROUTE_PATHS.CREATE_RECIPE,
    name: ROUTE_NAMES.CREATE_RECIPE,
    component: () => import('@/views/CreateRecipeView.vue'),
  },
  {
    beforeEnter: [authenticate],
    path: ROUTE_PATHS.RECIPE,
    name: ROUTE_NAMES.RECIPE,
    component: () => import('@/views/RecipeView.vue'),
    props: true,
  },
  {
    beforeEnter: [authenticate],
    path: ROUTE_PATHS.MY_PROFILE,
    name: ROUTE_NAMES.MY_PROFILE,
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    beforeEnter: [authenticate],
    path: ROUTE_PATHS.USER_PROFILE,
    name: ROUTE_NAMES.USER_PROFILE,
    component: () => import('@/views/ProfileView.vue'),
    props: true,
  },
  {
    beforeEnter: [authenticate],
    path: ROUTE_PATHS.EDIT_MY_PROFILE,
    name: ROUTE_NAMES.EDIT_MY_PROFILE,
    component: () => import('@/views/EditProfileView.vue'),
    props: true,
  },
];
