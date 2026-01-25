<script setup lang="ts">
import { computed } from 'vue';
import type { Rock } from '@/shared/types';

interface Props {
  rock: Rock;
  isLocked: boolean;
  isActive: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [rockId: number];
}>();

const maxHp = computed(() => props.rock.durationDays * 5);
const hpPercent = computed(() => (maxHp.value > 0 ? (props.rock.currentHp / maxHp.value) * 100 : 0));
const completedTasks = computed(() => props.rock.tasks.filter((t) => t.completed).length);
const totalTasks = computed(() => props.rock.tasks.length);

const rockEmoji = computed(() => {
  const percent = hpPercent.value;
  if (percent > 75) return '🪨';
  if (percent > 50) return '⛰️';
  if (percent > 25) return '🏔️';
  if (percent > 0) return '💥';
  return '✨';
});

const hpColor = computed(() => {
  const percent = hpPercent.value;
  if (percent > 75) return 'from-emerald-500 to-green-400';
  if (percent > 50) return 'from-amber-500 to-yellow-400';
  if (percent > 25) return 'from-orange-500 to-amber-400';
  return 'from-red-600 to-red-400';
});

const hpBarWidth = computed(() => `${hpPercent.value}%`);

function handleClick(): void {
  if (!props.isLocked) {
    emit('select', props.rock.id);
  }
}
</script>

<template>
  <div class="side-quest-card relative rounded-2xl border p-4 transition-all duration-500" :class="[
    isLocked
      ? 'bg-slate-900/50 border-slate-800 cursor-not-allowed'
      : 'bg-slate-800/90 border-slate-600 hover:border-amber-500/70 cursor-pointer',
    isActive && !isLocked ? 'ring-2 ring-amber-500 border-amber-500' : '',
  ]" @click="handleClick">
    <div v-if="isLocked" class="fog-overlay absolute inset-0 rounded-2xl overflow-hidden z-10 pointer-events-none">
      <div class="fog-layer fog-1"></div>
      <div class="fog-layer fog-2"></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-3xl drop-shadow-lg animate-pulse">🔒</span>
      </div>
    </div>

    <div :class="isLocked ? 'blur-[3px] grayscale opacity-40' : ''">
      <div class="flex flex-col items-center">
        <div class="text-4xl mb-2 transition-transform duration-300" :class="[
          hpPercent <= 25 && hpPercent > 0 ? 'animate-pulse' : '',
          !isLocked ? 'hover:scale-110' : '',
        ]">
          {{ rockEmoji }}
        </div>

        <p class="text-sm text-white font-medium line-clamp-2 break-words w-full text-center mb-2">
          {{ rock.goalName }}
        </p>

        <div class="flex items-center justify-center gap-1.5 text-sm mb-3">
          <span class="text-amber-400 font-bold">{{ rock.currentHp }}</span>
          <span class="text-slate-600">/</span>
          <span class="text-slate-500">{{ maxHp }}</span>
        </div>

        <div class="w-full relative">
          <div class="h-2.5 bg-slate-700/60 rounded-full overflow-hidden border border-slate-600/50">
            <div class="h-full bg-gradient-to-r transition-all duration-500 relative overflow-hidden" :class="hpColor"
              :style="{ width: hpBarWidth }">
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"></div>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-500 mt-2">
          {{ completedTasks }}/{{ totalTasks }} задач
        </p>
      </div>
    </div>

    <div v-if="!isLocked && isActive" class="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-xl -z-10 animate-glow">
    </div>
  </div>
</template>

<style scoped>
.side-quest-card {
  backdrop-filter: blur(8px);
}

.fog-overlay {
  background: linear-gradient(135deg,
      rgba(51, 65, 85, 0.9) 0%,
      rgba(30, 41, 59, 0.7) 50%,
      rgba(51, 65, 85, 0.9) 100%);
}

.fog-layer {
  position: absolute;
  inset: -50%;
  background: radial-gradient(ellipse at center, rgba(148, 163, 184, 0.3) 0%, transparent 70%);
}

.fog-1 {
  animation: fogDrift1 8s ease-in-out infinite;
}

.fog-2 {
  animation: fogDrift2 12s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes fogDrift1 {

  0%,
  100% {
    transform: translate(-10%, -10%) scale(1.2);
  }

  50% {
    transform: translate(10%, 10%) scale(1);
  }
}

@keyframes fogDrift2 {

  0%,
  100% {
    transform: translate(15%, -5%) scale(1);
  }

  50% {
    transform: translate(-15%, 5%) scale(1.3);
  }
}

@keyframes glow {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.8;
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
</style>
