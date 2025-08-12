import config from '@server/config';
import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: config.mail.service,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: {
    user: config.mail.email,
    pass: config.mail.pass,
  },
});

console.log('E-mail system authenticated.');
