<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../composables/useGameStore'

const { showTooltips } = useGameStore()

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'update', 'remove', 'setType', 'substitute'])

const isEditing = ref(false)
const editText = ref('')
const inputRef = ref(null)
const isAnimating = ref(false)
const showTypeMenu = ref(false)
const menuRef = ref(null)

let clickTimer = null

const typeIcon = computed(() => {
  switch (props.task.type) {
    case 'joker':
      return '🃏'
    case 'substitute':
      return '⏳'
    default:
      return '⛏️'
  }
})

const borderClass = computed(() => {
  if (props.task.completed) return 'bg-emerald-900/20 border-emerald-800/50'
  switch (props.task.type) {
    case 'joker':
      return 'bg-purple-900/20 border-purple-700/50 hover:border-purple-500'
    case 'substitute':
      return 'bg-amber-900/20 border-amber-700/50 hover:border-amber-500'
    default:
      return 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
  }
})

const isEmptyJoker = computed(() => props.task.type === 'joker' && !props.task.text)

function handleClickOutside(e) {
  if (showTypeMenu.value && menuRef.value && !menuRef.value.contains(e.target)) {
    showTypeMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClick() {
  if (isEmptyJoker.value) {
    startEdit()
    return
  }

  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    startEdit()
  } else {
    clickTimer = setTimeout(() => {
      clickTimer = null
      handleToggle()
    }, 300)
  }
}

function handleToggle() {
  if (isEmptyJoker.value) return

  if (!props.task.completed) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 400)
  }
  emit('toggle', props.task.id)
}

function startEdit() {
  if (props.task.completed) return
  editText.value = props.task.text
  isEditing.value = true
  nextTick(() => inputRef.value?.focus())
}

function saveEdit() {
  const trimmed = editText.value.trim()
  if (trimmed || props.task.type !== 'joker') {
    emit('update', props.task.id, trimmed)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function handleTypeClick(e) {
  e.stopPropagation()
  showTypeMenu.value = !showTypeMenu.value
}

function selectType(type) {
  emit('setType', props.task.id, type)
  showTypeMenu.value = false
}
</script>

<template>
  <VTooltip
    placement="top"
    :delay="{ show: 600, hide: 0 }"
    :disabled="!showTooltips || isEditing || showTypeMenu"
  >
    <div
      class="group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 min-h-[72px]"
      :class="[borderClass, { 'animate-complete': isAnimating }]"
    >
      <div class="relative" ref="menuRef">
        <button
          @click="handleTypeClick"
          class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all hover:scale-110 hover:bg-slate-700/50"
        >
          {{ typeIcon }}
        </button>

        <Transition name="menu">
          <div
            v-if="showTypeMenu"
            class="absolute left-0 top-10 z-20 bg-slate-700 rounded-xl shadow-xl border border-slate-600 p-1 min-w-[140px]"
          >
            <button
              @click="selectType('standard')"
              class="flex items-center gap-2 px-3 py-2 hover:bg-slate-600 rounded-lg w-full text-left text-sm text-white"
              :class="{ 'bg-slate-600': task.type === 'standard' }"
            >
              ⛏️ Привычка
            </button>
            <button
              @click="selectType('joker')"
              class="flex items-center gap-2 px-3 py-2 hover:bg-slate-600 rounded-lg w-full text-left text-sm text-white"
              :class="{ 'bg-slate-600': task.type === 'joker' }"
            >
              🃏 Разовая
            </button>
            <button
              v-if="task.type === 'standard' && task.text"
              @click="selectType('substitute')"
              class="flex items-center gap-2 px-3 py-2 hover:bg-slate-600 rounded-lg w-full text-left text-sm text-white"
            >
              ⏳ На день
            </button>
          </div>
        </Transition>
      </div>

      <button
        @click="handleToggle"
        :disabled="isEmptyJoker"
        class="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
        :class="[
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
            : isEmptyJoker
              ? 'border-slate-600 opacity-50 cursor-not-allowed'
              : 'border-slate-500 hover:border-amber-400 hover:scale-110'
        ]"
      >
        <span v-if="task.completed" class="text-sm font-bold">✓</span>
      </button>

      <div class="flex-1 min-w-0">
        <input
          v-if="isEditing"
          ref="inputRef"
          v-model="editText"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
          :placeholder="task.type === 'joker' ? 'Что сделать сегодня?' : ''"
          class="w-full bg-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
        />
        <div v-else class="flex flex-col justify-center">
          <span
            @click="handleClick"
            class="block truncate cursor-pointer select-none text-base transition-all duration-300"
            :class="[
              task.completed ? 'line-through text-slate-500' : 'text-white hover:text-amber-300',
              { 'text-slate-500 italic': isEmptyJoker }
            ]"
          >
            {{ task.text || 'Нажми чтобы добавить...' }}
          </span>
          <span
            v-if="task.type === 'substitute' && task.originalText"
            class="text-xs text-amber-500/70 truncate block"
          >
            Завтра: {{ task.originalText }}
          </span>
        </div>
      </div>

      <button
        @click="emit('remove', task.id)"
        class="flex-shrink-0 w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
      >
        ✕
      </button>
    </div>

    <template #popper>
      <div class="text-sm">
        <div>Двойной клик на текст: редактировать</div>
        <div>Клик на иконку: сменить тип</div>
        <div class="text-slate-400 text-xs mt-1">Подсказки можно отключить в настройках</div>
      </div>
    </template>
  </VTooltip>
</template>
