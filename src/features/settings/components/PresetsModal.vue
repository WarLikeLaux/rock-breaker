<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/features/game/store';
import { fetchPresets, loadPreset, type PresetMeta } from '../services/presets';

const { importData } = useGameStore();

const emit = defineEmits<{
  close: [];
  back: [];
}>();

const presets = ref<PresetMeta[]>([]);
const presetsLoaded = ref<boolean>(false);
const presetConfirmId = ref<string | null>(null);
const presetLoading = ref<boolean>(false);
const presetError = ref<string>('');

onMounted(async () => {
  try {
    presets.value = await fetchPresets();
  } catch {
    presets.value = [];
  } finally {
    presetsLoaded.value = true;
  }
});

async function handleLoadPreset(preset: PresetMeta): Promise<void> {
  if (presetConfirmId.value !== preset.id) {
    presetConfirmId.value = preset.id;
    setTimeout(() => {
      if (presetConfirmId.value === preset.id) {
        presetConfirmId.value = null;
      }
    }, 3000);
    return;
  }

  presetLoading.value = true;
  presetError.value = '';
  try {
    const jsonString = await loadPreset(preset.file);
    if (!jsonString) {
      presetError.value = 'Не удалось загрузить пресет';
      return;
    }

    if (!importData(jsonString)) {
      presetError.value = 'Ошибка импорта пресета';
      return;
    }
    emit('close');
  } catch (error) {
    console.error('Ошибка загрузки пресета:', error);
    presetError.value = 'Произошла непредвиденная ошибка при загрузке';
  } finally {
    presetLoading.value = false;
    presetConfirmId.value = null;
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
    @click.self="emit('close')">
    <div class="w-full max-w-sm bg-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button @click="emit('back')"
            class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h3 class="text-lg font-bold text-white">📦 Пресеты</h3>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-2xl">×</button>
      </div>

      <div v-if="!presetsLoaded" class="text-sm text-slate-500 text-center py-4">
        Загрузка...
      </div>

      <div v-else-if="presets.length === 0" class="text-sm text-slate-500 text-center py-4">
        Нет доступных пресетов
      </div>

      <div v-else class="space-y-2">
        <div v-for="preset in presets" :key="preset.id"
          class="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white truncate">{{ preset.name }}</p>
            <p class="text-xs text-slate-400">{{ preset.description }}</p>
          </div>
          <button @click="handleLoadPreset(preset)" :disabled="presetLoading"
            class="px-3 py-1 rounded text-xs transition-colors ml-2" :class="presetConfirmId === preset.id
              ? 'bg-red-600 text-white'
              : 'bg-slate-600 hover:bg-slate-500 text-white'
              ">
            {{ presetConfirmId === preset.id ? '⚠️ Перезаписать?' : 'Загрузить' }}
          </button>
        </div>
      </div>

      <p v-if="presetError" class="text-red-400 text-xs text-center animate-pulse">{{ presetError }}</p>
    </div>
  </div>
</template>
