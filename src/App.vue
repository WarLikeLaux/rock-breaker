<script setup>
import { useGameStore } from './composables/useGameStore'
import SetupView from './views/SetupView.vue'
import ArenaView from './views/ArenaView.vue'
import VictoryView from './views/VictoryView.vue'

const { isSetupComplete, isVictory } = useGameStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <SetupView v-if="!isSetupComplete" />
    <VictoryView v-else-if="isVictory" />
    <ArenaView v-else />
  </div>
</template>
