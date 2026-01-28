<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { MAX_DAILY_EXECUTIONS } from '@/shared/constants/tasks';
import type { Task } from '@/shared/types';

interface Props {
  task: Task;
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [type: Task['type']];
  setExecutions: [count: number];
  close: [];
}>();

const wrapperRef = ref<HTMLDivElement | null>(null);
const openUp = ref(false);

watch(() => props.show, (isShowing) => {
  if (isShowing && wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    openUp.value = spaceBelow < 250;
  }
});

const menuPositionClass = computed(() =>
  openUp.value ? 'bottom-10' : 'top-10'
);

const maxDailyExecutions = MAX_DAILY_EXECUTIONS;

function handleClickOutside(e: MouseEvent): void {
  if (props.show && wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function selectType(type: Task['type']): void {
  emit('select', type);
}

function selectExecutions(count: number): void {
  emit('setExecutions', count);
}
</script>

<template>
  <div ref="wrapperRef">
    <Transition name="menu">
      <div
        v-if="show"
        class="absolute left-0 z-20 bg-slate-700 rounded-xl shadow-xl border border-slate-600 p-1 min-w-[180px]"
        :class="menuPositionClass"
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

      <div v-if="task.type !== 'joker'" class="mt-1 pt-1">
        <div class="px-3 mb-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider">Повторений в день</div>
        <div class="flex gap-1 p-2 bg-slate-800/50 rounded-lg">
          <button
            v-for="n in maxDailyExecutions"
            :key="n"
            @click="selectExecutions(n)"
            class="flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center min-h-[36px]"
            :class="[
              task.requiredExecutions === n
                ? 'bg-emerald-500 text-white'
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-700/50',
            ]"
          >
            {{ n }}x
          </button>
        </div>
      </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
