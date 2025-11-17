export const FAKE_FRIDGE_IMAGE = Buffer.from('Fridge image');

export const FAKE_IMAGE_BUFFER_ONE = Buffer.from('aa');
export const FAKE_IMAGE_BUFFER_TWO = Buffer.from('bb');
export const FAKE_IMAGE_BUFFER_THREE = Buffer.from('cc');
export const FAKE_IMAGE_BUFFER_FOUR = Buffer.from('dd');

export const RESPONSE_IMAGES_OF_ONE = [FAKE_IMAGE_BUFFER_ONE];
export const RESPONSE_IMAGES_OF_TWO = [
  FAKE_IMAGE_BUFFER_ONE,
  FAKE_IMAGE_BUFFER_TWO,
];
export const RESPONSE_IMAGES_OF_THREE = [
  FAKE_IMAGE_BUFFER_ONE,
  FAKE_IMAGE_BUFFER_TWO,
  FAKE_IMAGE_BUFFER_THREE,
];
export const RESPONSE_IMAGES_OF_FOUR = [
  FAKE_IMAGE_BUFFER_ONE,
  FAKE_IMAGE_BUFFER_TWO,
  FAKE_IMAGE_BUFFER_THREE,
  FAKE_IMAGE_BUFFER_FOUR,
];

export const RESPONSE_RECIPE_ONE = {
  title: 'Recipe title 1',
  duration: 1,
  ingredients: ['ingredient 1', 'ingredient 2', 'ingredient 3'],
  tools: ['tool 1', 'tool 2', 'tool 3'],
  steps: ['step 1', 'step 2', 'step 3'],
};

export const RESPONSE_RECIPE_TWO = {
  title: 'Recipe title 2',
  duration: 2,
  ingredients: ['ingredient 1', 'ingredient 2', 'ingredient 3'],
  tools: ['tool 1', 'tool 2'],
  steps: ['step 1'],
};

export const RESPONSE_RECIPE_THREE = {
  title: 'recipe title 3',
  duration: 3,
  ingredients: ['ingredient 1', 'ingredient 2'],
  tools: ['tool 1', 'tool 2', 'tool 3'],
  steps: ['step 1', 'step 2', 'step 3', 'step 4', 'step 5'],
};

export const RESPONSE_RECIPE_FOUR = {
  title: 'recipe title 4',
  duration: 4,
  ingredients: ['ingredient 1'],
  tools: ['tool 1'],
  steps: ['step 1'],
};

export const INVALID_RESPONSE_SCHEMA = {
  notRecipes: [RESPONSE_RECIPE_ONE],
};

export const VALID_RESPONSE_SCHEMA_OF_ONE = {
  recipes: [RESPONSE_RECIPE_ONE],
};

export const VALID_RESPONSE_SCHEMA_OF_TWO = {
  recipes: [RESPONSE_RECIPE_ONE, RESPONSE_RECIPE_TWO],
};

export const VALID_RESPONSE_SCHEMA_OF_THREE = {
  recipes: [RESPONSE_RECIPE_ONE, RESPONSE_RECIPE_TWO, RESPONSE_RECIPE_THREE],
};

export const VALID_RESPONSE_SCHEMA_OF_FOUR = {
  recipes: [
    RESPONSE_RECIPE_ONE,
    RESPONSE_RECIPE_TWO,
    RESPONSE_RECIPE_THREE,
    RESPONSE_RECIPE_FOUR,
  ],
};
