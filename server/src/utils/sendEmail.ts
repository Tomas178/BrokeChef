import config from '@server/config';
import nodemailer from 'nodemailer';

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: config.auth.gmail.email,
    pass: config.auth.gmail.pass,
  },
});

console.log('E-mail system authenticated.');

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: config.auth.gmail.email,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email sending failed');
  }
}
