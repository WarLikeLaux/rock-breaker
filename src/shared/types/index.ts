export interface Task {
  id: number;
  text: string;
  completed: boolean;
  type: 'standard' | 'joker' | 'substitute';
  originalText: string | null;
  requiredExecutions: number;
  currentExecutions: number;
}

export interface TaskV3 {
  id: number;
  text: string;
  completed: boolean;
  type: 'standard' | 'joker' | 'substitute';
  originalText: string | null;
}

export interface Rock {
  id: number;
  goalName: string;
  durationDays: number;
  tasks: Task[];
  currentHp: number;
  lastActiveDate: string;
  taskIdCounter: number;
  isMain: boolean;
}

export interface StoredStateV2 {
  version: number;
  goalName: string;
  durationDays: number;
  tasks: Task[];
  isSetupComplete: boolean;
  currentHp: number;
  lastActiveDate: string;
  taskIdCounter: number;
}

export interface RockV3 {
  id: number;
  goalName: string;
  durationDays: number;
  tasks: TaskV3[];
  currentHp: number;
  lastActiveDate: string;
  taskIdCounter: number;
  isMain: boolean;
}

export interface StoredStateV3 {
  version: number;
  rocks: RockV3[];
  activeRockId: number;
  isSetupComplete: boolean;
  rockIdCounter: number;
}

export interface StoredState {
  version: number;
  rocks: Rock[];
  activeRockId: number;
  isSetupComplete: boolean;
  rockIdCounter: number;
}

export interface Settings {
  showTooltips?: boolean;
  soundEnabled?: boolean;
  hardModeEnabled?: boolean;
  focusModeEnabled?: boolean;
}
