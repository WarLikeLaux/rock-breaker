export interface Task {
  id: number;
  text: string;
  completed: boolean;
  type: 'standard' | 'joker' | 'substitute';
  originalText: string | null;
}

export interface StoredState {
  version: number;
  goalName: string;
  durationDays: number;
  tasks: Task[];
  isSetupComplete: boolean;
  currentHp: number;
  lastActiveDate: string;
  taskIdCounter: number;
}

export interface Settings {
  showTooltips?: boolean;
  soundEnabled?: boolean;
}
