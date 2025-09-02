import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import AuthenticationLayout from '@/layouts/AuthenticationLayout.vue';
import {
  createRecipePath,
  individualRecipePath,
  loginPath,
  profilePath,
  requestResetPasswordPath,
  resetPasswordPath,
  signupPath,
} from '@/config';
import { authenticate } from './guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
        {
          beforeEnter: [authenticate],
          path: createRecipePath,
          name: 'CreateRecipe',
          component: () => import('../views/CreateRecipeView.vue'),
        },
        {
          beforeEnter: [authenticate],
          path: profilePath,
          name: 'Profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          beforeEnter: [authenticate],
          path: individualRecipePath,
          name: 'Recipe',
          component: () => import('../views/RecipeView.vue'),
          props: true,
        },
      ],
    },
    {
      path: '',
      component: AuthenticationLayout,
      children: [
        {
          path: signupPath,
          name: 'Signup',
          component: () => import('../views/SignupView.vue'),
        },
        {
          path: loginPath,
          name: 'Login',
          component: () => import('../views/LoginView.vue'),
        },
        {
          path: signupPath,
          name: 'Signup',
          component: () => import('../views/SignupView.vue'),
        },
        {
          path: requestResetPasswordPath,
          name: 'RequestResetPassword',
          component: () => import('../views/RequestResetPasswordView.vue'),
        },
        {
          path: resetPasswordPath,
          name: 'ResetPassword',
          component: () => import('../views/ResetPasswordView.vue'),
        },
      ],
    },
  ],
});

export default router;
