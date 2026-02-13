import { handleServiceErrors, type ErrorOverride } from './handleServiceErrors';

export async function withServiceErrors<T>(
  fn: () => Promise<T>,
  overrides?: ErrorOverride[]
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleServiceErrors(error, overrides);
  }
}
