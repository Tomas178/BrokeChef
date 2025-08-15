import { authClient } from '@/lib/auth-client';
import { computed } from 'vue';

export const isLoggedIn = computed(() => !!authClient.getSession());
