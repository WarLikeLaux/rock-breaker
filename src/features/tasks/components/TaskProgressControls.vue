<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/shared/types';

interface Props {
  task: Task;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
}>();

const isEmptyJoker = computed(() => props.task.type === 'joker' && !props.task.text);
const isRepeatable = computed(() => props.task.requiredExecutions > 1);
const toggleDisabled = computed(() => isEmptyJoker.value || props.task.completed);
const toggleCursorClass = computed(() => (toggleDisabled.value ? 'cursor-default' : 'cursor-pointer'));
</script>

<template>
  <button
    @click="emit('toggle')"
    :disabled="toggleDisabled"
    class="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 select-none"
    :class="[
      toggleCursorClass,
      task.completed && !isRepeatable
        ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
        : task.completed && isRepeatable
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : isRepeatable
            ? 'border-amber-500/50 bg-amber-500/10'
            : isEmptyJoker
              ? 'border-slate-600 opacity-50 cursor-not-allowed'
              : 'border-slate-500 hover:border-amber-400 hover:scale-110',
    ]"
  >
    <span v-if="task.completed && !isRepeatable" class="text-sm font-bold">✓</span>
    <span
      v-else-if="isRepeatable"
      class="text-[10px] font-bold"
      :class="task.completed ? 'text-white' : 'text-amber-400/70'"
    >
      {{ task.currentExecutions }}/{{ task.requiredExecutions }}
    </span>
  </button>
</template>
