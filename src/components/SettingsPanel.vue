<script setup>
import { ref } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { goalName, durationDays, startNewDay, resetGame, exportData, importData, updateRock, showTooltips, toggleTooltips } = useGameStore()

const emit = defineEmits(['close'])

const showResetConfirm = ref(false)
const showEditGoal = ref(false)
const importError = ref('')
const fileInput = ref(null)

const editGoalName = ref(goalName.value)
const editDays = ref(durationDays.value)

function handleNewDay() {
  startNewDay()
  emit('close')
}

function handleReset() {
  if (!showResetConfirm.value) {
    showResetConfirm.value = true
    return
  }
  resetGame()
  emit('close')
}

function handleExport() {
  exportData()
}

function handleImportClick() {
  fileInput.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const text = await file.text()
  const success = importData(text)
  if (success) {
    importError.value = ''
    emit('close')
  } else {
    importError.value = 'Ошибка импорта. Проверьте файл.'
  }
  event.target.value = ''
}

function toggleEditGoal() {
  showEditGoal.value = !showEditGoal.value
  if (showEditGoal.value) {
    editGoalName.value = goalName.value
    editDays.value = durationDays.value
  }
}

function saveGoalEdit() {
  updateRock(editGoalName.value.trim() || goalName.value, editDays.value)
  showEditGoal.value = false
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-sm bg-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white">Настройки</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-2xl">
          ×
        </button>
      </div>

      <button
        @click="toggleEditGoal"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
      >
        ✏️ Изменить цель
      </button>

      <div v-if="showEditGoal" class="bg-slate-700/50 rounded-xl p-4 space-y-3">
        <input
          v-model="editGoalName"
          type="text"
          placeholder="Название цели"
          class="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
        <div class="flex items-center gap-3">
          <input
            v-model.number="editDays"
            type="number"
            min="1"
            max="365"
            class="w-24 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <span class="text-slate-400 text-sm flex-1">дней (удары сохранятся)</span>
        </div>
        <button
          @click="saveGoalEdit"
          class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white font-medium rounded-lg transition-all text-sm"
        >
          Сохранить
        </button>
      </div>

      <button
        @click="handleNewDay"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
      >
        🌅 Новый день
      </button>

      <button
        @click="handleExport"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
      >
        📤 Экспорт
      </button>

      <button
        @click="handleImportClick"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
      >
        📥 Импорт
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleFileChange"
      />
      <p v-if="importError" class="text-red-400 text-sm text-center">{{ importError }}</p>

      <label class="flex items-center justify-between py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl cursor-pointer transition-all">
        <span class="text-white flex items-center gap-2">💡 Подсказки</span>
        <div class="relative">
          <input
            type="checkbox"
            :checked="showTooltips"
            @change="toggleTooltips"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </div>
      </label>

      <hr class="border-slate-700" />

      <button
        @click="handleReset"
        class="w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        :class="showResetConfirm ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'"
      >
        {{ showResetConfirm ? '⚠️ Точно сбросить?' : '🗑️ Сброс' }}
      </button>
    </div>
  </div>
</template>
