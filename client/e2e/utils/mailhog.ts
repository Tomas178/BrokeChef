const BASE_URL_V1 = 'http://localhost:8025/api/v1';
const BASE_URL_V2 = 'http://localhost:8025/api/v2';

export async function getVerifyLink(): Promise<string> {
  const response = await fetch(`${BASE_URL_V2}/messages`, { method: 'GET' });

  const data = await response.json();
  const html: string = data.items[0].Content.Body;

  const htmlCleared = html.replace(/=\r\n/g, '').replace(/=3D/g, '=');

  const match = htmlCleared.match(
    /http:\/\/localhost:3000\/api\/auth\/verify-email\?token=[\w.*-]+&callbackURL=http:\/\/localhost:5173/
  );

  if (!match) {
    throw new Error('Verification link not found in email body');
  }

  return match[0];
}

export async function clearEmails() {
  await fetch(`${BASE_URL_V1}/messages`, { method: 'DELETE' });
}
