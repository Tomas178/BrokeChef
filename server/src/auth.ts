import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import config from './config';
import { sendMail } from './utils/sendMail';
import { transporter } from './utils/emailClient';

const createdAndUpdated = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const auth = betterAuth({
  user: {
    deleteUser: {
      enabled: true,
    },
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

  database: new Pool({
    connectionString: config.database.connectionString,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail(transporter, {
        to: user.email,
        subject: 'Verify your email address',
        text: `Click the link to verify your email: ${url}`,
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

  trustedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
});
