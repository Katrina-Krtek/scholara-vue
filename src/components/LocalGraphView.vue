<template>
  <section class="local-graph">
    <div class="graph-stage">
      <div class="graph-background">
        <div class="graph-line left-line"></div>
        <div class="graph-line right-line"></div>
        <div class="graph-line vertical-line"></div>
      </div>

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
    radial-gradient(circle at center, rgba(99, 102, 241, 0.12), transparent 36%),
    radial-gradient(circle at 22% 30%, rgba(168, 85, 247, 0.08), transparent 24%),
    radial-gradient(circle at 78% 72%, rgba(59, 130, 246, 0.08), transparent 24%),
    var(--bg-card);
  padding: 1.25rem;
  margin-top: 1rem;
  overflow: hidden;
}

.graph-stage {
  display: grid;
  grid-template-columns: minmax(170px, 1fr) 250px minmax(170px, 1fr);
  gap: 1.25rem;
  align-items: center;
  min-height: 320px;
  position: relative;
}

.graph-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.graph-line {
  position: absolute;
  background: linear-gradient(
    90deg,
    transparent,
    var(--border-color),
    transparent
  );
  opacity: 0.9;
}

.left-line {
  top: 50%;
  left: 16%;
  width: 36%;
  height: 1px;
  transform: rotate(-12deg);
  transform-origin: center;
}

.right-line {
  top: 50%;
  right: 16%;
  width: 36%;
  height: 1px;
  transform: rotate(12deg);
  transform-origin: center;
}

.vertical-line {
  top: 18%;
  left: 50%;
  width: 1px;
  height: 64%;
  background: linear-gradient(
    180deg,
    transparent,
    var(--border-color),
    transparent
  );
  opacity: 0.45;
}

.graph-column {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  position: relative;
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
  z-index: 3;
}

.graph-node {
  position: relative;
  z-index: 2;
  min-width: 145px;
  max-width: 230px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-decoration: none;
  padding: 0.58rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: var(--shadow);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.graph-node::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 1px solid transparent;
  pointer-events: none;
}

.graph-node:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  color: var(--accent);
}

.graph-node:hover::before {
  border-color: rgba(99, 102, 241, 0.25);
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

.tag-node {
  margin-right: 0.75rem;
}

.source-node {
  margin-left: 0.75rem;
}

.center-node {
  min-width: 220px;
  max-width: 270px;
  min-height: 142px;
  border-radius: 24px;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 1.1rem;
  border-color: var(--accent);
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 50%),
    var(--bg-card);
}

.center-node span {
  font-size: 2.15rem;
}

.center-node strong {
  white-space: normal;
  font-size: 0.96rem;
  line-height: 1.32;
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
    min-height: auto;
  }

  .graph-background {
    display: none;
  }

  .left-column,
  .right-column {
    align-items: stretch;
  }

  .tag-node,
  .source-node {
    margin: 0;
  }

  .graph-node,
  .center-node {
    max-width: none;
    width: 100%;
  }

  .graph-center {
    order: -1;
  }
}
</style>