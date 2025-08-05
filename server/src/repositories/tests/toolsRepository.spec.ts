import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import { fakeTool } from '@server/entities/tests/fakes';
import { omit, pick } from 'lodash-es';
import { toolsKeysPublic } from '@server/entities/tools';
import { toolsRepository } from '../toolsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = toolsRepository(database);

const [tool] = await insertAll(database, 'tools', [fakeTool()]);

describe('create', () => {
  it('Should create a new tool', async () => {
    const tool = fakeTool();

    const createdTool = await repository.create(tool);

    expect(createdTool).toEqual({
      id: expect.any(Number),
      ...pick(tool, toolsKeysPublic),
    });
  });

  it('Should throw an error if tool with the given name exists', async () => {
    const [tool] = await insertAll(database, 'tools', [fakeTool()]);

    const toolToInsert = omit(tool, 'id');

    await expect(repository.create(toolToInsert)).rejects.toThrow(/unique/i);
  });
});

describe('findById', () => {
  it('Should return undefined if there is no tool with given ID', async () => {
    const toolById = await repository.findById(tool.id + 1);

    expect(toolById).toBeUndefined();
  });

  it('Should return tool by ID', async () => {
    const toolById = await repository.findById(tool.id);

    expect(toolById).toEqual(tool);
  });
});

describe('findByName', () => {
  it('Should return undefined if there is no tool with given name', async () => {
    const toolByName = await repository.findByName(tool.name + 'a');

    expect(toolByName).toBeUndefined();
  });

  it('Should return tool by name', async () => {
    const toolByName = await repository.findByName(tool.name);

    expect(toolByName).toEqual(tool);
  });
});
