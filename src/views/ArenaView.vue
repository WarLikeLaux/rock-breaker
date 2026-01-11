<script setup>
import { ref } from 'vue'
import RockDisplay from '../components/RockDisplay.vue'
import TaskList from '../components/TaskList.vue'
import SettingsPanel from '../components/SettingsPanel.vue'

const showSettings = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col max-w-md mx-auto relative">
    <button
      @click="showSettings = true"
      class="absolute top-4 right-4 z-10 w-11 h-11 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 border border-slate-700"
    >
      ⚙️
    </button>

    <div class="pt-10 pb-8 px-6">
      <RockDisplay />
    </div>

    <div class="flex-1 px-6 pb-8">
      <TaskList />
    </div>

    <Transition name="fade">
      <SettingsPanel v-if="showSettings" @close="showSettings = false" />
    </Transition>
  </div>
</template>
