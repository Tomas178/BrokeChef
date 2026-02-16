import type { ObjectValues } from '@server/shared/types';

export const GracefulShutdownPriority = {
  WORKER: 10,
  QUEUE: 20,
  NODEMAILER: 30,
  INFRASTRUCTURE: 40,
  DATABASE: 50,
} as const;

export type GracefulShutdownPriorityValues = ObjectValues<
  typeof GracefulShutdownPriority
>;
