import { joinStepsToArray } from './joinStepsToArray';

it('Should return an empty array when given empty string', () => {
  const stringArray = joinStepsToArray('');

  expect(stringArray).toEqual([]);
});

it('Should return an array of single step if given string with no newlines', () => {
  const string = 'step1';

  const stringArray = joinStepsToArray(string);

  expect(stringArray).toHaveLength(1);
  expect(stringArray).toEqual([string]);
});

it('Should return an array with no empty values when given string with two newlines in a row', () => {
  const string = 'step1\nstep2\n\nstep3';

  const stringArray = joinStepsToArray(string);

  expect(stringArray).toHaveLength(3);

  expect(stringArray[0]).toEqual('step1');
  expect(stringArray[1]).toEqual('step2');
  expect(stringArray[2]).toEqual('step3');
});

it('Should return an array', () => {
  const string = 'step1\nstep2\nstep3';

  const stringArray = joinStepsToArray(string);

  expect(stringArray).toHaveLength(3);

  expect(stringArray[0]).toEqual('step1');
  expect(stringArray[1]).toEqual('step2');
  expect(stringArray[2]).toEqual('step3');
});
