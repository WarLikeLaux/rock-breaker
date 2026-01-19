import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { Task } from '@/shared/types';
import { getTodayDate } from '@/shared/utils/date';
import {
  saveToStorage,
  loadFromStorage,
  exportData as exportToFile,
  importData as importFromFile,
  saveSettings,
  loadSettings,
  clearStorage,
} from './storage';
import {
  addTask as addTaskOp,
  removeTask as removeTaskOp,
  updateTask as updateTaskOp,
  setTaskType as setTaskTypeOp,
  substituteTask as substituteTaskOp,
  toggleTask as toggleTaskOp,
  resetTasksForNewDay,
} from './taskOperations';
import {
  createRock as createRockOp,
  restartRock as restartRockOp,
  updateRock as updateRockOp,
  resetGame as resetGameOp,
  hitRock as hitRockOp,
  healRock as healRockOp,
} from './rockOperations';

export interface GameStore {
  goalName: Ref<string>;
  durationDays: Ref<number>;
  tasks: Ref<Task[]>;
  currentHp: Ref<number>;
  maxHp: ComputedRef<number>;
  hpPercent: ComputedRef<number>;
  isSetupComplete: Ref<boolean>;
  canAddTask: ComputedRef<boolean>;
  isVictory: ComputedRef<boolean>;
  lastActiveDate: Ref<string>;
  showTooltips: Ref<boolean>;
  createRock: (name: string, days: number) => void;
  restartRock: (newName: string, newDays: number) => void;
  updateRock: (newName: string, newDays: number) => void;
  addTask: (text: string, type?: Task['type']) => void;
  removeTask: (id: number) => void;
  updateTask: (id: number, newText: string) => void;
  setTaskType: (id: number, newType: Task['type']) => void;
  substituteTask: (id: number, tempText: string) => void;
  toggleTask: (id: number) => void;
  toggleTooltips: () => void;
  hitRock: () => void;
  resetGame: () => void;
  startNewDay: () => void;
  exportData: () => void;
  importData: (jsonString: string) => boolean;
  loadFromStorage: () => boolean;
}

const goalName = ref<string>('');
const durationDays = ref<number>(0);
const tasks = ref<Task[]>([]);
const isSetupComplete = ref<boolean>(false);
const currentHp = ref<number>(0);
const lastActiveDate = ref<string>('');
const showTooltips = ref<boolean>(loadSettings().showTooltips ?? true);

const taskIdCounter = { value: 0 };

const maxHp = computed(() => durationDays.value * 5);
const hpPercent = computed(() => (maxHp.value > 0 ? (currentHp.value / maxHp.value) * 100 : 0));
const canAddTask = computed(() => tasks.value.length < 5);
const isVictory = computed(() => isSetupComplete.value && currentHp.value <= 0);

function saveState(): void {
  saveToStorage({
    goalName: goalName.value,
    durationDays: durationDays.value,
    tasks: tasks.value,
    isSetupComplete: isSetupComplete.value,
    currentHp: currentHp.value,
    lastActiveDate: lastActiveDate.value,
    taskIdCounter: taskIdCounter.value,
  });
}

function startNewDay(): void {
  resetTasksForNewDay(tasks);
  lastActiveDate.value = getTodayDate();
  saveState();
}

function loadFromStorageWrapper(): boolean {
  const state = loadFromStorage();
  if (!state) return false;

  goalName.value = state.goalName || '';
  durationDays.value = state.durationDays || 0;
  tasks.value = state.tasks;
  isSetupComplete.value = state.isSetupComplete || false;
  currentHp.value = state.currentHp || 0;
  lastActiveDate.value = state.lastActiveDate || '';
  taskIdCounter.value = state.taskIdCounter || 0;

  const today = getTodayDate();
  if (lastActiveDate.value && lastActiveDate.value !== today) {
    startNewDay();
  }
  lastActiveDate.value = today;

  return true;
}

watch(
  [goalName, durationDays, tasks, isSetupComplete, currentHp, lastActiveDate],
  () => {
    if (isSetupComplete.value) {
      saveState();
    }
  },
  { deep: true },
);

watch(showTooltips, (val) => {
  const settings = loadSettings();
  settings.showTooltips = val;
  saveSettings(settings);
});

loadFromStorageWrapper();

export function useGameStore(): GameStore {
  return {
    goalName,
    durationDays,
    tasks,
    currentHp,
    maxHp,
    hpPercent,
    isSetupComplete,
    canAddTask,
    isVictory,
    lastActiveDate,
    showTooltips,
    createRock: (name: string, days: number) =>
      createRockOp(
        goalName,
        durationDays,
        currentHp,
        tasks,
        taskIdCounter,
        lastActiveDate,
        isSetupComplete,
        getTodayDate,
        name,
        days,
      ),
    restartRock: (newName: string, newDays: number) =>
      restartRockOp(
        goalName,
        durationDays,
        currentHp,
        tasks,
        lastActiveDate,
        getTodayDate,
        newName,
        newDays,
      ),
    updateRock: (newName: string, newDays: number) =>
      updateRockOp(goalName, durationDays, currentHp, maxHp, newName, newDays),
    addTask: (text: string, type?: Task['type']) =>
      addTaskOp(tasks, canAddTask, taskIdCounter, text, type),
    removeTask: (id: number) => removeTaskOp(tasks, id),
    updateTask: (id: number, newText: string) => updateTaskOp(tasks, id, newText),
    setTaskType: (id: number, newType: Task['type']) => setTaskTypeOp(tasks, id, newType),
    substituteTask: (id: number, tempText: string) => substituteTaskOp(tasks, id, tempText),
    toggleTask: (id: number) =>
      toggleTaskOp(
        tasks,
        id,
        () => hitRockOp(currentHp),
        () => healRockOp(currentHp, maxHp),
      ),
    toggleTooltips: () => {
      showTooltips.value = !showTooltips.value;
    },
    hitRock: () => hitRockOp(currentHp),
    resetGame: () =>
      resetGameOp(
        goalName,
        durationDays,
        currentHp,
        tasks,
        taskIdCounter,
        lastActiveDate,
        isSetupComplete,
        clearStorage,
      ),
    startNewDay,
    exportData: () =>
      exportToFile({
        goalName: goalName.value,
        durationDays: durationDays.value,
        tasks: tasks.value,
        isSetupComplete: isSetupComplete.value,
        currentHp: currentHp.value,
        lastActiveDate: lastActiveDate.value,
        taskIdCounter: taskIdCounter.value,
        showTooltips: showTooltips.value,
      }),
    importData: (jsonString: string) => {
      const state = importFromFile(jsonString);
      if (!state) return false;

      goalName.value = state.goalName || '';
      durationDays.value = state.durationDays || 0;
      tasks.value = state.tasks || [];
      currentHp.value = state.currentHp || 0;
      lastActiveDate.value = state.lastActiveDate || getTodayDate();
      taskIdCounter.value = state.taskIdCounter || 0;
      if (state.showTooltips !== undefined) {
        showTooltips.value = state.showTooltips;
      }
      isSetupComplete.value = true;
      saveState();
      return true;
    },
    loadFromStorage: loadFromStorageWrapper,
  };
}
