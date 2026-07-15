<template>
  <AppLayout
    title="Knowledge Graph"
    subtitle="Explore relationships across your courses, assignments, research, notes, concepts, terms, tags, and daily work."
    banner-key="knowledge-graph"
    default-icon="🕸️"
  >
    <main class="knowledge-graph-page">
      <div
        class="graph-layout"
        :class="{ 'focus-layout': focusMode }"
      >
        <aside
          v-if="!focusMode"
          class="left-sidebar"
        >
          <GraphFilters
            :node-types="graphNodeTypes"
            :nodes="nodes"
            :stats="visibleStats"
            @update:search="searchQuery = $event"
            @update:type="selectedType = $event"
            @update:tag="selectedTag = $event"
            @update:course="selectedCourse = $event"
            @update:density="graphDensity = $event"
            @update:todayOnly="todayOnly = $event"
            @update:connectedContext="showConnectedContext = $event"
          />

          <GraphDiscoveryPanel
            :items="discoveryItems"
            @select-discovery="handleDiscoveryClick"
          />
        </aside>

        <section class="graph-center">
          <div class="graph-card">
            <header class="graph-toolbar">
              <div class="graph-counts">
                <span>
                  <strong>{{ filteredNodes.length }}</strong>
                  Nodes
                </span>

                <span>
                  <strong>{{ visibleRelationshipCount }}</strong>
                  Relationships
                </span>
              </div>

              <button
                v-if="hasActiveFilters"
                class="clear-filter-btn"
                type="button"
                @click="handleResetFilters"
              >
                Clear Filters
              </button>
            </header>

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
                  {{ focusMode ? 'Exit Focus' : 'Focus Mode' }}
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

            <div
              v-if="filteredNodes.length === 0"
              class="graph-empty-state"
            >
              <div class="empty-icon">🕸️</div>

              <h2>No matching nodes</h2>

              <p>
                Clear the current filters or adjust your search to show more
                knowledge records.
              </p>

              <button
                class="primary-btn"
                type="button"
                @click="handleResetFilters"
              >
                Clear Filters
              </button>
            </div>

            <KnowledgeGraphCanvas
              v-else
              ref="graphCanvasRef"
              :graph-nodes="filteredNodes"
              :graph-links="filteredLinks"
              :selected-node-id="selectedNode?.id || null"
              :view-mode="graphViewMode"
              :density="graphDensity"
              @select-node="selectNode"
            />
          </div>
        </section>

        <aside
          v-if="!focusMode"
          class="right-sidebar"
        >
          <GraphNodePreview
            :node="selectedNode"
            :relationships="selectedRelationships"
            :all-nodes="nodes"
            @close="clearSelection"
            @select-node="revealNode"
            @open-node="openNode"
            @attach-node="attachNodeToDailyPage"
            @link-note="createLinkedNote"
          />

          <GraphRelatedItems
            :selected-node="selectedNode"
            :related-nodes="selectedRelatedNodes"
            @select-node="revealNode"
          />
        </aside>
      </div>
    </main>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import GraphDiscoveryPanel from '@/components/knowledge/GraphDiscoveryPanel.vue'
import GraphFilters from '@/components/knowledge/GraphFilters.vue'
import GraphNodePreview from '@/components/knowledge/GraphNodePreview.vue'
import GraphRelatedItems from '@/components/knowledge/GraphRelatedItems.vue'
import KnowledgeGraphCanvas from '@/components/knowledge/KnowledgeGraphCanvas.vue'

import { useKnowledgeGraph } from '@/composables/useKnowledgeGraph'

const router = useRouter()
const graphCanvasRef = ref(null)

const {
  graphNodeTypes,

  nodes,
  discoveryItems,

  searchQuery,
  selectedType,
  selectedTag,
  selectedCourse,
  graphDensity,
  todayOnly,
  showConnectedContext,
  graphViewMode,
  focusMode,
  selectedNode,

  filteredNodes,
  filteredLinks,
  selectedRelationships,
  selectedRelatedNodes,

  visibleStats,
  visibleRelationshipCount,

  selectNode,
  revealNode,
  clearSelection,
  resetFilters,
  getNodeById,
} = useKnowledgeGraph()

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedType.value !== 'all' ||
    selectedTag.value !== 'all' ||
    selectedCourse.value !== 'all' ||
    graphDensity.value !== 5 ||
    todayOnly.value ||
    showConnectedContext.value
  )
})

function handleDiscoveryClick(discovery) {
  const node = getNodeById(discovery?.relatedNodeId)

  if (!node) {
    return
  }

  revealNode(node)
}

function handleResetFilters() {
  resetFilters()
  clearSelection()
}

function resetGraphLayout() {
  graphCanvasRef.value?.resetLayout()
}

function openNode(node) {
  if (!node?.route) {
    window.alert(
      'This record does not have a dedicated Scholarory page yet.',
    )
    return
  }

  router.push(node.route)
}

function attachNodeToDailyPage(node) {
  if (!node) {
    return
  }

  const storageKey = 'scholarory-daily-page-attachments'

  let attachments = []

  try {
    attachments =
      JSON.parse(localStorage.getItem(storageKey)) || []
  } catch {
    attachments = []
  }

  const alreadyAttached = attachments.some((item) => {
    return item.nodeId === node.id
  })

  if (!alreadyAttached) {
    attachments.push({
      id: `daily-attachment-${Date.now()}`,
      nodeId: node.id,
      entityId: node.entityId || node.id,
      type: node.type,
      title: node.title,
      route: node.route || null,
      attachedAt: new Date().toISOString(),
    })

    localStorage.setItem(
      storageKey,
      JSON.stringify(attachments),
    )
  }

  window.alert(
    alreadyAttached
      ? `"${node.title}" is already attached to the Daily Page.`
      : `"${node.title}" was attached to the Daily Page.`,
  )
}

function createLinkedNote(node) {
  if (!node) {
    return
  }

  const storageKey = 'scholarory-linked-notes'

  let linkedNotes = []

  try {
    linkedNotes =
      JSON.parse(localStorage.getItem(storageKey)) || []
  } catch {
    linkedNotes = []
  }

  const note = {
    id: `linked-note-${Date.now()}`,
    title: `Notes for ${node.title}`,
    content: '',
    linkedNodeId: node.id,
    linkedEntityId: node.entityId || node.id,
    linkedEntityType: node.type,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  linkedNotes.unshift(note)

  localStorage.setItem(
    storageKey,
    JSON.stringify(linkedNotes),
  )

  window.alert(
    `A linked note was created for "${node.title}".`,
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

.graph-layout.focus-layout {
  grid-template-columns: minmax(0, 1fr);
}

.left-sidebar,
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.graph-center {
  min-width: 0;
}

.graph-card {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.graph-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem;
}

.graph-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.graph-counts strong {
  color: var(--text-primary);
}

.graph-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
}

.view-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.view-toggle-btn,
.reset-layout-btn,
.clear-filter-btn,
.primary-btn {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.58rem 0.82rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.view-toggle-btn:hover,
.reset-layout-btn:hover,
.clear-filter-btn:hover {
  border-color: var(--accent);
}

.view-toggle-btn.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-text);
}

.clear-filter-btn {
  padding: 0.45rem 0.7rem;
  font-size: 0.78rem;
}

.primary-btn {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.graph-empty-state {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  min-height: 500px;
  align-content: center;
  padding: 2rem;
  text-align: center;
}

.graph-empty-state h2,
.graph-empty-state p {
  margin: 0;
}

.graph-empty-state p {
  max-width: 520px;
  color: var(--text-secondary);
  line-height: 1.55;
}

.empty-icon {
  font-size: 2.4rem;
}

@media (max-width: 1300px) {
  .graph-layout {
    grid-template-columns: 1fr;
  }

  .graph-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .view-toggle {
    width: 100%;
  }

  .view-toggle-btn,
  .reset-layout-btn {
    width: 100%;
  }
}

@media (max-width: 700px) {
  .knowledge-graph-page {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .graph-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>