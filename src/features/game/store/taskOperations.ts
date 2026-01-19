import type { Task } from '@/shared/types';
import type { Ref } from 'vue';

export function addTask(
  tasks: Ref<Task[]>,
  canAddTask: Ref<boolean>,
  taskIdCounter: { value: number },
  text: string,
  type: Task['type'] = 'standard',
): void {
  if (!canAddTask.value || !text.trim()) return;
  tasks.value.push({
    id: ++taskIdCounter.value,
    text: text.trim(),
    completed: false,
    type,
    originalText: null,
  });
}

export function removeTask(tasks: Ref<Task[]>, id: number): void {
  const index = tasks.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks.value.splice(index, 1);
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
): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;

  if (task.type === 'joker' && !task.text) return;

  if (task.completed) {
    task.completed = false;
    if (task.type !== 'joker') onHeal();
  } else {
    task.completed = true;
    if (task.type !== 'joker') onHit();
  }
}

export function resetTasksForNewDay(tasks: Ref<Task[]>): void {
  tasks.value = tasks.value.filter((task) => {
    task.completed = false;

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
