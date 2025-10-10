import type { ObjectValues } from '@server/shared/types';

export const MODAL_TYPES = {
  FOLLOWERS: 'Followers',
  FOLLOWING: 'Following',
} as const;

export type ModalType = ObjectValues<typeof MODAL_TYPES>;
