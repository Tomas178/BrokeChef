export default class UserAlreadyFollowed extends Error {
  constructor() {
    super('User is already followed');
  }
}
