import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { Task, Rock } from '@/shared/types';
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

export interface GameStore {
  goalName: ComputedRef<string>;
  durationDays: ComputedRef<number>;
  tasks: ComputedRef<Task[]>;
  currentHp: ComputedRef<number>;
  maxHp: ComputedRef<number>;
  hpPercent: ComputedRef<number>;
  isSetupComplete: Ref<boolean>;
  canAddTask: ComputedRef<boolean>;
  isVictory: ComputedRef<boolean>;
  lastActiveDate: ComputedRef<string>;
  showTooltips: Ref<boolean>;

  rocks: Ref<Rock[]>;
  activeRockId: Ref<number>;
  activeRock: ComputedRef<Rock | undefined>;
  mainRock: ComputedRef<Rock | undefined>;
  sideRocks: ComputedRef<Rock[]>;
  isDayWon: ComputedRef<boolean>;
  canAccessSideQuests: ComputedRef<boolean>;

  createRock: (name: string, days: number, initialTasks?: string[]) => void;
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

  createSideQuest: (name: string, days: number, initialTasks?: string[]) => void;
  switchRock: (rockId: number) => boolean;
  deleteRock: (rockId: number) => boolean;
  promoteSideQuestToMain: (sideQuestId: number) => boolean;
}

const rocks = ref<Rock[]>([]);
const activeRockId = ref<number>(0);
const isSetupComplete = ref<boolean>(false);
const showTooltips = ref<boolean>(loadSettings().showTooltips ?? true);

const rockIdCounter = { value: 0 };

const activeRock = computed(() => rocks.value.find((r) => r.id === activeRockId.value));
const mainRock = computed(() => rocks.value.find((r) => r.isMain));
const sideRocks = computed(() => rocks.value.filter((r) => !r.isMain));

const goalName = computed(() => activeRock.value?.goalName ?? '');
const durationDays = computed(() => activeRock.value?.durationDays ?? 0);
const tasks = computed(() => activeRock.value?.tasks ?? []);
const currentHp = computed(() => activeRock.value?.currentHp ?? 0);
const lastActiveDate = computed(() => activeRock.value?.lastActiveDate ?? '');

const maxHp = computed(() => durationDays.value * 5);
const hpPercent = computed(() => (maxHp.value > 0 ? (currentHp.value / maxHp.value) * 100 : 0));
const canAddTask = computed(() => tasks.value.length < 5);
const isVictory = computed(() => {
  if (!isSetupComplete.value || !mainRock.value) return false;
  return mainRock.value.currentHp <= 0;
});

const isDayWon = computed(() => {
  if (!mainRock.value) return false;
  const mainTasks = mainRock.value.tasks;
  return mainTasks.length === 5 && mainTasks.every((t) => t.completed);
});

const canAccessSideQuests = computed(() => isDayWon.value);

function getActiveRockRef<K extends keyof Rock>(key: K): { value: Rock[K] } {
  return {
    get value() {
      return activeRock.value?.[key] as Rock[K];
    },
    set value(val: Rock[K]) {
      const rock = activeRock.value;
      if (rock) {
        (rock as Record<K, Rock[K]>)[key] = val;
      }
    },
  };
}

function saveState(): void {
  saveToStorage({
    rocks: rocks.value,
    activeRockId: activeRockId.value,
    isSetupComplete: isSetupComplete.value,
    rockIdCounter: rockIdCounter.value,
  });
}

function startNewDay(): void {
  rocks.value.forEach((rock) => {
    const tasksRef = ref(rock.tasks);
    resetTasksForNewDay(tasksRef);
    rock.tasks = tasksRef.value;
    rock.lastActiveDate = getTodayDate();
  });
  if (mainRock.value) {
    activeRockId.value = mainRock.value.id;
  }
  saveState();
}

function loadFromStorageWrapper(): boolean {
  const state = loadFromStorage();
  if (!state) return false;

  rocks.value = state.rocks;
  activeRockId.value = state.activeRockId;
  isSetupComplete.value = state.isSetupComplete;
  rockIdCounter.value = state.rockIdCounter;

  const today = getTodayDate();
  const anyRockNeedsReset = rocks.value.some(
    (rock) => rock.lastActiveDate && rock.lastActiveDate !== today,
  );

  if (anyRockNeedsReset) {
    startNewDay();
  }

  rocks.value.forEach((rock) => {
    rock.lastActiveDate = today;
  });

  return true;
}

watch(
  [rocks, activeRockId, isSetupComplete],
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

function createRock(name: string, days: number, initialTasks: string[] = []): void {
  const tasks: Task[] = initialTasks
    .slice(0, 5)
    .filter((text) => text.trim())
    .map((text, index) => ({
      id: index + 1,
      text: text.trim(),
      completed: false,
      type: 'standard' as const,
      originalText: null,
    }));

  const newRock: Rock = {
    id: ++rockIdCounter.value,
    goalName: name,
    durationDays: days,
    tasks,
    currentHp: days * 5,
    lastActiveDate: getTodayDate(),
    taskIdCounter: tasks.length,
    isMain: true,
  };
  rocks.value = [newRock];
  activeRockId.value = newRock.id;
  isSetupComplete.value = true;
}

function createSideQuest(name: string, days: number, initialTasks: string[] = []): void {
  const tasks: Task[] = initialTasks
    .slice(0, 5)
    .filter((text) => text.trim())
    .map((text, index) => ({
      id: index + 1,
      text: text.trim(),
      completed: false,
      type: 'standard' as const,
      originalText: null,
    }));

  const newRock: Rock = {
    id: ++rockIdCounter.value,
    goalName: name,
    durationDays: days,
    tasks,
    currentHp: days * 5,
    lastActiveDate: getTodayDate(),
    taskIdCounter: tasks.length,
    isMain: false,
  };
  rocks.value.push(newRock);
}

function switchRock(rockId: number): boolean {
  const targetRock = rocks.value.find((r) => r.id === rockId);
  if (!targetRock) return false;

  if (!targetRock.isMain && !canAccessSideQuests.value) {
    return false;
  }

  activeRockId.value = rockId;
  return true;
}

function deleteRock(rockId: number): boolean {
  const rock = rocks.value.find((r) => r.id === rockId);
  if (!rock || rock.isMain) return false;

  rocks.value = rocks.value.filter((r) => r.id !== rockId);

  if (activeRockId.value === rockId && mainRock.value) {
    activeRockId.value = mainRock.value.id;
  }

  return true;
}

function promoteSideQuestToMain(sideQuestId: number): boolean {
  const sideQuest = rocks.value.find((r) => r.id === sideQuestId);
  const oldMainRock = mainRock.value;

  if (!sideQuest || sideQuest.isMain || !oldMainRock) return false;

  oldMainRock.isMain = false;
  sideQuest.isMain = true;
  activeRockId.value = sideQuestId;

  const today = getTodayDate();
  if (sideQuest.lastActiveDate !== today) {
    const tasksRef = ref(sideQuest.tasks);
    resetTasksForNewDay(tasksRef);
    sideQuest.tasks = tasksRef.value;
    sideQuest.lastActiveDate = today;
  }

  return true;
}

function restartRock(newName: string, newDays: number): void {
  const rock = activeRock.value;
  if (!rock) return;

  rock.goalName = newName;
  rock.durationDays = newDays;
  rock.currentHp = newDays * 5;
  rock.tasks.forEach((task) => {
    task.completed = false;
  });
  rock.lastActiveDate = getTodayDate();
}

function updateRock(newName: string, newDays: number): void {
  const rock = activeRock.value;
  if (!rock) return;

  const oldMaxHp = rock.durationDays * 5;
  const damageDone = oldMaxHp - rock.currentHp;

  rock.goalName = newName;
  rock.durationDays = newDays;

  const newMaxHp = newDays * 5;
  rock.currentHp = Math.max(0, newMaxHp - damageDone);
}

function hitRock(): void {
  const rock = activeRock.value;
  if (rock && rock.currentHp > 0) {
    rock.currentHp--;
  }
}

function healRock(): void {
  const rock = activeRock.value;
  if (rock) {
    const rockMaxHp = rock.durationDays * 5;
    if (rock.currentHp < rockMaxHp) {
      rock.currentHp++;
    }
  }
}

function resetGame(): void {
  rocks.value = [];
  activeRockId.value = 0;
  rockIdCounter.value = 0;
  isSetupComplete.value = false;
  clearStorage();
}

export function useGameStore(): GameStore {
  const tasksRef = getActiveRockRef('tasks') as unknown as Ref<Task[]>;
  const taskIdCounterRef = {
    get value() {
      return activeRock.value?.taskIdCounter ?? 0;
    },
    set value(val: number) {
      const rock = activeRock.value;
      if (rock) rock.taskIdCounter = val;
    },
  };

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

    rocks,
    activeRockId,
    activeRock,
    mainRock,
    sideRocks,
    isDayWon,
    canAccessSideQuests,

    createRock,
    restartRock,
    updateRock,
    addTask: (text: string, type?: Task['type']) => {
      if (!activeRock.value) return;
      addTaskOp(tasksRef, canAddTask as unknown as Ref<boolean>, taskIdCounterRef, text, type);
    },
    removeTask: (id: number) => {
      if (!activeRock.value) return;
      removeTaskOp(tasksRef, id);
    },
    updateTask: (id: number, newText: string) => {
      if (!activeRock.value) return;
      updateTaskOp(tasksRef, id, newText);
    },
    setTaskType: (id: number, newType: Task['type']) => {
      if (!activeRock.value) return;
      setTaskTypeOp(tasksRef, id, newType);
    },
    substituteTask: (id: number, tempText: string) => {
      if (!activeRock.value) return;
      substituteTaskOp(tasksRef, id, tempText);
    },
    toggleTask: (id: number) => {
      if (!activeRock.value) return;
      toggleTaskOp(tasksRef, id, hitRock, healRock);
    },
    toggleTooltips: () => {
      showTooltips.value = !showTooltips.value;
    },
    hitRock,
    resetGame,
    startNewDay,
    exportData: () =>
      exportToFile({
        rocks: rocks.value,
        activeRockId: activeRockId.value,
        isSetupComplete: isSetupComplete.value,
        rockIdCounter: rockIdCounter.value,
        showTooltips: showTooltips.value,
      }),
    importData: (jsonString: string) => {
      const state = importFromFile(jsonString);
      if (!state) return false;

      rocks.value = state.rocks;
      activeRockId.value = state.activeRockId;
      rockIdCounter.value = state.rockIdCounter;
      if (state.showTooltips !== undefined) {
        showTooltips.value = state.showTooltips;
      }
      isSetupComplete.value = true;
      saveState();
      return true;
    },
    loadFromStorage: loadFromStorageWrapper,

    createSideQuest,
    switchRock,
    deleteRock,
    promoteSideQuestToMain,
  };
}
