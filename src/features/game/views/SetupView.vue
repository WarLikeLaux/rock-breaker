<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/features/game/store';
import { HP_PER_DAY } from '@/shared/constants/tasks';

const { createRock, importData } = useGameStore();

const MS_PER_DAY = 86400000;

const goalInput = ref<string>('');
const daysInput = ref<number>(30);
const tasksInput = ref<string[]>(['']);
const endDateInput = ref<string>('');
const importError = ref<string>('');
const fileInput = ref<HTMLInputElement | null>(null);

const calculatedHp = computed(() => daysInput.value * HP_PER_DAY);
const minEndDate = computed(() => {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return formatDate(minDate);
});

const isFormValid = computed(() => {
  return goalInput.value.trim().length > 0 && daysInput.value > 0;
});

function addTaskField(): void {
  if (tasksInput.value.length < 5) {
    tasksInput.value.push('');
  }
}

function removeTaskField(index: number): void {
  if (tasksInput.value.length > 1) {
    tasksInput.value.splice(index, 1);
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateDaysFromDate(dateValue: string): void {
  endDateInput.value = dateValue;
  if (!dateValue) return;
  const parts = dateValue.split('-').map((v) => Number(v));
  if (parts.length < 3) {
    daysInput.value = 0;
    return;
  }
  const year = parts[0] as number;
  const month = parts[1] as number;
  const day = parts[2] as number;
  if (!isFinite(year) || !isFinite(month) || !isFinite(day) ||
      month < 1 || month > 12 || day < 1 || day > 31) {
    daysInput.value = 0;
    return;
  }
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(year, month - 1, day);
  if (!isFinite(end.getTime())) {
    daysInput.value = 0;
    return;
  }
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
  if (diffDays > 0) {
    daysInput.value = diffDays;
  } else {
    daysInput.value = 0;
  }
}

watch(
  daysInput,
  (val) => {
    if (!val || val <= 0) return;
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + val);
    endDateInput.value = formatDate(target);
  },
  { immediate: true },
);

function handleSubmit(): void {
  if (!isFormValid.value) return;
  const tasks = tasksInput.value.filter((t) => t.trim()).map((t) => t.trim());
  createRock(goalInput.value.trim(), daysInput.value, tasks.length > 0 ? tasks : undefined);
}

function handleImportClick(): void {
  fileInput.value?.click();
}

async function handleFileChange(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const text = await file.text();
  const success = importData(text);
  if (success) {
    importError.value = '';
  } else {
    importError.value = 'Ошибка импорта. Проверьте файл.';
  }
  target.value = '';
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
    <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleFileChange" />

    <div class="w-full max-w-md">
      <p v-if="importError" class="text-red-400 text-sm text-center mb-4 animate-pulse">
        {{ importError }}
      </p>

      <div class="text-center mb-10">
        <div class="text-7xl mb-4 animate-float">🪨</div>
        <h1 class="text-3xl font-bold text-white mb-3">Какую скалу мы будем разбивать?</h1>
        <p class="text-slate-400 text-lg">Превратим большую цель в ежедневные микро-победы</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label for="goal" class="block text-sm font-medium text-slate-300 mb-2"> Моя цель </label>
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
          <p class="text-xs text-slate-500 mt-2">
            Дата рассчитается автоматически при выборе количества дней
          </p>
        </div>

        <div>
          <label for="end-date" class="block text-sm font-medium text-slate-300 mb-2">
            Дата завершения
          </label>
          <input
            id="end-date"
            :value="endDateInput"
            type="date"
            :min="minEndDate"
            @input="updateDaysFromDate(($event.target as HTMLInputElement).value)"
            class="w-full px-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-slate-500 mt-2">
            Количество дней рассчитается автоматически при выборе даты
          </p>
        </div>

        <div
          class="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20"
        >
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

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-slate-300">
              Задачи (опционально)
            </label>
            <button
              v-if="tasksInput.length < 5"
              type="button"
              @click="addTaskField"
              class="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              + Добавить задачу
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(_, index) in tasksInput"
              :key="index"
              class="flex gap-2 items-center"
            >
              <input
                v-model="tasksInput[index]"
                type="text"
                :placeholder="`Задача ${index + 1}`"
                class="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                v-if="tasksInput.length > 1"
                type="button"
                @click="removeTaskField(index)"
                class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-500">
            Можно добавить задачи сразу или позже. Максимум 5 задач.
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
