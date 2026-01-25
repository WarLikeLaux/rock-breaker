import type { StoredState, StoredStateV2, StoredStateV3, Rock, Task, Settings } from '@/shared/types';
import { getTodayDate } from '@/shared/utils/date';

const STORAGE_KEY = 'rock-breaker-state';
const SETTINGS_KEY = 'rock-breaker-settings';
const SCHEMA_VERSION = 4;

function migrateFromV2ToV3(oldState: StoredStateV2): StoredStateV3 {
  const mainRock = {
    id: 1,
    goalName: oldState.goalName || '',
    durationDays: oldState.durationDays || 0,
    tasks: (oldState.tasks || []).map((t) => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      type: t.type || 'standard',
      originalText: t.originalText || null,
    })),
    currentHp: oldState.currentHp || 0,
    lastActiveDate: oldState.lastActiveDate || '',
    taskIdCounter: oldState.taskIdCounter || 0,
    isMain: true,
    createdAt: oldState.lastActiveDate || getTodayDate(),
  };

  return {
    version: 3,
    rocks: [mainRock],
    activeRockId: 1,
    isSetupComplete: oldState.isSetupComplete || false,
    rockIdCounter: 1,
  };
}

function migrateFromV3ToV4(oldState: StoredStateV3): StoredState {
  return {
    version: SCHEMA_VERSION,
    rocks: oldState.rocks.map((rock) => ({
      ...rock,
      createdAt: rock.lastActiveDate || getTodayDate(),
      tasks: rock.tasks.map((task) => ({
        ...task,
        type: task.type || 'standard',
        originalText: task.originalText || null,
        requiredExecutions: 1,
        currentExecutions: task.completed ? 1 : 0,
      })),
    })),
    activeRockId: oldState.activeRockId,
    isSetupComplete: oldState.isSetupComplete,
    rockIdCounter: oldState.rockIdCounter,
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
    const state = JSON.parse(saved) as StoredState | StoredStateV2 | StoredStateV3;

    if (state.version === 2) {
      const v3State = migrateFromV2ToV3(state as StoredStateV2);
      const migrated = migrateFromV3ToV4(v3State);
      saveToStorage(migrated);
      return migrated;
    }

    if (state.version === 3) {
      const migrated = migrateFromV3ToV4(state as StoredStateV3);
      saveToStorage(migrated);
      return migrated;
    }

    if (state.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const v4State = state as StoredState;
    return {
      ...v4State,
      rocks: v4State.rocks.map((rock: Rock) => ({
        ...rock,
        createdAt: rock.createdAt || rock.lastActiveDate || getTodayDate(),
        tasks: (rock.tasks || []).map((t: Task) => ({
          ...t,
          type: t.type || 'standard',
          originalText: t.originalText || null,
          requiredExecutions: t.requiredExecutions ?? 1,
          currentExecutions: t.currentExecutions ?? (t.completed ? 1 : 0),
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
  hardModeEnabled: boolean;
  focusModeEnabled: boolean;
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
  hardModeEnabled?: boolean;
  focusModeEnabled?: boolean;
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
      createdAt: rock.createdAt || rock.lastActiveDate || getTodayDate(),
      tasks: (rock.tasks || []).map((t: Task) => ({
        ...t,
        type: t.type || 'standard',
        originalText: t.originalText || null,
        requiredExecutions: t.requiredExecutions ?? 1,
        currentExecutions: t.currentExecutions ?? (t.completed ? 1 : 0),
      })),
    }));

    const rockIds = normalizedRocks.map((rock) => rock.id);
    const fallbackActiveRockId = normalizedRocks[0]?.id ?? 0;
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
      hardModeEnabled: state.hardModeEnabled,
      focusModeEnabled: state.focusModeEnabled,
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
