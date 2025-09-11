const BASE_URL_V1 = 'http://localhost:8025/api/v1';
const BASE_URL_V2 = 'http://localhost:8025/api/v2';

async function getLatestEmailLink(): Promise<string> {
  const response = await fetch(`${BASE_URL_V2}/messages`, { method: 'GET' });

  const data = await response.json();
  const html: string = data.items[0].Content.Body;

  const htmlCleared = html.replace(/=\r\n/g, '').replace(/=3D/g, '=');

  const match = htmlCleared.match(
    /(http:\/\/localhost:3000\/api\/auth\/verify-email\?token=[\w.-]+&callbackURL=http:\/\/localhost:5173|http:\/\/localhost:3000\/api\/auth\/reset-password\/[^\s"]+)/
  );

  if (!match) {
    throw new Error('Link not found in email body');
  }

  return match[0];
}

export async function waitForEmailLink(): Promise<string> {
  const timeout = process.env.CI ? 90000 : 30000;
  const interval = 1000;
  let verificationLink: string | null = null;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      verificationLink = await getLatestEmailLink();
      if (verificationLink) break;
    } catch {
      // email not yet ready, ignore
    }
    await new Promise((res) => setTimeout(res, interval));
  }

  if (!verificationLink) {
    throw new Error('Verification link not received within 30 seconds');
  }

  return verificationLink;
}

export async function clearEmails() {
  await fetch(`${BASE_URL_V1}/messages`, { method: 'DELETE' });
}
