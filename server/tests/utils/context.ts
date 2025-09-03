import { fakeAuthUser } from '@server/entities/tests/fakes';
import { authUserSchema, type AuthUser } from '@server/entities/users';
import type { Context, ContextMinimal } from '@server/trpc';
import type { Request } from 'express';

export const requestContext = (
  context: Partial<Context> & ContextMinimal
): Context => ({
  req: {
    headers: {},
  } as Request,
  ...context,
});

export const authContext = (
  context: Partial<Context> & ContextMinimal,
  user: AuthUser = fakeAuthUser()
): Context => ({
  authUser: authUserSchema.parse(user),
  ...context,
});
