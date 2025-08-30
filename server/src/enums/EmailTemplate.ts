export enum EmailTemplate {
  VERIFY_EMAIL = 'verifyEmail.html',
  RESET_PASSWORD = 'resetPassword.html',
}

export type EmailTemplateKeys =
  (typeof EmailTemplate)[keyof typeof EmailTemplate];
