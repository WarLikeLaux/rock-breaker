<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  goalName: string;
  currentHp: number;
  maxHp: number;
  hpPercent: number;
  createdAt: string;
}

const props = defineProps<Props>();

const daysWorkedOn = computed(() => {
  const today = new Date();
  const created = new Date(props.createdAt);
  const diffTime = today.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
});

const dayForm = computed(() => {
  const n = daysWorkedOn.value;
  const remainder = n % 10;
  const remainder100 = n % 100;

  if (remainder100 >= 11 && remainder100 <= 14) return 'дней';
  if (remainder === 1) return 'день';
  if (remainder >= 2 && remainder <= 4) return 'дня';
  return 'дней';
});

const hpColor = computed(() => {
  const percent = props.hpPercent;
  if (percent > 75) return 'from-emerald-500 to-green-400';
  if (percent > 50) return 'from-amber-500 to-yellow-400';
  if (percent > 25) return 'from-orange-500 to-amber-400';
  return 'from-red-600 to-red-400';
});

const rockState = computed(() => {
  const percent = props.hpPercent;
  if (percent > 75) return 'Непокоренная';
  if (percent > 50) return 'Треснула';
  if (percent > 25) return 'Крошится';
  if (percent > 0) return 'Почти всё!';
  return 'Разрушена!';
});

const hpBarWidth = computed(() => `${props.hpPercent}%`);
</script>


<template>
  <div class="text-center select-none">
    <p class="text-xs text-slate-500 uppercase tracking-wider mb-3">{{ rockState }}</p>

    <h2 class="text-2xl font-bold text-white mb-3">{{ goalName }}</h2>

    <div class="flex items-center justify-center gap-2 mb-4">
      <span class="text-4xl font-bold transition-all duration-300"
        :class="hpPercent > 25 ? 'text-amber-400' : 'text-red-400'">
        {{ currentHp }}
      </span>
      <span class="text-slate-600">/</span>
      <span class="text-lg text-slate-500">{{ maxHp }} HP</span>
    </div>

    <div class="relative w-full max-w-xs mx-auto">
      <div class="h-5 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur border border-slate-600">
        <div class="h-full bg-gradient-to-r transition-all duration-700 ease-out relative overflow-hidden"
          :class="hpColor" :style="{ width: hpBarWidth }">
          <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
        </div>
      </div>
    </div>

    <p class="text-xs text-slate-500 mt-4">
      Ты работаешь над этим {{ daysWorkedOn }} {{ dayForm }}
    </p>
  </div>
</template>
