import { useUserStore } from '@/stores/user';

export const authenticate = () => {
  const user = useUserStore();

  if (!user.isLoggedIn) return { name: 'Login' };

  return true;
};
