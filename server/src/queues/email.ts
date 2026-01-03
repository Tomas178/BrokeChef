import type { EmailTemplateValues } from '@server/enums/EmailTemplate';
import { redisConnection } from '@server/utils/redis/connection';
import { Queue, type DefaultJobOptions } from 'bullmq';

export interface EmailJobData {
  emailType: EmailTemplateValues;
  to: string;
  username: string;
  url: string;
}

export const EMAIL_QUEUE_NAME = 'email-queue';
export const EMAIL_JOB_NAME = 'send-email';

export const defaultEmailJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: 100,
};

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
});

export async function addEmailJob(data: EmailJobData) {
  await emailQueue.add(EMAIL_JOB_NAME, data, defaultEmailJobOptions);
}
