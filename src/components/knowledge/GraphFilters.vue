<template>
  <div class="graph-filters">
    <div class="filter-header">
      <h3>Graph Filters</h3>

      <button
        class="reset-btn"
        type="button"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>

    <div class="filter-section">
      <label for="graph-search">
        Search
      </label>

      <input
        id="graph-search"
        v-model="searchModel"
        type="search"
        placeholder="Search titles, descriptions, tags..."
        class="filter-input"
      />
    </div>

    <div class="filter-section">
      <label for="graph-node-type">
        Node Type
      </label>

      <select
        id="graph-node-type"
        v-model="typeModel"
        class="filter-select"
      >
        <option value="all">
          All Types
        </option>

        <option
          v-for="nodeType in nodeTypes"
          :key="nodeType"
          :value="nodeType"
        >
          {{ formatLabel(nodeType) }}
        </option>
      </select>
    </div>

    <div class="filter-section">
      <label for="graph-tag">
        Tag
      </label>

      <select
        id="graph-tag"
        v-model="tagModel"
        class="filter-select"
      >
        <option value="all">
          All Tags
        </option>

        <option
          v-for="tag in availableTags"
          :key="tag.key"
          :value="tag.name"
        >
          {{ tag.name }}
        </option>
      </select>
    </div>

    <div class="filter-section">
      <label for="graph-course">
        Course
      </label>

      <select
        id="graph-course"
        v-model="courseModel"
        class="filter-select"
      >
        <option value="all">
          All Courses
        </option>

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
      <label for="graph-density">
        Graph Density
      </label>

      <input
        id="graph-density"
        v-model.number="densityModel"
        type="range"
        min="1"
        max="10"
        step="1"
        class="density-slider"
      />

      <div class="density-value">
        {{ densityModel }}
      </div>
    </div>

    <div class="filter-section">
      <label class="checkbox-label">
        <input
          v-model="todayOnlyModel"
          type="checkbox"
        />

        <span>
          Show Today’s Learning Map
        </span>
      </label>
    </div>

    <div class="filter-section">
      <label class="checkbox-label">
        <input
          v-model="connectedContextModel"
          type="checkbox"
        />

        <span>
          Show Connected Context
        </span>
      </label>

      <p class="filter-help">
        Include records directly connected to the current matches.
      </p>
    </div>

    <div class="filter-summary">
      <div class="summary-item">
        <span>
          Visible Nodes
        </span>

        <strong>
          {{ stats.nodeCount || 0 }}
        </strong>
      </div>

      <div class="summary-item">
        <span>
          Relationships
        </span>

        <strong>
          {{ stats.relationshipCount || 0 }}
        </strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
} from 'vue'

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

  search: {
    type: String,
    default: '',
  },

  selectedType: {
    type: String,
    default: 'all',
  },

  selectedTag: {
    type: String,
    default: 'all',
  },

  selectedCourse: {
    type: String,
    default: 'all',
  },

  density: {
    type: Number,
    default: 5,
  },

  todayOnly: {
    type: Boolean,
    default: false,
  },

  connectedContext: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'reset',
  'update:search',
  'update:type',
  'update:tag',
  'update:course',
  'update:density',
  'update:todayOnly',
  'update:connectedContext',
])

const searchModel = computed({
  get() {
    return props.search
  },

  set(value) {
    emit(
      'update:search',
      String(value || ''),
    )
  },
})

const typeModel = computed({
  get() {
    return props.selectedType
  },

  set(value) {
    emit(
      'update:type',
      value || 'all',
    )
  },
})

const tagModel = computed({
  get() {
    return props.selectedTag
  },

  set(value) {
    emit(
      'update:tag',
      value || 'all',
    )
  },
})

const courseModel = computed({
  get() {
    return props.selectedCourse
  },

  set(value) {
    emit(
      'update:course',
      value || 'all',
    )
  },
})

const densityModel = computed({
  get() {
    return props.density
  },

  set(value) {
    emit(
      'update:density',
      Number(value) || 5,
    )
  },
})

const todayOnlyModel = computed({
  get() {
    return props.todayOnly
  },

  set(value) {
    emit(
      'update:todayOnly',
      Boolean(value),
    )
  },
})

const connectedContextModel = computed({
  get() {
    return props.connectedContext
  },

  set(value) {
    emit(
      'update:connectedContext',
      Boolean(value),
    )
  },
})

const availableTags = computed(() => {
  const tags = new Map()

  props.nodes.forEach((node) => {
    ;(node.tags || []).forEach((tag) => {
      const cleanName =
        String(tag || '').trim()

      const key =
        normalizeTag(cleanName)

      if (
        !cleanName ||
        !key ||
        tags.has(key)
      ) {
        return
      }

      tags.set(key, {
        key,
        name: cleanName,
      })
    })
  })

  return [...tags.values()].sort(
    (a, b) => {
      return a.name.localeCompare(
        b.name,
      )
    },
  )
})

const courses = computed(() => {
  return props.nodes
    .filter((node) => {
      return node.type === 'course'
    })
    .sort((a, b) => {
      return String(
        a.title || '',
      ).localeCompare(
        String(b.title || ''),
      )
    })
})

function normalizeTag(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
}

function formatLabel(value) {
  return String(value || 'Record')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}
</script>

<style scoped>
.graph-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-secondary);
  padding: 1rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-header h3 {
  margin: 0;
  font-size: 1rem;
}

.reset-btn {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.45rem 0.8rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
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
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.65rem;
  font: inherit;
}

.filter-input:focus,
.filter-select:focus {
  border-color: var(--accent);
  outline: none;
}

.density-slider {
  width: 100%;
}

.density-value {
  text-align: center;
  font-weight: 700;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-help {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.75rem;
  line-height: 1.4;
}

.filter-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.summary-item {
  border-radius: 10px;
  background: var(--bg-primary);
  padding: 0.75rem;
  text-align: center;
}

.summary-item span {
  display: block;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.summary-item strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.1rem;
}
</style>