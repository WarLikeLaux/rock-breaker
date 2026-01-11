<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { goalName, currentHp, maxHp, hpPercent } = useGameStore()

const isShaking = ref(false)
const prevHp = ref(currentHp.value)

watch(currentHp, (newVal, oldVal) => {
  if (newVal < oldVal) {
    triggerShake()
  }
  prevHp.value = newVal
})

function triggerShake() {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 300)
}

const hpColor = computed(() => {
  const percent = hpPercent.value
  if (percent > 75) return 'from-emerald-500 to-green-400'
  if (percent > 50) return 'from-amber-500 to-yellow-400'
  if (percent > 25) return 'from-orange-500 to-amber-400'
  return 'from-red-600 to-red-400'
})

const rockState = computed(() => {
  const percent = hpPercent.value
  if (percent > 75) return { emoji: '🪨', scale: 'scale-100', label: 'Непокоренная' }
  if (percent > 50) return { emoji: '⛰️', scale: 'scale-95', label: 'Треснула' }
  if (percent > 25) return { emoji: '🏔️', scale: 'scale-90', label: 'Крошится' }
  if (percent > 0) return { emoji: '💥', scale: 'scale-85', label: 'Почти всё!' }
  return { emoji: '✨', scale: 'scale-75', label: 'Разрушена!' }
})
</script>

<template>
  <div class="text-center" :class="{ 'animate-shake': isShaking }">
    <div
      class="text-7xl mb-2 transition-all duration-500"
      :class="[rockState.scale, { 'animate-pulse': hpPercent <= 25 && hpPercent > 0 }]"
    >
      {{ rockState.emoji }}
    </div>

    <p class="text-xs text-slate-500 uppercase tracking-wider mb-3">{{ rockState.label }}</p>

    <h2 class="text-2xl font-bold text-white mb-3">{{ goalName }}</h2>

    <div class="flex items-center justify-center gap-2 mb-4">
      <span
        class="text-4xl font-bold transition-all duration-300"
        :class="hpPercent > 25 ? 'text-amber-400' : 'text-red-400'"
      >
        {{ currentHp }}
      </span>
      <span class="text-slate-600">/</span>
      <span class="text-lg text-slate-500">{{ maxHp }} HP</span>
    </div>

    <div class="relative w-full max-w-xs mx-auto">
      <div class="h-5 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur border border-slate-600">
        <div
          class="h-full bg-gradient-to-r transition-all duration-700 ease-out relative overflow-hidden"
          :class="hpColor"
          :style="{ width: `${hpPercent}%` }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
        </div>
      </div>
      <div class="absolute -top-1 -bottom-1 -left-1 -right-1 rounded-full pointer-events-none"
           :class="{ 'animate-glow': isShaking }"></div>
    </div>
  </div>
</template>
