import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import type { Task } from '@/shared/types';
import {
  addTask,
  removeTask,
  updateTask,
  setTaskType,
  toggleTask,
  resetTasksForNewDay,
} from '../taskOperations';

describe('taskOperations.ts', () => {
  describe('addTask', () => {
    it('должен добавлять задачу с типом standard по умолчанию', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(true);
      const counter = { value: 0 };

      addTask(tasks, canAddTask, counter, 'Новая задача');

      expect(tasks.value).toHaveLength(1);
      expect(tasks.value[0]).toEqual({
        id: 1,
        text: 'Новая задача',
        completed: false,
        type: 'standard',
        originalText: null,
      });
      expect(counter.value).toBe(1);
    });

    it('должен добавлять задачу с указанным типом', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(true);
      const counter = { value: 1 };

      addTask(tasks, canAddTask, counter, 'Джокер задача', 'joker');

      expect(tasks.value[0]?.type).toBe('joker');
    });

    it('не должен добавлять задачу если canAddTask === false', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(false);
      const counter = { value: 1 };

      addTask(tasks, canAddTask, counter, 'Не должна добавиться');

      expect(tasks.value).toHaveLength(0);
      expect(counter.value).toBe(1);
    });

    it('не должен добавлять задачу с пустым текстом', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(true);
      const counter = { value: 1 };

      addTask(tasks, canAddTask, counter, '');

      expect(tasks.value).toHaveLength(0);
      expect(counter.value).toBe(1);
    });
  });

  describe('removeTask', () => {
    it('должен удалять задачу по id', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача 1', completed: false, type: 'standard', originalText: null },
        { id: 2, text: 'Задача 2', completed: false, type: 'standard', originalText: null },
        { id: 3, text: 'Задача 3', completed: false, type: 'standard', originalText: null },
      ]);

      removeTask(tasks, 2);

      expect(tasks.value).toHaveLength(2);
      expect(tasks.value.find((t) => t.id === 2)).toBeUndefined();
    });

    it('не должен изменять массив если id не найден', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача 1', completed: false, type: 'standard', originalText: null },
      ]);

      removeTask(tasks, 999);

      expect(tasks.value).toHaveLength(1);
    });
  });

  describe('updateTask', () => {
    it('должен обновлять текст задачи', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Старый текст', completed: false, type: 'standard', originalText: null },
      ]);

      updateTask(tasks, 1, 'Новый текст');

      expect(tasks.value[0]?.text).toBe('Новый текст');
    });

    it('не должен обновлять если текст пустой', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Старый текст', completed: false, type: 'standard', originalText: null },
      ]);

      updateTask(tasks, 1, '');

      expect(tasks.value[0]?.text).toBe('Старый текст');
    });

    it('не должен обновлять если задача не найдена', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Текст', completed: false, type: 'standard', originalText: null },
      ]);

      updateTask(tasks, 999, 'Новый текст');

      expect(tasks.value[0]?.text).toBe('Текст');
    });
  });

  describe('setTaskType', () => {
    it('должен изменять тип с standard на joker', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null },
      ]);

      setTaskType(tasks, 1, 'joker');

      const task = tasks.value[0];
      expect(task?.type).toBe('joker');
      expect(task?.originalText).toBe('Задача');
    });

    it('должен изменять тип с standard на substitute', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null },
      ]);

      setTaskType(tasks, 1, 'substitute');

      const task = tasks.value[0];
      expect(task?.type).toBe('substitute');
      expect(task?.originalText).toBe('Задача');
    });

    it('должен восстанавливать originalText при смене обратно на standard', () => {
      const tasks = ref<Task[]>([
        {
          id: 1,
          text: 'Текущий текст',
          completed: false,
          type: 'joker',
          originalText: 'Оригинальный текст',
        },
      ]);

      setTaskType(tasks, 1, 'standard');

      const task = tasks.value[0];
      expect(task?.type).toBe('standard');
      expect(task?.text).toBe('Оригинальный текст');
      expect(task?.originalText).toBeNull();
    });

    it('не должен изменять тип если задача не найдена', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null },
      ]);

      setTaskType(tasks, 999, 'joker');

      expect(tasks.value[0]?.type).toBe('standard');
    });
  });

  describe('toggleTask', () => {
    it('должен выполнять задачу и вызывать onHit при unchecking', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(true);
      expect(onHit).toHaveBeenCalledOnce();
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('должен снимать выполнение и вызывать onHeal при checking', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHeal).toHaveBeenCalledOnce();
      expect(onHit).not.toHaveBeenCalled();
    });

    it('не должен вызывать колбэки для джокера', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Джокер', completed: false, type: 'joker', originalText: 'Оригинал' },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(true);
      expect(onHit).not.toHaveBeenCalled();
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('не должен изменять состояние если задача не найдена', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 999, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHit).not.toHaveBeenCalled();
      expect(onHeal).not.toHaveBeenCalled();
    });
  });

  describe('resetTasksForNewDay', () => {
    let tasks: ReturnType<typeof ref<Task[]>>;

    beforeEach(() => {
      tasks = ref<Task[]>([
        {
          id: 1,
          text: 'Обычная выполненная',
          completed: true,
          type: 'standard',
          originalText: null,
        },
        {
          id: 2,
          text: 'Обычная невыполненная',
          completed: false,
          type: 'standard',
          originalText: null,
        },
        {
          id: 3,
          text: 'Текущий текст',
          completed: true,
          type: 'joker',
          originalText: 'Джокер оригинал',
        },
        {
          id: 4,
          text: 'Текущий текст',
          completed: false,
          type: 'substitute',
          originalText: 'Замена оригинал',
        },
      ]);
    });

    it('должен сбрасывать completed для всех задач', () => {
      resetTasksForNewDay(tasks);

      tasks.value.forEach((task) => {
        expect(task.completed).toBe(false);
      });
    });

    it('должен удалять джокеры', () => {
      resetTasksForNewDay(tasks);

      const jokers = tasks.value.filter((t) => t.type === 'joker');
      expect(jokers).toHaveLength(0);
    });

    it('должен восстанавливать замены в standard с originalText', () => {
      resetTasksForNewDay(tasks);

      const substitute = tasks.value.find((t) => t.id === 4);
      expect(substitute?.type).toBe('standard');
      expect(substitute?.text).toBe('Замена оригинал');
      expect(substitute?.originalText).toBeNull();
    });

    it('не должен удалять обычные задачи', () => {
      const standardCount = tasks.value.filter((t) => t.type === 'standard').length;

      resetTasksForNewDay(tasks);

      const newStandardCount = tasks.value.filter((t) => t.type === 'standard').length;
      expect(newStandardCount).toBeGreaterThanOrEqual(standardCount);
    });

    it('должен корректно обрабатывать пустой массив', () => {
      const emptyTasks = ref<Task[]>([]);

      resetTasksForNewDay(emptyTasks);

      expect(emptyTasks.value).toHaveLength(0);
    });
  });
});
