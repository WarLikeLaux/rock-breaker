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
    class="group flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 transition-all hover:border-slate-600"
    :class="{ 'opacity-60': task.completed }"
  >
    <button
      @click="emit('toggle', task.id)"
      class="flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all"
      :class="
        task.completed
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : 'border-slate-500 hover:border-amber-500'
      "
    >
      <span v-if="task.completed" class="text-sm">✓</span>
    </button>

    <div class="flex-1 min-w-0">
      <input
        v-if="isEditing"
        ref="inputRef"
        v-model="editText"
        @blur="saveEdit"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        class="w-full bg-slate-700 rounded px-2 py-1 text-white outline-none focus:ring-2 focus:ring-amber-500"
      />
      <span
        v-else
        @dblclick="startEdit"
        class="block truncate cursor-pointer"
        :class="task.completed ? 'line-through text-slate-500' : 'text-white'"
      >
        {{ task.text }}
      </span>
    </div>

    <button
      @click="emit('remove', task.id)"
      class="flex-shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
    >
      ✕
    </button>
  </div>
</template>
