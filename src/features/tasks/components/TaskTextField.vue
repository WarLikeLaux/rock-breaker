<script setup lang="ts">
import { ref, nextTick, computed, onBeforeUnmount } from 'vue';
import type { Task } from '@/shared/types';

interface Props {
  task: Task;
  editing: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [id: number, text: string];
  toggle: [];
  'update:editing': [value: boolean];
}>();

const isEditing = computed(() => props.editing);
const editText = ref<string>('');
const inputRef = ref<HTMLInputElement | null>(null);
const isEmptyJoker = computed(() => props.task.type === 'joker' && !props.task.text);

let clickTimer: ReturnType<typeof setTimeout> | null = null;

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
      emit('toggle');
    }, 300);
  }
}

function startEdit(): void {
  editText.value = props.task.text;
  emit('update:editing', true);
  nextTick(() => inputRef.value?.focus());
}

function saveEdit(): void {
  const trimmed = editText.value.trim();
  if (props.task.type === 'joker' || trimmed) {
    emit('update', props.task.id, trimmed);
  }
  emit('update:editing', false);
}

function cancelEdit(): void {
  emit('update:editing', false);
}

onBeforeUnmount(() => {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
});
</script>

<template>
  <div class="flex-1 min-w-0">
    <input v-if="isEditing" ref="inputRef" v-model="editText" @blur="saveEdit" @keyup.enter="saveEdit"
      @keyup.escape="cancelEdit" :placeholder="task.type === 'joker' ? 'Что сделать сегодня?' : ''"
      class="w-full bg-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
    <div v-else class="flex flex-col justify-center">
      <span @click="handleClick()"
        class="block line-clamp-3 break-words select-none text-sm min-[401px]:text-base sm:text-lg transition-all duration-300"
        :class="[
          task.completed ? 'line-through text-slate-500 cursor-pointer' : 'text-white hover:text-amber-300 cursor-pointer',
          { 'text-slate-500 cursor-pointer': isEmptyJoker },
        ]">
        {{ task.text || 'Нажми чтобы добавить...' }}
      </span>
      <span v-if="task.type === 'substitute' && task.originalText" class="text-xs text-amber-500/70 truncate block">
        Завтра: {{ task.originalText }}
      </span>
    </div>
  </div>
</template>
