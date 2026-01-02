/* eslint-disable unicorn/no-null */
import config from '@server/config';
import { createDatabase } from '@server/database';
import { TABLES } from '@server/database/tables';
import {
  withIngredients,
  withTools,
} from '@server/repositories/recipesRepository';
import { openai } from '@server/utils/OpenAI/client';
import { formatRecipeForEmbedding } from '@server/utils/OpenAI/formatRecipeForEmbedding';
import { getEmbedding } from '@server/utils/OpenAI/getEmbedding';
import pgvector from 'pgvector/kysely';

async function fillNonEmbeddedRecipes() {
  const database = createDatabase(config.database);

  try {
    const recipesWithoutEmbeddings = await database
      .selectFrom(TABLES.RECIPES)
      .select(['id', 'duration', 'title'])
      .select(withIngredients)
      .select(withTools)
      .where('embedding', 'is', null)
      .execute();

    if (recipesWithoutEmbeddings.length === 0) {
      console.log('No non-embedded recipes found, returning...');
      return;
    }

    console.log(`Found ${recipesWithoutEmbeddings.length} recipes to embed...`);

    for (const recipe of recipesWithoutEmbeddings) {
      try {
        const text = formatRecipeForEmbedding(recipe);
        const embedding = await getEmbedding(openai, text);

        await database
          .updateTable(TABLES.RECIPES)
          .set({ embedding: pgvector.toSql(embedding) })
          .where('id', '=', recipe.id)
          .execute();

        console.log(`Embedded recipe ID: ${recipe.id}`);
      } catch (error) {
        console.error(
          `Error when embedding recipe with ID: ${recipe.id}`,
          error
        );
      }
    }

    console.log('Successfully embedded all non-embedded recipes');
  } finally {
    await database.destroy();
  }
}

await fillNonEmbeddedRecipes();
