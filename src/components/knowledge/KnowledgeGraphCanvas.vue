<template>
  <div class="graph-canvas" :class="viewMode">
    <VueFlow
      v-model:nodes="flowNodes"
      v-model:edges="flowEdges"
      fit-view-on-init
      :min-zoom="0.2"
      :max-zoom="2"
      class="vue-flow-container"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background />
      <MiniMap />
      <Controls />

      <template #node-default="nodeProps">
        <div
          class="custom-node"
          :class="[
            nodeProps.data.type,
            getNodeHighlightClass(nodeProps.data.id)
          ]"
          @click.stop="handleNodeClick(nodeProps)"
        >
          <div class="node-title">
            {{ nodeProps.data.title }}
          </div>

          <div class="node-type">
            {{ formatLabel(nodeProps.data.type) }}
          </div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const STORAGE_KEY = 'scholarory-knowledge-graph-node-positions'

const clusterPositions = {
  'daily-page': { x: 0, y: 0 },
  'planner-block': { x: 0, y: 190 },
  course: { x: 360, y: 0 },
  assignment: { x: 360, y: 190 },
  'research-source': { x: 720, y: 0 },
  note: { x: 360, y: 420 },
  tag: { x: 720, y: 420 },
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
})

const emit = defineEmits(['select-node', 'reset-layout'])

const flowNodes = ref([])

const connectedNodeIds = computed(() => {
  if (!props.selectedNodeId) return new Set()

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
  const visibleNodeIds = new Set(props.graphNodes.map((node) => node.id))

  return props.graphLinks
    .filter(
      (link) =>
        visibleNodeIds.has(link.source) &&
        visibleNodeIds.has(link.target)
    )
    .map((link) => {
      const isSelectedEdge =
        props.selectedNodeId &&
        (link.source === props.selectedNodeId ||
          link.target === props.selectedNodeId)

      return {
        id: link.id,
        source: link.source,
        target: link.target,
        label: props.viewMode === 'brain' ? '' : link.label,
        animated: isSelectedEdge,
        class: isSelectedEdge ? 'highlighted-edge' : 'dimmed-edge',
        style: {
          strokeWidth: getEdgeWidth(link.strength),
        },
      }
    })
})

watch(
  () => [props.graphNodes, props.viewMode],
  () => {
    flowNodes.value = buildFlowNodes()
  },
  {
    immediate: true,
    deep: true,
  }
)

function buildFlowNodes() {
  const savedPositions = loadSavedPositions()
  const typeCounts = {}

  return props.graphNodes.map((node) => {
    const type = node.type || 'note'
    const typeIndex = typeCounts[type] || 0
    typeCounts[type] = typeIndex + 1

    return {
      id: node.id,
      type: 'default',
      position: savedPositions[node.id] || getClusteredPosition(type, typeIndex),
      data: {
        ...node,
      },
    }
  })
}

function getClusteredPosition(type, index) {
  const base = clusterPositions[type] || { x: 0, y: 0 }

  const columnOffset = (index % 2) * 250
  const rowOffset = Math.floor(index / 2) * 140

  return {
    x: base.x + columnOffset,
    y: base.y + rowOffset,
  }
}

function getEdgeWidth(strength = 3) {
  if (strength >= 5) return 3
  if (strength === 4) return 2.5
  if (strength === 3) return 2
  if (strength === 2) return 1.5
  return 1
}

function handleNodeClick(nodeProps) {
  emit('select-node', nodeProps.data)
}

function handleNodeDragStop(event) {
  const draggedNode = event?.node || event

  if (!draggedNode?.id || !draggedNode?.position) return

  const savedPositions = loadSavedPositions()

  savedPositions[draggedNode.id] = {
    x: draggedNode.position.x,
    y: draggedNode.position.y,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPositions))
}

function resetLayout() {
  localStorage.removeItem(STORAGE_KEY)
  flowNodes.value = buildFlowNodes()
  emit('reset-layout')
}

defineExpose({
  resetLayout,
})

function loadSavedPositions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function getNodeHighlightClass(nodeId) {
  if (!props.selectedNodeId) return ''

  if (nodeId === props.selectedNodeId) {
    return 'selected-node'
  }

  if (connectedNodeIds.value.has(nodeId)) {
    return 'connected-node'
  }

  return 'dimmed-node'
}

function formatLabel(value) {
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<style scoped>
.graph-canvas {
  width: 100%;
  height: 700px;
}

.vue-flow-container {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

.custom-node {
  min-width: 180px;
  max-width: 220px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  color: var(--text-primary);
  box-shadow: var(--shadow);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.brain .custom-node {
  min-width: 72px;
  max-width: 110px;
  min-height: 72px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 0.55rem;
}

.brain .node-title {
  font-size: 0.68rem;
  line-height: 1.15;
  margin-bottom: 0;
}

.brain .node-type {
  display: none;
}

.custom-node:hover {
  border-color: var(--accent);
}

.selected-node {
  transform: scale(1.08);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18), var(--shadow);
}

.connected-node {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.12), var(--shadow);
}

.dimmed-node {
  opacity: 0.28;
}

.node-title {
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.node-type {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.custom-node.note {
  border-left: 4px solid #3b82f6;
}

.custom-node.tag {
  border-left: 4px solid #10b981;
}

.custom-node.assignment {
  border-left: 4px solid #f59e0b;
}

.custom-node.course {
  border-left: 4px solid #ef4444;
}

.custom-node.research-source {
  border-left: 4px solid #8b5cf6;
}

.custom-node.daily-page {
  border-left: 4px solid #06b6d4;
}

.custom-node.planner-block {
  border-left: 4px solid #f97316;
}

.brain .custom-node.note,
.brain .custom-node.tag,
.brain .custom-node.assignment,
.brain .custom-node.course,
.brain .custom-node.research-source,
.brain .custom-node.daily-page,
.brain .custom-node.planner-block {
  border-left-width: 1px;
}

.brain .custom-node.note {
  box-shadow: inset 0 0 0 4px rgba(59, 130, 246, 0.18), var(--shadow);
}

.brain .custom-node.tag {
  box-shadow: inset 0 0 0 4px rgba(16, 185, 129, 0.18), var(--shadow);
}

.brain .custom-node.assignment {
  box-shadow: inset 0 0 0 4px rgba(245, 158, 11, 0.18), var(--shadow);
}

.brain .custom-node.course {
  box-shadow: inset 0 0 0 4px rgba(239, 68, 68, 0.18), var(--shadow);
}

.brain .custom-node.research-source {
  box-shadow: inset 0 0 0 4px rgba(139, 92, 246, 0.18), var(--shadow);
}

.brain .custom-node.daily-page {
  box-shadow: inset 0 0 0 4px rgba(6, 182, 212, 0.18), var(--shadow);
}

.brain .custom-node.planner-block {
  box-shadow: inset 0 0 0 4px rgba(249, 115, 22, 0.18), var(--shadow);
}

:deep(.highlighted-edge .vue-flow__edge-path) {
  stroke-width: 3;
  stroke: var(--accent);
}

:deep(.dimmed-edge .vue-flow__edge-path) {
  opacity: 0.35;
}
</style>