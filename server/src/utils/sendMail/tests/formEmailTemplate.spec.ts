import { formEmailTemplate } from '../formEmailTemplate';

const username = 'John Doe';
const url = 'fake-url';

describe('formEmailTemplate', () => {
  it('Should replace all placeholders when template has single occurrences of them', async () => {
    const html = 'Hello {{username}}, click this: {{url}}';

    const formedTemplate = await formEmailTemplate(html, { username, url });

    expect(formedTemplate).not.toContain('{{username}}');
    expect(formedTemplate).not.toContain('{{url}}');

    expect(formedTemplate).toContain(username);
    expect(formedTemplate).toContain(url);
  });

  it('Should replace all placeholders when template has multiple occurrences of them', async () => {
    const html =
      'Hello {{username}}, click this: {{url}}. or this if you want: {{url}}. See ya later {{username}}!';

    const formedTemplate = await formEmailTemplate(html, { username, url });

    expect(formedTemplate).not.toContain('{{username}}');
    expect(formedTemplate).not.toContain('{{url}}');

    expect(formedTemplate).toContain(username);
    expect(formedTemplate).toContain(url);
  });
});
