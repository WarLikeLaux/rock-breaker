<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { useGameStore } from '@/features/game/store';
import TaskItem from './TaskItem.vue';

const {
  tasks,
  visibleTasks,
  focusModeEnabled,
  canAddTask,
  addTask,
  removeTask,
  updateTask,
  toggleTask,
  setTaskType,
  setRequiredExecutions,
  decrementExecution,
  skipCurrentFocusTask,
  toggleFocusMode,
} = useGameStore();

const newTaskText = ref<string>('');
const taskInput = ref<HTMLInputElement | null>(null);

const placeholderText = computed(() => {
  const remaining = 5 - tasks.value.length;
  return `Добавить задачу (осталось ${remaining} слот${remaining === 1 ? '' : 'ов'})`;
});

function handleAddTask(): void {
  if (!newTaskText.value.trim()) return;
  addTask(newTaskText.value);
  newTaskText.value = '';

  nextTick(() => {
    if (canAddTask.value) {
      taskInput.value?.focus();
    }
  });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-white whitespace-nowrap">
        Экипировка ({{ tasks.length }}/5)
      </h3>

      <button @click="toggleFocusMode"
        class="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border"
        :class="focusModeEnabled
          ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20'
          : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'">
        <span class="w-1.5 h-1.5 rounded-full"
          :class="focusModeEnabled ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'"></span>
        Фокус-режим: {{ focusModeEnabled ? 'ВКЛ' : 'ВЫКЛ' }}
      </button>
    </div>

    <TransitionGroup name="list" tag="div" class="space-y-3">
      <TaskItem v-for="task in visibleTasks" :key="task.id" :task="task" @toggle="toggleTask" @update="updateTask"
        @remove="removeTask" @setType="setTaskType" @setRequiredExecutions="setRequiredExecutions"
        @decrementExecution="decrementExecution" />
    </TransitionGroup>

    <div v-if="focusModeEnabled && tasks.length > 0" class="flex flex-col items-center gap-4 mt-4">
      <div class="flex items-center gap-4 w-full">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
        <div class="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
          Выполнено: {{tasks.filter(t => t.completed).length}} из {{ tasks.length }}
        </div>
        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
      </div>

      <button v-if="tasks.filter(t => !t.completed).length > 1" @click="skipCurrentFocusTask"
        class="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] transition-all font-black uppercase tracking-wider border border-slate-700 hover:border-slate-500 shadow-lg active:scale-95">
        🎲 Другую задачу
      </button>
    </div>

    <div v-if="tasks.length === 0" class="text-center py-12">
      <div class="text-4xl mb-3">🔨</div>
      <p class="text-slate-400">Добавь задачи для удара по скале</p>
    </div>

    <div v-if="!canAddTask" class="mt-6 text-center">
      <p class="text-sm sm:text-base uppercase tracking-[0.2em] font-bold text-amber-500/90">
        ⚔️ Экипировка собрана. В бой!
      </p>
    </div>

    <form v-if="!focusModeEnabled || tasks.length === 0" v-show="canAddTask" @submit.prevent="handleAddTask"
      class="mt-6">
      <div class="flex gap-0 group/input">
        <input ref="taskInput" v-model="newTaskText" :disabled="!canAddTask" type="text" :placeholder="placeholderText"
          class="flex-1 px-5 py-4 bg-slate-800/40 border-2 border-r-0 border-slate-700/80 rounded-l-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base font-medium group-hover/input:border-slate-600/80 group-focus-within/input:bg-slate-800/60" />
        <button type="submit" :disabled="!canAddTask || !newTaskText.trim()"
          class="w-16 h-auto bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-3xl font-bold rounded-r-2xl transition-all active:scale-95 flex items-center justify-center border-2 border-transparent border-l-0 group-focus-within/input:from-amber-400 group-focus-within/input:to-orange-400 group-focus-within/input:border-amber-500/50">
          +
        </button>
      </div>
    </form>
  </div>
</template>
