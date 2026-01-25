<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/features/game/store';
import { useSounds } from '@/shared/composables/useSounds';
import RockEmoji from './RockEmoji.vue';
import RockStats from './RockStats.vue';

const { goalName, currentHp, maxHp, hpPercent, isVictory, activeRock } = useGameStore();
const createdAt = computed(() => activeRock.value?.createdAt ?? new Date().toISOString().split('T')[0]!);
const { playRockTap, playHit, playHeal, playVictory, playClick } = useSounds();

const isShaking = ref<boolean>(false);
const isHealing = ref<boolean>(false);
const isWobbling = ref<boolean>(false);
const lastRock = ref(activeRock.value);
const rockEmojiRef = ref<InstanceType<typeof RockEmoji> | null>(null);

const lastPhrases: Record<'motivational' | 'funny' | 'sad', string> = {
  motivational: '',
  funny: '',
  sad: '',
};

const motivationalPhrases = [
  'Отлично!',
  'Так держать!',
  'Ещё один шаг!',
  'Ты молодец!',
  'Прогресс!',
  'Камень крошится!',
  'Победа близко!',
];

const funnyPhrases = [
  'Эй, больно!',
  'Не бей меня!',
  'Меня разрушит только рутина!',
  'Ай-ай-ай!',
  'Я крепче чем ты думаешь!',
  'Но я же не сделал ничего плохого...',
  'Давай договоримся?',
  'За что?!',
];

const sadPhrases = ['Эй, верни мой HP!', 'Ну ладно...', 'Я снова сильнее!', 'Спасибо!'];

const rockState = computed(() => {
  const percent = hpPercent.value;
  if (percent > 75) return { emoji: '🪨', scale: 'scale-100', label: 'Непокоренная' };
  if (percent > 50) return { emoji: '⛰️', scale: 'scale-95', label: 'Треснула' };
  if (percent > 25) return { emoji: '🏔️', scale: 'scale-90', label: 'Крошится' };
  if (percent > 0) return { emoji: '💥', scale: 'scale-85', label: 'Почти всё!' };
  return { emoji: '✨', scale: 'scale-75', label: 'Разрушена!' };
});

watch(currentHp, (newHp, oldHp) => {
  if (activeRock.value && lastRock.value && activeRock.value === lastRock.value) {
    const diff = (oldHp as number) - (newHp as number);
    if (diff === 1) {
      triggerShake();
      playHit();
      showPhraseWithText(getRandomPhrase(motivationalPhrases, 'motivational'));
    } else if (diff === -1) {
      triggerHeal();
      playHeal();
      showPhraseWithText(getRandomPhrase(sadPhrases, 'sad'));
    }
  }
  lastRock.value = activeRock.value;
});

watch(isVictory, (val) => {
  if (val) {
    playVictory();
  }
});

function triggerShake(): void {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 300);
}

function triggerVisualHit(): void {
  if (isShaking.value) return;
  triggerShake();
  playClick();
}

function triggerVisualHeal(): void {
  if (isHealing.value) return;
  triggerHeal();
  playClick();
}

defineExpose({ triggerVisualHit, triggerVisualHeal });

function triggerHeal(): void {
  isHealing.value = true;
  setTimeout(() => {
    isHealing.value = false;
  }, 500);
}

function getRandomPhrase(phrases: string[], category: keyof typeof lastPhrases): string {
  const available = phrases.filter((p) => p !== lastPhrases[category]);
  const phrase: string =
    available.length > 0 ? available[Math.floor(Math.random() * available.length)]! : phrases[0]!;
  lastPhrases[category] = phrase;
  return phrase;
}

function showPhraseWithText(text: string): void {
  rockEmojiRef.value?.showPhraseWithText(text);
}

function handleRockClick(): void {
  isWobbling.value = true;
  playRockTap();
  showPhraseWithText(getRandomPhrase(funnyPhrases, 'funny'));

  setTimeout(() => {
    isWobbling.value = false;
  }, 150);
}
</script>

<template>
  <div class="text-center select-none relative" :class="{ 'animate-shake': isShaking }">
    <div class="absolute -inset-8 rounded-full bg-amber-500/15 blur-2xl animate-pulse-slow -z-10"></div>
    <div class="absolute -inset-12 rounded-full bg-amber-600/10 blur-3xl animate-pulse-slower -z-10"></div>

    <RockEmoji ref="rockEmojiRef" :rock-emoji="rockState.emoji" :rock-scale="rockState.scale" :hp-percent="hpPercent"
      :is-wobbling="isWobbling" :is-healing="isHealing" @click="handleRockClick" />

    <RockStats :goal-name="goalName" :current-hp="currentHp" :max-hp="maxHp" :hp-percent="hpPercent"
      :created-at="createdAt" />
  </div>
</template>

<style scoped>
@keyframes pulse-slow {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes pulse-slower {

  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

.animate-pulse-slower {
  animation: pulse-slower 4s ease-in-out infinite;
}
</style>
