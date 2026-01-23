import { StatusCodes } from 'http-status-codes';

export default class RateLimitError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = StatusCodes.TOO_MANY_REQUESTS;
  }
}
