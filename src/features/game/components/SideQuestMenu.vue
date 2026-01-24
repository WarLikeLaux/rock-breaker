<script setup lang="ts">
import { ref } from 'vue';
import type { Rock } from '@/shared/types';
import SideQuestCard from './SideQuestCard.vue';

interface Props {
  sideRocks: Rock[];
  activeRockId: number;
  canAccess: boolean;
  mainRock?: Rock;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [rockId: number];
  createNew: [];
}>();

const isOpen = ref(false);

function handleSelect(rockId: number): void {
  emit('select', rockId);
  isOpen.value = false;
}

function handleCreateNew(): void {
  emit('createNew');
  isOpen.value = false;
}

function selectMain(): void {
  if (props.mainRock) {
    emit('select', props.mainRock.id);
    isOpen.value = false;
  }
}
</script>

<template>
  <div class="lg:hidden">
    <button
      @click="isOpen = true"
      class="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-slate-700 hover:border-slate-500"
      :class="canAccess ? 'text-amber-400' : 'text-slate-400'"
    >
      <span class="text-base leading-none">{{ canAccess ? '🔓' : '🔒' }}</span>
    </button>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        @click="isOpen = false"
      ></div>
    </Transition>

    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Сайд-квесты</h3>
            <button
              @click="isOpen = false"
              class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="!canAccess" class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
            <p class="text-sm text-amber-400">
              Выполни все 5 задач главной скалы, чтобы разблокировать сайд-квесты
            </p>
          </div>

          <div v-if="mainRock" class="mb-4">
            <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Главная скала</p>
            <div
              @click="selectMain"
              class="p-3 rounded-xl bg-slate-800/80 border border-amber-500/50 cursor-pointer hover:bg-slate-800 transition-colors"
              :class="activeRockId === mainRock.id ? 'ring-2 ring-amber-500' : ''"
            >
              <p class="text-white font-medium truncate">{{ mainRock.goalName }}</p>
              <p class="text-xs text-slate-400 mt-1">
                {{ mainRock.tasks.filter((t) => t.completed).length }}/{{ mainRock.tasks.length }} задач
              </p>
            </div>
          </div>

          <div v-if="sideRocks.length > 0">
            <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Побочные квесты</p>
            <div class="space-y-2">
              <SideQuestCard
                v-for="rock in sideRocks"
                :key="rock.id"
                :rock="rock"
                :is-locked="!canAccess"
                :is-active="activeRockId === rock.id"
                @select="handleSelect"
              />
            </div>
          </div>

          <button
            @click="handleCreateNew"
            class="w-full mt-4 py-3 px-4 rounded-xl border-2 border-dashed border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Добавить сайд-квест
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
