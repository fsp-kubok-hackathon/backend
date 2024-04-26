export function addHours(h: number, date?: Date): Date {
  if (!date) {
    date = new Date();
  }
  return new Date(date.getTime() + h * 60 * 60 * 1000);
}
