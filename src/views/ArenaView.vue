<script setup>
import { ref } from 'vue'
import RockDisplay from '../components/RockDisplay.vue'
import TaskList from '../components/TaskList.vue'
import SettingsPanel from '../components/SettingsPanel.vue'

const showSettings = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col p-6 max-w-md mx-auto relative">
    <button
      @click="showSettings = true"
      class="absolute top-4 right-4 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
    >
      ⚙️
    </button>

    <div class="pt-8 pb-12">
      <RockDisplay />
    </div>

    <div class="flex-1">
      <TaskList />
    </div>

    <SettingsPanel v-if="showSettings" @close="showSettings = false" />
  </div>
</template>
