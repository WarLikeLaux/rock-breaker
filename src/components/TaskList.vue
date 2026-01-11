<script setup>
import { ref } from 'vue'
import { useGameStore } from '../composables/useGameStore'
import TaskItem from './TaskItem.vue'

const { tasks, canAddTask, addTask, removeTask, updateTask, toggleTask } = useGameStore()

const newTaskText = ref('')

function handleAddTask() {
  if (!newTaskText.value.trim()) return
  addTask(newTaskText.value)
  newTaskText.value = ''
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">Орудия ({{ tasks.length }}/5)</h3>
    </div>

    <TransitionGroup name="list" tag="div" class="space-y-2">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="toggleTask"
        @update="updateTask"
        @remove="removeTask"
      />
    </TransitionGroup>

    <div v-if="tasks.length === 0" class="text-center py-8 text-slate-500">
      Добавь задачи для удара по скале
    </div>

    <form @submit.prevent="handleAddTask" class="mt-4">
      <div class="flex gap-2">
        <input
          v-model="newTaskText"
          :disabled="!canAddTask"
          type="text"
          placeholder="Новая задача..."
          class="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          type="submit"
          :disabled="!canAddTask || !newTaskText.trim()"
          class="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
        >
          +
        </button>
      </div>
      <p v-if="!canAddTask" class="text-sm text-amber-500 mt-2">
        Максимум 5 задач. Удали что-нибудь, чтобы добавить новое.
      </p>
    </form>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
