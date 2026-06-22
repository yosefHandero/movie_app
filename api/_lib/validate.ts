export function isValidMovieId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0 && id < 100_000_000;
}
