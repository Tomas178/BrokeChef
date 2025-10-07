import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import AuthenticationLayout from '@/layouts/AuthenticationLayout.vue';
import { mainLayoutRoutes } from './routes/mainLayout';
import { authLayoutRoutes } from './routes/authLayout';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: mainLayoutRoutes,
    },
    {
      path: '/',
      component: AuthenticationLayout,
      children: authLayoutRoutes,
    },
  ],
});

export default router;
