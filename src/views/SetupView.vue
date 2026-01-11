<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { createRock } = useGameStore()

const goalInput = ref('')
const daysInput = ref(30)

const calculatedHp = computed(() => daysInput.value * 5)

const isFormValid = computed(() => {
  return goalInput.value.trim().length > 0 && daysInput.value > 0
})

function handleSubmit() {
  if (!isFormValid.value) return
  createRock(goalInput.value.trim(), daysInput.value)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-12">
        <div class="text-6xl mb-4">🪨</div>
        <h1 class="text-3xl font-bold text-white mb-2">
          Какую скалу мы будем разбивать?
        </h1>
        <p class="text-slate-400">
          Превратим большую цель в ежедневные микро-победы
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="goal" class="block text-sm font-medium text-slate-300 mb-2">
            Моя цель
          </label>
          <input
            id="goal"
            v-model="goalInput"
            type="text"
            placeholder="Например: Запуск стартапа"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label for="days" class="block text-sm font-medium text-slate-300 mb-2">
            Срок (дней)
          </label>
          <input
            id="days"
            v-model.number="daysInput"
            type="number"
            min="1"
            max="365"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Здоровье скалы:</span>
            <span class="text-2xl font-bold text-amber-400">{{ calculatedHp }} HP</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            5 ударов в день × {{ daysInput }} дней
          </p>
        </div>

        <button
          type="submit"
          :disabled="!isFormValid"
          class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Создать скалу 🔨
        </button>
      </form>
    </div>
  </div>
</template>
