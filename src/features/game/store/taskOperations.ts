import { MAX_DAILY_EXECUTIONS, MIN_DAILY_EXECUTIONS } from '@/shared/constants/tasks';
import type { Task } from '@/shared/types';
import type { Ref } from 'vue';

export function addTask(
  tasks: Ref<Task[]>,
  canAddTask: Ref<boolean>,
  taskIdCounter: { value: number },
  text: string,
  type: Task['type'] = 'standard',
  requiredExecutions: number = MIN_DAILY_EXECUTIONS,
): void {
  if (!canAddTask.value || !text.trim()) return;
  const executions = type === 'joker'
    ? MIN_DAILY_EXECUTIONS
    : Math.min(MAX_DAILY_EXECUTIONS, Math.max(MIN_DAILY_EXECUTIONS, requiredExecutions));
  tasks.value.push({
    id: ++taskIdCounter.value,
    text: text.trim(),
    completed: false,
    type,
    originalText: null,
    requiredExecutions: executions,
    currentExecutions: 0,
  });
}

export function removeTask(tasks: Ref<Task[]>, id: number, onHeal?: () => void): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;

  const wasCompleted = task.completed && task.type !== 'joker';

  const index = tasks.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks.value.splice(index, 1);
  }

  if (wasCompleted && onHeal) {
    onHeal();
  }
}

export function updateTask(tasks: Ref<Task[]>, id: number, newText: string): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;

  if (task.type === 'joker') {
    task.text = newText.trim();
  } else if (newText.trim()) {
    task.text = newText.trim();
  }
}

export function setTaskType(tasks: Ref<Task[]>, id: number, newType: Task['type']): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;

  if (newType !== 'standard' && task.type === 'standard') {
    task.originalText = task.text;
  } else if (newType === 'standard' && task.originalText) {
    task.text = task.originalText;
    task.originalText = null;
  }

  task.type = newType;

  if (newType === 'joker') {
    task.requiredExecutions = MIN_DAILY_EXECUTIONS;
    task.currentExecutions = 0;
    task.completed = false;
    task.originalText = null;
  }
}

export function substituteTask(tasks: Ref<Task[]>, id: number, tempText: string): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task || task.type !== 'standard') return;

  task.originalText = task.text;
  task.text = tempText.trim();
  task.type = 'substitute';
}

export function toggleTask(
  tasks: Ref<Task[]>,
  id: number,
  onHit: () => void,
  onHeal: () => void,
  onVisualHit?: () => void,
): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;

  if (task.type === 'joker' && !task.text) return;

  if (task.completed) {
    if (task.currentExecutions > 0) {
      const wasCompleted = task.completed;
      task.currentExecutions--;
      task.completed = task.currentExecutions >= task.requiredExecutions;
      if (task.type !== 'joker' && wasCompleted && !task.completed) onHeal();
    }
  } else {
    task.currentExecutions++;
    const nowCompleted = task.currentExecutions >= task.requiredExecutions;
    task.completed = nowCompleted;

    if (task.type !== 'joker') {
      if (nowCompleted) {
        onHit();
      } else if (onVisualHit && task.requiredExecutions > 1) {
        onVisualHit();
      }
    }
  }
}

export function setRequiredExecutions(tasks: Ref<Task[]>, id: number, count: number): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task || task.type === 'joker') return;

  task.requiredExecutions = Math.min(MAX_DAILY_EXECUTIONS, Math.max(MIN_DAILY_EXECUTIONS, count));
  if (task.currentExecutions > task.requiredExecutions) {
    task.currentExecutions = task.requiredExecutions;
  }
  task.completed = task.currentExecutions >= task.requiredExecutions;
}

export function decrementExecution(
  tasks: Ref<Task[]>,
  id: number,
  onHeal: () => void,
  onVisualHeal?: () => void,
): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task || task.currentExecutions <= 0) return;

  const wasCompleted = task.completed;
  const wasPartiallyCompleted = task.currentExecutions > 0 && !task.completed;
  task.currentExecutions--;
  task.completed = task.currentExecutions >= task.requiredExecutions;

  if (task.type !== 'joker') {
    if (wasCompleted && !task.completed) {
      onHeal();
    } else if (wasPartiallyCompleted && task.currentExecutions === 0 && onVisualHeal) {
      onVisualHeal();
    }
  }
}

export function resetTasksForNewDay(tasks: Ref<Task[]>): void {
  tasks.value = tasks.value.filter((task) => {
    task.completed = false;
    task.currentExecutions = 0;

    if (task.type === 'joker') {
      return false;
    } else if (task.type === 'substitute') {
      task.text = task.originalText || '';
      task.originalText = null;
      task.type = 'standard';
    }
    return true;
  });
}
