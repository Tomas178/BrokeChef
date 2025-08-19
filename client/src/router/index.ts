import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import {
  loginPath,
  requestResetPasswordPath,
  resetPasswordPath,
  signupPath,
} from '@/config';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
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
});

export default router;
