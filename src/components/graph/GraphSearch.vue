<template>
  <div class="graph-search">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>

      <input
        v-model="localQuery"
        type="text"
        class="search-input"
        placeholder="Search concepts, sources, notes, people..."
        @input="handleInput"
      />

      <button
        v-if="localQuery"
        class="clear-btn"
        @click="clearSearch"
      >
        ✕
      </button>
    </div>

    <div
      v-if="localQuery && resultCount >= 0"
      class="search-results"
    >
      {{ resultCount }} result{{ resultCount === 1 ? '' : 's' }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  nodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:modelValue'
])

const localQuery = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    localQuery.value = value
  }
)

const handleInput = () => {
  emit(
    'update:modelValue',
    localQuery.value
  )
}

const clearSearch = () => {
  localQuery.value = ''

  emit(
    'update:modelValue',
    ''
  )
}

const resultCount = computed(() => {
  if (!localQuery.value) {
    return props.nodes.length
  }

  return props.nodes.filter(node =>
    node.label
      .toLowerCase()
      .includes(
        localQuery.value.toLowerCase()
      )
  ).length
})
</script>

<style scoped>
.graph-search {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.7;
}

.search-input {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0 42px 0 42px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  transition: background 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.search-results {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding-left: 0.25rem;
}

@media (max-width: 768px) {
  .search-input {
    height: 42px;
    font-size: 0.9rem;
  }
}
</style>