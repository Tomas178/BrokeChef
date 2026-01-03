import { fakeUser } from '@server/entities/tests/fakes';
import { auth } from '@server/auth';
import { EmailTemplate } from '@server/enums/EmailTemplate';
import { CREATED_AT, UPDATED_AT } from '@server/database/timestamps';
import type { EmailJobData } from '@server/queues/email';

const mockAddEmailJob = vi.hoisted(() => vi.fn());

vi.mock('@server/queues/email', () => ({
  emailQueue: {},
  addEmailJob: mockAddEmailJob,
}));

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
      expect(auth.options.user.fields.createdAt).toBe(CREATED_AT);
      expect(auth.options.user.fields.updatedAt).toBe(UPDATED_AT);
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
      expect(auth.options.account.fields.createdAt).toBe(CREATED_AT);
      expect(auth.options.account.fields.updatedAt).toBe(UPDATED_AT);
    });

    it('Sessions', () => {
      expect(auth.options.session.fields.userId).toBe('user_id');
      expect(auth.options.session.fields.ipAddress).toBe('ip_address');
      expect(auth.options.session.fields.userAgent).toBe('user_agent');
      expect(auth.options.session.fields.expiresAt).toBe('expires_at');
      expect(auth.options.session.fields.createdAt).toBe(CREATED_AT);
      expect(auth.options.session.fields.updatedAt).toBe(UPDATED_AT);
    });

    it('Verifications', () => {
      expect(auth.options.verification.fields.expiresAt).toBe('expires_at');
      expect(auth.options.verification.fields.createdAt).toBe(CREATED_AT);
      expect(auth.options.verification.fields.updatedAt).toBe(UPDATED_AT);
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

describe('Email sending', () => {
  beforeEach(() => vi.resetAllMocks());

  it('Email verification', async () => {
    const user = fakeUser();
    const fakeVerificationUrl = 'http://localhost:5173/verify-email';

    await auth.options.emailVerification.sendVerificationEmail({
      user,
      url: fakeVerificationUrl,
      token: 'fake-token',
    });

    const expectedCallData: EmailJobData = {
      emailType: EmailTemplate.VERIFY_EMAIL,
      to: user.email,
      username: user.name,
      url: fakeVerificationUrl,
    };

    expect(mockAddEmailJob).toHaveBeenCalledExactlyOnceWith(expectedCallData);
  });

  it('Password reset email', async () => {
    const user = fakeUser();
    const fakePasswordResetUrl = 'http://localhost:5173/reset-password';

    await auth.options.emailAndPassword.sendResetPassword({
      user,
      url: fakePasswordResetUrl,
      token: 'fake-token',
    });

    const expectedCallData: EmailJobData = {
      emailType: EmailTemplate.RESET_PASSWORD,
      to: user.email,
      username: user.name,
      url: fakePasswordResetUrl,
    };

    expect(mockAddEmailJob).toHaveBeenCalledExactlyOnceWith(expectedCallData);
  });
});
