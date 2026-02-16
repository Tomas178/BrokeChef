import { StatusCodes } from 'http-status-codes';

export default class ServiceUnavailable extends Error {
  status: number;

  constructor(message = 'Server is shutting down') {
    super(message);
    this.status = StatusCodes.SERVICE_UNAVAILABLE;
  }
}
