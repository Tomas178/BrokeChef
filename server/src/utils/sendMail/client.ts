import config from '@server/config';
import logger from '@server/logger';
import * as nodemailer from 'nodemailer';
import { GracefulShutdownPriority } from '@server/enums/GracefulShutdownPriority';
import { gracefulShutdownManager } from '../GracefulShutdownManager';

const transportOptions: nodemailer.TransportOptions = {};

if (config.mail.host) {
  Object.assign(transportOptions, {
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
  });
} else {
  Object.assign(transportOptions, {
    service: config.mail.service,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.email,
      pass: config.mail.pass,
    },
  });
}

export const transporter = nodemailer.createTransport(transportOptions);

/* v8 ignore start */
gracefulShutdownManager.registerCleanup(
  'nodemailer',
  () => {
    transporter.close();
  },
  GracefulShutdownPriority.NODEMAILER
);
/* v8 ignore start */

logger.info('E-mail system authenticated.');
