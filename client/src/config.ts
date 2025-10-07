import { ROUTE_PATHS } from './router/consts/routePaths';

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

export const resetPasswordBase = `${frontendBase}${ROUTE_PATHS.RESET_PASSWORD}`;

if (typeof frontendBase !== 'string')
  throw new Error('VITE_BASE_ORIGIN is not defined');
