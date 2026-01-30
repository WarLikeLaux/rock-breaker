import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveToStorage, loadFromStorage, importData, clearStorage, exportData, exportKey, importKey } from '../storage';
import type { Task, Rock } from '@/shared/types';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

function createRock(overrides: Partial<Rock> = {}): Rock {
  return {
    id: 1,
    goalName: 'Test Goal',
    durationDays: 30,
    tasks: [],
    currentHp: 150,
    lastActiveDate: '2024-01-01',
    taskIdCounter: 0,
    isMain: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('storage.ts', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('saveToStorage', () => {
    it('должен сохранять состояние в localStorage', () => {
      const state = {
        rocks: [createRock()],
        activeRockId: 1,
        isSetupComplete: true,
        rockIdCounter: 1,
      };

      saveToStorage(state);

      const saved = localStorage.getItem('rock-breaker-state');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!);
      expect(parsed.version).toBe(4);
      expect(parsed.rocks).toHaveLength(1);
      expect(parsed.rocks[0].goalName).toBe('Test Goal');
      expect(parsed.activeRockId).toBe(1);
    });
  });

  describe('loadFromStorage', () => {
    it('должен загружать состояние v4 из localStorage', () => {
      const state = {
        version: 4,
        rocks: [createRock({ goalName: 'Loaded Goal', durationDays: 20, currentHp: 100 })],
        activeRockId: 1,
        isSetupComplete: true,
        rockIdCounter: 1,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(state));

      const loaded = loadFromStorage();
      expect(loaded).toBeDefined();
      expect(loaded!.rocks[0]!.goalName).toBe('Loaded Goal');
      expect(loaded!.rocks[0]!.durationDays).toBe(20);
      expect(loaded!.rocks[0]!.currentHp).toBe(100);
    });

    it('должен мигрировать v3 в v4 добавляя поля выполнений', () => {
      const v3State = {
        version: 3,
        rocks: [{
          id: 1,
          goalName: 'Test',
          durationDays: 30,
          tasks: [
            { id: 1, text: 'Completed', completed: true, type: 'standard', originalText: null },
            { id: 2, text: 'Not completed', completed: false, type: 'standard', originalText: null },
          ],
          currentHp: 150,
          lastActiveDate: '2024-01-01',
          taskIdCounter: 2,
          isMain: true,
        }],
        activeRockId: 1,
        isSetupComplete: true,
        rockIdCounter: 1,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(v3State));

      const loaded = loadFromStorage();
      expect(loaded?.version).toBe(4);

      const task1 = loaded!.rocks[0]!.tasks[0];
      expect(task1?.requiredExecutions).toBe(1);
      expect(task1?.currentExecutions).toBe(1);

      const task2 = loaded!.rocks[0]!.tasks[1];
      expect(task2?.requiredExecutions).toBe(1);
      expect(task2?.currentExecutions).toBe(0);
    });

    it('должен мигрировать v2 в v4', () => {
      const v2State = {
        version: 2,
        goalName: 'Old Goal',
        durationDays: 20,
        tasks: [{ id: 1, text: 'Task 1', completed: false, type: 'standard', originalText: null }],
        isSetupComplete: true,
        currentHp: 100,
        lastActiveDate: '2024-01-01',
        taskIdCounter: 1,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(v2State));

      const loaded = loadFromStorage();
      expect(loaded).toBeDefined();
      expect(loaded?.version).toBe(4);
      expect(loaded?.rocks).toHaveLength(1);
      expect(loaded!.rocks[0]!.goalName).toBe('Old Goal');
      expect(loaded!.rocks[0]!.isMain).toBe(true);
      expect(loaded!.rocks[0]!.tasks).toHaveLength(1);
      expect(loaded!.rocks[0]!.tasks[0]?.requiredExecutions).toBe(1);
    });

    it('должен возвращать null если нет сохраненного состояния', () => {
      const loaded = loadFromStorage();
      expect(loaded).toBeNull();
    });

    it('должен удалять старую версию (v1) и возвращать null', () => {
      const oldState = {
        version: 1,
        goalName: 'Old',
        durationDays: 10,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(oldState));

      const loaded = loadFromStorage();
      expect(loaded).toBeNull();
      expect(localStorage.getItem('rock-breaker-state')).toBeNull();
    });

    it('должен нормализовать tasks (добавлять type, originalText и поля выполнений)', () => {
      const state = {
        version: 4,
        rocks: [
          createRock({
            tasks: [{ id: 1, text: 'Task 1', completed: false }] as Task[],
          }),
        ],
        activeRockId: 1,
        isSetupComplete: true,
        rockIdCounter: 1,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(state));

      const loaded = loadFromStorage();
      expect(loaded!.rocks[0]!.tasks[0]).toHaveProperty('type', 'standard');
      expect(loaded!.rocks[0]!.tasks[0]).toHaveProperty('originalText', null);
      expect(loaded!.rocks[0]!.tasks[0]).toHaveProperty('requiredExecutions', 1);
      expect(loaded!.rocks[0]!.tasks[0]).toHaveProperty('currentExecutions', 0);
    });
  });

  describe('importData', () => {
    it('должен импортировать валидные JSON данные', () => {
      const data = JSON.stringify({
        rocks: [createRock({ goalName: 'Imported', durationDays: 25, currentHp: 125 })],
        activeRockId: 1,
        rockIdCounter: 1,
      });

      const result = importData(data);
      expect(result).toBeDefined();
      expect(result!.rocks[0]!.goalName).toBe('Imported');
      expect(result!.rocks[0]!.durationDays).toBe(25);
    });

    it('должен возвращать null для невалидного JSON', () => {
      const result = importData('invalid json');
      expect(result).toBeNull();
    });

    it('должен возвращать null если нет массива rocks', () => {
      const data = JSON.stringify({
        goalName: 'Test',
        durationDays: 30,
      });

      const result = importData(data);
      expect(result).toBeNull();
    });

    it('должен нормализовать tasks при импорте (добавлять все поля)', () => {
      const data = JSON.stringify({
        rocks: [
          createRock({
            tasks: [{ id: 1, text: 'Test', completed: true }] as Task[],
          }),
        ],
        activeRockId: 1,
        rockIdCounter: 1,
      });

      const result = importData(data);
      expect(result!.rocks[0]!.tasks[0]).toHaveProperty('type', 'standard');
      expect(result!.rocks[0]!.tasks[0]).toHaveProperty('originalText', null);
      expect(result!.rocks[0]!.tasks[0]).toHaveProperty('requiredExecutions', 1);
      expect(result!.rocks[0]!.tasks[0]).toHaveProperty('currentExecutions', 1);
    });

    it('должен возвращать null если rocks пустой массив', () => {
      const data = JSON.stringify({
        rocks: [],
        activeRockId: 1,
        rockIdCounter: 1,
      });

      const result = importData(data);
      expect(result).toBeNull();
    });

    it('должен выбирать валидный activeRockId и корректный rockIdCounter', () => {
      const data = JSON.stringify({
        rocks: [
          createRock({ id: 5, goalName: 'A' }),
          createRock({ id: 9, goalName: 'B', isMain: false }),
        ],
        activeRockId: 999,
        rockIdCounter: 1,
      });

      const result = importData(data);
      expect(result!.activeRockId).toBe(5);
      expect(result!.rockIdCounter).toBe(10);
    });
  });

  describe('exportData', () => {
    it('должен создавать файл экспорта с корректным именем', () => {
      const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      const click = vi.fn();
      const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement;
      const createElement = vi.spyOn(document, 'createElement').mockReturnValue(anchor);

      exportData({
        rocks: [createRock()],
        activeRockId: 1,
        isSetupComplete: true,
        rockIdCounter: 1,
        showTooltips: true,
        hardModeEnabled: false,
        focusModeEnabled: false,
      });

      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(click).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
      expect(createElement).toHaveBeenCalledWith('a');
      expect(anchor.download.startsWith('rock-breaker-')).toBe(true);

      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
      createElement.mockRestore();
    });
  });

  describe('exportKey / importKey', () => {
    it('должен экспортировать и импортировать ключ с данными', () => {
      const key = exportKey({
        rocks: [createRock({ id: 2, goalName: 'Key Test' })],
        activeRockId: 2,
        isSetupComplete: true,
        rockIdCounter: 3,
        showTooltips: false,
        hardModeEnabled: true,
        focusModeEnabled: true,
        dayStartHour: 6,
      });

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');

      if (!key) {
        throw new Error('Ключ экспорта не создан');
      }

      const imported = importKey(key);
      expect(imported).not.toBeNull();

      if (!imported) {
        throw new Error('Ключ импорта не распознан');
      }

      expect(imported.activeRockId).toBe(2);
      expect(imported.rocks[0]?.goalName).toBe('Key Test');
      expect(imported.showTooltips).toBe(false);
      expect(imported.hardModeEnabled).toBe(true);
      expect(imported.focusModeEnabled).toBe(true);
      expect(imported.dayStartHour).toBe(6);
    });

    it('должен возвращать null для пустого ключа', () => {
      const imported = importKey('   ');
      expect(imported).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('должен удалять сохраненное состояние', () => {
      localStorage.setItem('rock-breaker-state', 'test');

      clearStorage();

      expect(localStorage.getItem('rock-breaker-state')).toBeNull();
    });
  });
});
