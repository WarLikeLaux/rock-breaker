import type { Task } from '@/shared/types';
import type { Ref, ComputedRef } from 'vue';

export function createRock(
  goalName: Ref<string>,
  durationDays: Ref<number>,
  currentHp: Ref<number>,
  tasks: Ref<Task[]>,
  taskIdCounter: { value: number },
  lastActiveDate: Ref<string>,
  isSetupComplete: Ref<boolean>,
  getTodayDate: () => string,
  name: string,
  days: number,
): void {
  goalName.value = name;
  durationDays.value = days;
  currentHp.value = days * 5;
  tasks.value = [];
  taskIdCounter.value = 0;
  lastActiveDate.value = getTodayDate();
  isSetupComplete.value = true;
}

export function restartRock(
  goalName: Ref<string>,
  durationDays: Ref<number>,
  currentHp: Ref<number>,
  tasks: Ref<Task[]>,
  lastActiveDate: Ref<string>,
  getTodayDate: () => string,
  newName: string,
  newDays: number,
): void {
  goalName.value = newName;
  durationDays.value = newDays;
  currentHp.value = newDays * 5;
  tasks.value.forEach((task) => {
    task.completed = false;
    task.currentExecutions = 0;
  });
  lastActiveDate.value = getTodayDate();
}

export function updateRock(
  goalName: Ref<string>,
  durationDays: Ref<number>,
  currentHp: Ref<number>,
  maxHp: ComputedRef<number>,
  newName: string,
  newDays: number,
): void {
  const oldMaxHp = maxHp.value;
  const damageDone = oldMaxHp - currentHp.value;

  goalName.value = newName;
  durationDays.value = newDays;

  const newMaxHp = newDays * 5;
  currentHp.value = Math.min(newMaxHp, Math.max(0, newMaxHp - damageDone));
}

export function resetGame(
  goalName: Ref<string>,
  durationDays: Ref<number>,
  currentHp: Ref<number>,
  tasks: Ref<Task[]>,
  taskIdCounter: { value: number },
  lastActiveDate: Ref<string>,
  isSetupComplete: Ref<boolean>,
  clearStorage: () => void,
): void {
  goalName.value = '';
  durationDays.value = 0;
  currentHp.value = 0;
  tasks.value = [];
  taskIdCounter.value = 0;
  lastActiveDate.value = '';
  isSetupComplete.value = false;
  clearStorage();
}

export function hitRock(currentHp: Ref<number>): void {
  if (currentHp.value > 0) {
    currentHp.value--;
  }
}

export function healRock(currentHp: Ref<number>, maxHp: ComputedRef<number>): void {
  if (currentHp.value < maxHp.value) {
    currentHp.value++;
  }
}
