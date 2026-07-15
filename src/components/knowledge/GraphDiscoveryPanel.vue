<template>
  <div class="discovery-panel">
    <div class="panel-header">
      <div>
        <h3>🐾 Rory Notices...</h3>

        <p>
          Helpful patterns, gaps, and suggested connections.
        </p>
      </div>

      <span class="notice-count">
        {{ validItems.length }}
      </span>
    </div>

    <div
      v-if="validItems.length"
      class="notice-list"
    >
      <button
        v-for="item in validItems"
        :key="item.id"
        class="notice-card"
        :class="getPriorityClass(item.priority)"
        type="button"
        @click="$emit('select-discovery', item)"
      >
        <div class="notice-topline">
          <span class="notice-category">
            {{ formatLabel(item.category || 'discovery') }}
          </span>

          <span class="notice-priority">
            {{ formatLabel(item.priority || 'medium') }}
          </span>
        </div>

        <h4>
          {{ item.title || 'Knowledge Graph Discovery' }}
        </h4>

        <p>
          {{
            item.description ||
            'Rory found a potentially useful graph connection.'
          }}
        </p>

        <div class="notice-action">
          View related node →
        </div>
      </button>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">🐾</div>

      <h4>No discoveries yet</h4>

      <p>
        Rory will surface patterns after more Scholarory records and
        relationships are connected.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'select-discovery',
])

const validItems = computed(() => {
  const discoveries = new Map()

  props.items.forEach((item, index) => {
    if (!item) {
      return
    }

    const id = String(
      item.id ||
      `graph-discovery-${index}`,
    )

    if (!discoveries.has(id)) {
      discoveries.set(id, {
        ...item,
        id,
      })
    }
  })

  return [...discoveries.values()]
})

function getPriorityClass(priority) {
  const normalized = String(priority || 'medium')
    .toLowerCase()
    .trim()

  if (normalized === 'high') {
    return 'priority-high'
  }

  if (normalized === 'low') {
    return 'priority-low'
  }

  return 'priority-medium'
}

function formatLabel(value) {
  return String(value || '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}
</script>

<style scoped>
.discovery-panel {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-secondary);
  padding: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.panel-header p {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  font-size: 0.83rem;
  line-height: 1.4;
}

.notice-count {
  display: grid;
  place-items: center;
  min-width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-primary);
  font-weight: 700;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notice-card {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.notice-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.notice-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.notice-category,
.notice-priority {
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 700;
}

.notice-card h4 {
  margin: 0;
  font-size: 0.93rem;
}

.notice-card p {
  margin: 0.45rem 0 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.45;
}

.notice-action {
  margin-top: 0.65rem;
  color: var(--accent-text);
  font-size: 0.76rem;
  font-weight: 800;
}

.priority-high {
  border-left: 4px solid #f59e0b;
}

.priority-medium {
  border-left: 4px solid #3b82f6;
}

.priority-low {
  border-left: 4px solid #10b981;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  padding: 1.5rem 0.75rem;
  text-align: center;
}

.empty-state h4,
.empty-state p {
  margin: 0;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 0.86rem;
  line-height: 1.5;
}

.empty-icon {
  font-size: 1.5rem;
}
</style>