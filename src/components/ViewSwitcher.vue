<template>
  <div class="view-switcher">
    <button
      v-for="layout in viewLayouts"
      :key="layout.id"
      type="button"
      class="view-btn"
      :class="{ active: modelValue === layout.id }"
      @click="$emit('update:modelValue', layout.id)"
    >
      <span>{{ layout.icon }}</span>
      <span>{{ layout.name }}</span>
    </button>
  </div>
</template>

<script setup>
import { viewLayouts } from '../data/viewLayouts'

defineProps({
  modelValue: {
    type: String,
    default: 'gallery'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.view-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.75rem 0 1rem;
}

.view-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  font-size: 0.78rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.view-btn:hover,
.view-btn.active {
  border-color: var(--accent);
  color: var(--text-primary);
  background: var(--accent-soft);
}
</style>