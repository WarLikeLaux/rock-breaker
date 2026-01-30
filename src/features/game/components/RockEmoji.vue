<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

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

const phraseClasses = 'phrase-bubble absolute -top-10 left-1/2 -translate-x-1/2 z-10 text-amber-100 text-sm px-4 py-2.5 rounded-lg shadow-lg border border-amber-500/60 whitespace-nowrap font-bold backdrop-blur-sm bg-gradient-to-r from-amber-600/30 to-amber-500/20';

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

onBeforeUnmount(() => {
  if (phraseTimer) {
    clearTimeout(phraseTimer);
    phraseTimer = null;
  }
});

defineExpose({ showPhraseWithText });
</script>

<template>
  <div class="relative inline-block">
    <div @click="handleClick"
      class="text-7xl mb-2 transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95 select-none"
      :class="[
        rockScale,
        {
          'animate-pulse': hpPercent <= 25 && hpPercent > 0,
          'animate-wobble': isWobbling,
          'animate-heal': isHealing,
        },
      ]">
      {{ rockEmoji }}
    </div>

    <Transition name="phrase">
      <div v-if="showPhrase" :class="phraseClasses">
        {{ currentPhrase }}
      </div>
    </Transition>
  </div>
</template>
