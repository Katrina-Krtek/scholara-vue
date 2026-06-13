<template>
  <section class="progress-card">
    <div class="progress-header">
      <h3>Assignment Progress</h3>
      <span class="progress-value">{{ modelValue }}%</span>
    </div>

    <input
      type="range"
      min="0"
      max="100"
      :value="modelValue"
      @input="updateValue"
      class="progress-slider"
    />

    <div class="progress-status">
      {{ progressLabel }}
    </div>

    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${modelValue}%` }"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
  emit('update:modelValue', Number(event.target.value))
}

const progressLabel = computed(() => {
  const value = props.modelValue

  if (value === 0) return 'Not Started'
  if (value < 25) return 'Getting Started'
  if (value < 50) return 'In Progress'
  if (value < 75) return 'Making Good Progress'
  if (value < 100) return 'Almost Complete'

  return 'Completed'
})
</script>

<style scoped>
.progress-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  margin: 0;
}

.progress-value {
  font-weight: 800;
  color: var(--accent-text);
}

.progress-slider {
  width: 100%;
  margin-bottom: 1rem;
}

.progress-status {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.2s ease;
}
</style>