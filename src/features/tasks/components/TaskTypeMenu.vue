<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Task } from '@/shared/types';

interface Props {
  task: Task;
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [type: Task['type']];
  close: [];
}>();

const menuRef = ref<HTMLDivElement | null>(null);

function handleClickOutside(e: MouseEvent): void {
  if (props.show && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function selectType(type: Task['type']): void {
  emit('select', type);
}
</script>

<template>
  <Transition name="menu">
    <div
      v-if="show"
      ref="menuRef"
      class="absolute left-0 top-10 z-20 bg-slate-700 rounded-xl shadow-xl border border-slate-600 p-1 min-w-[140px]"
    >
      <button
        @click="selectType('standard')"
        class="flex items-center gap-2 px-3 py-2 hover:bg-slate-600 rounded-lg w-full text-left text-sm text-white"
        :class="{ 'bg-slate-600': task.type === 'standard' }"
      >
        ⛏️ Привычка
      </button>
      <button
        @click="selectType('joker')"
        class="flex items-center gap-2 px-3 py-2 hover:bg-slate-600 rounded-lg w-full text-left text-sm text-white"
        :class="{ 'bg-slate-600': task.type === 'joker' }"
      >
        🃏 Разовая
      </button>
      <button
        v-if="task.type === 'standard' && task.text"
        @click="selectType('substitute')"
        class="flex items-center gap-2 px-3 py-2 hover:bg-slate-600 rounded-lg w-full text-left text-sm text-white"
      >
        ⏳ На день
      </button>
    </div>
  </Transition>
</template>
