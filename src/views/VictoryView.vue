<script setup>
import { ref } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { goalName, resetGame, restartRock } = useGameStore()

const newGoalName = ref(goalName.value)
const newDays = ref(30)

function handleNewRock() {
  resetGame()
}

function handleRestartRock() {
  restartRock(newGoalName.value.trim() || goalName.value, newDays.value)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="text-center max-w-md w-full">
      <div class="text-8xl mb-6 animate-bounce">🎉</div>

      <h1 class="text-4xl font-bold text-white mb-4">
        Скала разрушена!
      </h1>

      <p class="text-xl text-amber-400 mb-2">{{ goalName }}</p>

      <p class="text-slate-400 mb-8">
        Ты сделал это! Маленькие шаги привели к большой победе.
      </p>

      <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6 text-left">
        <h3 class="text-sm font-medium text-slate-300 mb-3">Повторить с теми же задачами:</h3>

        <div class="space-y-3">
          <input
            v-model="newGoalName"
            type="text"
            placeholder="Новое название (или оставить)"
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />

          <div class="flex items-center gap-3">
            <input
              v-model.number="newDays"
              type="number"
              min="1"
              max="365"
              class="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
            <span class="text-slate-400 text-sm">дней ({{ newDays * 5 }} HP)</span>
          </div>

          <button
            @click="handleRestartRock"
            class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all text-sm"
          >
            🔄 Повторить скалу
          </button>
        </div>
      </div>

      <button
        @click="handleNewRock"
        class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Найти новую скалу 🪨
      </button>
    </div>
  </div>
</template>
