import * as nodemailer from 'nodemailer';

const mocks = vi.hoisted(() => ({
  mailConfig: {
    service: 'gmail',
    port: 465,
    secure: true,
    email: 'test@gmail.com',
    pass: 'abcdefghijklmnop',
    host: undefined as string | undefined,
  },
}));

vi.mock('@server/config', () => ({
  default: {
    get mail() {
      return mocks.mailConfig;
    },
  },
}));

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(),
}));

vi.mock('@server/logger', () => ({
  default: {
    info: vi.fn(),
  },
}));

describe('transporter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('Should use Service settings (Gmail) when host is missing (Else Block)', async () => {
    mocks.mailConfig = {
      service: 'gmail',
      port: 465,
      secure: true,
      email: 'test@gmail.com',
      pass: 'abcdefghijklmnop',
      host: undefined,
    };

    await import('../client');

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'gmail',
        auth: {
          user: 'test@gmail.com',
          pass: 'abcdefghijklmnop',
        },
      })
    );
  });

  it('Should use Host settings when host is provided (If Block)', async () => {
    mocks.mailConfig = {
      host: 'smtp.custom-host.com',
      port: 587,
      secure: false,
      service: 'gmail',
      email: 'test@gmail.com',
      pass: '123',
    };

    await import('../client');

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.custom-host.com',
        port: 587,
        secure: false,
      })
    );
  });
});
