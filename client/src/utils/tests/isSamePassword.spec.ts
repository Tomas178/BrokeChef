import { isSamePassword } from '../isSamePassword';

const password = 'password123';

describe('isSamePassword', () => {
  it('Should return true when given matching passwords', () => {
    expect(isSamePassword(password, password)).toBeTruthy();
  });

  it('Should return false when given non-matching password', () => {
    const modifiedPassword = password + 'a';

    expect(isSamePassword(password, modifiedPassword));
  });
});
