<template>
  <div class="related-items-panel">
    <div class="panel-header">
      <h3>Related Items</h3>

      <span
        v-if="selectedNode"
        class="selected-node"
      >
        {{ selectedNode.title }}
      </span>
    </div>

    <div
      v-if="!selectedNode"
      class="empty-state"
    >
      <p>Select a node to view related content.</p>
    </div>

    <template v-else>
      <div
        v-for="group in groupedItems"
        :key="group.type"
        class="group-section"
      >
        <div class="group-header">
          <h4>{{ formatLabel(group.type) }}</h4>
          <span>{{ group.items.length }}</span>
        </div>

        <div
          v-if="group.items.length"
          class="item-list"
        >
          <button
            v-for="item in group.items"
            :key="item.id"
            class="related-card"
            @click="$emit('select-node', item)"
          >
            <div class="item-title">
              {{ item.title }}
            </div>

            <div class="item-description">
              {{ truncate(item.description) }}
            </div>

            <div class="item-footer">
              <span class="item-status">
                {{ item.status || 'active' }}
              </span>

              <span class="item-date">
                {{ item.updatedAt || '—' }}
              </span>
            </div>
          </button>
        </div>

        <div
          v-else
          class="empty-group"
        >
          No related items.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedNode: {
    type: Object,
    default: null,
  },

  relatedNodes: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'select-node',
])

const groupTypes = [
  'note',
  'research-source',
  'assignment',
  'course',
  'daily-page',
  'planner-block',
  'tag',
]

const groupedItems = computed(() => {
  return groupTypes.map((type) => ({
    type,
    items: props.relatedNodes.filter(
      (node) => node.type === type,
    ),
  }))
})

function truncate(text, length = 90) {
  if (!text) return 'No description available.'

  return text.length > length
    ? `${text.substring(0, length)}...`
    : text
}

function formatLabel(value) {
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<style scoped>
.related-items-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
}

.panel-header {
  margin-bottom: 1rem;
}

.panel-header h3 {
  margin: 0;
}

.selected-node {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  opacity: 0.75;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  opacity: 0.7;
}

.group-section {
  margin-bottom: 1.5rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.group-header h4 {
  margin: 0;
  font-size: 0.95rem;
}

.group-header span {
  font-size: 0.8rem;
  opacity: 0.75;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.related-card {
  width: 100%;
  text-align: left;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: 0.15s ease;
}

.related-card:hover {
  transform: translateY(-1px);
}

.item-title {
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.item-description {
  font-size: 0.85rem;
  opacity: 0.8;
  line-height: 1.4;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.65rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.empty-group {
  font-size: 0.85rem;
  opacity: 0.6;
  padding: 0.5rem 0;
}
</style>