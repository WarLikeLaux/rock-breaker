<script setup lang="ts">
import { ref } from 'vue';
import SettingsToggle from '@/shared/components/SettingsToggle.vue';
import { useGameStore } from '@/features/game/store';
import { useSounds } from '@/shared/composables/useSounds';

const {
  goalName,
  durationDays,
  startNewDay,
  resetGame,
  exportData,
  importData,
  updateRock,
  mainRock,
  switchRock,
  showTooltips,
  toggleTooltips,
  hardModeEnabled,
  toggleHardMode,
  focusModeEnabled,
  toggleFocusMode,
  dayStartHour,
  setDayStartHour,
} = useGameStore();
const { soundEnabled, toggleSound } = useSounds();

const emit = defineEmits<{
  close: [];
  openHelp: [];
  openPresets: [];
}>();

const showNewDayConfirm = ref<boolean>(false);
const showResetConfirm = ref<boolean>(false);
const showEditGoal = ref<boolean>(false);
const importError = ref<string>('');
const fileInput = ref<HTMLInputElement | null>(null);

const editGoalName = ref<string>(goalName.value);
const editDays = ref<number>(durationDays.value);

function handleNewDay(): void {
  if (!showNewDayConfirm.value) {
    showNewDayConfirm.value = true;
    return;
  }
  startNewDay();
  if (mainRock.value) {
    switchRock(mainRock.value.id);
  }
  emit('close');
}

function handleReset(): void {
  if (!showResetConfirm.value) {
    showResetConfirm.value = true;
    return;
  }
  resetGame();
  emit('close');
}

function handleExport(): void {
  exportData();
}

function handleImportClick(): void {
  fileInput.value?.click();
}

async function handleFileChange(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const success = importData(text);
    if (success) {
      importError.value = '';
      emit('close');
    } else {
      importError.value = 'Ошибка импорта. Проверьте файл.';
    }
  } catch (error) {
    console.error('Ошибка чтения файла:', error);
    importError.value = 'Не удалось прочитать файл.';
  } finally {
    target.value = '';
  }
}

function toggleEditGoal(): void {
  showEditGoal.value = !showEditGoal.value;
  if (showEditGoal.value) {
    editGoalName.value = goalName.value;
    editDays.value = durationDays.value;
  }
}

function saveGoalEdit(): void {
  const sanitizedDays = Math.max(1, Math.min(365, Math.floor(Number(editDays.value) || 1)));
  updateRock(editGoalName.value.trim() || goalName.value, sanitizedDays);
  showEditGoal.value = false;
  emit('close');
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
    @click.self="emit('close')">
    <div class="w-full max-w-sm bg-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white">Настройки</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-2xl">×</button>
      </div>

      <button @click="toggleEditGoal"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2">
        ✏️ Изменить активную цель
      </button>

      <div v-if="showEditGoal" class="bg-slate-700/50 rounded-xl p-4 space-y-3">
        <input v-model="editGoalName" type="text" placeholder="Название цели"
          class="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
        <div class="flex items-center gap-3">
          <input v-model.number="editDays" type="number" min="1" max="365"
            class="w-24 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
          <span class="text-slate-400 text-sm flex-1">дней (удары сохранятся)</span>
        </div>
        <button @click="saveGoalEdit"
          class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white font-medium rounded-lg transition-all text-sm">
          Сохранить
        </button>
      </div>

      <button @click="handleNewDay" class="w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        :class="showNewDayConfirm
          ? 'bg-amber-600 hover:bg-amber-500 text-white'
          : 'bg-slate-700 hover:bg-slate-600 text-white'
          ">
        {{ showNewDayConfirm ? '⚠️ Точно начать новый день?' : '🌅 Новый день' }}
      </button>

      <div class="flex gap-2">
        <button @click="handleExport"
          class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2">
          📤 Экспорт
        </button>

        <button @click="handleImportClick"
          class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2">
          📥 Импорт
        </button>
      </div>
      <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleFileChange" />
      <p v-if="importError" class="text-red-400 text-sm text-center">{{ importError }}</p>

      <button @click="emit('openPresets')"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2">
        📦 Пресеты
      </button>

      <button @click="emit('openHelp')"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2">
        ❓ Справка
      </button>

      <SettingsToggle label="Подсказки" icon="💡" :model-value="showTooltips" @update:model-value="toggleTooltips" />

      <SettingsToggle label="Звуки" icon="🔊" :model-value="soundEnabled" @update:model-value="toggleSound" />

      <VTooltip placement="top" :delay="{ show: 600, hide: 0 }">
        <SettingsToggle label="Хардмод" icon="🔥" :model-value="hardModeEnabled" @update:model-value="toggleHardMode" />
        <template #popper>
          <div class="text-sm">Блокирует сайд-квесты до победы дня</div>
        </template>
      </VTooltip>

      <VTooltip placement="top" :delay="{ show: 600, hide: 0 }">
        <SettingsToggle label="Фокус-режим" icon="🎯" :model-value="focusModeEnabled"
          @update:model-value="toggleFocusMode" />
        <template #popper>
          <div class="text-sm">Показывает только одну задачу за раз</div>
        </template>
      </VTooltip>

      <VTooltip placement="top" :delay="{ show: 600, hide: 0 }">
        <div class="flex items-center justify-between bg-slate-700/50 rounded-xl px-4 py-3">
          <div class="flex items-center gap-2">
            <span>🕐</span>
            <span class="text-white text-sm">Начало дня</span>
          </div>
          <select
            :value="dayStartHour"
            @change="setDayStartHour(Number(($event.target as HTMLSelectElement).value))"
            class="bg-slate-600 text-white text-sm rounded-lg px-2 py-1 border border-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option v-for="h in 24" :key="h - 1" :value="h - 1">
              {{ String(h - 1).padStart(2, '0') }}:00
            </option>
          </select>
        </div>
        <template #popper>
          <div class="text-sm">Во сколько начинается новый день</div>
        </template>
      </VTooltip>

      <hr class="border-slate-700" />

      <button @click="handleReset" class="w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        :class="showResetConfirm
          ? 'bg-red-600 hover:bg-red-500 text-white'
          : 'bg-slate-700 hover:bg-slate-600 text-white'
          ">
        {{ showResetConfirm ? '⚠️ Точно сбросить?' : '🗑️ Сброс' }}
      </button>
    </div>
  </div>
</template>
