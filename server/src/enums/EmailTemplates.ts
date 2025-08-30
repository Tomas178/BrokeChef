export enum EmailTemplates {
  VERIFY_EMAIL = 'verifyEmail.html',
  RESET_PASSWORD = 'resetPassword.html',
}

export type EmailTemplatesKeys =
  (typeof EmailTemplates)[keyof typeof EmailTemplates];
