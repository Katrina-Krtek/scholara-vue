<template>
  <section class="checklist-card">
    <div class="checklist-header">
      <h3>Submission Checklist</h3>
      <span class="completion-text">
        {{ completedCount }}/{{ localChecklist.length }} Complete
      </span>
    </div>

    <div class="checklist-items">
      <label
        v-for="(item, index) in localChecklist"
        :key="index"
        class="checklist-item"
      >
        <input
          type="checkbox"
          :checked="item.completed"
          @change="toggleItem(index)"
        />

        <span
          :class="{
            completed: item.completed,
          }"
        >
          {{ item.label }}
        </span>
      </label>
    </div>

    <div class="progress-wrapper">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${completionPercentage}%` }"
        />
      </div>

      <span class="progress-percent">
        {{ completionPercentage }}%
      </span>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  checklist: {
    type: Array,
    default: () => [
      { label: 'Instructions reviewed', completed: false },
      { label: 'Rubric reviewed', completed: false },
      { label: 'Research linked', completed: false },
      { label: 'Draft completed', completed: false },
      { label: 'Grammar checked', completed: false },
      { label: 'Citations verified', completed: false },
      { label: 'Final review completed', completed: false },
      { label: 'Submitted', completed: false },
    ],
  },
})

const emit = defineEmits(['update:checklist'])

const localChecklist = ref([...props.checklist])

watch(
  () => props.checklist,
  (newValue) => {
    localChecklist.value = [...newValue]
  },
  { deep: true }
)

function toggleItem(index) {
  localChecklist.value[index].completed =
    !localChecklist.value[index].completed

  emit('update:checklist', [...localChecklist.value])
}

const completedCount = computed(() => {
  return localChecklist.value.filter((item) => item.completed).length
})

const completionPercentage = computed(() => {
  if (!localChecklist.value.length) return 0

  return Math.round(
    (completedCount.value / localChecklist.value.length) * 100
  )
})
</script>

<style scoped>
.checklist-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.checklist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.checklist-header h3 {
  margin: 0;
}

.completion-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.checklist-items {
  display: grid;
  gap: 0.75rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checklist-item input {
  cursor: pointer;
}

.completed {
  text-decoration: line-through;
  opacity: 0.7;
}

.progress-wrapper {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  transition: width 0.2s ease;
}

.progress-percent {
  font-size: 0.85rem;
  font-weight: 800;
  min-width: 40px;
  text-align: right;
}
</style>