import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTodayDate } from '../date';

describe('getTodayDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('должен возвращать текущую дату', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 10, 0, 0));

    const result = getTodayDate();
    expect(result).toBe('2026-01-02');
  });

  it('должен сдвигать дату на начало дня', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 1, 0, 0));

    const result = getTodayDate(2);
    expect(result).toBe('2026-01-01');
  });
});
