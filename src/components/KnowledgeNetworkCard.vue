<template>
  <section class="network-card">
    <div class="network-header">
      <div>
        <h2>Knowledge Network</h2>
        <p>Local graph relationships for this research source.</p>
      </div>

      <span class="network-count">
        {{ totalConnections }} connection{{ totalConnections === 1 ? '' : 's' }}
      </span>
    </div>

    <div class="network-map">
      <div class="side-cluster">
        <h3>Connected Tags</h3>

        <p v-if="attachedTags.length === 0" class="muted-text">
          No knowledge tags attached yet.
        </p>

        <RouterLink
          v-for="tag in attachedTagsWithCounts"
          :key="tag.id"
          :to="`/knowledge-tags/${tag.id}`"
          class="network-pill tag-pill"
        >
          <span>{{ tag.icon || '🏷️' }} {{ tag.name }}</span>
          <strong>{{ tag.sourceCount }}</strong>
        </RouterLink>
      </div>

      <div class="center-cluster">
        <div class="center-node">
          <span class="center-icon">{{ getItemIcon(item) }}</span>
          <strong>{{ item?.title || 'Research Item' }}</strong>
          <small>Current Source</small>
        </div>

        <div class="connection-summary">
          <div>
            <strong>{{ attachedTags.length }}</strong>
            <span>Tags</span>
          </div>

          <div>
            <strong>{{ linkedItems.length }}</strong>
            <span>Direct</span>
          </div>

          <div>
            <strong>{{ backlinks.length }}</strong>
            <span>Backlinks</span>
          </div>
        </div>
      </div>

      <div class="side-cluster">
        <h3>Connected Sources</h3>

        <p v-if="combinedSources.length === 0" class="muted-text">
          No connected sources yet.
        </p>

        <RouterLink
          v-for="source in combinedSources"
          :key="source.id"
          :to="`/research/items/${source.id}`"
          class="network-pill source-pill"
        >
          <span>{{ getItemIcon(source) }} {{ source.title }}</span>
          <small>{{ source.connectionType }}</small>
        </RouterLink>
      </div>
    </div>
    <section class="graph-preview-section">
  <h3>Local Graph</h3>

  <LocalGraphView
    center-type="source"
    :center-id="item.id"
    :center-title="item.title"
    :center-icon="getItemIcon(item)"
    center-label="Current Source"
    :tags="attachedTags"
    :sources="combinedSources"
  />
</section>

    <div class="network-insights">
      <div class="insight-card">
        <h3>Most Connected Tags</h3>

        <p v-if="topAttachedTags.length === 0" class="muted-text">
          Add tags to begin building relationship strength.
        </p>

        <RouterLink
          v-for="tag in topAttachedTags"
          :key="tag.id"
          :to="`/knowledge-tags/${tag.id}`"
          class="insight-row"
        >
          <span>{{ tag.icon || '🏷️' }} {{ tag.name }}</span>
          <strong>{{ tag.sourceCount }} source{{ tag.sourceCount === 1 ? '' : 's' }}</strong>
        </RouterLink>
      </div>

      <div class="insight-card">
        <h3>Relationship Strength</h3>

        <div class="strength-meter">
          <div class="strength-fill" :style="{ width: `${relationshipStrength}%` }"></div>
        </div>

        <p class="strength-label">
          {{ relationshipStrengthLabel }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { getResearchTypeById } from '../data/researchTypes'
import { useKnowledgeTags } from '../composables/useKnowledgeTags'
import LocalGraphView from './LocalGraphView.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  attachedTags: {
    type: Array,
    default: () => []
  },
  linkedItems: {
    type: Array,
    default: () => []
  },
  backlinks: {
    type: Array,
    default: () => []
  }
})

const {
  allResearchItemTags,
  loadResearchItemTags
} = useKnowledgeTags()

onMounted(async () => {
  await loadResearchItemTags()
})

const totalConnections = computed(() => {
  return props.attachedTags.length + props.linkedItems.length + props.backlinks.length
})

const attachedTagsWithCounts = computed(() => {
  return props.attachedTags
    .map((tag) => ({
      ...tag,
      sourceCount: getTagSourceCount(tag.id)
    }))
    .sort((a, b) => b.sourceCount - a.sourceCount)
})

const topAttachedTags = computed(() => {
  return attachedTagsWithCounts.value.slice(0, 5)
})

const combinedSources = computed(() => {
  const sourceMap = new Map()

  props.linkedItems.forEach((source) => {
    sourceMap.set(source.id, {
      ...source,
      connectionType: 'Direct'
    })
  })

  props.backlinks.forEach((source) => {
    sourceMap.set(source.id, {
      ...source,
      connectionType: sourceMap.has(source.id) ? 'Direct + Backlink' : 'Backlink'
    })
  })

  return Array.from(sourceMap.values())
})

const relationshipStrength = computed(() => {
  const score =
    props.attachedTags.length * 20 +
    props.linkedItems.length * 25 +
    props.backlinks.length * 25

  return Math.min(score, 100)
})

const relationshipStrengthLabel = computed(() => {
  if (relationshipStrength.value >= 80) {
    return 'Strongly connected source'
  }

  if (relationshipStrength.value >= 50) {
    return 'Moderately connected source'
  }

  if (relationshipStrength.value >= 25) {
    return 'Lightly connected source'
  }

  return 'Early-stage network source'
})

function getTagSourceCount(tagId) {
  return allResearchItemTags.value.filter((link) => link.knowledgeTagId === tagId).length
}

function getItemIcon(researchItem) {
  if (!researchItem) return '📄'

  const type = getResearchTypeById(researchItem.type)
  return type?.icon || '📄'
}
</script>

<style scoped>
.network-card {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  padding: 1.2rem;
  margin: 2.5rem 0;
  box-shadow: var(--shadow);
}

.network-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.network-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.network-header p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.network-count {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

.network-map {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.side-cluster,
.center-cluster,
.insight-card {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--btn-bg);
  padding: 0.9rem;
  min-width: 0;
}

.side-cluster h3,
.insight-card h3 {
  margin: 0 0 0.75rem;
  font-size: 0.92rem;
  color: var(--text-secondary);
}

.center-cluster {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.85rem;
}

.center-node {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  padding: 1rem;
  text-align: center;
}

.center-icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.55rem;
}

.center-node strong {
  display: block;
  font-size: 0.95rem;
  line-height: 1.35;
}

.center-node small {
  display: block;
  color: var(--text-muted);
  margin-top: 0.45rem;
  font-size: 0.75rem;
}

.connection-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
}

.connection-summary div {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 0.55rem 0.3rem;
  text-align: center;
}

.connection-summary strong {
  display: block;
  font-size: 1rem;
}

.connection-summary span {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.network-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.42rem 0.6rem;
  font-size: 0.82rem;
  text-decoration: none;
  margin-bottom: 0.45rem;
  min-width: 0;
}

.network-pill span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.network-pill strong,
.network-pill small {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 0.72rem;
}

.network-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tag-pill strong {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  padding: 0.1rem 0.4rem;
}

.network-insights {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1rem;
  margin-top: 1rem;
}

.insight-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
  padding: 0.45rem 0;
  font-size: 0.84rem;
}

.insight-row:last-child {
  border-bottom: none;
}

.insight-row:hover {
  color: var(--accent);
}

.insight-row strong {
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.strength-meter {
  height: 10px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
}

.strength-label {
  margin: 0.7rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.muted-text {
  color: var(--text-muted);
  font-size: 0.84rem;
  margin: 0;
}

@media (max-width: 980px) {
  .network-map,
  .network-insights {
    grid-template-columns: 1fr;
  }

  .center-cluster {
    order: -1;
  }
}

@media (max-width: 620px) {
  .network-header {
    flex-direction: column;
  }

  .connection-summary {
    grid-template-columns: 1fr;
  }
}
.graph-preview-section {
  margin-top: 1rem;
}

.graph-preview-section h3 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}
</style>