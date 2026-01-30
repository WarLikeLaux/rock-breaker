import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../storage', async () => {
  const actual = await vi.importActual<typeof import('../storage')>('../storage');
  const mockStore: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (key: string) => mockStore[key] || null,
    setItem: (key: string, value: string) => {
      mockStore[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStore[key];
    },
    clear: () => {
      for (const key in mockStore) delete mockStore[key];
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });

  return actual;
});

import { useGameStore } from '../index';

describe('useGameStore integration tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Сценарий: Наступил новый день', () => {
    it('должен сбрасывать все задачи на невыполненные при вызове startNewDay', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Задача 1');
      store.addTask('Задача 2');
      store.toggleTask(store.tasks.value[0]!.id);
      store.toggleTask(store.tasks.value[1]!.id);

      expect(store.tasks.value[0]?.completed).toBe(true);
      expect(store.tasks.value[1]?.completed).toBe(true);

      store.startNewDay();

      expect(store.tasks.value[0]?.completed).toBe(false);
      expect(store.tasks.value[1]?.completed).toBe(false);
    });

    it('должен удалять джокеры при startNewDay', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Обычная задача');
      store.addTask('Джокер задача', 'joker');

      expect(store.tasks.value).toHaveLength(2);
      expect(store.tasks.value.find((t) => t.type === 'joker')).toBeDefined();

      store.startNewDay();

      expect(store.tasks.value).toHaveLength(1);
      expect(store.tasks.value.find((t) => t.type === 'joker')).toBeUndefined();
    });

    it('должен восстанавливать замены в обычные задачи при startNewDay', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Оригинальная задача');
      store.setTaskType(store.tasks.value[0]!.id, 'substitute');

      expect(store.tasks.value[0]?.type).toBe('substitute');
      expect(store.tasks.value[0]?.originalText).toBe('Оригинальная задача');

      store.startNewDay();

      expect(store.tasks.value[0]?.type).toBe('standard');
      expect(store.tasks.value[0]?.text).toBe('Оригинальная задача');
      expect(store.tasks.value[0]?.originalText).toBeNull();
    });
  });

  describe('Сценарий: Использование джокера', () => {
    it('должен позволять добавлять джокер', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Джокер', 'joker');

      expect(store.tasks.value).toHaveLength(1);
      const task = store.tasks.value[0];
      expect(task?.type).toBe('joker');
      expect(task?.originalText).toBeNull();
    });

    it('джокер не должен влиять на HP при toggle', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Джокер', 'joker');

      const initialHp = store.currentHp.value;

      store.toggleTask(store.tasks.value[0]!.id);
      expect(store.currentHp.value).toBe(initialHp);

      store.toggleTask(store.tasks.value[0]!.id);
      expect(store.currentHp.value).toBe(initialHp);
    });

    it('должен позволять изменять обычную задачу в джокер', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Обычная задача');

      expect(store.tasks.value[0]?.type).toBe('standard');

      store.setTaskType(store.tasks.value[0]!.id, 'joker');

      expect(store.tasks.value[0]?.type).toBe('joker');
      expect(store.tasks.value[0]?.originalText).toBe('Обычная задача');
    });
  });

  describe('Сценарий: Расчет урона', () => {
    it('должен уменьшать HP при выполнении задачи', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Задача');

      const initialHp = store.currentHp.value;

      store.toggleTask(store.tasks.value[0]!.id);

      expect(store.currentHp.value).toBe(initialHp - 1);
    });

    it('должен увеличивать HP при снятии выполнения', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      store.addTask('Задача');

      store.toggleTask(store.tasks.value[0]!.id);
      const hpAfterHit = store.currentHp.value;

      store.toggleTask(store.tasks.value[0]!.id);

      expect(store.currentHp.value).toBe(hpAfterHit + 1);
    });

    it('HP не должен опускаться ниже 0', () => {
      const store = useGameStore();

      store.createRock('Цель', 1);
      expect(store.currentHp.value).toBe(5);

      for (let i = 0; i < 5; i++) {
        store.addTask(`Задача ${i}`);
      }

      for (let i = 0; i < 5; i++) {
        store.toggleTask(store.tasks.value[i]!.id);
      }

      expect(store.currentHp.value).toBe(0);
    });

    it('HP не должен превышать maxHp при heal', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);
      const maxHp = store.maxHp.value;

      store.addTask('Задача');
      store.toggleTask(store.tasks.value[0]!.id);
      store.toggleTask(store.tasks.value[0]!.id);

      expect(store.currentHp.value).toBe(maxHp);
    });
  });

  describe('Сценарий: Победа', () => {
    it('isVictory должен быть true когда HP = 0', () => {
      const store = useGameStore();

      store.createRock('Цель', 1);
      expect(store.isVictory.value).toBe(false);

      store.addTask('Задача 1');
      store.addTask('Задача 2');
      store.addTask('Задача 3');
      store.addTask('Задача 4');
      store.addTask('Задача 5');

      store.tasks.value.forEach((task) => store.toggleTask(task.id));

      expect(store.currentHp.value).toBe(0);
      expect(store.isVictory.value).toBe(true);
    });

    it('isVictory должен быть false когда HP > 0', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);

      expect(store.currentHp.value).toBeGreaterThan(0);
      expect(store.isVictory.value).toBe(false);
    });
  });

  describe('Сценарий: Автосохранение', () => {
    it('должен восстанавливать состояние из localStorage', async () => {
      vi.setSystemTime(new Date('2026-01-12'));

      const store1 = useGameStore();
      store1.createRock('Сохраненная цель', 15);
      store1.addTask('Сохраненная задача');

      await Promise.resolve();
      vi.runAllTimers();

      store1.isSetupComplete.value = false;
      store1.rocks.value = [];
      store1.activeRockId.value = 0;

      const store2 = useGameStore();
      store2.loadFromStorage();

      expect(store2.goalName.value).toBe('Сохраненная цель');
      expect(store2.durationDays.value).toBe(15);
      expect(store2.tasks.value).toHaveLength(1);
      expect(store2.tasks.value[0]?.text).toBe('Сохраненная задача');
    });
  });

  describe('Сценарий: Лимит задач', () => {
    it('canAddTask должен быть false когда достигнут лимит', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);

      expect(store.canAddTask.value).toBe(true);

      for (let i = 0; i < 5; i++) {
        store.addTask(`Задача ${i}`);
      }

      expect(store.canAddTask.value).toBe(false);
    });

    it('не должен добавлять задачи когда достигнут лимит', () => {
      const store = useGameStore();

      store.createRock('Цель', 30);

      for (let i = 0; i < 5; i++) {
        store.addTask(`Задача ${i}`);
      }

      const tasksCount = store.tasks.value.length;

      store.addTask('Лишняя задача');

      expect(store.tasks.value).toHaveLength(tasksCount);
    });
  });

  describe('Сценарий: Перезапуск скалы', () => {
    it('должен сбрасывать HP и очищать completed при рестарте', () => {
      const store = useGameStore();

      store.createRock('Цель', 20);
      store.addTask('Задача 1');
      store.addTask('Задача 2');
      store.toggleTask(store.tasks.value[0]!.id);

      expect(store.tasks.value[0]?.completed).toBe(true);
      expect(store.currentHp.value).toBeLessThan(store.maxHp.value);

      store.restartRock('Новая цель', 30);

      expect(store.goalName.value).toBe('Новая цель');
      expect(store.durationDays.value).toBe(30);
      expect(store.currentHp.value).toBe(150);
      expect(store.tasks.value[0]?.completed).toBe(false);
      expect(store.tasks.value[1]?.completed).toBe(false);
    });
  });

  describe('Сценарий: Хардмод и доступ к сайд-квестам', () => {
    it('canAccessSideQuests должен быть true когда хардмод выключен', () => {
      const store = useGameStore();

      store.createRock('Главная цель', 30);
      store.hardModeEnabled.value = false;

      expect(store.canAccessSideQuests.value).toBe(true);
    });

    it('canAccessSideQuests должен быть false когда хардмод включен и день не выигран', () => {
      const store = useGameStore();

      store.createRock('Главная цель', 30);
      store.addTask('Задача 1');
      store.hardModeEnabled.value = true;

      expect(store.isDayWon.value).toBe(false);
      expect(store.canAccessSideQuests.value).toBe(false);
    });

    it('canAccessSideQuests должен быть true когда хардмод включен и день выигран', () => {
      const store = useGameStore();

      store.createRock('Главная цель', 30);
      for (let i = 0; i < 5; i++) {
        store.addTask(`Задача ${i + 1}`);
      }
      store.hardModeEnabled.value = true;

      store.tasks.value.forEach((task) => store.toggleTask(task.id));

      expect(store.isDayWon.value).toBe(true);
      expect(store.canAccessSideQuests.value).toBe(true);
    });

    it('toggleHardMode должен переключать режим', () => {
      const store = useGameStore();

      store.createRock('Главная цель', 30);
      store.hardModeEnabled.value = false;
      expect(store.hardModeEnabled.value).toBe(false);

      store.toggleHardMode();
      expect(store.hardModeEnabled.value).toBe(true);

      store.toggleHardMode();
      expect(store.hardModeEnabled.value).toBe(false);
    });
  });
});
