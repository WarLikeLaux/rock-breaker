<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { useGameStore } from '@/features/game/store';
import RockDisplay from '@/features/game/components/RockDisplay.vue';
import TaskList from '@/features/tasks/components/TaskList.vue';
import SettingsPanel from '@/features/settings/components/SettingsPanel.vue';
import SideQuestCard from '@/features/game/components/SideQuestCard.vue';
import SideQuestMenu from '@/features/game/components/SideQuestMenu.vue';
import CreateSideQuestModal from '@/features/game/components/CreateSideQuestModal.vue';

const gameStore = useGameStore();
const {
  sideRocks,
  activeRockId,
  canAccessSideQuests,
  mainRock,
  activeRock,
  switchRock,
  createSideQuest,
  promoteSideQuestToMain,
  deleteRock,
  focusModeEnabled,
} = gameStore;

const showSettings = ref<boolean>(false);
const showCreateModal = ref<boolean>(false);
const rockDisplayRef = ref<InstanceType<typeof RockDisplay> | null>(null);

function triggerVisualHit(): void {
  rockDisplayRef.value?.triggerVisualHit();
}

function triggerVisualHeal(): void {
  rockDisplayRef.value?.triggerVisualHeal();
}

gameStore.triggerVisualHit = triggerVisualHit;
gameStore.triggerVisualHeal = triggerVisualHeal;

onBeforeUnmount(() => {
  gameStore.triggerVisualHit = undefined;
  gameStore.triggerVisualHeal = undefined;
});

const isViewingSideQuest = computed(() => {
  return activeRock.value && !activeRock.value.isMain;
});

const leftSideRocks = computed(() => {
  const rocks = sideRocks.value;
  const half = Math.ceil(rocks.length / 2);
  return rocks.slice(0, half);
});

const rightSideRocks = computed(() => {
  const rocks = sideRocks.value;
  const half = Math.ceil(rocks.length / 2);
  return rocks.slice(half);
});

function handleSwitchRock(rockId: number): void {
  switchRock(rockId);
}

function handleCreateSideQuest(name: string, days: number, tasks?: string[]): void {
  createSideQuest(name, days, tasks);
  showCreateModal.value = false;
}

function backToMain(): void {
  if (mainRock.value) {
    switchRock(mainRock.value.id);
  }
}

function handlePromoteSideQuest(): void {
  if (activeRock.value && !activeRock.value.isMain) {
    promoteSideQuestToMain(activeRock.value.id);
  }
}

const deleteConfirmId = ref<number | null>(null);

function handleDeleteSideQuest(): void {
  if (!activeRock.value || activeRock.value.isMain) return;

  if (deleteConfirmId.value === activeRock.value.id) {
    deleteRock(activeRock.value.id);
    if (mainRock.value) {
      switchRock(mainRock.value.id);
    }
    deleteConfirmId.value = null;
  } else {
    deleteConfirmId.value = activeRock.value.id;
    setTimeout(() => {
      deleteConfirmId.value = null;
    }, 3000);
  }
}
</script>

<template>
  <div class="arena-container min-h-screen flex relative overflow-hidden"
    :class="{ 'focus-mode-active': focusModeEnabled }">
    <div class="ambient-fog ambient-fog-left"></div>
    <div class="ambient-fog ambient-fog-right"></div>

    <div
      class="side-panel hidden lg:flex flex-1 flex-col gap-4 p-4 min-w-[200px] relative z-10 transition-all duration-700"
      :class="{ 'opacity-30 blur-[1px] pointer-events-none': focusModeEnabled }">
      <div class="flex items-center gap-2 mb-2 mt-[14px]">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        <p class="text-xs text-slate-500 uppercase tracking-widest font-medium">Сайд-квесты</p>
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      </div>

      <div class="quest-grid">
        <SideQuestCard v-for="rock in leftSideRocks" :key="rock.id" :rock="rock" :is-locked="!canAccessSideQuests"
          :is-active="activeRockId === rock.id" @select="handleSwitchRock" />
        <button @click="showCreateModal = true"
          class="add-quest-btn rounded-2xl border-2 border-dashed border-slate-700/60 hover:border-amber-500/50 text-slate-600/70 hover:text-amber-500 transition-all duration-300 text-3xl active:scale-95 hover:bg-slate-800/30 flex items-center justify-center">
          +
        </button>
      </div>
    </div>

    <div class="flex-shrink-0 w-full max-w-full sm:max-w-md flex flex-col relative z-20 mx-auto lg:mx-0">
      <div class="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 sm:gap-3"
        :class="{ 'hidden sm:flex': isViewingSideQuest }">
        <div class="flex gap-2 sm:gap-3">
          <SideQuestMenu v-if="!isViewingSideQuest" :side-rocks="sideRocks" :active-rock-id="activeRockId"
            :can-access="canAccessSideQuests" :main-rock="mainRock" @select="handleSwitchRock"
            @create-new="showCreateModal = true" />

          <a href="https://github.com/WarLikeLaux/rock-breaker" target="_blank"
            class="flex w-10 h-10 sm:w-11 sm:h-11 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 border border-slate-700 hover:border-slate-500"
            title="GitHub Repository">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>

          <button @click="showSettings = true"
            class="w-10 h-10 sm:w-11 sm:h-11 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 border border-slate-700 hover:border-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div v-if="isViewingSideQuest" class="hidden sm:flex gap-2 sm:gap-3">
          <VTooltip placement="bottom" :delay="{ show: 600, hide: 0 }">
            <button @click="handlePromoteSideQuest"
              class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur rounded-xl text-amber-400 hover:text-amber-300 transition-all border border-amber-500/30 hover:border-amber-500/50 text-sm uppercase">
              ⭐
            </button>
            <template #popper>
              <div class="text-sm">Сделать основной целью</div>
            </template>
          </VTooltip>

          <VTooltip placement="bottom" :delay="{ show: 600, hide: 0 }">
            <button @click="handleDeleteSideQuest"
              class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 backdrop-blur rounded-xl text-red-400 hover:text-red-300 transition-all border border-red-500/30 hover:border-red-500/50 text-sm uppercase"
              :class="{ 'bg-red-600/50 border-red-500': deleteConfirmId === activeRock?.id }">
              {{ deleteConfirmId === activeRock?.id ? 'Удалить?' : '🗑️' }}
            </button>
            <template #popper>
              <div class="text-sm">Удалить сайд-квест</div>
            </template>
          </VTooltip>
        </div>
      </div>

      <div class="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
        <div v-if="!isViewingSideQuest"
          class="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-2 items-center gap-2">
          <div class="h-px w-8 bg-gradient-to-r from-transparent to-slate-700"></div>
          <p class="text-xs text-slate-500 uppercase tracking-widest font-medium">Основной квест</p>
          <div class="h-px w-8 bg-gradient-to-r from-slate-700 to-transparent"></div>
        </div>
        <div v-else class="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-2 items-center gap-2">
          <div class="h-px w-8 bg-gradient-to-r from-transparent to-slate-700"></div>
          <p class="text-xs text-slate-500 uppercase tracking-widest font-medium">Сайд-квест</p>
          <div class="h-px w-8 bg-gradient-to-r from-slate-700 to-transparent"></div>
        </div>
        <div v-if="isViewingSideQuest" class="hidden sm:flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full">
          <button @click="backToMain"
            class="flex items-center gap-2 px-2.5 py-2 sm:px-3 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500 text-xs sm:text-sm uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span class="hidden sm:inline">К главной</span>
          </button>
        </div>
        <div class="hidden sm:block w-[140px]"></div>
      </div>

      <div v-if="isViewingSideQuest" class="sm:hidden absolute top-4 left-4 right-4 z-30 space-y-2">
        <div class="flex items-center justify-between">
          <button @click="backToMain"
            class="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <SideQuestMenu :side-rocks="sideRocks" :active-rock-id="activeRockId" :can-access="canAccessSideQuests"
              :main-rock="mainRock" @select="handleSwitchRock" @create-new="showCreateModal = true" />
            <button @click="showSettings = true"
              class="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2">
          <button @click="handlePromoteSideQuest"
            class="w-10 h-10 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur rounded-xl flex items-center justify-center text-amber-400 hover:text-amber-300 transition-all border border-amber-500/30 hover:border-amber-500/50">
            ⭐
          </button>
          <button @click="handleDeleteSideQuest"
            class="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 backdrop-blur rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-all border border-red-500/30 hover:border-red-500/50"
            :class="{ 'bg-red-600/50 border-red-500': deleteConfirmId === activeRock?.id }">
            🗑️
          </button>
        </div>
      </div>

      <div class="pt-20 pb-8 px-6 transition-all duration-700"
        :class="{ 'opacity-20 blur-sm scale-95 pointer-events-none': focusModeEnabled }">
        <RockDisplay ref="rockDisplayRef" />
      </div>

      <div class="flex-1 px-6 pb-8 transition-all duration-500" :class="{ 'pt-2': focusModeEnabled }">
        <TaskList />
      </div>
    </div>

    <div
      class="side-panel hidden lg:flex flex-1 flex-col gap-4 p-4 min-w-[200px] relative z-10 transition-all duration-700"
      :class="{ 'opacity-30 blur-[1px] pointer-events-none': focusModeEnabled }">
      <div class="flex items-center gap-2 mb-2 mt-[14px]">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        <p class="text-xs text-slate-500 uppercase tracking-widest font-medium">Сайд-квесты</p>
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      </div>

      <div class="quest-grid quest-grid-right">
        <SideQuestCard v-for="rock in rightSideRocks" :key="rock.id" :rock="rock" :is-locked="!canAccessSideQuests"
          :is-active="activeRockId === rock.id" @select="handleSwitchRock" />
        <button @click="showCreateModal = true"
          class="add-quest-btn rounded-2xl border-2 border-dashed border-slate-700/60 hover:border-amber-500/50 text-slate-600/70 hover:text-amber-500 transition-all duration-300 text-3xl active:scale-95 hover:bg-slate-800/30 flex items-center justify-center">
          +
        </button>
      </div>
    </div>

    <Transition name="fade">
      <SettingsPanel v-if="showSettings" @close="showSettings = false"
        @create-side-quest="showSettings = false; showCreateModal = true" />
    </Transition>

    <Transition name="fade">
      <CreateSideQuestModal v-if="showCreateModal" @close="showCreateModal = false" @create="handleCreateSideQuest" />
    </Transition>
  </div>
</template>

<style scoped>
.arena-container {
  background: radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%);
}

.ambient-fog {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30%;
  pointer-events: none;
  z-index: 1;
}

.ambient-fog-left {
  left: 0;
  background: linear-gradient(90deg,
      rgba(51, 65, 85, 0.4) 0%,
      rgba(51, 65, 85, 0.2) 30%,
      transparent 100%);
  animation: ambientPulse 10s ease-in-out infinite;
}

.ambient-fog-right {
  right: 0;
  background: linear-gradient(270deg,
      rgba(51, 65, 85, 0.4) 0%,
      rgba(51, 65, 85, 0.2) 30%,
      transparent 100%);
  animation: ambientPulse 10s ease-in-out infinite reverse;
}

@keyframes ambientPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

.side-panel {
  background: linear-gradient(180deg,
      rgba(15, 23, 42, 0.3) 0%,
      rgba(30, 41, 59, 0.2) 50%,
      rgba(15, 23, 42, 0.3) 100%);
}

.quest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.quest-grid>* {
  aspect-ratio: 1;
}

.quest-grid-right {
  justify-content: end;
  justify-items: stretch;
  direction: rtl;
}

.quest-grid-right>* {
  aspect-ratio: 1;
  direction: ltr;
}

.add-quest-btn {
  min-height: 160px;
}
</style>
