import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';
import config from './config';

const createdAndUpdated = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export function createAuth(database: Pool) {
  return betterAuth({
    user: {
      modelName: 'users',
      fields: {
        emailVerified: 'email_verified',
        ...createdAndUpdated,
      },
    },

    session: {
      modelName: 'sessions',
      fields: {
        userId: 'user_id',
        expiresAt: 'expires_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        ...createdAndUpdated,
      },
    },

    account: {
      modelName: 'accounts',
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

    verification: {
      modelName: 'verifications',
      fields: {
        expiresAt: 'expires_at',
        ...createdAndUpdated,
      },
    },

    database,
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

    trustedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
  });
}
