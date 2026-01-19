<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  remove: [];
}>();

const deleteConfirm = ref<boolean>(false);

function handleClick(): void {
  if (deleteConfirm.value) {
    emit('remove');
  } else {
    deleteConfirm.value = true;
    setTimeout(() => {
      deleteConfirm.value = false;
    }, 2000);
  }
}
</script>

<template>
  <div class="relative w-8 h-8 flex-shrink-0">
    <Transition name="fade">
      <button
        v-if="deleteConfirm"
        @click="handleClick"
        class="absolute inset-0 w-full h-full rounded-lg flex items-center justify-center bg-red-500 text-white hover:bg-red-600 scale-110 z-10 shadow-sm"
      >
        🗑️
      </button>
    </Transition>
    <button
      v-show="!deleteConfirm"
      @click="handleClick"
      class="absolute inset-0 w-full h-full rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
    >
      ✕
    </button>
  </div>
</template>
