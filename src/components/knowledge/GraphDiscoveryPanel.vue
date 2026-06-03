<template>
  <div class="discovery-panel">
    <div class="panel-header">
      <div>
        <h3>🐾 Rory Notices...</h3>
        <p>Helpful patterns, gaps, and suggested connections.</p>
      </div>

      <span class="notice-count">
        {{ items.length }}
      </span>
    </div>

    <div
      v-if="items.length"
      class="notice-list"
    >
      <button
        v-for="item in items"
        :key="item.id"
        class="notice-card"
        :class="`priority-${item.priority}`"
        @click="$emit('select-discovery', item)"
      >
        <div class="notice-topline">
          <span class="notice-category">
            {{ formatLabel(item.category) }}
          </span>

          <span class="notice-priority">
            {{ formatLabel(item.priority) }}
          </span>
        </div>

        <h4>{{ item.title }}</h4>

        <p>{{ item.description }}</p>

        <div class="notice-action">
          View related node →
        </div>
      </button>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <h4>No discoveries yet</h4>
      <p>
        Rory will surface patterns once more notes, sources, assignments, and daily pages are connected.
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'select-discovery',
])

function formatLabel(value) {
  if (!value) return ''

  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<style scoped>
.discovery-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
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
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.notice-count {
  min-width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  font-weight: 700;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notice-card {
  width: 100%;
  text-align: left;
  border-radius: 14px;
  padding: 0.85rem;
  cursor: pointer;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: 0.15s ease;
}

.notice-card:hover {
  transform: translateY(-1px);
}

.notice-topline {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notice-category,
.notice-priority {
  font-size: 0.72rem;
  opacity: 0.75;
}

.notice-card h4 {
  margin: 0;
  font-size: 0.95rem;
}

.notice-card p {
  margin: 0.45rem 0 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-secondary);
}

.notice-action {
  margin-top: 0.65rem;
  font-size: 0.78rem;
  font-weight: 700;
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
  text-align: center;
  padding: 1.5rem 0.75rem;
}

.empty-state h4 {
  margin: 0;
}

.empty-state p {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>