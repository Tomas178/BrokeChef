import type { ObjectValues } from '@server/shared/types';

export const EmailSubject = {
  VERIFY_EMAIL: 'Verify your email address',
  RESET_PASSWORD: 'Password reset',
} as const;

export type EmailSubjectValues = ObjectValues<typeof EmailSubject>;
