<template>
  <div
    class="graph-canvas"
    :class="viewMode"
  >
    <VueFlow
      v-model:nodes="flowNodes"
      :edges="flowEdges"
      :min-zoom="0.12"
      :max-zoom="2.5"
      :pan-on-drag="[0, 1]"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :zoom-on-double-click="false"
      :pan-on-scroll="false"
      :prevent-scrolling="true"
      :nodes-connectable="false"
      :edges-focusable="false"
      :elevate-nodes-on-select="false"
      :select-nodes-on-drag="false"
      class="vue-flow-container"
      @pane-ready="handlePaneReady"
      @move="handleViewportMove"
      @pane-click="handlePaneClick"
      @node-drag-start="handleNodeDragStart"
      @node-drag="handleNodeDrag"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background />

      <MiniMap
        pannable
        zoomable
        :node-color="getMiniMapNodeColor"
        class="graph-minimap"
      />

      <Controls />

      <template #node-default="nodeProps">
        <div
          class="custom-node"
          :class="[
            nodeProps.data.type,
            getNodeHighlightClass(
              nodeProps.data.id,
            ),
            {
              'show-context-label':
                shouldShowNodeLabel(
                  nodeProps.data,
                ),
            },
          ]"
          :style="getNodeStyle(
            nodeProps.data,
          )"
          :title="getNodeTooltip(
            nodeProps.data,
          )"
          role="button"
          tabindex="0"
          @click.stop="
            handleNodeClick(nodeProps)
          "
          @keydown.enter.stop="
            handleNodeClick(nodeProps)
          "
          @keydown.space.prevent.stop="
            handleNodeClick(nodeProps)
          "
        >
          <div class="node-core">
            <span class="node-connection-count">
              {{
                nodeProps.data.connectionCount
              }}
            </span>
          </div>

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
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force'

import {
  Background,
} from '@vue-flow/background'

import {
  Controls,
} from '@vue-flow/controls'

import {
  VueFlow,
} from '@vue-flow/core'

import {
  MiniMap,
} from '@vue-flow/minimap'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

const CARD_STORAGE_KEY =
  'scholarory-knowledge-graph-card-positions-v3'

const BRAIN_STORAGE_KEY =
  'scholarory-knowledge-graph-brain-positions-v3'

const LEGACY_STORAGE_KEY =
  'scholarory-knowledge-graph-node-positions-v2'

const clusterPositions = {
  'daily-page': { x: 0, y: 0 },
  'planner-block': { x: 0, y: 240 },
  course: { x: 340, y: 0 },
  assignment: { x: 340, y: 240 },
  'research-source': { x: 680, y: 0 },
  source: { x: 680, y: 0 },
  book: { x: 680, y: 200 },
  'book-chapter': { x: 680, y: 360 },
  journal: { x: 680, y: 520 },
  article: { x: 680, y: 680 },
  'journal-article': { x: 680, y: 680 },
  dissertation: { x: 900, y: 200 },
  thesis: { x: 900, y: 380 },
  note: { x: 340, y: 520 },
  concept: { x: 1100, y: 0 },
  term: { x: 1100, y: 240 },
  tag: { x: 1100, y: 480 },
  'knowledge-tag': { x: 1100, y: 480 },
  person: { x: 1400, y: 0 },
  flashcard: { x: 1400, y: 240 },
  'writing-project': { x: 1400, y: 480 },
  canvas: { x: 0, y: 480 },
  jot: { x: 0, y: 680 },
}

const nodeTypeColors = {
  note: '#3b82f6',
  tag: '#10b981',
  'knowledge-tag': '#10b981',
  assignment: '#f59e0b',
  course: '#ef4444',

  'research-source': '#8b5cf6',
  source: '#8b5cf6',
  book: '#7c3aed',
  'book-chapter': '#6d28d9',
  journal: '#9333ea',
  article: '#a855f7',
  'journal-article': '#a855f7',
  dissertation: '#7e22ce',
  thesis: '#9333ea',
  blog: '#c026d3',
  webpage: '#d946ef',
  website: '#d946ef',
  report: '#8b5cf6',
  'conference-paper': '#a21caf',
  encyclopedia: '#6d28d9',
  dictionary: '#7e22ce',
  podcast: '#c026d3',
  video: '#db2777',
  media: '#be185d',

  'daily-page': '#06b6d4',
  'planner-block': '#f97316',
  concept: '#ec4899',
  term: '#14b8a6',
  person: '#dc2626',
  flashcard: '#0d9488',
  'writing-project': '#6366f1',
  canvas: '#a855f7',
  jot: '#64748b',
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
const flowInstance = ref(null)
const viewportZoom = ref(1)

let simulation = null
let simulationNodes = []
let simulationNodeById = new Map()
let animationFrameId = null
let fitTimerId = null
let dragReleaseTimerId = null
let settleSaveTimerId = null

const visibleNodeIds = computed(() => {
  return new Set(
    props.graphNodes.map((node) => {
      return String(node.id)
    }),
  )
})

const nodeDistanceMap = computed(() => {
  const distances = new Map()

  if (
    !props.selectedNodeId ||
    !visibleNodeIds.value.has(
      String(props.selectedNodeId),
    )
  ) {
    return distances
  }

  const adjacency = new Map()

  visibleNodeIds.value.forEach((nodeId) => {
    adjacency.set(nodeId, new Set())
  })

  props.graphLinks.forEach((link) => {
    const source = String(link.source)
    const target = String(link.target)

    if (
      !visibleNodeIds.value.has(source) ||
      !visibleNodeIds.value.has(target)
    ) {
      return
    }

    adjacency.get(source)?.add(target)
    adjacency.get(target)?.add(source)
  })

  const selectedId =
    String(props.selectedNodeId)

  const queue = [selectedId]

  distances.set(selectedId, 0)

  while (queue.length > 0) {
    const currentId = queue.shift()

    const currentDistance =
      distances.get(currentId) || 0

    adjacency
      .get(currentId)
      ?.forEach((neighborId) => {
        if (distances.has(neighborId)) {
          return
        }

        distances.set(
          neighborId,
          currentDistance + 1,
        )

        queue.push(neighborId)
      })
  }

  return distances
})

const flowEdges = computed(() => {
  return props.graphLinks
    .filter((link) => {
      return (
        visibleNodeIds.value.has(
          String(link.source),
        ) &&
        visibleNodeIds.value.has(
          String(link.target),
        )
      )
    })
    .map((link, index) => {
      const source = String(link.source)
      const target = String(link.target)

      const sourceDistance =
        nodeDistanceMap.value.get(source)

      const targetDistance =
        nodeDistanceMap.value.get(target)

      const relationshipDistance =
        getRelationshipDistance(
          sourceDistance,
          targetDistance,
        )

      const hasSelection =
        Boolean(props.selectedNodeId)

      const edgeClass = hasSelection
        ? getEdgeHighlightClass(
            relationshipDistance,
          )
        : 'standard-edge'

      return {
        id:
          link.id ||
          `graph-edge-${source}-${target}-${index}`,

        source,
        target,

        type:
          props.viewMode === 'brain'
            ? 'straight'
            : 'default',

        label:
          props.viewMode === 'brain'
            ? ''
            : link.label || 'Related to',

        animated: false,
        selectable: false,
        class: edgeClass,

        style: {
          strokeWidth:
            props.viewMode === 'brain'
              ? getBrainEdgeWidth(
                  link.strength,
                )
              : getCardEdgeWidth(
                  link.strength,
                ),
        },
      }
    })
})

watch(
  () => [
    props.graphNodes,
    props.graphLinks,
    props.viewMode,
    props.density,
  ],
  () => {
    rebuildGraph()
  },
  {
    immediate: true,
    deep: true,
  },
)

onBeforeUnmount(() => {
  stopSimulation()
  clearFitTimer()
  clearDragReleaseTimer()
  clearSettleSaveTimer()
})

function rebuildGraph() {
  stopSimulation()
  clearFitTimer()

  flowNodes.value = buildFlowNodes()

  nextTick(() => {
    if (props.viewMode === 'brain') {
      startForceSimulation()
    } else {
      scheduleFitView(180)
    }
  })
}

function buildFlowNodes() {
  const storageKey =
    props.viewMode === 'brain'
      ? BRAIN_STORAGE_KEY
      : CARD_STORAGE_KEY

  const savedPositions =
    loadSavedPositions(storageKey)

  const connectionCounts =
    getVisibleConnectionCounts()

  const typeCounts = {}

  return props.graphNodes.map(
    (node, index) => {
      const id = String(node.id)
      const type =
        String(node.type || 'note')

      const typeIndex =
        typeCounts[type] || 0

      typeCounts[type] =
        typeIndex + 1

      const connectionCount =
        connectionCounts.get(id) || 0

      const position =
        savedPositions[id] ||
        (
          props.viewMode === 'brain'
            ? getBrainSeedPosition(
                id,
                index,
                props.graphNodes.length,
                connectionCount,
              )
            : getClusteredPosition(
                type,
                typeIndex,
              )
        )

      return {
        id,
        type: 'default',
        draggable: true,
        selectable: true,
        position,

        data: {
          ...node,
          id,
          type,

          title: String(
            node.title ||
            node.label ||
            'Untitled Record',
          ),

          connectionCount,

          nodeSize:
            getNodeSize(connectionCount),

          nodeColor:
            getNodeTypeColor(type),
        },
      }
    },
  )
}

function startForceSimulation() {
  if (props.viewMode !== 'brain') {
    return
  }

  if (flowNodes.value.length === 0) {
    return
  }

  simulationNodes =
    flowNodes.value.map((node) => {
      return {
        id: node.id,

        x:
          Number(node.position?.x) || 0,

        y:
          Number(node.position?.y) || 0,

        vx: 0,
        vy: 0,

        connectionCount:
          Number(
            node.data?.connectionCount,
          ) || 0,

        radius:
          (
            Number(
              node.data?.nodeSize,
            ) || 24
          ) / 2,

        /*
         * Brain Map positions are seeds, not permanent pins.
         * Nodes are temporarily fixed only while the user
         * is actively dragging them.
         */
        fx: null,
        fy: null,
      }
    })

  simulationNodeById =
    new Map(
      simulationNodes.map((node) => {
        return [node.id, node]
      }),
    )

  if (simulationNodes.length === 1) {
    simulationNodes[0].x = 0
    simulationNodes[0].y = 0
    syncSimulationPositions()
    saveBrainSimulationPositions()
    scheduleFitView(80)
    return
  }

  const simulationLinks =
    props.graphLinks
      .filter((link) => {
        return (
          simulationNodeById.has(
            String(link.source),
          ) &&
          simulationNodeById.has(
            String(link.target),
          )
        )
      })
      .map((link) => {
        return {
          ...link,
          source: String(link.source),
          target: String(link.target),
        }
      })

  const safeDensity =
    Math.max(
      1,
      Math.min(
        10,
        Number(props.density) || 5,
      ),
    )

  /*
   * A larger density value spreads the network farther
   * apart without changing the underlying relationships.
   */
  const linkDistance =
    72 + safeDensity * 12

  simulation =
    forceSimulation(simulationNodes)
      .force(
        'link',
        forceLink(simulationLinks)
          .id((node) => node.id)
          .distance((link) => {
            const strength =
              Number(link.strength) || 3

            return (
              linkDistance +
              Math.max(
                0,
                5 - strength,
              ) * 12
            )
          })
          .strength((link) => {
            const strength =
              Number(link.strength) || 3

            return Math.min(
              0.82,
              0.12 + strength * 0.1,
            )
          })
          .iterations(2),
      )
      .force(
        'charge',
        forceManyBody()
          .strength((node) => {
            return (
              -150 -
              Math.min(
                node.connectionCount,
                12,
              ) * 12
            )
          })
          .distanceMin(20)
          .distanceMax(1100),
      )
      .force(
        'collision',
        forceCollide()
          .radius((node) => {
            return node.radius + 16
          })
          .strength(0.92)
          .iterations(2),
      )
      .force(
        'center',
        forceCenter(0, 0),
      )
      .force(
        'x',
        forceX(0).strength(0.012),
      )
      .force(
        'y',
        forceY(0).strength(0.012),
      )
      .alpha(1)
      .alphaMin(0.001)
      .alphaDecay(0.024)
      .velocityDecay(0.34)
      .stop()

  /*
   * Pre-settle the network before the first visible frame.
   * It opens as an organic graph instead of exploding from
   * the seed positions, while remaining fully interactive.
   */
  const warmupTicks =
    Math.min(
      220,
      Math.max(
        110,
        simulationNodes.length * 3,
      ),
    )

  for (
    let tick = 0;
    tick < warmupTicks;
    tick += 1
  ) {
    simulation.tick()
  }

  syncSimulationPositions()
  saveBrainSimulationPositions()

  simulation
    .alpha(0.32)
    .alphaTarget(0)
    .on(
      'tick',
      scheduleSimulationSync,
    )
    .on(
      'end',
      handleSimulationEnd,
    )
    .restart()

  scheduleFitView(100)
}


function stopSimulation({
  save = true,
} = {}) {
  if (
    save &&
    simulationNodes.length > 0
  ) {
    saveBrainSimulationPositions()
  }

  if (simulation) {
    simulation.stop()
    simulation = null
  }

  simulationNodes = []
  simulationNodeById = new Map()

  if (animationFrameId !== null) {
    cancelAnimationFrame(
      animationFrameId,
    )

    animationFrameId = null
  }
}

function handleSimulationEnd() {
  syncSimulationPositions()
  saveBrainSimulationPositions()
}

function saveBrainSimulationPositions() {
  if (
    props.viewMode !== 'brain' ||
    simulationNodes.length === 0
  ) {
    return
  }

  const positions = {}

  simulationNodes.forEach((node) => {
    const x = Number(node.x)
    const y = Number(node.y)

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return
    }

    positions[node.id] = {
      x,
      y,
    }
  })

  localStorage.setItem(
    BRAIN_STORAGE_KEY,
    JSON.stringify(positions),
  )
}

function scheduleSettledPositionSave(
  delay = 1200,
) {
  clearSettleSaveTimer()

  settleSaveTimerId =
    window.setTimeout(() => {
      settleSaveTimerId = null
      saveBrainSimulationPositions()
    }, delay)
}

function clearSettleSaveTimer() {
  if (settleSaveTimerId !== null) {
    window.clearTimeout(
      settleSaveTimerId,
    )

    settleSaveTimerId = null
  }
}

function clearDragReleaseTimer() {
  if (dragReleaseTimerId !== null) {
    window.clearTimeout(
      dragReleaseTimerId,
    )

    dragReleaseTimerId = null
  }
}

function scheduleSimulationSync() {
  if (animationFrameId !== null) {
    return
  }

  animationFrameId =
    requestAnimationFrame(() => {
      animationFrameId = null
      syncSimulationPositions()
    })
}

function syncSimulationPositions() {
  if (!simulationNodeById.size) {
    return
  }

  flowNodes.value =
    flowNodes.value.map((node) => {
      const simulationNode =
        simulationNodeById.get(
          node.id,
        )

      if (!simulationNode) {
        return node
      }

      return {
        ...node,

        position: {
          x:
            Number(
              simulationNode.x,
            ) || 0,

          y:
            Number(
              simulationNode.y,
            ) || 0,
        },
      }
    })
}

function getVisibleConnectionCounts() {
  const counts = new Map()

  visibleNodeIds.value.forEach((nodeId) => {
    counts.set(nodeId, 0)
  })

  props.graphLinks.forEach((link) => {
    const source = String(link.source)
    const target = String(link.target)

    if (
      !visibleNodeIds.value.has(source) ||
      !visibleNodeIds.value.has(target)
    ) {
      return
    }

    counts.set(
      source,
      (counts.get(source) || 0) + 1,
    )

    counts.set(
      target,
      (counts.get(target) || 0) + 1,
    )
  })

  return counts
}

function getNodeSize(connectionCount) {
  const count =
    Math.max(
      0,
      Number(connectionCount) || 0,
    )

  const calculatedSize =
    22 + Math.sqrt(count) * 12

  return Math.round(
    Math.min(
      66,
      calculatedSize,
    ),
  )
}

function getNodeTypeColor(type) {
  return (
    nodeTypeColors[type] ||
    '#64748b'
  )
}

function getNodeStyle(node) {
  return {
    '--node-size':
      `${node.nodeSize || 24}px`,

    '--node-fill':
      node.nodeColor ||
      getNodeTypeColor(node.type),
  }
}

function getBrainSeedPosition(
  id,
  index,
  total,
  connectionCount,
) {
  const hash = hashString(id)

  const angle =
    (
      (hash % 360) *
      Math.PI
    ) / 180

  const safeTotal =
    Math.max(1, total)

  const connectedRadius =
    80 +
    (
      (
        hash >>> 8
      ) % 260
    )

  const orphanRadius =
    320 +
    (
      (
        hash >>> 12
      ) % 280
    )

  const radius =
    connectionCount > 0
      ? connectedRadius
      : (
          safeTotal > 8
            ? orphanRadius
            : connectedRadius
        )

  const stagger =
    (index % 7) * 11

  return {
    x:
      Math.cos(angle) *
      (radius + stagger),

    y:
      Math.sin(angle) *
      (radius + stagger),
  }
}

function hashString(value) {
  let hash = 2166136261

  const text =
    String(value || '')

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash ^= text.charCodeAt(index)

    hash = Math.imul(
      hash,
      16777619,
    )
  }

  return hash >>> 0
}

function getClusteredPosition(type, index) {
  const base =
    clusterPositions[type] ||
    { x: 0, y: 0 }

  const safeDensity =
    Math.max(
      1,
      Math.min(
        10,
        Number(props.density) || 5,
      ),
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
    Math.floor(index / 2) *
    rowSpacing

  return {
    x:
      base.x * densityScale +
      columnOffset,

    y:
      base.y * densityScale +
      rowOffset,
  }
}

function getCardEdgeWidth(strength = 3) {
  const numericStrength =
    Number(strength) || 3

  if (numericStrength >= 5) return 3
  if (numericStrength === 4) return 2.5
  if (numericStrength === 3) return 2
  if (numericStrength === 2) return 1.5

  return 1
}

function getBrainEdgeWidth(strength = 3) {
  const numericStrength =
    Number(strength) || 3

  if (numericStrength >= 5) return 1.8
  if (numericStrength === 4) return 1.45
  if (numericStrength === 3) return 1.15
  if (numericStrength === 2) return 0.9

  return 0.7
}

function getRelationshipDistance(
  sourceDistance,
  targetDistance,
) {
  const sourceIsKnown =
    Number.isFinite(sourceDistance)

  const targetIsKnown =
    Number.isFinite(targetDistance)

  if (
    !sourceIsKnown ||
    !targetIsKnown
  ) {
    return null
  }

  return Math.max(
    sourceDistance,
    targetDistance,
  )
}

function getEdgeHighlightClass(distance) {
  if (distance === 1) {
    return 'distance-one-edge'
  }

  if (distance === 2) {
    return 'distance-two-edge'
  }

  if (
    Number.isFinite(distance) &&
    distance >= 3
  ) {
    return 'distance-three-edge'
  }

  return 'dimmed-edge'
}

function getNodeHighlightClass(nodeId) {
  if (!props.selectedNodeId) {
    return ''
  }

  const distance =
    nodeDistanceMap.value.get(
      String(nodeId),
    )

  if (distance === 0) {
    return 'selected-node'
  }

  if (distance === 1) {
    return 'distance-one-node'
  }

  if (distance === 2) {
    return 'distance-two-node'
  }

  if (
    Number.isFinite(distance) &&
    distance >= 3
  ) {
    return 'distance-three-node'
  }

  return 'dimmed-node'
}

function shouldShowNodeLabel(node) {
  if (props.viewMode !== 'brain') {
    return true
  }

  const distance =
    nodeDistanceMap.value.get(
      String(node.id),
    )

  const connectionCount =
    Number(node.connectionCount) || 0

  return (
    viewportZoom.value >= 0.82 ||
    distance === 0 ||
    distance === 1 ||
    (
      connectionCount >= 4 &&
      viewportZoom.value >= 0.42
    )
  )
}

function getNodeTooltip(node) {
  const count =
    Number(node.connectionCount) || 0

  const connectionLabel =
    count === 1
      ? 'connection'
      : 'connections'

  return (
    `${node.title} · ` +
    `${count} ${connectionLabel}`
  )
}

function getMiniMapNodeColor(node) {
  return (
    node?.data?.nodeColor ||
    getNodeTypeColor(
      node?.data?.type,
    )
  )
}

function handleNodeClick(nodeProps) {
  emit(
    'select-node',
    nodeProps.data,
  )
}

function handlePaneClick() {
  emit('select-node', null)
}

function handlePaneReady(instance) {
  flowInstance.value = instance
  scheduleFitView(80)
}

function handleViewportMove(event) {
  const nextZoom =
    Number(
      event?.transform?.[2] ??
      event?.viewport?.zoom ??
      event?.zoom ??
      event?.flowTransform?.zoom,
    )

  if (Number.isFinite(nextZoom)) {
    viewportZoom.value = nextZoom
  }
}

function handleNodeDragStart(event) {
  if (props.viewMode !== 'brain') {
    return
  }

  clearDragReleaseTimer()
  clearSettleSaveTimer()

  const draggedNode =
    event?.node || event

  const simulationNode =
    simulationNodeById.get(
      String(draggedNode?.id),
    )

  if (!simulationNode) {
    return
  }

  const position =
    draggedNode.position || {}

  simulationNode.fx =
    Number(position.x) ||
    simulationNode.x ||
    0

  simulationNode.fy =
    Number(position.y) ||
    simulationNode.y ||
    0

  simulation
    ?.alphaTarget(0.22)
    .restart()
}

function handleNodeDrag(event) {
  if (props.viewMode !== 'brain') {
    return
  }

  const draggedNode =
    event?.node || event

  const simulationNode =
    simulationNodeById.get(
      String(draggedNode?.id),
    )

  if (!simulationNode) {
    return
  }

  const position =
    draggedNode.position || {}

  simulationNode.fx =
    Number(position.x) || 0

  simulationNode.fy =
    Number(position.y) || 0

  simulationNode.x =
    simulationNode.fx

  simulationNode.y =
    simulationNode.fy
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

  const storageKey =
    props.viewMode === 'brain'
      ? BRAIN_STORAGE_KEY
      : CARD_STORAGE_KEY

  const savedPositions =
    loadSavedPositions(storageKey)

  const savedPosition = {
    x:
      Number(
        draggedNode.position.x,
      ) || 0,

    y:
      Number(
        draggedNode.position.y,
      ) || 0,
  }

  savedPositions[draggedNode.id] =
    savedPosition

  localStorage.setItem(
    storageKey,
    JSON.stringify(savedPositions),
  )

  if (props.viewMode !== 'brain') {
    return
  }

  const simulationNode =
    simulationNodeById.get(
      String(draggedNode.id),
    )

  if (!simulationNode) {
    return
  }

  simulationNode.x =
    savedPosition.x

  simulationNode.y =
    savedPosition.y

  /*
   * Keep the node under the pointer until Vue Flow finishes
   * its drag event, then release it back into the simulation.
   * This is the springy behavior used by Obsidian-style
   * force graphs instead of permanently pinning the node.
   */
  simulationNode.fx =
    savedPosition.x

  simulationNode.fy =
    savedPosition.y

  clearDragReleaseTimer()

  dragReleaseTimerId =
    window.setTimeout(() => {
      dragReleaseTimerId = null

      simulationNode.fx = null
      simulationNode.fy = null

      simulation
        ?.alphaTarget(0)
        .alpha(0.42)
        .restart()

      scheduleSettledPositionSave()
    }, 40)
}

function resetLayout() {
  stopSimulation({
    save: false,
  })

  clearDragReleaseTimer()
  clearSettleSaveTimer()

  localStorage.removeItem(
    CARD_STORAGE_KEY,
  )

  localStorage.removeItem(
    BRAIN_STORAGE_KEY,
  )

  localStorage.removeItem(
    LEGACY_STORAGE_KEY,
  )

  rebuildGraph()

  emit('reset-layout')
}

defineExpose({
  resetLayout,
})

function scheduleFitView(delay = 200) {
  clearFitTimer()

  fitTimerId =
    window.setTimeout(() => {
      fitTimerId = null

      flowInstance.value?.fitView?.({
        padding:
          props.viewMode === 'brain'
            ? 0.12
            : 0.18,

        duration: 420,
      })
    }, delay)
}

function clearFitTimer() {
  if (fitTimerId !== null) {
    window.clearTimeout(
      fitTimerId,
    )

    fitTimerId = null
  }
}

function loadSavedPositions(storageKey) {
  try {
    const parsed =
      JSON.parse(
        localStorage.getItem(
          storageKey,
        ),
      )

    return (
      parsed &&
      typeof parsed === 'object'
    )
      ? parsed
      : {}
  } catch {
    return {}
  }
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
  height: clamp(640px, 74vh, 900px);
}

.vue-flow-container {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

:deep(.vue-flow__pane) {
  cursor: grab;
}

:deep(.vue-flow__pane.dragging) {
  cursor: grabbing;
}

:deep(.vue-flow__node) {
  cursor: pointer;
}

/* Remove Vue Flow's default node card */

:deep(.vue-flow__node-default) {
  width: auto;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

:deep(.vue-flow__node-default.selected) {
  box-shadow: none;
}

/* Card node */

.custom-node {
  min-width: 180px;
  max-width: 225px;
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--node-fill);
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
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.custom-node:hover,
.custom-node:focus-visible {
  border-color: var(--node-fill);
  outline: none;
  transform: translateY(-2px);
}

.node-core {
  display: none;
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

.node-connection-count {
  display: none;
}

/* Connection-distance highlighting */

.selected-node {
  z-index: 10;
  border-color: #22c55e;
  transform: scale(1.08);
  box-shadow:
    0 0 0 4px rgb(34 197 94 / 32%),
    0 0 24px rgb(34 197 94 / 24%),
    var(--shadow);
}

.distance-one-node {
  z-index: 9;
  border-color: #eab308;
  box-shadow:
    0 0 0 3px rgb(234 179 8 / 30%),
    0 0 18px rgb(234 179 8 / 18%),
    var(--shadow);
}

.distance-two-node {
  z-index: 8;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 3px rgb(59 130 246 / 28%),
    0 0 16px rgb(59 130 246 / 15%),
    var(--shadow);
}

.distance-three-node {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 2px rgb(139 92 246 / 22%),
    var(--shadow);
}

.dimmed-node {
  opacity: 0.13;
  filter: saturate(0.4);
}

/* Brain Map */

.brain .custom-node {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--node-size);
  min-width: var(--node-size);
  max-width: var(--node-size);
  height: var(--node-size);
  min-height: var(--node-size);
  border: 1.5px solid rgb(255 255 255 / 48%);
  border-radius: 999px;
  background: var(--node-fill);
  padding: 0;
  overflow: visible;
  box-shadow:
    0 3px 12px rgb(15 23 42 / 24%);
  will-change: transform;
}

.brain .custom-node:hover,
.brain .custom-node:focus-visible {
  z-index: 30;
  transform: scale(1.2);
  filter: brightness(1.12);
}

.brain .node-core {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.brain .node-connection-count {
  display: inline;
  color: rgb(255 255 255 / 92%);
  font-size: clamp(
    0.48rem,
    calc(var(--node-size) / 7),
    0.75rem
  );
  font-weight: 800;
  line-height: 1;
  text-shadow:
    0 1px 3px rgb(0 0 0 / 48%);
}

.brain .node-title {
  position: absolute;
  top: calc(100% + 7px);
  left: 50%;
  z-index: 40;
  width: max-content;
  max-width: 210px;
  margin: 0;
  border-radius: 5px;
  background:
    color-mix(
      in srgb,
      var(--bg-card) 90%,
      transparent
    );
  color: var(--text-primary);
  padding: 0.2rem 0.38rem;
  box-shadow:
    0 2px 8px rgb(0 0 0 / 18%);
  font-size: 0.67rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
  opacity: 0;
  pointer-events: none;
  transform:
    translateX(-50%)
    translateY(-3px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.brain .custom-node:hover .node-title,
.brain .custom-node:focus-visible .node-title,
.brain .show-context-label .node-title {
  opacity: 1;
  transform:
    translateX(-50%)
    translateY(0);
}

.brain .node-type {
  display: none;
}

.brain .selected-node {
  border-color: #22c55e;
  box-shadow:
    0 0 0 5px rgb(34 197 94 / 42%),
    0 0 28px rgb(34 197 94 / 44%);
}

.brain .distance-one-node {
  border-color: #facc15;
  box-shadow:
    0 0 0 4px rgb(250 204 21 / 38%),
    0 0 22px rgb(250 204 21 / 32%);
}

.brain .distance-two-node {
  border-color: #60a5fa;
  box-shadow:
    0 0 0 4px rgb(96 165 250 / 34%),
    0 0 20px rgb(96 165 250 / 28%);
}

.brain .distance-three-node {
  border-color: #a78bfa;
  box-shadow:
    0 0 0 3px rgb(167 139 250 / 25%);
}

/* Card record-type indicators */

.card .custom-node.note {
  border-left-color: #3b82f6;
}

.card .custom-node.tag,
.card .custom-node.knowledge-tag {
  border-left-color: #10b981;
}

.card .custom-node.assignment {
  border-left-color: #f59e0b;
}

.card .custom-node.course {
  border-left-color: #ef4444;
}

.card .custom-node.research-source,
.card .custom-node.source,
.card .custom-node.book,
.card .custom-node.book-chapter,
.card .custom-node.journal,
.card .custom-node.article,
.card .custom-node.journal-article,
.card .custom-node.dissertation,
.card .custom-node.thesis {
  border-left-color: #8b5cf6;
}

.card .custom-node.daily-page {
  border-left-color: #06b6d4;
}

.card .custom-node.planner-block {
  border-left-color: #f97316;
}

.card .custom-node.concept {
  border-left-color: #ec4899;
}

.card .custom-node.term {
  border-left-color: #14b8a6;
}

.card .custom-node.person {
  border-left-color: #dc2626;
}

.card .custom-node.flashcard {
  border-left-color: #0d9488;
}

.card .custom-node.writing-project {
  border-left-color: #6366f1;
}

.card .custom-node.canvas {
  border-left-color: #a855f7;
}

.card .custom-node.jot {
  border-left-color: #64748b;
}

/* Edges */

:deep(.distance-one-edge .vue-flow__edge-path) {
  stroke: #eab308;
  stroke-width: 2.5;
  opacity: 1;
}

:deep(.distance-two-edge .vue-flow__edge-path) {
  stroke: #3b82f6;
  opacity: 0.88;
}

:deep(.distance-three-edge .vue-flow__edge-path) {
  stroke: #8b5cf6;
  opacity: 0.58;
}

:deep(.dimmed-edge .vue-flow__edge-path) {
  opacity: 0.045;
}

:deep(.standard-edge .vue-flow__edge-path) {
  stroke: var(--text-muted);
  opacity: 0.36;
}

.brain :deep(.standard-edge .vue-flow__edge-path) {
  opacity: 0.3;
}

.brain :deep(.vue-flow__edge-path) {
  stroke-linecap: round;
}

:deep(.vue-flow__edge-text) {
  fill: var(--text-secondary);
  font-size: 10px;
}

:deep(.vue-flow__edge-textbg) {
  fill: var(--bg-card);
  fill-opacity: 0.9;
}

/* MiniMap */

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
  opacity: 0.75;
}

:deep(.graph-minimap .vue-flow__minimap-node),
:deep(.vue-flow__minimap-node) {
  stroke: var(--border-color) !important;
  stroke-width: 1;
}

/* Controls */

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

@media (max-width: 700px) {
  .graph-canvas {
    height: 640px;
  }
}
</style>