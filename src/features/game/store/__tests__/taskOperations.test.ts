import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, type Ref } from 'vue';
import type { Task } from '@/shared/types';
import {
  addTask,
  removeTask,
  updateTask,
  setTaskType,
  substituteTask,
  toggleTask,
  setRequiredExecutions,
  decrementExecution,
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
        requiredExecutions: 1,
        currentExecutions: 0,
      });
      expect(counter.value).toBe(1);
    });

    it('должен добавлять задачу с указанным количеством выполнений', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(true);
      const counter = { value: 0 };

      addTask(tasks, canAddTask, counter, 'Задача 3x', 'standard', 3);

      expect(tasks.value[0]?.requiredExecutions).toBe(3);
      expect(tasks.value[0]?.currentExecutions).toBe(0);
    });

    it('должен ограничивать requiredExecutions диапазоном 1-3', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(true);

      addTask(tasks, canAddTask, { value: 0 }, 'Задача 5x', 'standard', 5);
      expect(tasks.value[0]?.requiredExecutions).toBe(3);

      addTask(tasks, canAddTask, { value: 1 }, 'Задача 0x', 'standard', 0);
      expect(tasks.value[1]?.requiredExecutions).toBe(1);
    });

    it('joker должен всегда иметь requiredExecutions = 1', () => {
      const tasks = ref<Task[]>([]);
      const canAddTask = ref(true);

      addTask(tasks, canAddTask, { value: 0 }, 'Джокер', 'joker', 3);
      expect(tasks.value[0]?.requiredExecutions).toBe(1);
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
        { id: 1, text: 'Задача 1', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
        { id: 2, text: 'Задача 2', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
        { id: 3, text: 'Задача 3', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      removeTask(tasks, 2);

      expect(tasks.value).toHaveLength(2);
      expect(tasks.value.find((t) => t.id === 2)).toBeUndefined();
    });

    it('не должен изменять массив если id не найден', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача 1', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      removeTask(tasks, 999);

      expect(tasks.value).toHaveLength(1);
    });

    it('должен вызвать onHeal когда удаляется выполненная стандартная задача', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача 1', completed: true, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 1 },
      ]);
      const onHeal = vi.fn();

      removeTask(tasks, 1, onHeal);

      expect(onHeal).toHaveBeenCalled();
      expect(tasks.value).toHaveLength(0);
    });

    it('не должен вызвать onHeal когда удаляется незавершённая задача', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача 1', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);
      const onHeal = vi.fn();

      removeTask(tasks, 1, onHeal);

      expect(onHeal).not.toHaveBeenCalled();
      expect(tasks.value).toHaveLength(0);
    });

    it('не должен вызвать onHeal когда удаляется joker задача', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Joker', completed: true, type: 'joker', originalText: null, requiredExecutions: 1, currentExecutions: 1 },
      ]);
      const onHeal = vi.fn();

      removeTask(tasks, 1, onHeal);

      expect(onHeal).not.toHaveBeenCalled();
      expect(tasks.value).toHaveLength(0);
    });
  });

  describe('updateTask', () => {
    it('должен обновлять текст задачи', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Старый текст', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      updateTask(tasks, 1, 'Новый текст');

      expect(tasks.value[0]?.text).toBe('Новый текст');
    });

    it('не должен обновлять если текст пустой', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Старый текст', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      updateTask(tasks, 1, '');

      expect(tasks.value[0]?.text).toBe('Старый текст');
    });

    it('не должен обновлять если задача не найдена', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Текст', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      updateTask(tasks, 999, 'Новый текст');

      expect(tasks.value[0]?.text).toBe('Текст');
    });

    it('должен обновлять текст джокера даже если он пустой', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Джокер', completed: false, type: 'joker', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      updateTask(tasks, 1, '   ');

      expect(tasks.value[0]?.text).toBe('');
    });
  });

  describe('setTaskType', () => {
    it('должен изменять тип с standard на joker', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      setTaskType(tasks, 1, 'joker');

      const task = tasks.value[0];
      expect(task?.type).toBe('joker');
      expect(task?.originalText).toBeNull();
    });

    it('должен изменять тип с standard на substitute', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
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
          requiredExecutions: 1,
          currentExecutions: 0,
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
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      setTaskType(tasks, 999, 'joker');

      expect(tasks.value[0]?.type).toBe('standard');
    });

    it('должен полностью сбрасывать прогресс при смене на joker', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: 'Оригинал', requiredExecutions: 3, currentExecutions: 2 },
      ]);

      setTaskType(tasks, 1, 'joker');

      expect(tasks.value[0]?.requiredExecutions).toBe(1);
      expect(tasks.value[0]?.currentExecutions).toBe(0);
      expect(tasks.value[0]?.completed).toBe(false);
      expect(tasks.value[0]?.originalText).toBeNull();
    });
  });

  describe('substituteTask', () => {
    it('должен создавать подмену для standard задачи', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Обычная', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      substituteTask(tasks, 1, 'Временная');

      const task = tasks.value[0];
      expect(task?.type).toBe('substitute');
      expect(task?.text).toBe('Временная');
      expect(task?.originalText).toBe('Обычная');
    });

    it('не должен изменять не standard задачу', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Джокер', completed: false, type: 'joker', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      substituteTask(tasks, 1, 'Временная');

      const task = tasks.value[0];
      expect(task?.type).toBe('joker');
      expect(task?.text).toBe('Джокер');
      expect(task?.originalText).toBeNull();
    });
  });

  describe('toggleTask', () => {
    it('должен выполнять задачу и вызывать onHit', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(true);
      expect(tasks.value[0]?.currentExecutions).toBe(1);
      expect(onHit).toHaveBeenCalledOnce();
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('должен снимать выполнение и вызывать onHeal', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 1 },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(false);
      expect(tasks.value[0]?.currentExecutions).toBe(0);
      expect(onHeal).toHaveBeenCalledOnce();
      expect(onHit).not.toHaveBeenCalled();
    });

    it('не должен вызывать колбэки для джокера', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Джокер', completed: false, type: 'joker', originalText: 'Оригинал', requiredExecutions: 1, currentExecutions: 0 },
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
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 999, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHit).not.toHaveBeenCalled();
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('не должен переключать джокера без текста', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: '', completed: false, type: 'joker', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);

      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHit).not.toHaveBeenCalled();
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('должен увеличивать currentExecutions при каждом клике и вызывать onHit только при полном выполнении', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 3, currentExecutions: 0 },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);
      expect(tasks.value[0]?.currentExecutions).toBe(1);
      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHit).not.toHaveBeenCalled();

      toggleTask(tasks, 1, onHit, onHeal);
      expect(tasks.value[0]?.currentExecutions).toBe(2);
      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHit).not.toHaveBeenCalled();

      toggleTask(tasks, 1, onHit, onHeal);
      expect(tasks.value[0]?.currentExecutions).toBe(3);
      expect(tasks.value[0]?.completed).toBe(true);
      expect(onHit).toHaveBeenCalledOnce();
    });

    it('должен уменьшать currentExecutions при отмене и вызывать onHeal при переходе из выполненной', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null, requiredExecutions: 2, currentExecutions: 2 },
      ]);
      const onHit = vi.fn();
      const onHeal = vi.fn();

      toggleTask(tasks, 1, onHit, onHeal);
      expect(tasks.value[0]?.currentExecutions).toBe(1);
      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHeal).toHaveBeenCalledOnce();
    });
  });

  describe('setRequiredExecutions', () => {
    it('должен изменять количество требуемых выполнений', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      setRequiredExecutions(tasks, 1, 3);

      expect(tasks.value[0]?.requiredExecutions).toBe(3);
    });

    it('должен ограничивать значение диапазоном 1-3', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      setRequiredExecutions(tasks, 1, 5);
      expect(tasks.value[0]?.requiredExecutions).toBe(3);

      setRequiredExecutions(tasks, 1, 0);
      expect(tasks.value[0]?.requiredExecutions).toBe(1);
    });

    it('не должен изменять joker задачи', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Джокер', completed: false, type: 'joker', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);

      setRequiredExecutions(tasks, 1, 3);

      expect(tasks.value[0]?.requiredExecutions).toBe(1);
    });

    it('должен корректировать currentExecutions если превышает новое значение', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null, requiredExecutions: 3, currentExecutions: 3 },
      ]);

      setRequiredExecutions(tasks, 1, 2);

      expect(tasks.value[0]?.currentExecutions).toBe(2);
      expect(tasks.value[0]?.completed).toBe(true);
    });
  });

  describe('decrementExecution', () => {
    it('должен уменьшать currentExecutions без вызова onHeal если задача не была выполнена', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 3, currentExecutions: 2 },
      ]);
      const onHeal = vi.fn();

      decrementExecution(tasks, 1, onHeal);

      expect(tasks.value[0]?.currentExecutions).toBe(1);
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('должен вызывать onHeal только когда задача переходит из выполненной в невыполненную', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null, requiredExecutions: 3, currentExecutions: 3 },
      ]);
      const onHeal = vi.fn();

      decrementExecution(tasks, 1, onHeal);

      expect(tasks.value[0]?.currentExecutions).toBe(2);
      expect(tasks.value[0]?.completed).toBe(false);
      expect(onHeal).toHaveBeenCalledOnce();
    });

    it('не должен уменьшать ниже 0', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: false, type: 'standard', originalText: null, requiredExecutions: 1, currentExecutions: 0 },
      ]);
      const onHeal = vi.fn();

      decrementExecution(tasks, 1, onHeal);

      expect(tasks.value[0]?.currentExecutions).toBe(0);
      expect(onHeal).not.toHaveBeenCalled();
    });

    it('должен обновлять completed статус', () => {
      const tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null, requiredExecutions: 2, currentExecutions: 2 },
      ]);
      const onHeal = vi.fn();

      decrementExecution(tasks, 1, onHeal);

      expect(tasks.value[0]?.completed).toBe(false);
    });
  });

  describe('resetTasksForNewDay', () => {
    let tasks: Ref<Task[]>;

    beforeEach(() => {
      tasks = ref<Task[]>([
        {
          id: 1,
          text: 'Обычная выполненная',
          completed: true,
          type: 'standard',
          originalText: null,
          requiredExecutions: 1,
          currentExecutions: 1,
        },
        {
          id: 2,
          text: 'Обычная невыполненная',
          completed: false,
          type: 'standard',
          originalText: null,
          requiredExecutions: 1,
          currentExecutions: 0,
        },
        {
          id: 3,
          text: 'Текущий текст',
          completed: true,
          type: 'joker',
          originalText: 'Джокер оригинал',
          requiredExecutions: 1,
          currentExecutions: 1,
        },
        {
          id: 4,
          text: 'Текущий текст',
          completed: false,
          type: 'substitute',
          originalText: 'Замена оригинал',
          requiredExecutions: 1,
          currentExecutions: 0,
        },
      ]);
    });

    it('должен сбрасывать completed для всех задач', () => {
      resetTasksForNewDay(tasks);

      tasks.value.forEach((task) => {
        expect(task.completed).toBe(false);
      });
    });

    it('должен сбрасывать currentExecutions при новом дне', () => {
      tasks = ref<Task[]>([
        { id: 1, text: 'Задача', completed: true, type: 'standard', originalText: null, requiredExecutions: 3, currentExecutions: 3 },
      ]);

      resetTasksForNewDay(tasks);

      expect(tasks.value[0]?.currentExecutions).toBe(0);
      expect(tasks.value[0]?.completed).toBe(false);
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
