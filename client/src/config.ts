export const apiOrigin =
  (import.meta.env.VITE_API_ORIGIN as string) || window.location.origin;
export const apiPath =
  (import.meta.env.VITE_API_PATH as string) || '/api/v1/trpc';
export const apiBase = `${apiOrigin}${apiPath}`;

if (typeof apiOrigin !== 'string')
  throw new Error('VITE_API_ORIGIN is not defined');

if (typeof apiPath !== 'string')
  throw new Error('VITE_API_PATH is not defined');

export const frontendBase =
  (import.meta.env.VITE_BASE_ORIGIN as string) || 'http://localhost:5173';

export const resetPasswordPath =
  (import.meta.env.VITE_RESET_PASSWORD_PATH as string) || '/reset-password';

export const resetPasswordBase = `${frontendBase}${resetPasswordPath}`;

if (typeof frontendBase !== 'string')
  throw new Error('VITE_BASE_ORIGIN is not defined');

if (typeof resetPasswordPath !== 'string')
  throw new Error('VITE_RESET_PASSWORD_PATH is not defined');
