import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import { fakeIngredient } from '@server/entities/tests/fakes';
import { omit, pick } from 'lodash-es';
import { ingredientsKeysPublic } from '@server/entities/ingredients';
import { ingredientsRepository } from '../ingredientsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = ingredientsRepository(database);

const [ingredient] = await insertAll(database, 'ingredients', [
  fakeIngredient(),
]);

describe('create', () => {
  it('Should create a new ingredient', async () => {
    const ingredient = fakeIngredient();

    const createdIngredient = await repository.create(ingredient);

    expect(createdIngredient).toEqual({
      id: expect.any(Number),
      ...pick(ingredient, ingredientsKeysPublic),
    });
  });

  it('Should throw an error if ingredient with the given name exists', async () => {
    const [ingredient] = await insertAll(database, 'ingredients', [
      fakeIngredient(),
    ]);

    const ingredientToInsert = omit(ingredient, 'id');

    await expect(repository.create(ingredientToInsert)).rejects.toThrow(
      /unique/i
    );
  });
});

describe('findById', () => {
  it('Should return undefined if there is no ingredient with given ID', async () => {
    const ingredientById = await repository.findById(ingredient.id + 1);

    expect(ingredientById).toBeUndefined();
  });

  it('Should return ingredient by ID', async () => {
    const ingredientById = await repository.findById(ingredient.id);

    expect(ingredientById).toEqual(ingredient);
  });
});

describe('findByName', () => {
  it('Should return undefined if there is no ingredient with given name', async () => {
    const ingredientByName = await repository.findByName(ingredient.name + 'a');

    expect(ingredientByName).toBeUndefined();
  });

  it('Should return ingredient by name', async () => {
    const ingredientByName = await repository.findByName(ingredient.name);

    expect(ingredientByName).toEqual(ingredient);
  });
});
