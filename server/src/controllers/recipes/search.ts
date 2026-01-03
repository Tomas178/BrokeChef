import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationWithUserInput } from '@server/entities/shared';

export default publicProcedure
  .use(provideServices({ recipesService }))
  .input(paginationWithUserInput)
  .query(async ({ input: paginationWithUserInput, ctx: { services } }) => {
    const { userInput, ...pagination } = paginationWithUserInput;

    const recipes = await services.recipesService.search(userInput, pagination);

    return recipes;
  });
