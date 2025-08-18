const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';

export const apiOrigin =
  (import.meta.env.VITE_API_ORIGIN as string) || window.location.origin;
export const apiPath =
  (import.meta.env.VITE_API_PATH as string) || '/api/v1/trpc';
export const apiBase = `${apiOrigin}${apiPath}`;

export const frontendBase =
  (import.meta.env.VITE_BASE_ORIGIN as string) || DEFAULT_FRONTEND_ORIGIN;

if (typeof apiOrigin !== 'string') {
  throw new Error('VITE_API_ORIGIN is not defined');
}

if (typeof apiPath !== 'string') {
  throw new Error('VITE_API_PATH is not defined');
}
