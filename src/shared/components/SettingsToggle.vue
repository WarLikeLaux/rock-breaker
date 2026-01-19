<script setup lang="ts">
interface Props {
  label: string;
  icon: string;
  modelValue: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function toggle(): void {
  emit('update:modelValue', !defineProps<Props>().modelValue);
}
</script>

<template>
  <label
    class="flex items-center justify-between py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl cursor-pointer transition-all"
  >
    <span class="text-white flex items-center gap-2">{{ icon }} {{ label }}</span>
    <div class="relative">
      <input type="checkbox" :checked="modelValue" @change="toggle" class="sr-only peer" />
      <div
        class="w-11 h-6 bg-slate-600 peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"
      ></div>
    </div>
  </label>
</template>
