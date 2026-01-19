export function getTodayDate(): string {
  const parts = new Date().toISOString().split('T');
  return parts[0] || '';
}
