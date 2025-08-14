import { DatabaseError } from 'pg';
import { assertError, assertPostgresError } from '../errors';

describe('assertError', () => {
  it('Should not throw an error if input is an instance of Error', () => {
    const error = new Error('Test error');
    expect(() => assertError(error)).not.toThrow();
  });

  it('Should throw an error if input is not an instance of Error', () => {
    const error = 'Test error';
    expect(() => assertError(error)).toThrow();
  });
});

describe('assertPostgresError', () => {
  it('should not throw an error if input is an instance of Error', () => {
    const error = new DatabaseError('Test error', 1, 'error');
    expect(() => assertPostgresError(error)).not.toThrow();
  });

  it('should throw an error if input is not an instance of Error', () => {
    const error = 'Test error';
    expect(() => assertPostgresError(error)).toThrow();
  });
});
