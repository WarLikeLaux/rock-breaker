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
const toggleDisabled = computed(() => isEmptyJoker.value);
const toggleCursorClass = computed(() => (toggleDisabled.value ? 'cursor-default' : 'cursor-pointer'));

const buttonStateClass = computed(() => {
  if (props.task.completed && !isRepeatable.value) {
    return 'bg-emerald-500 border-emerald-500 text-white scale-110';
  }
  if (props.task.completed && isRepeatable.value) {
    return 'bg-emerald-500 border-emerald-500 text-white';
  }
  if (isRepeatable.value) {
    return 'border-amber-500/50 bg-amber-500/10';
  }
  if (isEmptyJoker.value) {
    return 'border-slate-600 opacity-50 cursor-not-allowed';
  }
  return 'border-slate-500 hover:border-amber-400 hover:scale-110';
});
</script>

<template>
  <button
    @click="emit('toggle')"
    :disabled="toggleDisabled"
    class="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 select-none"
    :class="[toggleCursorClass, buttonStateClass]"
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
