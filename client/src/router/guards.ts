// guards.ts
import { useUserStore } from '@/stores/user';
import type { NavigationGuard } from 'vue-router';

export const authenticate: NavigationGuard = (to) => {
  const user = useUserStore();
  console.log(user.isLoggedIn);

  if (!user.isLoggedIn) {
    return { name: 'Login' };
  }

  if (to.name === 'EditUserProfile') {
    const loggedInUserId = user.id;
    const targetUserId = to.params.id;

    if (String(loggedInUserId) !== String(targetUserId)) {
      return { name: 'MyProfile' };
    }
  }

  return true;
};
