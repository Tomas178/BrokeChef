import numbro from 'numbro';

export function formatRecipeRating(number: number) {
  return numbro(number).format({ trimMantissa: true, mantissa: 2 });
}
