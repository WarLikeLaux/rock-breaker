import { describe, it, expect, beforeEach } from 'vitest';
import { saveToStorage, loadFromStorage, importData, clearStorage } from '../storage';
import type { Task } from '@/shared/types';

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

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

describe('storage.ts', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('saveToStorage', () => {
    it('должен сохранять состояние в localStorage', () => {
      const state = {
        goalName: 'Test Goal',
        durationDays: 30,
        tasks: [] as Task[],
        isSetupComplete: true,
        currentHp: 150,
        lastActiveDate: '2024-01-01',
        taskIdCounter: 0,
      };

      saveToStorage(state);

      const saved = localStorage.getItem('rock-breaker-state');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!);
      expect(parsed.version).toBe(2);
      expect(parsed.goalName).toBe('Test Goal');
      expect(parsed.durationDays).toBe(30);
      expect(parsed.currentHp).toBe(150);
    });
  });

  describe('loadFromStorage', () => {
    it('должен загружать состояние из localStorage', () => {
      const state = {
        version: 2,
        goalName: 'Loaded Goal',
        durationDays: 20,
        tasks: [],
        isSetupComplete: true,
        currentHp: 100,
        lastActiveDate: '2024-01-01',
        taskIdCounter: 0,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(state));

      const loaded = loadFromStorage();
      expect(loaded).toBeDefined();
      expect(loaded?.goalName).toBe('Loaded Goal');
      expect(loaded?.durationDays).toBe(20);
      expect(loaded?.currentHp).toBe(100);
    });

    it('должен возвращать null если нет сохраненного состояния', () => {
      const loaded = loadFromStorage();
      expect(loaded).toBeNull();
    });

    it('должен удалять старую версию и возвращать null', () => {
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

    it('должен нормализовать tasks (добавлять type и originalText)', () => {
      const state = {
        version: 2,
        goalName: 'Test',
        durationDays: 30,
        tasks: [{ id: 1, text: 'Task 1', completed: false }],
        isSetupComplete: true,
        currentHp: 150,
        lastActiveDate: '2024-01-01',
        taskIdCounter: 1,
      };

      localStorage.setItem('rock-breaker-state', JSON.stringify(state));

      const loaded = loadFromStorage();
      expect(loaded?.tasks[0]).toHaveProperty('type', 'standard');
      expect(loaded?.tasks[0]).toHaveProperty('originalText', null);
    });
  });

  describe('importData', () => {
    it('должен импортировать валидные JSON данные', () => {
      const data = JSON.stringify({
        goalName: 'Imported',
        durationDays: 25,
        tasks: [],
        currentHp: 125,
        lastActiveDate: '2024-01-01',
        taskIdCounter: 0,
      });

      const result = importData(data);
      expect(result).toBeDefined();
      expect(result?.goalName).toBe('Imported');
      expect(result?.durationDays).toBe(25);
    });

    it('должен возвращать null для невалидного JSON', () => {
      const result = importData('invalid json');
      expect(result).toBeNull();
    });

    it('должен нормализовать tasks при импорте', () => {
      const data = JSON.stringify({
        tasks: [{ id: 1, text: 'Test', completed: false }],
      });

      const result = importData(data);
      expect(result?.tasks?.[0]).toHaveProperty('type', 'standard');
      expect(result?.tasks?.[0]).toHaveProperty('originalText', null);
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
