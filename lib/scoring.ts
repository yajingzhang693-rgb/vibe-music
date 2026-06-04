export function calculateFinalScore(
  overall: number,
  production: number,
  songwriting: number
): number {
  const total = overall * 0.7 + ((production + songwriting) / 2) * 0.3;
  return Math.round(total * 10) / 10;
}
