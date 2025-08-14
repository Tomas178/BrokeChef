export default class UserNotFound extends Error {
  constructor(id: string) {
    super(`User with ID: ${id} not found`);
  }
}
