<template>
  <div class="node-card">
    <div v-if="node">
      <div class="node-header">
        <div
          class="node-color"
          :style="{ backgroundColor: node.color }"
        />

        <div>
          <h2 class="node-title">
            {{ node.label }}
          </h2>

          <p class="node-type">
            {{ formattedType }}
          </p>
        </div>
      </div>

      <div class="section">
        <h3>Description</h3>

        <p class="description">
          {{ node.description || 'No description available.' }}
        </p>
      </div>

      <div class="section">
        <h3>Connected Items</h3>

        <div
          v-if="connectedNodes.length"
          class="connected-list"
        >
          <button
            v-for="connected in connectedNodes"
            :key="connected.id"
            class="connected-item"
            @click="$emit('select-node', connected)"
          >
            <span
              class="connected-dot"
              :style="{
                backgroundColor: connected.color
              }"
            />

            <div>
              <div class="connected-label">
                {{ connected.label }}
              </div>

              <div class="connected-type">
                {{ connected.type }}
              </div>
            </div>
          </button>
        </div>

        <p
          v-else
          class="empty-state"
        >
          No connected items found.
        </p>
      </div>

      <div class="section">
        <h3>Quick Actions</h3>

        <div class="actions">
          <button
            class="action-btn"
            @click="viewNode"
          >
            View
          </button>

          <button
            class="action-btn"
            @click="editNode"
          >
            Edit
          </button>

          <button
            class="action-btn danger"
            @click="deleteNode"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="empty-panel"
    >
      <div class="empty-icon">
        🕸️
      </div>

      <h3>Select a Node</h3>

      <p>
        Click a node in the graph to view
        its details and relationships.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    default: null
  },

  connectedNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'select-node',
  'view-node',
  'edit-node',
  'delete-node'
])

const formattedType = computed(() => {
  if (!props.node?.type) return ''

  return (
    props.node.type.charAt(0).toUpperCase() +
    props.node.type.slice(1)
  )
})

const viewNode = () => {
  emit('view-node', props.node)
}

const editNode = () => {
  emit('edit-node', props.node)
}

const deleteNode = () => {
  emit('delete-node', props.node)
}
</script>

<style scoped>
.node-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
}

.node-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.15rem;
}

.node-type {
  margin: 0.2rem 0 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section h3 {
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.description {
  color: var(--text-primary);
  line-height: 1.5;
}

.connected-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.connected-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  width: 100%;
  border: none;
  background: rgba(255,255,255,0.03);

  padding: 0.7rem;
  border-radius: 12px;

  cursor: pointer;
  text-align: left;

  transition: all 0.2s ease;
}

.connected-item:hover {
  background: rgba(212,175,55,0.08);
}

.connected-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.connected-label {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.connected-type {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.action-btn {
  border: none;
  border-radius: 10px;
  cursor: pointer;

  padding: 0.65rem 0.9rem;

  background: rgba(212,175,55,0.12);
  color: #d4af37;

  font-weight: 600;
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn.danger {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
}

.empty-state {
  color: var(--text-secondary);
  font-style: italic;
}

.empty-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;

  align-items: center;
  text-align: center;

  height: 100%;
  min-height: 300px;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.empty-panel h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-panel p {
  color: var(--text-secondary);
  max-width: 240px;
}

@media (max-width: 768px) {
  .node-card {
    padding: 0.85rem;
  }
}
</style>