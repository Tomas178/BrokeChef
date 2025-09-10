import config from '@server/config';
import * as nodemailer from 'nodemailer';

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

console.log('E-mail system authenticated.');
