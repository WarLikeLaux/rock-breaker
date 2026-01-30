export function getTodayDate(dayStartHour = 0): string {
  const now = new Date();
  if (dayStartHour > 0) {
    now.setHours(now.getHours() - dayStartHour);
  }
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
