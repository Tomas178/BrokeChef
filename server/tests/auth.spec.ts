import { createAuth } from '@server/auth';
import { clearPoolTables } from './utils/record';
import { createTestPool } from './utils/pool';

const pool = createTestPool();
const auth = createAuth(pool);

beforeEach(async () => {
  await clearPoolTables(pool, [
    'verifications',
    'users',
    'sessions',
    'accounts',
  ]);
});

afterAll(async () => {
  await pool.end();
});

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
