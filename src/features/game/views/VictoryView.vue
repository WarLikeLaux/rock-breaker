<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/features/game/store';
import { useSounds } from '@/shared/composables/useSounds';

const { goalName, durationDays, resetGame, restartRock } = useGameStore();
const { playVictory } = useSounds();

const newGoalName = ref<string>(goalName.value);
const newDays = ref<number>(durationDays.value);

onMounted(() => {
  playVictory();
});

function handleNewRock(): void {
  resetGame();
}

function handleRestartRock(): void {
  restartRock(newGoalName.value.trim() || goalName.value, newDays.value);
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center max-w-md w-full">
      <div class="relative mb-8">
        <div class="text-8xl animate-bounce-slow">🎉</div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-32 h-32 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>

      <h1 class="text-4xl font-bold text-white mb-4 animate-fade-in">Скала разрушена!</h1>

      <p class="text-2xl text-amber-400 mb-3 font-semibold">{{ goalName }}</p>

      <p class="text-slate-400 mb-10 text-lg">
        Ты сделал это! Маленькие шаги привели к большой победе.
      </p>

      <div
        class="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 mb-6 text-left backdrop-blur"
      >
        <h3 class="text-sm font-medium text-slate-300 mb-4">Повторить с теми же задачами:</h3>

        <div class="space-y-4">
          <input
            v-model="newGoalName"
            type="text"
            placeholder="Новое название (или оставить)"
            class="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />

          <div class="flex items-center gap-4">
            <input
              v-model.number="newDays"
              type="number"
              min="1"
              max="365"
              class="w-28 px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <span class="text-slate-400 flex-1">дней → {{ newDays * 5 }} HP</span>
          </div>

          <button
            @click="handleRestartRock"
            class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            🔄 Повторить скалу
          </button>
        </div>
      </div>

      <button
        @click="handleNewRock"
        class="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-lg font-bold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/25"
      >
        Найти новую скалу 🪨
      </button>
    </div>
  </div>
</template>
