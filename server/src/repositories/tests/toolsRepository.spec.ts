import { createTestDatabase } from '@tests/utils/database';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/record';
import { fakeTool } from '@server/entities/tests/fakes';
import { omit, pick } from 'lodash-es';
import { toolsKeysPublic } from '@server/entities/tools';
import { toolsRepository } from '../toolsRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = toolsRepository(database);

const [toolOne, toolTwo] = await insertAll(database, 'tools', [
  fakeTool(),
  fakeTool(),
]);

describe('create', () => {
  it('Should create a new tool', async () => {
    const tool = fakeTool();

    const [createdTool] = await repository.create([tool]);

    expect(createdTool).toEqual({
      id: expect.any(Number),
      ...pick(tool, toolsKeysPublic),
    });
  });

  it('Should create many new tools', async () => {
    const tools = [fakeTool(), fakeTool()];

    const createdTools = await repository.create(tools);

    expect(createdTools).toMatchObject(tools);
  });

  it('Should throw an error if tool with the given name exists', async () => {
    const [tool] = await insertAll(database, 'tools', [fakeTool()]);

    const toolToInsert = omit(tool, 'id');

    await expect(repository.create([toolToInsert])).rejects.toThrow(/unique/i);
  });
});

describe('findById', () => {
  it('Should return undefined if there is no tool with given ID', async () => {
    const toolById = await repository.findById(toolOne.id + toolTwo.id);

    expect(toolById).toBeUndefined();
  });

  it('Should return tool by ID', async () => {
    const toolById = await repository.findById(toolOne.id);

    expect(toolById).toEqual(toolOne);
  });
});

describe('findByNames', () => {
  it('Should return undefined if given an empty array', async () => {
    await expect(repository.findByNames([])).resolves.toBeUndefined();
  });

  it('Should return undefined if there is no tool with given name', async () => {
    const toolByName = await repository.findByNames([toolOne.name + 'a']);

    expect(toolByName).toEqual([]);
  });

  it('Should return tool by name', async () => {
    const toolByName = await repository.findByNames([toolOne.name]);

    expect(toolByName).toEqual([toolOne]);
  });

  it('Should return multiple tools by names', async () => {
    const tools = [toolOne.name, toolTwo.name];

    const toolsByNames = await repository.findByNames(tools);

    expect(toolsByNames).toEqual([toolOne, toolTwo]);
  });
});
