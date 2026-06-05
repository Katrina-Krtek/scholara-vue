<template>
  <div class="graph-filters">
    <div class="filters-header">
      <h3>Filters</h3>

      <div class="filter-actions">
        <button
          class="action-btn"
          @click="selectAll"
        >
          All
        </button>

        <button
          class="action-btn"
          @click="clearAll"
        >
          None
        </button>
      </div>
    </div>

    <div class="filter-list">
      <label
        v-for="filter in filterOptions"
        :key="filter.type"
        class="filter-item"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(filter.type)"
          @change="toggleFilter(filter.type)"
        />

        <span
          class="color-dot"
          :style="{
            backgroundColor: filter.color
          }"
        />

        <span class="filter-label">
          {{ filter.label }}
        </span>

        <span class="filter-count">
          {{ getCount(filter.type) }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },

  nodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:modelValue'
])

const filterOptions = [
  {
    type: 'course',
    label: 'Courses',
    color: '#2563eb'
  },
  {
    type: 'assignment',
    label: 'Assignments',
    color: '#16a34a'
  },
  {
    type: 'source',
    label: 'Sources',
    color: '#f59e0b'
  },
  {
    type: 'note',
    label: 'Notes',
    color: '#8b5cf6'
  },
  {
    type: 'concept',
    label: 'Concepts',
    color: '#ec4899'
  },
  {
    type: 'term',
    label: 'Terms',
    color: '#06b6d4'
  },
  {
    type: 'person',
    label: 'People',
    color: '#ef4444'
  },
  {
    type: 'flashcard',
    label: 'Flashcards',
    color: '#14b8a6'
  }
]

const toggleFilter = (type) => {
  const current = [...props.modelValue]

  const exists = current.includes(type)

  const updated = exists
    ? current.filter(item => item !== type)
    : [...current, type]

  emit(
    'update:modelValue',
    updated
  )
}

const selectAll = () => {
  emit(
    'update:modelValue',
    filterOptions.map(
      option => option.type
    )
  )
}

const clearAll = () => {
  emit(
    'update:modelValue',
    []
  )
}

const getCount = (type) => {
  return props.nodes.filter(
    node => node.type === type
  ).length
}
</script>

<style scoped>
.graph-filters {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  border: none;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  background: rgba(212, 175, 55, 0.12);
  color: #d4af37;
  font-size: 0.8rem;
  font-weight: 600;
}

.action-btn:hover {
  opacity: 0.9;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
}

.filter-item input {
  cursor: pointer;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.filter-label {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-count {
  color: var(--text-secondary);
  font-size: 0.8rem;
  min-width: 24px;
  text-align: right;
}

@media (max-width: 768px) {
  .graph-filters {
    padding: 0.85rem;
  }

  .filter-label {
    font-size: 0.85rem;
  }
}
</style>