export enum EmailTemplates {
  VerifyEmail = 'verifyEmail.html',
  ResetPassword = 'resetPassword.html',
}

export type EmailTemplatesKeys =
  (typeof EmailTemplates)[keyof typeof EmailTemplates];
