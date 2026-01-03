import { EmailTemplate } from '@server/enums/EmailTemplate';
import type { Job } from 'bullmq';
import type { EmailJobData } from '@server/queues/email';
import { processEmailJob } from '../email';

const { eventHandlers } = vi.hoisted(() => ({
  eventHandlers: {} as Record<string, any>,
}));

const [
  mockGetTemplate,
  mockFormEmailTemplate,
  mockSendMail,
  mockLoggerInfo,
  mockLoggerError,
] = vi.hoisted(() => [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()]);

vi.mock('@server/utils/AWSS3Client/getTemplate', () => ({
  getTemplate: mockGetTemplate,
}));

vi.mock('@server/utils/sendMail/formEmailTemplate', () => ({
  formEmailTemplate: mockFormEmailTemplate,
}));

vi.mock('@server/utils/sendMail/client', () => ({
  transporter: {},
}));

vi.mock('@server/utils/sendMail/sendMail', () => ({
  sendMail: mockSendMail,
}));

vi.mock('@server/logger', () => ({
  default: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}));

vi.mock('@server/utils/redis/connection', () => ({ redisConnection: {} }));

vi.mock('bullmq', () => ({
  Worker: vi.fn(() => ({
    on: vi.fn((event, callback) => {
      eventHandlers[event] = callback;
    }),
    close: vi.fn(),
  })),
  Queue: vi.fn(),
}));

const fakeEmailTemplatesBucket = vi.hoisted(
  () => 'fake-email-templates-bucket'
);
vi.mock('@server/config', () => ({
  default: {
    auth: {
      aws: { s3: { buckets: { emailTemplates: fakeEmailTemplatesBucket } } },
    },
  },
}));

const createMockJob = (data: EmailJobData) =>
  ({
    id: 'job-123',
    data,
  }) as Job;

describe('Email Worker Processor', () => {
  beforeEach(() => vi.clearAllMocks());

  const fakeEmail = 'test@example.com';
  const fakeUsername = 'TestUser';
  const fakeFormEmailTemplate = '<html><body>Hi User</body></html>';
  const fakeUrl = 'http://verify.com';

  it('Should process a VERIFY_EMAIL job sucessfully', async () => {
    mockGetTemplate.mockResolvedValue('template-content');
    mockFormEmailTemplate.mockResolvedValue(fakeFormEmailTemplate);
    mockSendMail.mockResolvedValue(undefined);

    const job = createMockJob({
      emailType: EmailTemplate.VERIFY_EMAIL,
      to: fakeEmail,
      username: fakeUsername,
      url: fakeUrl,
    });

    await processEmailJob(job);

    expect(mockGetTemplate).toHaveBeenCalledWith(
      expect.anything(),
      fakeEmailTemplatesBucket,
      EmailTemplate.VERIFY_EMAIL
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        to: fakeEmail,
        subject: 'Verify your email address',
        html: fakeFormEmailTemplate,
      })
    );

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      expect.stringContaining('Email sent successfully')
    );
  });

  it('Should throw an error if sending fails', async () => {
    const errorMessage = 'SMPT Error';
    mockSendMail.mockRejectedValueOnce(new Error(errorMessage));

    const job = createMockJob({
      emailType: EmailTemplate.RESET_PASSWORD,
      to: fakeEmail,
      username: fakeUsername,
      url: fakeUrl,
    });

    await expect(processEmailJob(job)).rejects.toThrow(errorMessage);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send email')
    );
  });

  describe('Event Listeners', () => {
    it('Should log when worker is ready', () => {
      const readyCallback = eventHandlers['ready'];
      expect(readyCallback).toBeDefined();

      readyCallback();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('Email worker is ready')
      );
    });

    it('Should log when worker encounters an error', () => {
      const errorCallback = eventHandlers['error'];
      expect(errorCallback).toBeDefined();

      const fakeError = new Error('Redis died');
      errorCallback(fakeError);

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Email worker Redis connection error',
        fakeError
      );
    });
  });
});
