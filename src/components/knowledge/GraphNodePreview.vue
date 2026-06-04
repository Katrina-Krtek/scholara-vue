<template>
  <div
    v-if="node"
    class="node-preview"
  >
    <div class="preview-header">
      <div>
        <h2>{{ node.title }}</h2>

        <span class="node-type">
          {{ formatLabel(node.type) }}
        </span>
      </div>

      <button
        class="close-btn"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>

    <div class="preview-section">
      <h4>Description</h4>

      <p>
        {{ node.description || 'No description available.' }}
      </p>
    </div>

    <div
      v-if="node.tags?.length"
      class="preview-section"
    >
      <h4>Tags</h4>

      <div class="tag-list">
        <span
          v-for="tag in node.tags"
          :key="tag"
          class="tag-pill"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="preview-section">
      <h4>Relationships</h4>

      <div
        v-if="relationships.length"
        class="relationship-list"
      >
        <div
          v-for="relationship in relationships"
          :key="relationship.id"
          class="relationship-item"
        >
          <div class="relationship-label">
            {{ relationship.label }}
          </div>

          <div class="relationship-target">
            {{ getRelatedTitle(relationship) }}
          </div>
        </div>
      </div>

      <p v-else>
        No connected relationships.
      </p>
    </div>

    <div
      v-if="relatedNodes.length"
      class="preview-section"
    >
      <h4>Connected Items</h4>

      <div class="related-list">
        <button
          v-for="related in relatedNodes"
          :key="related.id"
          class="related-item"
          @click="$emit('select-node', related)"
        >
          <div class="related-title">
            {{ related.title }}
          </div>

          <div class="related-type">
            {{ formatLabel(related.type) }}
          </div>
        </button>
      </div>
    </div>

    <div class="preview-section">
      <h4>Details</h4>

      <div class="detail-grid">
        <div class="detail-item">
          <span>Status</span>
          <strong>{{ node.status || 'Unknown' }}</strong>
        </div>

        <div class="detail-item">
          <span>Updated</span>
          <strong>{{ node.updatedAt || '—' }}</strong>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button
        class="primary-btn"
        @click="$emit('open-node', node)"
      >
        Open Full Page
      </button>

      <button
        class="secondary-btn"
        @click="$emit('attach-node', node)"
      >
        Attach to Daily Page
      </button>

      <button
        class="secondary-btn"
        @click="$emit('link-note', node)"
      >
        Create Linked Note
      </button>
    </div>

    <div class="rory-insights">
      <h4>🐾 Rory Notices...</h4>

      <ul>
        <li>
          This node has
          <strong>{{ relationships.length }}</strong>
          relationship(s).
        </li>

        <li v-if="node.tags?.length">
          Tagged with
          <strong>{{ node.tags.length }}</strong>
          topic(s).
        </li>

        <li v-if="relatedNodes.length">
          Connected to
          <strong>{{ relatedNodes.length }}</strong>
          other item(s).
        </li>

        <li v-if="relationships.length === 0">
          This node may need more connections.
        </li>
      </ul>
    </div>
  </div>

  <div
    v-else
    class="empty-preview"
  >
    <h3>Select a node</h3>

    <p>
      Click a node in the graph to explore its relationships.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    default: null,
  },

  relationships: {
    type: Array,
    default: () => [],
  },

  allNodes: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'close',
  'open-node',
  'attach-node',
  'link-note',
  'select-node',
])

const relatedNodes = computed(() => {
  if (!props.node) return []

  return props.relationships
    .map((relationship) => {
      const relatedId =
        relationship.source === props.node.id
          ? relationship.target
          : relationship.source

      return props.allNodes.find(
        (node) => node.id === relatedId
      )
    })
    .filter(Boolean)
})

function getRelatedTitle(relationship) {
  const relatedId =
    relationship.source === props.node.id
      ? relationship.target
      : relationship.source

  const relatedNode = props.allNodes.find(
    (node) => node.id === relatedId
  )

  return relatedNode?.title || 'Unknown Node'
}

function formatLabel(value) {
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<style scoped>
.node-preview,
.empty-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.preview-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.node-type {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-primary);
}

.preview-section {
  margin-top: 1rem;
}

.preview-section h4 {
  margin-bottom: 0.5rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
}

.relationship-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.relationship-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem;
}

.relationship-label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.relationship-target {
  font-weight: 600;
  margin-top: 0.2rem;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.related-item {
  text-align: left;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-primary);
  cursor: pointer;
}

.related-item:hover {
  opacity: 0.9;
}

.related-title {
  font-weight: 600;
}

.related-type {
  font-size: 0.8rem;
  opacity: 0.75;
  margin-top: 0.2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.detail-item {
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 0.75rem;
}

.detail-item span {
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.primary-btn,
.secondary-btn {
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
}

.primary-btn {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.primary-btn:hover {
  border-color: var(--accent);
  background: var(--btn-bg);
}

.secondary-btn {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.secondary-btn:hover {
  border-color: var(--accent);
  background: var(--btn-bg);
}
.rory-insights {
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-primary);
}

.rory-insights ul {
  padding-left: 1.25rem;
  margin-bottom: 0;
}

.empty-preview {
  text-align: center;
}
</style>