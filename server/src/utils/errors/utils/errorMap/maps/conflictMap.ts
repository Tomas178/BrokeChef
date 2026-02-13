import CollectionAlreadyCreated from '@server/utils/errors/collections/CollectionAlreadyCreated';
import CollectionRecipesLinkAlreadyExists from '@server/utils/errors/collections/CollectionRecipeLinkAlreadyExists';
import UserAlreadyFollowed from '@server/utils/errors/follows/UserAlreadyFollowed';
import RecipeAlreadyCreated from '@server/utils/errors/recipes/RecipeAlreadyCreated';
import RecipeAlreadyMarkedAsCooked from '@server/utils/errors/recipes/RecipeAlreadyMarkedAsCooked';
import RecipeAlreadyRated from '@server/utils/errors/recipes/RecipeAlreadyRated';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server';

const conflictErrors = [
  RecipeAlreadyCreated,
  RecipeAlreadyMarkedAsCooked,
  RecipeAlreadyRated,
  RecipeAlreadySaved,
  CollectionAlreadyCreated,
  CollectionRecipesLinkAlreadyExists,
  UserAlreadyFollowed,
] as const;

export const ERRORS_CONFLICTS = new Map<
  new () => Error,
  Extract<TRPC_ERROR_CODE_KEY, 'CONFLICT'>
>(conflictErrors.map(ErrorClass => [ErrorClass, 'CONFLICT']));
