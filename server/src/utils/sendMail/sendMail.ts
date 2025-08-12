import config from '@server/config';
import type { SendMailOptions, Transporter } from 'nodemailer';

export async function sendMail(
  transporter: Transporter,
  options: SendMailOptions
) {
  try {
    await transporter.sendMail({
      from: config.mail.email,
      ...options,
    });
  } catch {
    throw new Error('Email sending failed');
  }
}
