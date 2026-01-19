<script setup lang="ts">
import { useGameStore } from '@/features/game/store';
import SetupView from '@/features/game/views/SetupView.vue';
import ArenaView from '@/features/game/views/ArenaView.vue';
import VictoryView from '@/features/game/views/VictoryView.vue';

const { isSetupComplete, isVictory } = useGameStore();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 select-none">
    <SetupView v-if="!isSetupComplete" />
    <VictoryView v-else-if="isVictory" />
    <ArenaView v-else />
  </div>
</template>
