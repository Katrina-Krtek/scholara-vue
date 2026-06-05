<template>
  <AppLayout
    title="Knowledge Graph"
    subtitle="Visualize relationships between courses, assignments, sources, notes, concepts, terms, people, and flashcards."
    banner-key="knowledge"
    default-icon="🕸️"
  >
    <GraphStats
      :stats="nodeStats"
      :most-connected-node="mostConnectedNode"
      :orphan-nodes="orphanNodes"
    />

    <div class="controls-row">
      <GraphSearch
        v-model="searchQuery"
        :nodes="nodes"
      />
    </div>

    <div class="graph-layout">
      <aside class="left-sidebar">
        <GraphFilters
          v-model="activeTypes"
          :nodes="nodes"
        />
      </aside>

      <main class="graph-main">
        <KnowledgeGraphCanvas
          :nodes="filteredNodes"
          :links="filteredLinks"
          :selected-node="selectedNode"
          @select-node="selectNode"
        />
      </main>

      <aside class="right-sidebar">
        <GraphNodeCard
          :node="selectedNode"
          :connected-nodes="connectedNodes"
          @select-node="selectNode"
          @view-node="handleViewNode"
          @edit-node="handleEditNode"
          @delete-node="handleDeleteNode"
        />
      </aside>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'

import GraphFilters from '@/components/graph/GraphFilters.vue'
import GraphNodeCard from '@/components/graph/GraphNodeCard.vue'
import GraphSearch from '@/components/graph/GraphSearch.vue'
import GraphStats from '@/components/graph/GraphStats.vue'
import KnowledgeGraphCanvas from '@/components/graph/KnowledgeGraphCanvas.vue'

import { useKnowledgeGraph } from '@/composables/useKnowledgeGraph'

const {
  searchQuery,
  activeTypes,
  selectedNode,

  filteredNodes,
  filteredLinks,

  connectedNodes,

  nodeStats,
  mostConnectedNode,
  orphanNodes,

  nodes,

  selectNode
} = useKnowledgeGraph()

const handleViewNode = (node) => {
  console.log('View node', node)
}

const handleEditNode = (node) => {
  console.log('Edit node', node)
}

const handleDeleteNode = (node) => {
  console.log('Delete node', node)
}
</script>

<style scoped>
.controls-row {
  margin-bottom: 1rem;
}

.graph-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1rem;
  min-height: 750px;
}

.left-sidebar,
.right-sidebar {
  display: flex;
  flex-direction: column;
}

.graph-main {
  min-width: 0;
}

@media (max-width: 1200px) {
  .graph-layout {
    grid-template-columns: 250px 1fr;
  }

  .right-sidebar {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .graph-layout {
    grid-template-columns: 1fr;
  }

  .left-sidebar,
  .right-sidebar {
    width: 100%;
  }
}
</style>