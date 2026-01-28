<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';

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
const phrasePosition = ref<'left' | 'right'>('right');
let phraseTimer: ReturnType<typeof setTimeout> | null = null;

const phraseClasses = computed(() => {
  const baseClasses = 'phrase-bubble absolute top-1/2 -translate-y-1/2 text-amber-100 text-sm px-4 py-2.5 rounded-lg shadow-lg border border-amber-500/60 whitespace-nowrap font-bold backdrop-blur-sm bg-gradient-to-r from-amber-600/30 to-amber-500/20';
  if (phrasePosition.value === 'right') {
    return `${baseClasses} left-full ml-4`;
  } else {
    return `${baseClasses} right-full mr-4`;
  }
});

function handleClick(): void {
  emit('click');
}

function showPhraseWithText(text: string): void {
  if (phraseTimer) {
    clearTimeout(phraseTimer);
  }
  phrasePosition.value = Math.random() > 0.5 ? 'right' : 'left';
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
