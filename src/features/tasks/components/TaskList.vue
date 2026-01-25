<script setup lang="ts">
import { ref, nextTick } from 'vue';
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
} = useGameStore();

const newTaskText = ref<string>('');
const taskInput = ref<HTMLInputElement | null>(null);

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
      <h3 class="text-lg font-bold text-white">
        Орудия
      </h3>
      <div v-if="!focusModeEnabled" class="text-slate-500 font-normal text-sm ml-2">{{ tasks.length }}/5</div>
      <div v-else class="text-amber-500 font-normal text-sm ml-2 flex items-center gap-2">
        <button v-if="tasks.filter(t => !t.completed).length > 1" @click="skipCurrentFocusTask"
          class="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors font-bold">
          🎲 ДРУГУЮ
        </button>
        <span class="font-bold">ФОКУС-РЕЖИМ</span>
      </div>
    </div>

    <TransitionGroup name="list" tag="div" class="space-y-3">
      <TaskItem v-for="task in visibleTasks" :key="task.id" :task="task" @toggle="toggleTask" @update="updateTask"
        @remove="removeTask" @setType="setTaskType" @setRequiredExecutions="setRequiredExecutions"
        @decrementExecution="decrementExecution" />
    </TransitionGroup>

    <div v-if="focusModeEnabled && tasks.length > 0" class="text-center text-sm text-slate-400">
      Выполнено: {{tasks.filter(t => t.completed).length}} / {{ tasks.length }}
    </div>

    <div v-if="tasks.length === 0" class="text-center py-12">
      <div class="text-4xl mb-3">🔨</div>
      <p class="text-slate-400">Добавь задачи для удара по скале</p>
    </div>

    <form @submit.prevent="handleAddTask" class="mt-6">
      <div class="flex gap-3">
        <input ref="taskInput" v-model="newTaskText" :disabled="!canAddTask" type="text" placeholder="Новая задача..."
          class="flex-1 px-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base" />
        <button type="submit" :disabled="!canAddTask || !newTaskText.trim()"
          class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
          +
        </button>
      </div>
      <p v-if="!canAddTask" class="text-sm text-amber-500/80 mt-3 text-center">
        Максимум 5 задач - фокус важнее количества
      </p>
    </form>
  </div>
</template>
