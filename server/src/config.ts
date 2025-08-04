import 'dotenv/config';
import { z } from 'zod';

const { env } = process;

if (!env.NODE_ENV) env.NODE_ENV = 'development';

// force UTC timezone, so it matches the default timezone in production
env.TZ = 'UTC';

const isTest = env.NODE_ENV === 'test';
const isDevelopmentTest = env.NODE_ENV === 'development' || isTest;

const schema = z
  .object({
    env: z
      .enum(['development', 'production', 'staging', 'test'])
      .default('development'),
    isCi: z.preprocess(coerceBoolean, z.boolean().default(false)),
    port: z.coerce.number().default(3000),

    auth: z.object({
      tokenKey: z.string().default(() => {
        if (isDevelopmentTest) {
          return 'supersecretkey';
        }

        throw new Error('You must provide a TOKEN_KEY in a production env!');
      }),
      expiresIn: z.string().default('7d'),

      gmail: z.object({
        email: z.email(),
        pass: z.string(),
      }),

      google: z.object({
        clientId: z.string(),
        clientSecret: z.string(),
      }),

      github: z.object({
        clientId: z.string(),
        clientSecret: z.string(),
      }),

      betterAuth: z.object({
        secret: z.string().default(() => {
          if (isDevelopmentTest) {
            return 'supersecretbetterauthkey';
          }

          throw new Error(
            'You must provide a BETTER_AUTH_SECRET in a production env!'
          );
        }),
        url: z.url(),
      }),
    }),

    database: z.object({
      connectionString: z.url(),
    }),
  })
  .readonly();

const config = schema.parse({
  env: env.NODE_ENV,
  port: env.PORT,
  isCi: env.CI,

  auth: {
    tokenKey: env.TOKEN_KEY,
    expiresIn: env.TOKEN_EXPIRES_IN,

    gmail: {
      email: env.EMAIL,
      pass: env.EMAIL_APP_PASS,
    },

    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },

    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },

    betterAuth: {
      secret: env.BETTER_AUTH_SECRET,
      url: env.BETTER_AUTH_URL,
    },
  },

  database: {
    connectionString: env.DATABASE_URL,
  },
});

export default config;

// utility functions
function coerceBoolean(value: unknown) {
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }

  return;
}
