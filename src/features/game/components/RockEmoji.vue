<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  rockEmoji: string;
  rockScale: string;
  hpPercent: number;
  isWobbling: boolean;
  isHealing: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  click: [];
  'phrase-show': [text: string];
}>();

const showPhrase = ref<boolean>(false);
const currentPhrase = ref<string>('');
let phraseTimer: ReturnType<typeof setTimeout> | null = null;

function handleClick(): void {
  emit('click');
}

function showPhraseWithText(text: string): void {
  if (phraseTimer) {
    clearTimeout(phraseTimer);
  }
  currentPhrase.value = text;
  showPhrase.value = true;
  phraseTimer = setTimeout(() => {
    showPhrase.value = false;
    phraseTimer = null;
  }, 2000);
}

defineExpose({ showPhraseWithText });
</script>

<template>
  <div class="relative inline-block">
    <div
      @click="handleClick"
      class="text-7xl mb-2 transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95 select-none"
      :class="[
        rockScale,
        {
          'animate-pulse': hpPercent <= 25 && hpPercent > 0,
          'animate-wobble': isWobbling,
          'animate-heal': isHealing,
        },
      ]"
    >
      {{ rockEmoji }}
    </div>

    <Transition name="phrase">
      <div
        v-if="showPhrase"
        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg border border-slate-600"
      >
        {{ currentPhrase }}
      </div>
    </Transition>
  </div>
</template>
