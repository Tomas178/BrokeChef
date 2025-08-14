import { DatabaseError } from 'pg';

export function assertError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw error;
  }
}

export function assertPostgresError(
  error: unknown
): asserts error is DatabaseError {
  if (!(error instanceof DatabaseError)) {
    throw error;
  }
}
