import { betterAuth } from 'better-auth';
import pg from 'pg';
import { CREATED_AT, UPDATED_AT } from '@server/database/timestamps';
import config from './config';
import { EmailTemplate } from './enums/EmailTemplate';
import { TABLES } from './database/tables';
import { addEmailJob } from './queues/email';

const createdAndUpdated = {
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const auth = betterAuth({
  user: {
    modelName: TABLES.USERS,
    fields: {
      emailVerified: 'email_verified',
      ...createdAndUpdated,
    },

    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        await addEmailJob({
          emailType: EmailTemplate.VERIFY_EMAIL,
          to: newEmail,
          username: user.name,
          url,
        });
      },
    },
  },

  account: {
    modelName: TABLES.ACCOUNTS,
    fields: {
      userId: 'user_id',
      accountId: 'account_id',
      providerId: 'provider_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      idToken: 'id_token',
      ...createdAndUpdated,
    },
  },

  session: {
    modelName: TABLES.SESSIONS,
    fields: {
      userId: 'user_id',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      ...createdAndUpdated,
    },
  },

  verification: {
    modelName: TABLES.VERIFICATIONS,
    fields: {
      expiresAt: 'expires_at',
      ...createdAndUpdated,
    },
  },

  database: new pg.Pool({
    connectionString: config.database.connectionString,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await addEmailJob({
        emailType: EmailTemplate.RESET_PASSWORD,
        to: user.email,
        username: user.name,
        url,
      });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await addEmailJob({
        emailType: EmailTemplate.VERIFY_EMAIL,
        to: user.email,
        username: user.name,
        url,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: config.auth.google.clientId,
      clientSecret: config.auth.google.clientSecret,
    },
    github: {
      clientId: config.auth.github.clientId,
      clientSecret: config.auth.github.clientSecret,
    },
  },

  secret: config.auth.betterAuth.secret,

  trustedOrigins: config.auth.betterAuth.trustedOrigins,
});
