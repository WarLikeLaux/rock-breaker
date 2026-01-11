<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'update', 'remove'])

const isEditing = ref(false)
const editText = ref('')
const inputRef = ref(null)
const isAnimating = ref(false)

let clickTimer = null

function handleClick() {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    startEdit()
  } else {
    clickTimer = setTimeout(() => {
      clickTimer = null
      handleToggle()
    }, 200)
  }
}

function handleToggle() {
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
  if (editText.value.trim()) {
    emit('update', props.task.id, editText.value)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div
    class="group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300"
    :class="[
      task.completed
        ? 'bg-emerald-900/20 border-emerald-800/50'
        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80',
      { 'animate-complete': isAnimating }
    ]"
  >
    <button
      @click="handleToggle"
      class="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
      :class="
        task.completed
          ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
          : 'border-slate-500 hover:border-amber-400 hover:scale-110'
      "
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
        class="w-full bg-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all"
      />
      <span
        v-else
        @click="handleClick"
        class="block truncate cursor-pointer select-none text-base transition-all duration-300"
        :class="task.completed ? 'line-through text-slate-500' : 'text-white hover:text-amber-300'"
      >
        {{ task.text }}
      </span>
    </div>

    <button
      @click="emit('remove', task.id)"
      class="flex-shrink-0 w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
    >
      ✕
    </button>
  </div>
</template>
