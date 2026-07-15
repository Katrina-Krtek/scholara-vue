<template>
  <div
    class="graph-canvas"
    :class="viewMode"
  >
    <VueFlow
      v-model:nodes="flowNodes"
      :edges="flowEdges"
      fit-view-on-init
      :min-zoom="0.2"
      :max-zoom="2"
      class="vue-flow-container"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background />

      <MiniMap
        pannable
        zoomable
        class="graph-minimap"
      />

      <Controls />

      <template #node-default="nodeProps">
        <div
          class="custom-node"
          :class="[
            nodeProps.data.type,
            getNodeHighlightClass(nodeProps.data.id),
          ]"
          @click.stop="handleNodeClick(nodeProps)"
        >
          <div class="node-title">
            {{ nodeProps.data.title }}
          </div>

          <div class="node-type">
            {{
  formatLabel(
    nodeProps.data.sourceType ||
    nodeProps.data.type
  )
}}
          </div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const STORAGE_KEY =
  'scholarory-knowledge-graph-node-positions-v2'

const clusterPositions = {
  'daily-page': { x: 0, y: 0 },
  'planner-block': { x: 0, y: 240 },
  course: { x: 340, y: 0 },
  assignment: { x: 340, y: 240 },
  'research-source': { x: 680, y: 0 },
  book: { x: 680, y: 200 },
  journal: { x: 680, y: 400 },
  article: { x: 680, y: 600 },
  note: { x: 340, y: 520 },
  concept: { x: 1020, y: 0 },
  term: { x: 1020, y: 240 },
  tag: { x: 1020, y: 480 },
  person: { x: 1360, y: 0 },
  flashcard: { x: 1360, y: 240 },
  'writing-project': { x: 1360, y: 480 },
  canvas: { x: 0, y: 480 },
  jot: { x: 0, y: 680 },
}

const props = defineProps({
  graphNodes: {
    type: Array,
    default: () => [],
  },

  graphLinks: {
    type: Array,
    default: () => [],
  },

  selectedNodeId: {
    type: String,
    default: null,
  },

  viewMode: {
    type: String,
    default: 'card',
  },

  density: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits([
  'select-node',
  'reset-layout',
])

const flowNodes = ref([])

const connectedNodeIds = computed(() => {
  if (!props.selectedNodeId) {
    return new Set()
  }

  const ids = new Set([props.selectedNodeId])

  props.graphLinks.forEach((link) => {
    if (link.source === props.selectedNodeId) {
      ids.add(link.target)
    }

    if (link.target === props.selectedNodeId) {
      ids.add(link.source)
    }
  })

  return ids
})

const flowEdges = computed(() => {
  const visibleNodeIds = new Set(
    props.graphNodes.map((node) => node.id),
  )

  return props.graphLinks
    .filter((link) => {
      return (
        visibleNodeIds.has(link.source) &&
        visibleNodeIds.has(link.target)
      )
    })
    .map((link, index) => {
      const isSelectedEdge =
        Boolean(props.selectedNodeId) &&
        (
          link.source === props.selectedNodeId ||
          link.target === props.selectedNodeId
        )

      const hasSelection =
        Boolean(props.selectedNodeId)

      return {
        id:
          link.id ||
          `graph-edge-${link.source}-${link.target}-${index}`,

        source: link.source,
        target: link.target,

        label:
          props.viewMode === 'brain'
            ? ''
            : link.label || 'Related to',

        animated: isSelectedEdge,

        class: hasSelection
          ? (
              isSelectedEdge
                ? 'highlighted-edge'
                : 'dimmed-edge'
            )
          : 'standard-edge',

        style: {
          strokeWidth: getEdgeWidth(link.strength),
        },
      }
    })
})

watch(
  () => [
    props.graphNodes,
    props.viewMode,
    props.density,
  ],
  () => {
    flowNodes.value = buildFlowNodes()
  },
  {
    immediate: true,
    deep: true,
  },
)

function buildFlowNodes() {
  const savedPositions = loadSavedPositions()
  const typeCounts = {}

  return props.graphNodes.map((node) => {
    const type = String(node.type || 'note')
    const typeIndex = typeCounts[type] || 0

    typeCounts[type] = typeIndex + 1

    return {
      id: String(node.id),
      type: 'default',

      position:
        savedPositions[node.id] ||
        getClusteredPosition(type, typeIndex),

      data: {
        ...node,
        id: String(node.id),
        type,

        title: String(
          node.title ||
          node.label ||
          'Untitled Record',
        ),
      },
    }
  })
}

function getClusteredPosition(type, index) {
  const base =
    clusterPositions[type] ||
    { x: 0, y: 0 }

  const safeDensity = Math.max(
    1,
    Math.min(10, Number(props.density) || 5),
  )

  const densityScale =
    0.55 + safeDensity * 0.09

  const columnSpacing =
    250 * densityScale

  const rowSpacing =
    145 * densityScale

  const columnOffset =
    (index % 2) * columnSpacing

  const rowOffset =
    Math.floor(index / 2) * rowSpacing

  return {
    x: base.x * densityScale + columnOffset,
    y: base.y * densityScale + rowOffset,
  }
}

function getEdgeWidth(strength = 3) {
  const numericStrength =
    Number(strength) || 3

  if (numericStrength >= 5) return 3
  if (numericStrength === 4) return 2.5
  if (numericStrength === 3) return 2
  if (numericStrength === 2) return 1.5

  return 1
}

function handleNodeClick(nodeProps) {
  emit('select-node', nodeProps.data)
}

function handleNodeDragStop(event) {
  const draggedNode =
    event?.node || event

  if (
    !draggedNode?.id ||
    !draggedNode?.position
  ) {
    return
  }

  const savedPositions =
    loadSavedPositions()

  savedPositions[draggedNode.id] = {
    x: draggedNode.position.x,
    y: draggedNode.position.y,
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(savedPositions),
  )
}

function resetLayout() {
  localStorage.removeItem(STORAGE_KEY)

  flowNodes.value =
    buildFlowNodes()

  emit('reset-layout')
}

defineExpose({
  resetLayout,
})

function loadSavedPositions() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY),
    )

    return parsed &&
      typeof parsed === 'object'
      ? parsed
      : {}
  } catch {
    return {}
  }
}

function getNodeHighlightClass(nodeId) {
  if (!props.selectedNodeId) {
    return ''
  }

  if (nodeId === props.selectedNodeId) {
    return 'selected-node'
  }

  if (connectedNodeIds.value.has(nodeId)) {
    return 'connected-node'
  }

  return 'dimmed-node'
}

function formatLabel(value) {
  return String(value || 'Record')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}
</script>

<style scoped>
.graph-canvas {
  width: 100%;
  height: 720px;
}

.vue-flow-container {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

.custom-node {
  min-width: 180px;
  max-width: 225px;
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--text-muted);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.75rem;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.custom-node:hover {
  border-color: var(--accent);
}

.selected-node {
  border-color: var(--accent);
  transform: scale(1.07);
  box-shadow:
    0 0 0 3px var(--accent-soft),
    var(--shadow);
}

.connected-node {
  border-color: var(--accent);
  box-shadow:
    0 0 0 2px var(--accent-soft),
    var(--shadow);
}

.dimmed-node {
  opacity: 0.28;
}

.node-title {
  margin-bottom: 0.35rem;
  overflow-wrap: anywhere;
  font-weight: 700;
}

.node-type {
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Brain Map mode */

.brain .custom-node {
  display: grid;
  place-items: center;
  min-width: 78px;
  max-width: 112px;
  min-height: 78px;
  border-left-width: 1px;
  border-radius: 999px;
  padding: 0.55rem;
  text-align: center;
}

.brain .node-title {
  margin-bottom: 0;
  font-size: 0.68rem;
  line-height: 1.15;
}

.brain .node-type {
  display: none;
}

/* Node categories */

.custom-node.note {
  border-left-color: #3b82f6;
}

.custom-node.tag {
  border-left-color: #10b981;
}

.custom-node.assignment {
  border-left-color: #f59e0b;
}

.custom-node.course {
  border-left-color: #ef4444;
}

.custom-node.research-source,
.custom-node.book,
.custom-node.journal,
.custom-node.article {
  border-left-color: #8b5cf6;
}

.custom-node.daily-page {
  border-left-color: #06b6d4;
}

.custom-node.planner-block {
  border-left-color: #f97316;
}

.custom-node.concept {
  border-left-color: #ec4899;
}

.custom-node.term {
  border-left-color: #14b8a6;
}

.custom-node.person {
  border-left-color: #dc2626;
}

.custom-node.flashcard {
  border-left-color: #0d9488;
}

.custom-node.writing-project {
  border-left-color: #6366f1;
}

.custom-node.canvas {
  border-left-color: #a855f7;
}

.custom-node.jot {
  border-left-color: #64748b;
}

/* Graph relationships */

:deep(.highlighted-edge .vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 3;
}

:deep(.dimmed-edge .vue-flow__edge-path) {
  opacity: 0.25;
}

:deep(.standard-edge .vue-flow__edge-path) {
  opacity: 0.78;
}

/* Theme-aware MiniMap */

:deep(.graph-minimap),
:deep(.vue-flow__minimap) {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card) !important;
  box-shadow: var(--shadow);
}

:deep(.graph-minimap .vue-flow__minimap-mask),
:deep(.vue-flow__minimap-mask) {
  fill: var(--bg-primary) !important;
  opacity: 0.78;
}

:deep(.graph-minimap .vue-flow__minimap-node),
:deep(.vue-flow__minimap-node) {
  fill: var(--accent-soft) !important;
  stroke: var(--accent) !important;
  stroke-width: 1;
}

/* Theme-aware Vue Flow controls */

:deep(.vue-flow__controls) {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

:deep(.vue-flow__controls-button) {
  border: 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: 0;
}

:deep(.vue-flow__controls-button:hover) {
  background: var(--btn-bg);
  color: var(--accent-text);
}

:deep(.vue-flow__controls-button svg) {
  fill: currentColor;
}
</style>