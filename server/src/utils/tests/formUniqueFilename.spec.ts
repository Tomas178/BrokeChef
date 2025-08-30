import { formUniqueFilename } from '../formUniqueFilename';

const fakeRandomUUID = 'randomUUID';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => fakeRandomUUID),
}));

describe('formUniqueFilename', () => {
  it('Should return unique filename', () => {
    const filename = 'file';

    const uniqueFilename = formUniqueFilename(filename);

    expect(uniqueFilename).toContain(fakeRandomUUID);
    expect(uniqueFilename).toContain(filename);
  });
});
