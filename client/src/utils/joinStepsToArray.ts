export function joinStepsToArray(steps: string): string[] {
  if (!steps) return [];

  return steps
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean);
}
