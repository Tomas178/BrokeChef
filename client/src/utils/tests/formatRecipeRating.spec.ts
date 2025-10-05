import { formatRecipeRating } from '../formatRecipeRating';

describe('formatRecipeRating', () => {
  describe('Should return integer', () => {
    const returnValue = '3';

    it('Should return "3" if rating is 3', async () => {
      const rating = 3;
      expect(formatRecipeRating(rating)).toBe(returnValue);
    });

    it('Should return "3" if rating is 3.0', async () => {
      const rating = 3.0;
      expect(formatRecipeRating(rating)).toBe(returnValue);
    });

    it('Should return "3" if rating is 3.00', async () => {
      const rating = 3.0;
      expect(formatRecipeRating(rating)).toBe(returnValue);
    });
  });

  describe('Should return float', () => {
    const returnValue = '3.5';
    it('Should return "3.5" if rating is 3.5', () => {
      const rating = 3.5;
      expect(formatRecipeRating(rating)).toBe(returnValue);
    });

    it('Should return "3.5" if rating is 3.50', () => {
      const rating = 3.5;
      expect(formatRecipeRating(rating)).toBe(returnValue);
    });

    it('Should return 3.51 if rating is 3.514', () => {
      const rating = 3.514;
      expect(formatRecipeRating(rating)).toBe('3.51');
    });

    it('Should return 3.52 if rating is 3.516', () => {
      const rating = 3.516;
      expect(formatRecipeRating(rating)).toBe('3.52');
    });
  });
});
