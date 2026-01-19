import { describe, it, expect } from 'vitest';
import { ref, computed } from 'vue';
import type { Task } from '@/shared/types';
import { createRock, updateRock, hitRock, healRock, restartRock } from '../rockOperations';

describe('rockOperations.ts', () => {
  describe('createRock', () => {
    it('должен создавать скалу с корректными параметрами', () => {
      const goalName = ref('');
      const durationDays = ref(0);
      const currentHp = ref(0);
      const tasks = ref<Task[]>([]);
      const taskIdCounter = { value: 0 };
      const lastActiveDate = ref('');
      const isSetupComplete = ref(false);
      const getTodayDate = () => '2026-01-12';

      createRock(
        goalName,
        durationDays,
        currentHp,
        tasks,
        taskIdCounter,
        lastActiveDate,
        isSetupComplete,
        getTodayDate,
        'Бросить курить',
        30,
      );

      expect(goalName.value).toBe('Бросить курить');
      expect(durationDays.value).toBe(30);
      expect(currentHp.value).toBe(150);
      expect(tasks.value).toEqual([]);
      expect(taskIdCounter.value).toBe(0);
      expect(lastActiveDate.value).toBe('2026-01-12');
      expect(isSetupComplete.value).toBe(true);
    });

    it('должен устанавливать HP как durationDays * 5', () => {
      const goalName = ref('');
      const durationDays = ref(0);
      const currentHp = ref(0);
      const tasks = ref<Task[]>([]);
      const taskIdCounter = { value: 0 };
      const lastActiveDate = ref('');
      const isSetupComplete = ref(false);
      const getTodayDate = () => '2026-01-12';

      createRock(
        goalName,
        durationDays,
        currentHp,
        tasks,
        taskIdCounter,
        lastActiveDate,
        isSetupComplete,
        getTodayDate,
        'Цель',
        50,
      );

      expect(currentHp.value).toBe(250);
    });

    it('должен очищать tasks и сбрасывать taskIdCounter', () => {
      const goalName = ref('');
      const durationDays = ref(0);
      const currentHp = ref(0);
      const tasks = ref<Task[]>([
        { id: 1, text: 'Старая задача', completed: false, type: 'standard', originalText: null },
      ]);
      const taskIdCounter = { value: 5 };
      const lastActiveDate = ref('');
      const isSetupComplete = ref(false);
      const getTodayDate = () => '2026-01-12';

      createRock(
        goalName,
        durationDays,
        currentHp,
        tasks,
        taskIdCounter,
        lastActiveDate,
        isSetupComplete,
        getTodayDate,
        'Цель',
        10,
      );

      expect(tasks.value).toEqual([]);
      expect(taskIdCounter.value).toBe(0);
    });
  });

  describe('updateRock', () => {
    it('должен обновлять параметры скалы сохраняя урон', () => {
      const goalName = ref('Старая цель');
      const durationDays = ref(20);
      const currentHp = ref(80);
      const maxHp = computed(() => durationDays.value * 5);

      updateRock(goalName, durationDays, currentHp, maxHp, 'Новая цель', 40);

      expect(goalName.value).toBe('Новая цель');
      expect(durationDays.value).toBe(40);
      expect(currentHp.value).toBe(180);
    });

    it('не должен устанавливать HP ниже 0', () => {
      const goalName = ref('Цель');
      const durationDays = ref(100);
      const currentHp = ref(10);
      const maxHp = computed(() => durationDays.value * 5);

      updateRock(goalName, durationDays, currentHp, maxHp, 'Новая цель', 5);

      expect(currentHp.value).toBe(0);
    });
  });

  describe('hitRock', () => {
    it('должен уменьшать HP на 1', () => {
      const currentHp = ref(100);

      hitRock(currentHp);

      expect(currentHp.value).toBe(99);
    });

    it('не должен уменьшать HP ниже 0', () => {
      const currentHp = ref(1);

      hitRock(currentHp);

      expect(currentHp.value).toBe(0);
    });

    it('должен корректно работать при HP = 0', () => {
      const currentHp = ref(0);

      hitRock(currentHp);

      expect(currentHp.value).toBe(0);
    });
  });

  describe('healRock', () => {
    it('должен увеличивать HP на 1', () => {
      const currentHp = ref(50);
      const maxHp = computed(() => 100);

      healRock(currentHp, maxHp);

      expect(currentHp.value).toBe(51);
    });

    it('не должен превышать maxHp', () => {
      const currentHp = ref(100);
      const maxHp = computed(() => 100);

      healRock(currentHp, maxHp);

      expect(currentHp.value).toBe(100);
    });

    it('должен корректно работать при HP = maxHp', () => {
      const currentHp = ref(100);
      const maxHp = computed(() => 100);

      healRock(currentHp, maxHp);

      expect(currentHp.value).toBe(100);
    });

    it('должен корректно работать при HP = 0', () => {
      const currentHp = ref(0);
      const maxHp = computed(() => 100);

      healRock(currentHp, maxHp);

      expect(currentHp.value).toBe(1);
    });
  });

  describe('restartRock', () => {
    it('должен перезапускать скалу с обновлением всех параметров', () => {
      const goalName = ref('Старая цель');
      const durationDays = ref(20);
      const currentHp = ref(50);
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача 1', completed: true, type: 'standard', originalText: null },
        { id: 2, text: 'Задача 2', completed: false, type: 'standard', originalText: null },
      ]);
      const lastActiveDate = ref('2025-01-01');
      const getTodayDate = () => '2026-01-12';

      restartRock(
        goalName,
        durationDays,
        currentHp,
        tasks,
        lastActiveDate,
        getTodayDate,
        'Перезапущенная цель',
        40,
      );

      expect(goalName.value).toBe('Перезапущенная цель');
      expect(durationDays.value).toBe(40);
      expect(currentHp.value).toBe(200);
      expect(lastActiveDate.value).toBe('2026-01-12');
      expect(tasks.value[0]?.completed).toBe(false);
      expect(tasks.value[1]?.completed).toBe(false);
    });

    it('должен устанавливать новую дату начала', () => {
      const goalName = ref('Цель');
      const durationDays = ref(10);
      const currentHp = ref(50);
      const tasks = ref<Task[]>([]);
      const lastActiveDate = ref('2020-01-01');
      const getTodayDate = () => '2026-01-12';

      const oldDate = lastActiveDate.value;

      restartRock(
        goalName,
        durationDays,
        currentHp,
        tasks,
        lastActiveDate,
        getTodayDate,
        'Цель',
        10,
      );

      expect(lastActiveDate.value).not.toBe(oldDate);
      expect(lastActiveDate.value).toBe('2026-01-12');
    });
  });
});
