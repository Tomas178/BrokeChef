vi.mock('nodemailer', () => ({
  createTransport: vi.fn(),
}));

vi.mock('@server/config', () => ({
  default: {
    auth: {
      gmail: {
        email: 'test@gmail.com',
        pass: 'abcdefghijklmnop',
      },
    },
  },
}));

import * as nodemailer from 'nodemailer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { transporter } from '../emailClient';

describe('transporter', () => {
  it('Should call nodemailer.createTransport with correct settings for Email', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: 'test@gmail.com',
        pass: 'abcdefghijklmnop',
      },
    });
  });
});
