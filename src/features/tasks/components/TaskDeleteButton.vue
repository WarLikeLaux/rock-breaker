<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

const emit = defineEmits<{
  remove: [];
}>();

const deleteConfirm = ref<boolean>(false);
let confirmTimeout: ReturnType<typeof setTimeout> | null = null;

function handleClick(): void {
  if (deleteConfirm.value) {
    if (confirmTimeout) {
      clearTimeout(confirmTimeout);
      confirmTimeout = null;
    }
    emit('remove');
  } else {
    if (confirmTimeout) {
      clearTimeout(confirmTimeout);
    }
    deleteConfirm.value = true;
    confirmTimeout = setTimeout(() => {
      deleteConfirm.value = false;
      confirmTimeout = null;
    }, 2000);
  }
}

onBeforeUnmount(() => {
  if (confirmTimeout) {
    clearTimeout(confirmTimeout);
    confirmTimeout = null;
  }
});
</script>

<template>
  <div class="relative w-6 h-6 flex-shrink-0">
    <Transition name="fade">
      <button
        v-if="deleteConfirm"
        @click="handleClick"
        class="absolute inset-0 w-full h-full rounded-md flex items-center justify-center bg-red-500 text-white hover:bg-red-600 scale-110 z-10 shadow-sm"
      >
        🗑️
      </button>
    </Transition>
    <button
      v-show="!deleteConfirm"
      @click="handleClick"
      class="absolute inset-0 w-full h-full rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-rose-500/50 bg-slate-900/30 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.25)] hover:text-rose-300 hover:bg-slate-900/60 cursor-pointer"
    >
      <svg
        class="w-3.5 h-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <path d="M5 5l6 6M11 5l-6 6" />
      </svg>
    </button>
  </div>
</template>
