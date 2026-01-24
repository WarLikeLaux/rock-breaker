import type { StoredState, StoredStateV2, Rock, Task, Settings } from '@/shared/types';
import { getTodayDate } from '@/shared/utils/date';

const STORAGE_KEY = 'rock-breaker-state';
const SETTINGS_KEY = 'rock-breaker-settings';
const SCHEMA_VERSION = 3;

function migrateFromV2ToV3(oldState: StoredStateV2): StoredState {
  const mainRock: Rock = {
    id: 1,
    goalName: oldState.goalName || '',
    durationDays: oldState.durationDays || 0,
    tasks: (oldState.tasks || []).map((t: Task) => ({
      ...t,
      type: t.type || 'standard',
      originalText: t.originalText || null,
    })),
    currentHp: oldState.currentHp || 0,
    lastActiveDate: oldState.lastActiveDate || '',
    taskIdCounter: oldState.taskIdCounter || 0,
    isMain: true,
  };

  return {
    version: SCHEMA_VERSION,
    rocks: [mainRock],
    activeRockId: 1,
    isSetupComplete: oldState.isSetupComplete || false,
    rockIdCounter: 1,
  };
}

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
    const state = JSON.parse(saved) as StoredState | StoredStateV2;

    if (state.version === 2) {
      const migrated = migrateFromV2ToV3(state as StoredStateV2);
      saveToStorage(migrated);
      return migrated;
    }

    if (state.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const v3State = state as StoredState;
    return {
      ...v3State,
      rocks: v3State.rocks.map((rock: Rock) => ({
        ...rock,
        tasks: (rock.tasks || []).map((t: Task) => ({
          ...t,
          type: t.type || 'standard',
          originalText: t.originalText || null,
        })),
      })),
    };
  } catch {
    return null;
  }
}

interface ExportData {
  rocks: Rock[];
  activeRockId: number;
  isSetupComplete: boolean;
  rockIdCounter: number;
  showTooltips: boolean;
}

export function exportData(data: ExportData): void {
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

interface ImportResult {
  rocks: Rock[];
  activeRockId: number;
  rockIdCounter: number;
  showTooltips?: boolean;
}

export function importData(jsonString: string): ImportResult | null {
  try {
    const state = JSON.parse(jsonString) as Partial<ExportData & { exportedAt?: string }>;

    if (!state.rocks || !Array.isArray(state.rocks)) {
      return null;
    }

    if (state.rocks.length === 0) {
      return null;
    }

    const normalizedRocks = state.rocks.map((rock: Rock) => ({
      ...rock,
      tasks: (rock.tasks || []).map((t: Task) => ({
        ...t,
        type: t.type || 'standard',
        originalText: t.originalText || null,
      })),
    }));

    const rockIds = normalizedRocks.map((rock) => rock.id);
    const fallbackActiveRockId = normalizedRocks[0].id;
    const activeRockId = rockIds.includes(state.activeRockId ?? -1)
      ? (state.activeRockId as number)
      : fallbackActiveRockId;
    const maxRockId = Math.max(...rockIds);

    return {
      rocks: normalizedRocks,
      activeRockId,
      rockIdCounter: state.rockIdCounter && state.rockIdCounter >= maxRockId
        ? state.rockIdCounter
        : maxRockId,
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
