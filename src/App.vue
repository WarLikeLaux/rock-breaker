<script setup>
import { useGameStore } from './composables/useGameStore'
import SetupView from './views/SetupView.vue'

const { isSetupComplete, goalName, currentHp } = useGameStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <SetupView v-if="!isSetupComplete" />

    <div v-else class="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 class="text-4xl font-bold text-white mb-4">🪨 {{ goalName }}</h1>
      <p class="text-2xl text-amber-400">HP: {{ currentHp }}</p>
      <p class="text-slate-400 mt-8">Арена будет в итерации 2</p>
    </div>
  </div>
</template>
