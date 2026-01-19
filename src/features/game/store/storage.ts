import type { StoredState, Task, Settings } from '@/shared/types';
import { getTodayDate } from '@/shared/utils/date';

const STORAGE_KEY = 'rock-breaker-state';
const SETTINGS_KEY = 'rock-breaker-settings';
const SCHEMA_VERSION = 2;

export function saveToStorage(state: Omit<StoredState, 'version'>): void {
  const stateWithVersion: StoredState = {
    version: SCHEMA_VERSION,
    ...state,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithVersion));
}

export function loadFromStorage(): StoredState | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const state = JSON.parse(saved) as StoredState;

    if (state.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      ...state,
      tasks: (state.tasks || []).map((t: Task) => ({
        ...t,
        type: t.type || 'standard',
        originalText: t.originalText || null,
      })),
    };
  } catch {
    return null;
  }
}

export function exportData(data: Omit<StoredState, 'version'> & { showTooltips: boolean }): void {
  const state = {
    ...data,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rock-breaker-${getTodayDate()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(
  jsonString: string,
): Partial<StoredState & { showTooltips?: boolean }> | null {
  try {
    const state = JSON.parse(jsonString) as Partial<
      StoredState & { showTooltips?: boolean; exportedAt?: string }
    >;
    return {
      goalName: state.goalName || '',
      durationDays: state.durationDays || 0,
      tasks: (state.tasks || []).map((t: Task) => ({
        ...t,
        type: t.type || 'standard',
        originalText: t.originalText || null,
      })),
      currentHp: state.currentHp || 0,
      lastActiveDate: state.lastActiveDate || getTodayDate(),
      taskIdCounter: state.taskIdCounter || 0,
      showTooltips: state.showTooltips,
    };
  } catch {
    return null;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): Settings {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as Settings;
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
