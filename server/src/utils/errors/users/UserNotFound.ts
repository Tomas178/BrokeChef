export default class UserNotFound extends Error {
  constructor(id: string) {
    super(`User with : ${id} not found`);
  }
}
