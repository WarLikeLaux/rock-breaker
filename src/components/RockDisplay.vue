<script setup>
import { computed } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { goalName, currentHp, maxHp, hpPercent } = useGameStore()

const hpColor = computed(() => {
  const percent = hpPercent.value
  if (percent > 75) return 'from-emerald-500 to-green-400'
  if (percent > 50) return 'from-amber-500 to-yellow-400'
  if (percent > 25) return 'from-orange-500 to-amber-400'
  return 'from-red-600 to-red-400'
})

const rockEmoji = computed(() => {
  const percent = hpPercent.value
  if (percent > 75) return '🪨'
  if (percent > 50) return '⛰️'
  if (percent > 25) return '🏔️'
  return '💥'
})
</script>

<template>
  <div class="text-center">
    <div class="text-6xl mb-4 transition-all duration-300">
      {{ rockEmoji }}
    </div>

    <h2 class="text-2xl font-bold text-white mb-2">{{ goalName }}</h2>

    <div class="flex items-center justify-center gap-3 mb-3">
      <span class="text-3xl font-bold text-amber-400">{{ currentHp }}</span>
      <span class="text-slate-500">/</span>
      <span class="text-xl text-slate-400">{{ maxHp }} HP</span>
    </div>

    <div class="w-full max-w-xs mx-auto h-4 bg-slate-700 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r transition-all duration-500 ease-out"
        :class="hpColor"
        :style="{ width: `${hpPercent}%` }"
      ></div>
    </div>
  </div>
</template>
