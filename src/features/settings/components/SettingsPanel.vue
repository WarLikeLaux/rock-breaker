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
  sideRocks,
  deleteRock,
  promoteSideQuestToMain,
} = useGameStore();
const { soundEnabled, toggleSound } = useSounds();

const emit = defineEmits<{
  close: [];
  createSideQuest: [];
}>();

const showResetConfirm = ref<boolean>(false);
const showEditGoal = ref<boolean>(false);
const importError = ref<string>('');
const fileInput = ref<HTMLInputElement | null>(null);
const deleteConfirmId = ref<number | null>(null);

const editGoalName = ref<string>(goalName.value);
const editDays = ref<number>(durationDays.value);

function handleNewDay(): void {
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

  const text = await file.text();
  const success = importData(text);
  if (success) {
    importError.value = '';
    emit('close');
  } else {
    importError.value = 'Ошибка импорта. Проверьте файл.';
  }
  target.value = '';
}

function toggleEditGoal(): void {
  showEditGoal.value = !showEditGoal.value;
  if (showEditGoal.value) {
    editGoalName.value = goalName.value;
    editDays.value = durationDays.value;
  }
}

function saveGoalEdit(): void {
  updateRock(editGoalName.value.trim() || goalName.value, editDays.value);
  showEditGoal.value = false;
  emit('close');
}

function handleDeleteSideQuest(id: number): void {
  if (deleteConfirmId.value === id) {
    deleteRock(id);
    deleteConfirmId.value = null;
  } else {
    deleteConfirmId.value = id;
    setTimeout(() => {
      if (deleteConfirmId.value === id) {
        deleteConfirmId.value = null;
      }
    }, 3000);
  }
}

function handleCreateSideQuest(): void {
  emit('createSideQuest');
}

function handlePromoteSideQuest(id: number): void {
  promoteSideQuestToMain(id);
  emit('close');
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-sm bg-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white">Настройки</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-2xl">×</button>
      </div>

      <button
        @click="toggleEditGoal"
        class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
      >
        ✏️ Изменить активную цель
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
      <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleFileChange" />
      <p v-if="importError" class="text-red-400 text-sm text-center">{{ importError }}</p>

      <SettingsToggle
        label="Подсказки"
        icon="💡"
        :model-value="showTooltips"
        @update:model-value="toggleTooltips"
      />

      <SettingsToggle
        label="Звуки"
        icon="🔊"
        :model-value="soundEnabled"
        @update:model-value="toggleSound"
      />

      <hr class="border-slate-700" />

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-slate-300">Сайд-квесты</h4>
          <button
            @click="handleCreateSideQuest"
            class="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            + Добавить
          </button>
        </div>

        <div v-if="sideRocks.length === 0" class="text-sm text-slate-500 text-center py-2">
          Нет сайд-квестов
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="rock in sideRocks"
            :key="rock.id"
            class="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white truncate">{{ rock.goalName }}</p>
              <p class="text-xs text-slate-400">
                {{ rock.currentHp }}/{{ rock.durationDays * 5 }} HP
              </p>
            </div>
            <div class="flex items-center gap-2 ml-2">
              <VTooltip placement="top" :delay="{ show: 600, hide: 0 }">
                <button
                  @click="handlePromoteSideQuest(rock.id)"
                  class="px-2 py-1 rounded text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 transition-colors"
                >
                  ⭐
                </button>
                <template #popper>
                  <div class="text-sm">Сделать основной целью</div>
                </template>
              </VTooltip>
              <button
                @click="handleDeleteSideQuest(rock.id)"
                class="px-2 py-1 rounded text-xs transition-colors"
                :class="
                  deleteConfirmId === rock.id
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-red-400'
                "
              >
                {{ deleteConfirmId === rock.id ? 'Удалить?' : '🗑️' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr class="border-slate-700" />

      <button
        @click="handleReset"
        class="w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        :class="
          showResetConfirm
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        "
      >
        {{ showResetConfirm ? '⚠️ Точно сбросить?' : '🗑️ Сброс' }}
      </button>
    </div>
  </div>
</template>
