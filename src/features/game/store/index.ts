import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { Task, Rock } from '@/shared/types';
import { getTodayDate } from '@/shared/utils/date';
import {
  saveToStorage,
  loadFromStorage,
  exportData as exportToFile,
  importData as importFromFile,
  exportKey as exportToKey,
  importKey as importFromKey,
  type ImportResult,
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
  setRequiredExecutions as setRequiredExecutionsOp,
  decrementExecution as decrementExecutionOp,
  resetTasksForNewDay,
} from './taskOperations';
import {
  restartRock as restartRockOp,
  updateRock as updateRockOp,
} from './rockOperations';

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
  subscribeVisualHit: (callback: () => void) => () => void;
  subscribeVisualHeal: (callback: () => void) => () => void;

  canAccessSideQuests: ComputedRef<boolean>;
  hardModeEnabled: Ref<boolean>;
  focusModeEnabled: Ref<boolean>;
  dayStartHour: Ref<number>;
  visibleTasks: ComputedRef<Task[]>;

  createRock: (name: string, days: number, initialTasks?: string[]) => void;
  restartRock: (newName: string, newDays: number) => void;
  updateRock: (newName: string, newDays: number) => void;
  addTask: (text: string, type?: Task['type'], requiredExecutions?: number) => void;
  removeTask: (id: number) => void;
  updateTask: (id: number, newText: string) => void;
  setTaskType: (id: number, newType: Task['type']) => void;
  substituteTask: (id: number, tempText: string) => void;
  toggleTask: (id: number) => void;
  setRequiredExecutions: (id: number, count: number) => void;
  decrementExecution: (id: number) => void;
  toggleTooltips: () => void;

  toggleHardMode: () => void;
  toggleFocusMode: () => void;
  setDayStartHour: (hour: number) => void;
  skipCurrentFocusTask: () => void;
  hitRock: () => void;
  resetGame: () => void;
  startNewDay: () => void;
  exportData: () => void;
  exportKey: () => string | null;
  importData: (jsonString: string) => boolean;
  importKey: (key: string) => boolean;
  loadFromStorage: () => boolean;

  createSideQuest: (name: string, days: number, initialTasks?: string[]) => void;
  switchRock: (rockId: number) => boolean;
  deleteRock: (rockId: number) => boolean;
  promoteSideQuestToMain: (sideQuestId: number) => boolean;
}

const rocks = ref<Rock[]>([]);
const activeRockId = ref<number>(0);
const isSetupComplete = ref<boolean>(false);
const initialSettings = loadSettings();
const showTooltips = ref<boolean>(initialSettings.showTooltips ?? true);

const hardModeEnabled = ref<boolean>(initialSettings.hardModeEnabled ?? false);
const focusModeEnabled = ref<boolean>(initialSettings.focusModeEnabled ?? false);
const dayStartHour = ref<number>(initialSettings.dayStartHour ?? 0);
const focusSkipOffset = ref<number>(0);
const shuffledIndices = ref<number[]>([]);

const rockIdCounter = { value: 0 };
const visualHitListeners = new Set<() => void>();
const visualHealListeners = new Set<() => void>();

function triggerVisualHit(): void {
  visualHitListeners.forEach((cb) => cb());
}

function triggerVisualHeal(): void {
  visualHealListeners.forEach((cb) => cb());
}

const activeRock = computed(() => rocks.value.find((r) => r.id === activeRockId.value));
const mainRock = computed(() => rocks.value.find((r) => r.isMain));
const sideRocks = computed(() => rocks.value.filter((r) => !r.isMain));

const goalName = computed(() => activeRock.value?.goalName ?? '');
const durationDays = computed(() => activeRock.value?.durationDays ?? 0);
const tasks = computed(() => activeRock.value?.tasks ?? []);
const incompleteTaskCount = computed(() => tasks.value.filter((t) => !t.completed).length);

function generateShuffledIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices;
}

watch(
  incompleteTaskCount,
  (newCount) => {
    shuffledIndices.value = generateShuffledIndices(newCount);
    focusSkipOffset.value = 0;
  },
  { immediate: true },
);

const visibleTasks = computed(() => {
  const allTasks = tasks.value;
  if (!focusModeEnabled.value) return allTasks;

  const incompleteTasks = allTasks.filter((t) => !t.completed);
  if (incompleteTasks.length === 0) return allTasks;

  const firstTask = incompleteTasks[0];
  if (!firstTask || shuffledIndices.value.length !== incompleteTasks.length) {
    return firstTask ? [firstTask] : allTasks;
  }

  const index = shuffledIndices.value[focusSkipOffset.value];
  if (typeof index !== 'number' || index < 0 || index >= incompleteTasks.length) {
    return [firstTask];
  }

  const task = incompleteTasks[index];
  return task ? [task] : [firstTask];
});
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

const canAccessSideQuests = computed(() => {
  if (!hardModeEnabled.value) return true;
  return isDayWon.value;
});

function getActiveRockRef<K extends keyof Rock>(key: K): Ref<Rock[K]> {
  return computed({
    get: () => activeRock.value?.[key] as Rock[K],
    set: (val: Rock[K]) => {
      const rock = activeRock.value;
      if (rock) {
        (rock as Record<K, Rock[K]>)[key] = val;
      }
    },
  });
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
    rock.lastActiveDate = getTodayDate(dayStartHour.value);
  });
  focusSkipOffset.value = 0;
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

  const today = getTodayDate(dayStartHour.value);
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

watch(hardModeEnabled, (val) => {
  const settings = loadSettings();
  settings.hardModeEnabled = val;
  saveSettings(settings);
});

watch(focusModeEnabled, (val) => {
  const settings = loadSettings();
  settings.focusModeEnabled = val;
  saveSettings(settings);
});

watch(dayStartHour, (val) => {
  const settings = loadSettings();
  settings.dayStartHour = val;
  saveSettings(settings);
});


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
      requiredExecutions: 1,
      currentExecutions: 0,
    }));

  const newRock: Rock = {
    id: ++rockIdCounter.value,
    goalName: name,
    durationDays: days,
    tasks,
    currentHp: days * 5,
    lastActiveDate: getTodayDate(dayStartHour.value),
    taskIdCounter: tasks.length,
    isMain: true,
    createdAt: getTodayDate(dayStartHour.value),
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
      requiredExecutions: 1,
      currentExecutions: 0,
    }));

  const newRock: Rock = {
    id: ++rockIdCounter.value,
    goalName: name,
    durationDays: days,
    tasks,
    currentHp: days * 5,
    lastActiveDate: getTodayDate(dayStartHour.value),
    taskIdCounter: tasks.length,
    isMain: false,
    createdAt: getTodayDate(dayStartHour.value),
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

  const today = getTodayDate(dayStartHour.value);
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

  restartRockOp(
    getActiveRockRef('goalName'),
    getActiveRockRef('durationDays'),
    getActiveRockRef('currentHp'),
    getActiveRockRef('tasks') as unknown as Ref<Task[]>,
    getActiveRockRef('lastActiveDate'),
    getTodayDate,
    newName,
    newDays,
  );
}

function updateRock(newName: string, newDays: number): void {
  const rock = activeRock.value;
  if (!rock) return;

  updateRockOp(
    getActiveRockRef('goalName'),
    getActiveRockRef('durationDays'),
    getActiveRockRef('currentHp'),
    maxHp,
    newName,
    newDays,
  );
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

function applyImportedState(state: ImportResult): void {
  rocks.value = state.rocks;
  activeRockId.value = state.activeRockId;
  rockIdCounter.value = state.rockIdCounter;
  if (state.showTooltips !== undefined) {
    showTooltips.value = state.showTooltips;
  }
  if (state.hardModeEnabled !== undefined) {
    hardModeEnabled.value = state.hardModeEnabled;
  }
  if (state.focusModeEnabled !== undefined) {
    focusModeEnabled.value = state.focusModeEnabled;
  }
  if (state.dayStartHour !== undefined) {
    dayStartHour.value = state.dayStartHour;
  }
  isSetupComplete.value = true;
  saveState();
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

  if (!isSetupComplete.value) {
    loadFromStorageWrapper();
  }

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
    hardModeEnabled,
    focusModeEnabled,
    dayStartHour,
    visibleTasks,

    createRock,
    restartRock,
    updateRock,
    addTask: (text: string, type?: Task['type'], requiredExecutions?: number) => {
      if (!activeRock.value) return;
      addTaskOp(tasksRef, canAddTask as unknown as Ref<boolean>, taskIdCounterRef, text, type, requiredExecutions);
    },
    removeTask: (id: number) => {
      if (!activeRock.value) return;
      removeTaskOp(tasksRef, id, healRock);
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
      toggleTaskOp(tasksRef, id, hitRock, healRock, triggerVisualHit);
    },
    subscribeVisualHit: (callback: () => void) => {
      visualHitListeners.add(callback);
      return () => visualHitListeners.delete(callback);
    },
    setRequiredExecutions: (id: number, count: number) => {
      if (!activeRock.value) return;
      setRequiredExecutionsOp(tasksRef, id, count);
    },
    decrementExecution: (id: number) => {
      if (!activeRock.value) return;
      decrementExecutionOp(tasksRef, id, healRock, triggerVisualHeal);
    },
    subscribeVisualHeal: (callback: () => void) => {
      visualHealListeners.add(callback);
      return () => visualHealListeners.delete(callback);
    },
    toggleTooltips: () => {
      showTooltips.value = !showTooltips.value;
    },
    toggleHardMode: () => {
      hardModeEnabled.value = !hardModeEnabled.value;
    },
    toggleFocusMode: () => {
      focusModeEnabled.value = !focusModeEnabled.value;
      focusSkipOffset.value = 0;
    },
    setDayStartHour: (hour: number) => {
      dayStartHour.value = Math.max(0, Math.min(23, Math.floor(hour)));
    },
    skipCurrentFocusTask: () => {
      const count = incompleteTaskCount.value;
      if (count <= 1) return;

      focusSkipOffset.value++;
      if (focusSkipOffset.value >= count) {

        const lastIndex = shuffledIndices.value[shuffledIndices.value.length - 1];
        const newIndices = generateShuffledIndices(count);

        if (newIndices[0] === lastIndex && count > 1) {
          const swapIdx = 1 + Math.floor(Math.random() * (count - 1));
          [newIndices[0], newIndices[swapIdx]] = [newIndices[swapIdx]!, newIndices[0]!];
        }
        shuffledIndices.value = newIndices;
        focusSkipOffset.value = 0;
      }
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

        hardModeEnabled: hardModeEnabled.value,
        focusModeEnabled: focusModeEnabled.value,
        dayStartHour: dayStartHour.value,
      }),
    exportKey: () =>
      exportToKey({
        rocks: rocks.value,
        activeRockId: activeRockId.value,
        isSetupComplete: isSetupComplete.value,
        rockIdCounter: rockIdCounter.value,
        showTooltips: showTooltips.value,
        hardModeEnabled: hardModeEnabled.value,
        focusModeEnabled: focusModeEnabled.value,
        dayStartHour: dayStartHour.value,
      }),
    importData: (jsonString: string) => {
      const state = importFromFile(jsonString);
      if (!state) return false;

      applyImportedState(state);
      return true;
    },
    importKey: (key: string) => {
      const state = importFromKey(key);
      if (!state) return false;

      applyImportedState(state);
      return true;
    },
    loadFromStorage: loadFromStorageWrapper,

    createSideQuest,
    switchRock,
    deleteRock,
    promoteSideQuestToMain,
  };
}
