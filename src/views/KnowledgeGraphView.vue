<template>
  <AppLayout
    title="Knowledge Graph"
    subtitle="Explore relationships between notes, sources, assignments, courses, tags, and daily pages."
    banner-key="knowledge-graph"
    default-icon="🕸️"
  >
    <main class="knowledge-graph-page">
      <div class="graph-layout">
        <aside class="left-sidebar">
          <GraphFilters
            :node-types="graphNodeTypes"
            :nodes="mockKnowledgeGraphNodes"
            :stats="stats"
            @update:search="searchQuery = $event"
            @update:type="selectedType = $event"
            @update:tag="selectedTag = $event"
            @update:course="selectedCourse = $event"
            @update:density="graphDensity = $event"
            @update:todayOnly="todayOnly = $event"
          />

          <GraphDiscoveryPanel
            :items="mockGraphDiscoveryItems"
            @select-discovery="handleDiscoveryClick"
          />
        </aside>

        <main class="graph-center">
          <section class="graph-card">
            <div class="graph-toolbar">
              <span>{{ filteredNodes.length }} Nodes</span>
              <span>{{ mockKnowledgeGraphLinks.length }} Relationships</span>
            </div>

            <KnowledgeGraphCanvas
              @select-node="selectNode"
            />
          </section>
        </main>

        <aside class="right-sidebar">
          <GraphNodePreview
            :node="selectedNode"
            :relationships="selectedRelationships"
            :all-nodes="mockKnowledgeGraphNodes"
            @close="selectedNode = null"
            @select-node="selectNode"
          />

          <GraphRelatedItems
            :selected-node="selectedNode"
            :related-nodes="selectedRelatedNodes"
            @select-node="selectNode"
          />
        </aside>
      </div>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'

import AppLayout from '../components/AppLayout.vue'
import GraphFilters from '../components/knowledge/GraphFilters.vue'
import GraphNodePreview from '../components/knowledge/GraphNodePreview.vue'
import GraphRelatedItems from '../components/knowledge/GraphRelatedItems.vue'
import GraphDiscoveryPanel from '../components/knowledge/GraphDiscoveryPanel.vue'
import KnowledgeGraphCanvas from '../components/knowledge/KnowledgeGraphCanvas.vue'

import {
  graphNodeTypes,
  mockKnowledgeGraphNodes,
  mockKnowledgeGraphLinks,
  mockGraphDiscoveryItems,
  getGraphStats,
  getLinksForNode,
  getRelatedNodes
} from '../data/mockKnowledgeGraph'

const searchQuery = ref('')
const selectedType = ref('all')
const selectedTag = ref('all')
const selectedCourse = ref('all')
const graphDensity = ref(5)
const todayOnly = ref(false)

const selectedNode = ref(null)

const stats = getGraphStats()

const filteredNodes = computed(() => {
  let nodes = [...mockKnowledgeGraphNodes]

  if (todayOnly.value) {
    nodes = nodes.filter((node) => node.date === '2026-06-03')
  }

  if (selectedType.value !== 'all') {
    nodes = nodes.filter((node) => node.type === selectedType.value)
  }

  if (selectedTag.value !== 'all') {
    nodes = nodes.filter((node) => node.tags?.includes(selectedTag.value))
  }

  if (selectedCourse.value !== 'all') {
    nodes = nodes.filter(
      (node) =>
        node.id === selectedCourse.value ||
        node.courseId === selectedCourse.value
    )
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()

    nodes = nodes.filter(
      (node) =>
        node.title.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query)
    )
  }

  return nodes
})

const selectedRelationships = computed(() => {
  if (!selectedNode.value) return []
  return getLinksForNode(selectedNode.value.id)
})

const selectedRelatedNodes = computed(() => {
  if (!selectedNode.value) return []
  return getRelatedNodes(selectedNode.value.id)
})

function selectNode(node) {
  selectedNode.value = node
}

function handleDiscoveryClick(discovery) {
  const node = mockKnowledgeGraphNodes.find(
    (item) => item.id === discovery.relatedNodeId
  )

  if (node) {
    selectedNode.value = node
  }
}
</script>

<style scoped>
.knowledge-graph-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem 2rem 6rem;
  color: var(--text-primary);
}

.graph-layout {
  display: grid;
  grid-template-columns: 300px minmax(420px, 1fr) 340px;
  gap: 1rem;
  align-items: start;
}

.left-sidebar,
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.graph-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.graph-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 600;
}

@media (max-width: 1300px) {
  .graph-layout {
    grid-template-columns: 1fr;
  }
}
</style>