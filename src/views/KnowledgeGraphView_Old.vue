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
            @update:connectedContext="showConnectedContext = $event"
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
              <span>{{ visibleRelationshipCount }} Relationships</span>
            </div>

            <div class="graph-actions">
              <div class="view-toggle">
                <button
                  class="view-toggle-btn"
                  :class="{ active: graphViewMode === 'card' }"
                  type="button"
                  @click="graphViewMode = 'card'"
                >
                  Card View
                </button>

                <button
                  class="view-toggle-btn"
                  :class="{ active: graphViewMode === 'brain' }"
                  type="button"
                  @click="graphViewMode = 'brain'"
                >
                  Brain Map
                </button>

                <button
                  class="view-toggle-btn"
                  :class="{ active: focusMode }"
                  type="button"
                  @click="focusMode = !focusMode"
                >
                  Focus Mode
                </button>
              </div>

              <button
                class="reset-layout-btn"
                type="button"
                @click="resetGraphLayout"
              >
                Reset Layout
              </button>
            </div>

            <KnowledgeGraphCanvas
              ref="graphCanvasRef"
              :graph-nodes="filteredNodes"
              :graph-links="mockKnowledgeGraphLinks"
              :selected-node-id="selectedNode?.id"
              :view-mode="graphViewMode"
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
            @open-node="openNode"
            @attach-node="attachNodeToDailyPage"
            @link-note="createLinkedNote"
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
import { useRouter } from 'vue-router'

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

const router = useRouter()

const searchQuery = ref('')
const selectedType = ref('all')
const selectedTag = ref('all')
const selectedCourse = ref('all')
const graphDensity = ref(5)
const todayOnly = ref(false)
const showConnectedContext = ref(false)
const graphViewMode = ref('card')
const focusMode = ref(false)
const selectedNode = ref(null)
const graphCanvasRef = ref(null)

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
        node.description?.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query) ||
        node.status?.toLowerCase().includes(query) ||
        node.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }

  if (showConnectedContext.value && nodes.length > 0) {
    const visibleIds = new Set(nodes.map((node) => node.id))

    mockKnowledgeGraphLinks.forEach((link) => {
      if (
        visibleIds.has(link.source) ||
        visibleIds.has(link.target)
      ) {
        visibleIds.add(link.source)
        visibleIds.add(link.target)
      }
    })

    nodes = mockKnowledgeGraphNodes.filter((node) =>
      visibleIds.has(node.id)
    )
  }

  return nodes
})

const visibleRelationshipCount = computed(() => {
  const visibleNodeIds = new Set(filteredNodes.value.map((node) => node.id))

  return mockKnowledgeGraphLinks.filter(
    (link) =>
      visibleNodeIds.has(link.source) &&
      visibleNodeIds.has(link.target)
  ).length
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

function resetGraphLayout() {
  graphCanvasRef.value?.resetLayout()
}

function openNode(node) {
  if (!node) return

  if (!node.route) {
    window.alert('This node type does not have a full page yet.')
    return
  }

  router.push(node.route)
}

function attachNodeToDailyPage(node) {
  if (!node) return

  window.alert(
    `${node.title} will be attached to today's Daily Page once Daily Pages are built.`
  )
}

function createLinkedNote(node) {
  if (!node) return

  window.alert(
    `Linked note creation for "${node.title}" will be added when the Notes editor is connected.`
  )
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

.graph-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.view-toggle-btn,
.reset-layout-btn {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.view-toggle-btn:hover,
.reset-layout-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.view-toggle-btn.active {
  border-color: var(--accent);
  color: var(--text-primary);
  background: var(--bg-card);
}

@media (max-width: 1300px) {
  .graph-layout {
    grid-template-columns: 1fr;
  }

  .graph-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .view-toggle {
    width: 100%;
  }

  .view-toggle-btn,
  .reset-layout-btn {
    width: 100%;
  }
}
</style>