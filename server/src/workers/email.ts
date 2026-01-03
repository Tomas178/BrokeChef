import config from '@server/config';
import {
  EmailTemplate,
  type EmailTemplateValues,
} from '@server/enums/EmailTemplate';
import logger from '@server/logger';
import { EMAIL_QUEUE_NAME, type EmailJobData } from '@server/queues/email';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { getTemplate } from '@server/utils/AWSS3Client/getTemplate';
import { redisConnection } from '@server/utils/redis/connection';
import { transporter } from '@server/utils/sendMail/client';
import { formEmailTemplate } from '@server/utils/sendMail/formEmailTemplate';
import { sendMail } from '@server/utils/sendMail/sendMail';
import { Job, Worker } from 'bullmq';

const CONCURRENT_PROCESSES = 5;

function getSubject(emailType: EmailTemplateValues) {
  let subject = '';

  if (emailType === EmailTemplate.VERIFY_EMAIL) {
    subject = 'Verify your email address';
  }

  if (emailType === EmailTemplate.RESET_PASSWORD) {
    subject = 'Password reset';
  }

  return subject;
}

export async function processEmailJob(job: Job<EmailJobData>) {
  const { emailType, to, username, url } = job.data;

  logger.info(`Processing email job ${job.id}: ${emailType} for ${to}`);

  try {
    const templateName = config.auth.aws.s3.buckets.emailTemplates;

    const emailTemplate = await getTemplate(s3Client, templateName, emailType);

    const htmlContent = await formEmailTemplate(emailTemplate, {
      username,
      url,
    });

    const subject = getSubject(emailType);

    await sendMail(transporter, {
      to,
      subject,
      html: htmlContent,
    });

    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}`, error);
    throw error;
  }
}

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  processEmailJob,
  {
    connection: redisConnection,
    concurrency: CONCURRENT_PROCESSES,
  }
);

emailWorker.on('ready', () => {
  logger.info(
    `Email worker is ready! Connected to Redis and listening on ${EMAIL_QUEUE_NAME}`
  );
});

emailWorker.on('error', error => {
  logger.error('Email worker Redis connection error', error);
});
