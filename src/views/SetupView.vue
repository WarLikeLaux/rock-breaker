<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { createRock, importData } = useGameStore()

const goalInput = ref('')
const daysInput = ref(30)
const importError = ref('')
const fileInput = ref(null)

const calculatedHp = computed(() => daysInput.value * 5)

const isFormValid = computed(() => {
  return goalInput.value.trim().length > 0 && daysInput.value > 0
})

function handleSubmit() {
  if (!isFormValid.value) return
  createRock(goalInput.value.trim(), daysInput.value)
}

function handleImportClick() {
  fileInput.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const text = await file.text()
  const success = importData(text)
  if (!success) {
    importError.value = 'Ошибка импорта. Проверьте файл.'
  }
  event.target.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative">
    <button
      @click="handleImportClick"
      class="absolute top-4 right-4 w-11 h-11 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 border border-slate-700"
      title="Импорт данных"
    >
      📥
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileChange"
    />

    <div class="w-full max-w-md">
      <p v-if="importError" class="text-red-400 text-sm text-center mb-4 animate-pulse">{{ importError }}</p>

      <div class="text-center mb-10">
        <div class="text-7xl mb-4 animate-float">🪨</div>
        <h1 class="text-3xl font-bold text-white mb-3">
          Какую скалу мы будем разбивать?
        </h1>
        <p class="text-slate-400 text-lg">
          Превратим большую цель в ежедневные микро-победы
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label for="goal" class="block text-sm font-medium text-slate-300 mb-2">
            Моя цель
          </label>
          <input
            id="goal"
            v-model="goalInput"
            type="text"
            placeholder="Например: Запуск стартапа"
            class="w-full px-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
            class="w-full px-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        <div class="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
          <div class="flex justify-between items-center">
            <span class="text-slate-300">Здоровье скалы:</span>
            <span class="text-3xl font-bold text-amber-400">{{ calculatedHp }} HP</span>
          </div>
          <div class="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-full"></div>
          </div>
          <p class="text-xs text-slate-500 mt-2">
            5 ударов в день × {{ daysInput }} дней = {{ calculatedHp }} ударов до победы
          </p>
        </div>

        <button
          type="submit"
          :disabled="!isFormValid"
          class="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-lg font-bold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
        >
          Создать скалу 🔨
        </button>
      </form>
    </div>
  </div>
</template>
