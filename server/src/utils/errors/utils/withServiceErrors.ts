import { handleServiceErrors } from './handleServiceErrors';

export async function withServiceErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleServiceErrors(error);
  }
}
