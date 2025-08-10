import { getEmailVerifyHtml, getPasswordResetHtml } from '../templates';

it('getEmailVerifyHtml', async () => {
  const userName = 'noname';
  const verifyUrl = 'fake-url';

  const HtmlContent = await getEmailVerifyHtml(userName, verifyUrl);

  expect(HtmlContent).toContain(userName);
  expect(HtmlContent).toContain(verifyUrl);
});

it('getPasswordResetHtml', async () => {
  const userName = 'noname';
  const verifyUrl = 'fake-url';

  const HtmlContent = await getPasswordResetHtml(userName, verifyUrl);

  expect(HtmlContent).toContain(userName);
  expect(HtmlContent).toContain(verifyUrl);
});
