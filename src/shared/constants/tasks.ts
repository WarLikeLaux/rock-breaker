export const MIN_DAILY_EXECUTIONS = 1;
export const MAX_DAILY_EXECUTIONS = 3;
export const HP_PER_DAY = 5;

export function calculateMaxHp(days: number): number {
  if (!Number.isFinite(days) || days < 0) {
    return 0;
  }
  return Math.floor(days) * HP_PER_DAY;
}
