import { formUniqueFilename } from '../formUniqueFilename';

const fakeRandomUUID = 'randomUUID';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => fakeRandomUUID),
}));

describe('formUniqueFilename', () => {
  it('Should return unique filename', () => {
    const uniqueFilename = formUniqueFilename();

    expect(uniqueFilename).toBe(fakeRandomUUID);
  });
});
