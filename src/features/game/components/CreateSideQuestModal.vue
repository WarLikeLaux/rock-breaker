<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const emit = defineEmits<{
  close: [];
  create: [name: string, days: number, tasks?: string[]];
}>();

const goalInput = ref<string>('');
const daysInput = ref<number>(30);
const tasksInput = ref<string[]>(['']);
const endDateInput = ref<string>('');

const calculatedHp = computed(() => daysInput.value * 5);
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
  if (parts.length < 3) return;
  const year = parts[0] as number;
  const month = parts[1] as number;
  const day = parts[2] as number;
  if (!isFinite(year) || !isFinite(month) || !isFinite(day)) return;
  const today = new Date();
  const startUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const endUtc = Date.UTC(year, month - 1, day);
  const diffDays = Math.round((endUtc - startUtc) / 86400000);
  if (diffDays > 0) {
    daysInput.value = diffDays;
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
  emit('create', goalInput.value.trim(), daysInput.value, tasks.length > 0 ? tasks : undefined);
  goalInput.value = '';
  daysInput.value = 30;
  tasksInput.value = [''];
  endDateInput.value = '';
}

function handleClose(): void {
  emit('close');
  goalInput.value = '';
  daysInput.value = 30;
  tasksInput.value = [''];
  endDateInput.value = '';
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="handleClose"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      class="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6"
    >
      <button
        @click="handleClose"
        aria-label="Закрыть диалог"
        class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
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

      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🗻</div>
        <h2 id="modal-title" class="text-xl font-bold text-white">Новый сайд-квест</h2>
        <p id="modal-desc" class="text-slate-400 text-sm mt-1">Побочная цель для баланса</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="side-goal" class="block text-sm font-medium text-slate-300 mb-2">
            Название цели
          </label>
          <input
            id="side-goal"
            v-model="goalInput"
            type="text"
            placeholder="Например: Читать книги"
            class="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label for="side-days" class="block text-sm font-medium text-slate-300 mb-2">
            Срок (дней)
          </label>
          <input
            id="side-days"
            v-model.number="daysInput"
            type="number"
            min="1"
            max="365"
            class="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-slate-500 mt-2">
            Дата рассчитается автоматически при выборе количества дней
          </p>
        </div>

        <div>
          <label for="side-end-date" class="block text-sm font-medium text-slate-300 mb-2">
            Дата завершения
          </label>
          <input
            id="side-end-date"
            :value="endDateInput"
            type="date"
            :min="minEndDate"
            @input="updateDaysFromDate(($event.target as HTMLInputElement).value)"
            class="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <p class="text-xs text-slate-500 mt-2">
            Количество дней рассчитается автоматически при выборе даты
          </p>
        </div>

        <div
          class="bg-gradient-to-r from-slate-500/10 to-slate-400/10 rounded-xl p-4 border border-slate-600/30"
        >
          <div class="flex justify-between items-center">
            <span class="text-slate-400 text-sm">Здоровье скалы:</span>
            <span class="text-xl font-bold text-slate-300">{{ calculatedHp }} HP</span>
          </div>
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
                class="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                v-if="tasksInput.length > 1"
                type="button"
                @click="removeTaskField(index)"
                class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
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

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="handleClose"
            class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
