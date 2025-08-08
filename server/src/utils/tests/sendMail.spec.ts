import type { Transporter } from 'nodemailer';
import { sendMail } from '../sendMail';

const mockSendMail = vi.fn();

const mockTransporter = {
  sendMail: mockSendMail,
} as unknown as Transporter;

describe('sendMail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email with correct parameters', async () => {
    mockSendMail.mockResolvedValueOnce({ accepted: ['test@example.com'] });
    const sendMailOptions = {
      to: 'test@example.com',
      subject: 'Hello',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };

    await sendMail(mockTransporter, sendMailOptions);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: expect.any(String),
      ...sendMailOptions,
    });
  });

  it('should throw an error when sendMail fails', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(
      sendMail(mockTransporter, {
        to: 'fail@example.com',
        subject: 'Fail',
        text: 'Should fail',
      })
    ).rejects.toThrow('Email sending failed');
  });
});
