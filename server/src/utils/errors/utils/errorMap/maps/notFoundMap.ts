import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import CollectionRecipeLinkNotFound from '@server/utils/errors/collections/CollectionRecipeLinkNotFound';
import FollowLinkNotFound from '@server/utils/errors/follows/FollowLinkNotFound';
import CookedRecipeNotFound from '@server/utils/errors/recipes/CookedRecipeNotFound';
import RatingNotFound from '@server/utils/errors/recipes/RatingNotFound';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import SavedRecipeNotFound from '@server/utils/errors/recipes/SavedRecipeNotFound';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server';

const notFoundErrors = [
  RecipeNotFound,
  RatingNotFound,
  UserNotFound,
  CookedRecipeNotFound,
  FollowLinkNotFound,
  CollectionNotFound,
  CollectionRecipeLinkNotFound,
  SavedRecipeNotFound,
] as const;

export const ERRORS_NOT_FOUND = new Map<
  new (...args: never[]) => Error,
  Extract<TRPC_ERROR_CODE_KEY, 'NOT_FOUND'>
>(notFoundErrors.map(ErrorClass => [ErrorClass, 'NOT_FOUND']));
