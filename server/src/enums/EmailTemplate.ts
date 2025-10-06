export enum EmailTemplate {
  VERIFY_EMAIL = 'verifyEmail.html',
  RESET_PASSWORD = 'resetPassword.html',
}

export type EmailTemplateValues = `${EmailTemplate}`;
