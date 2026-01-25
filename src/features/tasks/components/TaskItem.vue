<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/features/game/store';
import type { Task } from '@/shared/types';
import TaskTypeMenu from './TaskTypeMenu.vue';
import TaskProgressControls from './TaskProgressControls.vue';
import TaskTextField from './TaskTextField.vue';
import TaskDeleteButton from './TaskDeleteButton.vue';
import TaskTooltip from './TaskTooltip.vue';

const { showTooltips } = useGameStore();

interface Props {
  task: Task;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: number];
  update: [id: number, text: string];
  remove: [id: number];
  setType: [id: number, type: Task['type']];
  substitute: [id: number, text: string];
  setRequiredExecutions: [id: number, count: number];
  decrementExecution: [id: number];
}>();

const isEditing = ref<boolean>(false);
const isAnimating = ref<boolean>(false);
const showTypeMenu = ref<boolean>(false);

const typeIcon = computed(() => {
  switch (props.task.type) {
    case 'joker':
      return '🃏';
    case 'substitute':
      return '⏳';
    default:
      return '⛏️';
  }
});

const borderClass = computed(() => {
  if (props.task.completed) return 'bg-emerald-900/20 border-emerald-800/50';
  if (isPartiallyCompleted.value) return 'bg-amber-900/10 border-amber-700/30';
  switch (props.task.type) {
    case 'joker':
      return 'bg-purple-900/20 border-purple-700/50 hover:border-purple-500';
    case 'substitute':
      return 'bg-amber-900/20 border-amber-700/50 hover:border-amber-500';
    default:
      return 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80';
  }
});

const isPartiallyCompleted = computed(
  () => props.task.currentExecutions > 0 && !props.task.completed,
);

const canDecrement = computed(
  () => props.task.currentExecutions > 0,
);

function handleToggle(): void {
  if (props.task.completed) return;

  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 400);
  emit('toggle', props.task.id);
}

function handleTypeClick(e: MouseEvent): void {
  e.stopPropagation();
  showTypeMenu.value = !showTypeMenu.value;
}

function selectType(type: Task['type']): void {
  emit('setType', props.task.id, type);
  showTypeMenu.value = false;
}

function selectExecutions(count: number): void {
  emit('setRequiredExecutions', props.task.id, count);
  showTypeMenu.value = false;
}

function handleDecrement(): void {
  emit('decrementExecution', props.task.id);
}

function handleUpdate(id: number, text: string): void {
  emit('update', id, text);
}
</script>

<template>
  <VTooltip
    placement="top"
    :delay="{ show: 600, hide: 0 }"
    :disabled="!showTooltips || isEditing || showTypeMenu"
  >
    <div
      class="group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 min-h-[72px]"
      :class="[borderClass, { 'animate-complete': isAnimating }]"
    >
      <div class="relative select-none">
        <button
          @click="handleTypeClick"
          class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all hover:scale-110 hover:bg-slate-700/50"
        >
          {{ typeIcon }}
        </button>

        <TaskTypeMenu
          :task="task"
          :show="showTypeMenu"
          @select="selectType"
          @setExecutions="selectExecutions"
          @close="showTypeMenu = false"
        />
      </div>

      <TaskProgressControls
        :task="task"
        @toggle="handleToggle"
      />

      <TaskTextField
        :task="task"
        v-model:editing="isEditing"
        @toggle="handleToggle"
        @update="handleUpdate"
      />

      <button
        v-if="canDecrement"
        @click="handleDecrement"
        class="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border border-amber-500/60 bg-slate-900/40 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.25)] hover:text-amber-200 hover:bg-slate-900/70 transition-all cursor-pointer"
      >
        <svg
          class="w-3.5 h-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M4 8h8" />
        </svg>
      </button>

      <TaskDeleteButton @remove="emit('remove', task.id)" />
    </div>

    <template #popper>
      <TaskTooltip :task="task" />
    </template>
  </VTooltip>
</template>
