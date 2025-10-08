import { betterAuth } from 'better-auth';
import pg from 'pg';
import { CREATED_AT, UPDATED_AT } from '@server/database/timestamps';
import config from './config';
import { sendMail } from './utils/sendMail/sendMail';
import { transporter } from './utils/sendMail/client';
import { s3Client } from './utils/AWSS3Client/client';
import { formEmailTemplate } from './utils/sendMail/formEmailTemplate';
import { getTemplate } from './utils/AWSS3Client/getTemplate';
import { EmailTemplate } from './enums/EmailTemplate';
import logger from './logger';
import { TABLES } from './database/tables';

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
        const verifyEmailTemplate = await getTemplate(
          s3Client,
          config.auth.aws.s3.buckets.emailTemplates,
          EmailTemplate.VERIFY_EMAIL
        );

        const htmlContent = await formEmailTemplate(verifyEmailTemplate, {
          username: user.name,
          url,
        });

        await sendMail(transporter, {
          to: newEmail,
          subject: 'Verify your email address',
          html: htmlContent,
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
      const resetPasswordTemplate = await getTemplate(
        s3Client,
        config.auth.aws.s3.buckets.emailTemplates,
        EmailTemplate.RESET_PASSWORD
      );
      const htmlContent = await formEmailTemplate(resetPasswordTemplate, {
        username: user.name,
        url,
      });
      await sendMail(transporter, {
        to: user.email,
        subject: 'Password reset',
        html: htmlContent,
      });
    },
    onPasswordReset: async ({ user }) => {
      logger.info(`Password for the user: ${user.email} has been reset`);
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const verifyEmailTemplate = await getTemplate(
        s3Client,
        config.auth.aws.s3.buckets.emailTemplates,
        EmailTemplate.VERIFY_EMAIL
      );
      const htmlContent = await formEmailTemplate(verifyEmailTemplate, {
        username: user.name,
        url,
      });
      await sendMail(transporter, {
        to: user.email,
        subject: 'Verify your email address',
        html: htmlContent,
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
