import type { ObjectValues } from '@server/shared/types';

export const EmailTemplate = {
  VERIFY_EMAIL: 'verifyEmail.html',
  RESET_PASSWORD: 'resetPassword.html',
} as const;

export type EmailTemplateValues = ObjectValues<typeof EmailTemplate>;
