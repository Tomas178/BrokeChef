import { StatusCodes } from 'http-status-codes';

export default class Unauthenticated extends Error {
  status: number;

  constructor() {
    super('Unauthenticated. Please Sign In');
    this.status = StatusCodes.FORBIDDEN;
  }
}
