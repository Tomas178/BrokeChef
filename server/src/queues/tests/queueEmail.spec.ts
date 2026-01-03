import { Queue } from 'bullmq';
import { EmailTemplate } from '@server/enums/EmailTemplate';
import {
  addEmailJob,
  EMAIL_QUEUE_NAME,
  emailQueue,
  EMAIL_JOB_NAME,
  type EmailJobData,
  defaultEmailJobOptions,
} from '../email';

const mockAdd = vi.hoisted(() => vi.fn());
const mockQueue = vi.hoisted(() =>
  vi.fn(() => ({
    add: mockAdd,
  }))
);

vi.mock('bullmq', () => ({
  Queue: mockQueue,
}));

vi.mock('@server/utils/redis/connection', () => ({
  redisConnection: {},
}));

describe('Email Queue', () => {
  beforeEach(() => mockAdd.mockClear());

  it('Should initialize the Queue with the correct name', () => {
    expect(Queue).toHaveBeenCalledWith(
      EMAIL_QUEUE_NAME,
      expect.objectContaining({
        connection: expect.any(Object),
      })
    );
  });

  it('addEmailJob should add a job to the queue with default options', async () => {
    const mockData: EmailJobData = {
      emailType: EmailTemplate.VERIFY_EMAIL,
      to: 'test@gmail.com',
      username: 'Test',
      url: 'fake-url',
    };

    await addEmailJob(mockData);

    expect(emailQueue.add).toHaveBeenCalledExactlyOnceWith(
      EMAIL_JOB_NAME,
      mockData,
      expect.objectContaining(defaultEmailJobOptions)
    );
  });
});
