<template>
  <div class="related-items-panel">
    <div class="panel-header">
      <div>
        <h3>Related Items</h3>

        <span
          v-if="selectedNode"
          class="selected-node"
        >
          {{ getNodeTitle(selectedNode) }}
        </span>
      </div>

      <span
        v-if="selectedNode"
        class="total-count"
      >
        {{ uniqueRelatedNodes.length }}
      </span>
    </div>

    <div
      v-if="!selectedNode"
      class="empty-state"
    >
      <div class="empty-icon">🔗</div>

      <h4>Select a node</h4>

      <p>
        Choose a graph node to view its connected records.
      </p>
    </div>

    <div
      v-else-if="groupedItems.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🧩</div>

      <h4>No related records</h4>

      <p>
        This record has not been connected to another Scholarory item yet.
      </p>
    </div>

    <div
      v-else
      class="groups-list"
    >
      <section
        v-for="group in groupedItems"
        :key="group.type"
        class="group-section"
      >
        <div class="group-header">
          <h4>
            {{ getTypeIcon(group.type) }}
            {{ getTypeLabel(group.type) }}
          </h4>

          <span>{{ group.items.length }}</span>
        </div>

        <div class="item-list">
          <button
            v-for="item in group.items"
            :key="item.id"
            class="related-card"
            type="button"
            @click="$emit('select-node', item)"
          >
            <div class="item-title">
              {{ getNodeTitle(item) }}
            </div>

            <div class="item-description">
              {{ truncate(item.description) }}
            </div>

            <div class="item-footer">
              <span class="item-status">
                {{ formatLabel(item.status || 'active') }}
              </span>

              <span class="item-date">
                {{ formatDate(item.updatedAt) }}
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
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

const preferredTypeOrder = [
  'course',
  'assignment',
  'research-source',
  'book',
  'journal',
  'article',
  'note',
  'concept',
  'term',
  'tag',
  'person',
  'flashcard',
  'writing-project',
  'daily-page',
  'planner-block',
  'canvas',
  'jot',
]

const uniqueRelatedNodes = computed(() => {
  const records = new Map()

  props.relatedNodes.forEach((node) => {
    if (!node?.id || records.has(String(node.id))) {
      return
    }

    records.set(String(node.id), node)
  })

  return [...records.values()]
})

const groupedItems = computed(() => {
  const groups = new Map()

  uniqueRelatedNodes.value.forEach((node) => {
    const type = String(node.type || 'record')

    if (!groups.has(type)) {
      groups.set(type, [])
    }

    groups.get(type).push(node)
  })

  return [...groups.entries()]
    .map(([type, items]) => ({
      type,
      items: [...items].sort((a, b) => {
        return getNodeTitle(a).localeCompare(
          getNodeTitle(b),
        )
      }),
    }))
    .sort((a, b) => {
      const aIndex = preferredTypeOrder.indexOf(a.type)
      const bIndex = preferredTypeOrder.indexOf(b.type)

      if (aIndex === -1 && bIndex === -1) {
        return a.type.localeCompare(b.type)
      }

      if (aIndex === -1) return 1
      if (bIndex === -1) return -1

      return aIndex - bIndex
    })
})

function getNodeTitle(node) {
  return String(
    node?.title ||
    node?.label ||
    'Untitled Record',
  )
}

function truncate(value, length = 90) {
  const text = String(value || '').trim()

  if (!text) {
    return 'No description available.'
  }

  return text.length > length
    ? `${text.substring(0, length)}...`
    : text
}

function formatLabel(value) {
  return String(value || 'Unknown')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getTypeLabel(type) {
  const labels = {
    course: 'Courses',
    assignment: 'Assignments',
    'research-source': 'Research Sources',
    book: 'Books',
    journal: 'Journals',
    article: 'Articles',
    note: 'Notes',
    concept: 'Concepts',
    term: 'Terms',
    tag: 'Knowledge Tags',
    person: 'People',
    flashcard: 'Flashcards',
    'writing-project': 'Writing Projects',
    'daily-page': 'Daily Pages',
    'planner-block': 'Planner Blocks',
    canvas: 'Canvases',
    jot: 'Jots',
  }

  return labels[type] || formatLabel(type)
}

function getTypeIcon(type) {
  const icons = {
    course: '🎓',
    assignment: '✅',
    'research-source': '📚',
    book: '📕',
    journal: '📰',
    article: '📑',
    note: '📝',
    concept: '💡',
    term: '📖',
    tag: '🏷️',
    person: '👤',
    flashcard: '🗂️',
    'writing-project': '✍️',
    'daily-page': '📅',
    'planner-block': '⏰',
    canvas: '🎨',
    jot: '✏️',
  }

  return icons[type] || '🔗'
}
</script>

<style scoped>
.related-items-panel {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-secondary);
  padding: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-header h3 {
  margin: 0;
}

.selected-node {
  display: inline-block;
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.total-count {
  display: grid;
  place-items: center;
  min-width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-primary);
  font-weight: 700;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.65rem;
}

.group-header h4 {
  margin: 0;
  font-size: 0.92rem;
}

.group-header span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.related-card {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.related-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.item-title {
  font-weight: 700;
}

.item-description {
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.4;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.65rem;
  color: var(--text-muted);
  font-size: 0.72rem;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
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