<template>
  <section class="local-graph">
    <div class="graph-stage">
      <div class="graph-column left-column">
        <RouterLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/knowledge-tags/${tag.id}`"
          class="graph-node tag-node"
        >
          <span>{{ tag.icon || '🏷️' }}</span>
          <strong>{{ tag.name }}</strong>
        </RouterLink>
      </div>

      <div class="graph-center">
        <div class="connector-line horizontal-line"></div>

        <RouterLink
          :to="centerLink"
          class="graph-node center-node"
        >
          <span>{{ centerIcon }}</span>
          <strong>{{ centerTitle }}</strong>
          <small>{{ centerLabel }}</small>
        </RouterLink>
      </div>

      <div class="graph-column right-column">
        <RouterLink
          v-for="source in sources"
          :key="source.id"
          :to="`/research/items/${source.id}`"
          class="graph-node source-node"
        >
          <span>{{ getItemIcon(source) }}</span>
          <strong>{{ source.title }}</strong>
        </RouterLink>
      </div>
    </div>

    <div v-if="isEmpty" class="empty-graph">
      No local graph relationships yet.
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { getResearchTypeById } from '../data/researchTypes'

const props = defineProps({
  centerType: {
    type: String,
    default: 'source'
  },
  centerTitle: {
    type: String,
    required: true
  },
  centerIcon: {
    type: String,
    default: '📄'
  },
  centerId: {
    type: String,
    required: true
  },
  centerLabel: {
    type: String,
    default: 'Current Node'
  },
  tags: {
    type: Array,
    default: () => []
  },
  sources: {
    type: Array,
    default: () => []
  }
})

const centerLink = computed(() => {
  if (props.centerType === 'tag') {
    return `/knowledge-tags/${props.centerId}`
  }

  return `/research/items/${props.centerId}`
})

const isEmpty = computed(() => {
  return props.tags.length === 0 && props.sources.length === 0
})

function getItemIcon(researchItem) {
  if (!researchItem) return '📄'

  const type = getResearchTypeById(researchItem.type)
  return type?.icon || '📄'
}
</script>

<style scoped>
.local-graph {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background:
    radial-gradient(circle at center, rgba(99, 102, 241, 0.08), transparent 34%),
    var(--bg-card);
  padding: 1.2rem;
  margin-top: 1rem;
  overflow: hidden;
}

.graph-stage {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) 240px minmax(160px, 1fr);
  gap: 1.25rem;
  align-items: center;
  min-height: 260px;
  position: relative;
}

.graph-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 2;
}

.left-column {
  align-items: flex-end;
}

.right-column {
  align-items: flex-start;
}

.graph-center {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}

.horizontal-line {
  position: absolute;
  width: 520px;
  height: 1px;
  background: var(--border-color);
  z-index: 0;
}

.graph-node {
  position: relative;
  z-index: 2;
  min-width: 140px;
  max-width: 220px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-decoration: none;
  padding: 0.55rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: var(--shadow);
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.graph-node:hover {
  transform: translateY(-1px);
  border-color: var(--accent);
  color: var(--accent);
}

.graph-node span {
  flex-shrink: 0;
}

.graph-node strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
}

.center-node {
  min-width: 210px;
  max-width: 260px;
  min-height: 130px;
  border-radius: 22px;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 1rem;
}

.center-node span {
  font-size: 2rem;
}

.center-node strong {
  white-space: normal;
  font-size: 0.95rem;
  line-height: 1.3;
}

.center-node small {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.empty-graph {
  color: var(--text-muted);
  text-align: center;
  padding: 1rem 0 0;
  font-size: 0.88rem;
}

@media (max-width: 850px) {
  .graph-stage {
    grid-template-columns: 1fr;
  }

  .left-column,
  .right-column {
    align-items: stretch;
  }

  .horizontal-line {
    display: none;
  }

  .graph-node,
  .center-node {
    max-width: none;
    width: 100%;
  }
}
</style>