<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { useGameStore } from '@/features/game/store';
import type { Task } from '@/shared/types';
import TaskTypeMenu from './TaskTypeMenu.vue';
import TaskDeleteButton from './TaskDeleteButton.vue';

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
}>();

const isEditing = ref<boolean>(false);
const editText = ref<string>('');
const inputRef = ref<HTMLInputElement | null>(null);
const isAnimating = ref<boolean>(false);
const showTypeMenu = ref<boolean>(false);

let clickTimer: ReturnType<typeof setTimeout> | null = null;

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
  switch (props.task.type) {
    case 'joker':
      return 'bg-purple-900/20 border-purple-700/50 hover:border-purple-500';
    case 'substitute':
      return 'bg-amber-900/20 border-amber-700/50 hover:border-amber-500';
    default:
      return 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80';
  }
});

const isEmptyJoker = computed(() => props.task.type === 'joker' && !props.task.text);

function handleClick(): void {
  if (isEmptyJoker.value) {
    startEdit();
    return;
  }

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    startEdit();
  } else {
    clickTimer = setTimeout(() => {
      clickTimer = null;
      handleToggle();
    }, 300);
  }
}

function handleToggle(): void {
  if (isEmptyJoker.value) return;

  if (!props.task.completed) {
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
    }, 400);
  }
  emit('toggle', props.task.id);
}

function startEdit(): void {
  editText.value = props.task.text;
  isEditing.value = true;
  nextTick(() => inputRef.value?.focus());
}

function saveEdit(): void {
  const trimmed = editText.value.trim();
  if (props.task.type === 'joker' || trimmed) {
    emit('update', props.task.id, trimmed);
  }
  isEditing.value = false;
}

function cancelEdit(): void {
  isEditing.value = false;
}

function handleTypeClick(e: MouseEvent): void {
  e.stopPropagation();
  showTypeMenu.value = !showTypeMenu.value;
}

function selectType(type: Task['type']): void {
  emit('setType', props.task.id, type);
  showTypeMenu.value = false;
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
          @close="showTypeMenu = false"
        />
      </div>

      <button
        @click="handleToggle"
        :disabled="isEmptyJoker"
        class="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 select-none"
        :class="[
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
            : isEmptyJoker
              ? 'border-slate-600 opacity-50 cursor-not-allowed'
              : 'border-slate-500 hover:border-amber-400 hover:scale-110',
        ]"
      >
        <span v-if="task.completed" class="text-sm font-bold">✓</span>
      </button>

      <div class="flex-1 min-w-0">
        <input
          v-if="isEditing"
          ref="inputRef"
          v-model="editText"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          :placeholder="task.type === 'joker' ? 'Что сделать сегодня?' : ''"
          class="w-full bg-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
        />
        <div v-else class="flex flex-col justify-center">
          <span
            @click="handleClick"
            class="block truncate cursor-pointer select-text text-base transition-all duration-300"
            :class="[
              task.completed ? 'line-through text-slate-500' : 'text-white hover:text-amber-300',
              { 'text-slate-500': isEmptyJoker },
            ]"
          >
            {{ task.text || 'Нажми чтобы добавить...' }}
          </span>
          <span
            v-if="task.type === 'substitute' && task.originalText"
            class="text-xs text-amber-500/70 truncate block"
          >
            Завтра: {{ task.originalText }}
          </span>
        </div>
      </div>

      <TaskDeleteButton @remove="emit('remove', task.id)" />
    </div>

    <template #popper>
      <div class="text-sm">
        <div>Двойной клик на текст: редактировать</div>
        <div>Клик на иконку: сменить тип</div>
        <div class="text-slate-400 text-xs mt-1">Подсказки можно отключить в настройках</div>
      </div>
    </template>
  </VTooltip>
</template>
