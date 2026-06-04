<template>
  <div class="graph-filters">
    <div class="filter-header">
      <h3>Graph Filters</h3>

      <button
        class="reset-btn"
        type="button"
        @click="resetFilters"
      >
        Reset
      </button>
    </div>

    <div class="filter-section">
      <label>Search</label>

      <input
        v-model="localSearch"
        type="text"
        placeholder="Search graph..."
        class="filter-input"
      />
    </div>

    <div class="filter-section">
      <label>Node Type</label>

      <select
        v-model="localType"
        class="filter-select"
      >
        <option value="all">All Types</option>

        <option
          v-for="type in nodeTypes"
          :key="type"
          :value="type"
        >
          {{ formatLabel(type) }}
        </option>
      </select>
    </div>

    <div class="filter-section">
      <label>Tag</label>

      <select
        v-model="localTag"
        class="filter-select"
      >
        <option value="all">All Tags</option>

        <option
          v-for="tag in availableTags"
          :key="tag"
          :value="tag"
        >
          {{ tag }}
        </option>
      </select>
    </div>

    <div class="filter-section">
      <label>Course</label>

      <select
        v-model="localCourse"
        class="filter-select"
      >
        <option value="all">All Courses</option>

        <option
          v-for="course in courses"
          :key="course.id"
          :value="course.id"
        >
          {{ course.title }}
        </option>
      </select>
    </div>

    <div class="filter-section">
      <label>Graph Density</label>

      <input
        v-model="localDensity"
        type="range"
        min="1"
        max="10"
        class="density-slider"
      />

      <div class="density-value">
        {{ localDensity }}
      </div>
    </div>

    <div class="filter-section">
      <label class="checkbox-label">
        <input
          v-model="showTodayOnly"
          type="checkbox"
        />

        Show Today's Learning Map
      </label>
    </div>

    <div class="filter-section">
      <label class="checkbox-label">
        <input
          v-model="showConnectedContext"
          type="checkbox"
        />

        Show Connected Context
      </label>

      <p class="filter-help">
        Include directly related nodes when searching or filtering.
      </p>
    </div>

    <div class="filter-summary">
      <div class="summary-item">
        <span>Nodes</span>
        <strong>{{ stats.nodeCount }}</strong>
      </div>

      <div class="summary-item">
        <span>Relationships</span>
        <strong>{{ stats.relationshipCount }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  nodeTypes: {
    type: Array,
    default: () => [],
  },

  nodes: {
    type: Array,
    default: () => [],
  },

  stats: {
    type: Object,
    default: () => ({
      nodeCount: 0,
      relationshipCount: 0,
    }),
  },
})

const emit = defineEmits([
  'update:search',
  'update:type',
  'update:tag',
  'update:course',
  'update:density',
  'update:todayOnly',
  'update:connectedContext',
])

const localSearch = ref('')
const localType = ref('all')
const localTag = ref('all')
const localCourse = ref('all')
const localDensity = ref(5)
const showTodayOnly = ref(false)
const showConnectedContext = ref(false)

const availableTags = computed(() => {
  const tags = new Set()

  props.nodes.forEach((node) => {
    node.tags?.forEach((tag) => tags.add(tag))
  })

  return [...tags].sort()
})

const courses = computed(() => {
  return props.nodes.filter((node) => node.type === 'course')
})

watch(localSearch, (value) => {
  emit('update:search', value)
})

watch(localType, (value) => {
  emit('update:type', value)
})

watch(localTag, (value) => {
  emit('update:tag', value)
})

watch(localCourse, (value) => {
  emit('update:course', value)
})

watch(localDensity, (value) => {
  emit('update:density', Number(value))
})

watch(showTodayOnly, (value) => {
  emit('update:todayOnly', value)
})

watch(showConnectedContext, (value) => {
  emit('update:connectedContext', value)
})

function resetFilters() {
  localSearch.value = ''
  localType.value = 'all'
  localTag.value = 'all'
  localCourse.value = 'all'
  localDensity.value = 5
  showTodayOnly.value = false
  showConnectedContext.value = false
}

function formatLabel(value) {
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
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

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-header h3 {
  margin: 0;
  font-size: 1rem;
}

.reset-btn {
  border: 1px solid var(--border-color);
  cursor: pointer;
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  font-weight: 600;
}

.reset-btn:hover {
  border-color: var(--accent);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-section label {
  font-size: 0.85rem;
  font-weight: 600;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.65rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.density-slider {
  width: 100%;
}

.density-value {
  text-align: center;
  font-weight: 600;
}

.checkbox-label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-help {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.filter-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.summary-item {
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 0.75rem;
  text-align: center;
}

.summary-item span {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.summary-item strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.1rem;
}
</style>
