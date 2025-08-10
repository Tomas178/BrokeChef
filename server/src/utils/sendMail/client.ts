import config from '@server/config';
import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: config.auth.gmail.email,
    pass: config.auth.gmail.pass,
  },
});

console.log('E-mail system authenticated.');
