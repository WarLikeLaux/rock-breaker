import { describe, it, expect } from 'vitest';
import { calculateMaxHp, HP_PER_DAY } from '../tasks';

describe('calculateMaxHp', () => {
  it('должен возвращать 0 для отрицательного значения', () => {
    const result = calculateMaxHp(-1);
    expect(result).toBe(0);
  });

  it('должен возвращать 0 для нечислового значения', () => {
    const result = calculateMaxHp(Number.NaN);
    expect(result).toBe(0);
  });

  it('должен округлять дни вниз', () => {
    const result = calculateMaxHp(2.9);
    expect(result).toBe(2 * HP_PER_DAY);
  });
});
