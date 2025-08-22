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
    cors: z.object({
      origin: z.array(z.url()),
    }),

    mail: z.object({
      service: z.string().default('gmail'),
      port: z.coerce.number().default(465),
      secure: z.coerce.boolean().default(true),
      email: z.email(),
      pass: z.string(),
    }),

    auth: z.object({
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
        trustedOrigins: z.array(z.url()),
      }),

      aws: z.object({
        accessIdKey: z.string().trim(),
        secretAccessKey: z.string().trim(),
        s3: z.object({
          region: z.string().trim(),
          buckets: z.object({
            emailTemplates: z.string().trim(),
          }),
        }),
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
  cors: {
    origin: [env.FRONT_END_URL, env.FRONT_END_FULL_URL],
  },

  mail: {
    service: env.MAIL_SERVICE,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    email: env.EMAIL,
    pass: env.EMAIL_APP_PASS,
  },

  auth: {
    google: {
      clientId: env.CLIENT_ID_GOOGLE,
      clientSecret: env.CLIENT_SECRET_GOOGLE,
    },

    github: {
      clientId: env.CLIENT_ID_GITHUB,
      clientSecret: env.CLIENT_SECRET_GITHUB,
    },

    betterAuth: {
      secret: env.BETTER_AUTH_SECRET,
      url: env.BETTER_AUTH_URL,
      trustedOrigins: [env.BETTER_AUTH_URL, env.FRONT_END_URL],
    },

    aws: {
      accessIdKey: env.AWS_ACCESS_ID_KEY,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      s3: {
        region: env.AWS_S3_REGION,
        buckets: {
          emailTemplates: env.AWS_S3_EMAIL_TEMPLATES_BUCKET_NAME,
        },
      },
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
