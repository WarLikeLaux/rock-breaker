<script setup>
import RockDisplay from '../components/RockDisplay.vue'
import TaskList from '../components/TaskList.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col p-6 max-w-md mx-auto">
    <div class="pt-8 pb-12">
      <RockDisplay />
    </div>

    <div class="flex-1">
      <TaskList />
    </div>
  </div>
</template>
