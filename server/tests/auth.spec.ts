import { auth } from '@server/auth';
import { fakeUser } from '@server/entities/tests/fakes';
import * as sendMailModule from '@server/utils/sendMail/sendMail';
import {
  getEmailVerifyHtml,
  getPasswordResetHtml,
} from '@server/utils/sendMail/templates';

describe('Better-auth configuration', () => {
  it('Should be initialized with the correct model names', () => {
    expect(auth.options.account.modelName).toBe('accounts');
    expect(auth.options.session.modelName).toBe('sessions');
    expect(auth.options.user.modelName).toBe('users');
    expect(auth.options.verification.modelName).toBe('verifications');
  });

  describe('Table columns shoud have snake_case naming', () => {
    it('Users', () => {
      expect(auth.options.user.fields.emailVerified).toBe('email_verified');
      expect(auth.options.user.fields.createdAt).toBe('created_at');
      expect(auth.options.user.fields.updatedAt).toBe('updated_at');
    });

    it('Accounts', () => {
      expect(auth.options.account.fields.userId).toBe('user_id');
      expect(auth.options.account.fields.accountId).toBe('account_id');
      expect(auth.options.account.fields.accessToken).toBe('access_token');
      expect(auth.options.account.fields.accessTokenExpiresAt).toBe(
        'access_token_expires_at'
      );
      expect(auth.options.account.fields.idToken).toBe('id_token');
      expect(auth.options.account.fields.providerId).toBe('provider_id');
      expect(auth.options.account.fields.refreshToken).toBe('refresh_token');
      expect(auth.options.account.fields.refreshTokenExpiresAt).toBe(
        'refresh_token_expires_at'
      );
      expect(auth.options.account.fields.createdAt).toBe('created_at');
      expect(auth.options.account.fields.updatedAt).toBe('updated_at');
    });

    it('Sessions', () => {
      expect(auth.options.session.fields.userId).toBe('user_id');
      expect(auth.options.session.fields.ipAddress).toBe('ip_address');
      expect(auth.options.session.fields.userAgent).toBe('user_agent');
      expect(auth.options.session.fields.expiresAt).toBe('expires_at');
      expect(auth.options.session.fields.createdAt).toBe('created_at');
      expect(auth.options.session.fields.updatedAt).toBe('updated_at');
    });

    it('Verifications', () => {
      expect(auth.options.verification.fields.expiresAt).toBe('expires_at');
      expect(auth.options.verification.fields.createdAt).toBe('created_at');
      expect(auth.options.verification.fields.updatedAt).toBe('updated_at');
    });
  });
});

describe('Social sign-ins', async () => {
  it('Should redirect to Google OAuth2.0 on social sign-in start', async () => {
    const response = await auth.api.signInSocial({
      body: {
        provider: 'google',
      },
    });

    expect(response).toHaveProperty('redirect', true);
    expect(response).toHaveProperty('url');
    expect(response.url).toContain('https://accounts.google.com/o/oauth2/auth');
  });

  it('Should redirect to GitHub OAuth2.0 on social sign-in start', async () => {
    const response = await auth.api.signInSocial({
      body: {
        provider: 'github',
      },
    });

    expect(response).toHaveProperty('redirect', true);
    expect(response).toHaveProperty('url');
    expect(response.url).toContain('https://github.com/login/oauth/authorize');
  });
});

it('Email verification', async () => {
  const sendEmailSpy = vi
    .spyOn(sendMailModule, 'sendMail')
    .mockResolvedValueOnce();

  const user = fakeUser();
  const fakeVerificationUrl = 'http://localhost:5173/verify-email';
  const htmlContent = await getEmailVerifyHtml(user.name, fakeVerificationUrl);

  await auth.options.emailVerification.sendVerificationEmail({
    user,
    url: fakeVerificationUrl,
    token: 'fake-token',
  });

  expect(sendEmailSpy).toHaveBeenCalledWith(expect.any(Object), {
    to: user.email,
    subject: expect.stringMatching(/verify/i),
    html: htmlContent,
  });

  sendEmailSpy.mockRestore();
});

it('Password reset email', async () => {
  const sendEmailSpy = vi
    .spyOn(sendMailModule, 'sendMail')
    .mockResolvedValueOnce();

  const user = fakeUser();
  const fakePasswordResetUrl = 'http://localhost:5173/reset-password';
  const htmlContent = await getPasswordResetHtml(
    user.name,
    fakePasswordResetUrl
  );

  await auth.options.emailAndPassword.sendResetPassword({
    user,
    url: fakePasswordResetUrl,
    token: 'fake-token',
  });

  expect(sendEmailSpy).toHaveBeenCalledWith(expect.any(Object), {
    to: user.email,
    subject: expect.stringMatching(/reset/i),
    html: htmlContent,
  });

  sendEmailSpy.mockRestore();
});
