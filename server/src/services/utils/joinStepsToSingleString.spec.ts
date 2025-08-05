import { joinStepsToSingleString } from './joinStepsToSingleString';

it('Should return single string with NO newlines when given array of 1 step', () => {
  const singleString = joinStepsToSingleString(['step1']);

  expect(singleString).toEqual('step1');
});

it('Should return single string with newlines', () => {
  const singleString = joinStepsToSingleString(['step1', 'step2']);

  expect(singleString).toEqual('step1\nstep2');
});
