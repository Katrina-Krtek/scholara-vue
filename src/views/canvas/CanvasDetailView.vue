<template>
  <AppLayout
    :title="canvas?.title || 'Canvas'"
    subtitle="Arrange ideas, notes, sources, and concepts in a visual workspace"
    banner-key="canvas-detail"
    default-icon="🧩"
  >
    <section v-if="canvas" class="canvas-detail-page">
      <header class="canvas-header">
        <div class="canvas-header-left">
          <button
            class="back-button"
            type="button"
            @click="returnToCanvasHub"
          >
            ← Canvas Hub
          </button>

          <div class="canvas-summary">
            <h2>{{ canvas.title }}</h2>

            <p v-if="canvas.description">
              {{ canvas.description }}
            </p>

            <p v-else>
              Visual workspace for notes, ideas, questions, and connections.
            </p>
          </div>
        </div>

        <div class="save-indicator" :class="`save-indicator--${saveState}`">
          <span class="save-dot"></span>

          <span>
            {{ saveLabel }}
          </span>
        </div>
      </header>

      <section class="canvas-workspace">
        <header class="canvas-toolbar">
          <div class="toolbar-group">
            <div class="add-card-wrapper">
              <button
                class="primary-button"
                type="button"
                @click.stop="toggleAddCardMenu"
              >
                <span aria-hidden="true">＋</span>
                Add Card
                <span class="dropdown-arrow" aria-hidden="true">⌄</span>
              </button>

              <div
                v-if="showAddCardMenu"
                class="add-card-menu"
                @click.stop
              >
                <button
                  v-for="cardType in cardTypes"
                  :key="cardType.value"
                  type="button"
                  @click="addCanvasCard(cardType.value)"
                >
                  <span class="card-type-icon" aria-hidden="true">
                    {{ cardType.icon }}
                  </span>

                  <span>
                    <strong>{{ cardType.label }}</strong>
                    <small>{{ cardType.description }}</small>
                  </span>
                </button>
              </div>
            </div>

            <button
              class="toolbar-button"
              type="button"
              title="Save canvas"
              @click="saveCanvasNow"
            >
              💾
              <span>Save</span>
            </button>

            <button
              class="toolbar-button"
              type="button"
              title="Fit every card into view"
              :disabled="!nodes.length"
              @click="fitCanvasView"
            >
              ⛶
              <span>Fit View</span>
            </button>
          </div>

          <div class="toolbar-group toolbar-group--right">
            <span class="canvas-count">
              {{ nodes.length }}
              {{ nodes.length === 1 ? 'card' : 'cards' }}
            </span>

            <span class="canvas-count">
              {{ edges.length }}
              {{ edges.length === 1 ? 'connection' : 'connections' }}
            </span>

            <div class="zoom-controls">
              <button
                type="button"
                title="Zoom out"
                aria-label="Zoom out"
                @click="zoomCanvasOut"
              >
                −
              </button>

              <button
                type="button"
                title="Reset zoom"
                aria-label="Reset zoom"
                @click="resetCanvasView"
              >
                {{ zoomPercentage }}%
              </button>

              <button
                type="button"
                title="Zoom in"
                aria-label="Zoom in"
                @click="zoomCanvasIn"
              >
                ＋
              </button>
            </div>

            <button
              class="toolbar-button toolbar-button--danger"
              type="button"
              :disabled="!nodes.length && !edges.length"
              @click="confirmClearCanvas"
            >
              Clear
            </button>
          </div>
        </header>

        <div ref="canvasStage" class="canvas-stage">
          <VueFlow
            id="scholarory-canvas"
            v-model:nodes="nodes"
            v-model:edges="edges"
            class="scholarory-flow"
            :default-viewport="initialViewport"
            :default-edge-options="defaultEdgeOptions"
            :connection-line-style="connectionLineStyle"
            :min-zoom="0.2"
            :max-zoom="2.5"
            :snap-to-grid="true"
            :snap-grid="[20, 20]"
            :connection-radius="40"
            :nodes-draggable="true"
            :nodes-connectable="true"
            :elements-selectable="true"
            :edges-updatable="true"
            :zoom-on-scroll="true"
            :zoom-on-pinch="true"
            :pan-on-drag="true"
            :prevent-scrolling="true"
            @connect="handleConnect"
            @pane-ready="handlePaneReady"
            @viewport-change="handleViewportChange"
            @viewport-change-end="handleViewportChangeEnd"
            @node-drag-stop="scheduleCanvasSave"
            @nodes-change="scheduleCanvasSave"
            @edges-change="scheduleCanvasSave"
          >
            <template #node-canvasCard="nodeProps">
              <CanvasCardNode
                v-bind="nodeProps"
                @update="handleCardUpdate"
                @delete="deleteCanvasCard"
              />
            </template>
          </VueFlow>

          <section v-if="!nodes.length" class="empty-canvas-overlay">
            <div class="empty-canvas-card">
              <span class="empty-canvas-icon" aria-hidden="true">
                🧩
              </span>

              <h3>Start building your canvas</h3>

              <p>
                Add a note, idea, question, quotation, source, or concept card.
                Drag cards around and connect related thoughts.
              </p>

              <button
                class="primary-button"
                type="button"
                @click="addCanvasCard('note')"
              >
                ＋ Add Your First Note
              </button>
            </div>
          </section>

          <aside class="canvas-help">
            <span>Drag empty space to pan</span>
            <span>Scroll to zoom</span>
            <span>Drag between card handles to connect</span>
          </aside>
        </div>
      </section>
    </section>

    <section v-else class="missing-canvas">
      <div class="missing-canvas-icon" aria-hidden="true">🧩</div>

      <h2>Canvas not found</h2>

      <p>
        This canvas may have been deleted or its address may be incorrect.
      </p>

      <button
        class="primary-button"
        type="button"
        @click="returnToCanvasHub"
      >
        Return to Canvas Hub
      </button>
    </section>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VueFlow } from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import AppLayout from '../../components/AppLayout.vue'
import CanvasCardNode from './CanvasCardNode.vue'
import { useCanvases } from '../../composables/useCanvases'

const route = useRoute()
const router = useRouter()

const {
  getCanvasById,
  createCardAndPlace,
  saveCanvasGraph,
  clearCanvas,
} = useCanvases()

const canvasStage = ref(null)
const flowInstance = shallowRef(null)

const nodes = ref([])
const edges = ref([])

const showAddCardMenu = ref(false)
const saveState = ref('saved')
const currentZoom = ref(1)
const isHydrating = ref(true)

let saveTimer = null

const cardTypes = [
  {
    value: 'note',
    label: 'Note',
    icon: '📝',
    description: 'Capture information or observations.',
  },
  {
    value: 'idea',
    label: 'Idea',
    icon: '💡',
    description: 'Record an insight or possibility.',
  },
  {
    value: 'question',
    label: 'Question',
    icon: '❓',
    description: 'Track something to investigate.',
  },
  {
    value: 'quote',
    label: 'Quotation',
    icon: '💬',
    description: 'Save an important quotation.',
  },
  {
    value: 'source',
    label: 'Source',
    icon: '📚',
    description: 'Represent a research source.',
  },
  {
    value: 'concept',
    label: 'Concept',
    icon: '🧠',
    description: 'Map a central topic or concept.',
  },
]

const canvasId = computed(() => String(route.params.id || ''))

const canvas = computed(() => getCanvasById(canvasId.value))

const initialViewport = computed(() => ({
  x: Number(canvas.value?.viewport?.x || 0),
  y: Number(canvas.value?.viewport?.y || 0),
  zoom: Number(canvas.value?.viewport?.zoom || 1),
}))

const zoomPercentage = computed(() =>
  Math.round(currentZoom.value * 100),
)

const saveLabel = computed(() => {
  if (saveState.value === 'saving') {
    return 'Saving...'
  }

  if (saveState.value === 'unsaved') {
    return 'Unsaved changes'
  }

  return 'Saved'
})

const defaultEdgeOptions = {
  type: 'smoothstep',
  selectable: true,
  updatable: true,
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
  },
}

const connectionLineStyle = {
  stroke: '#375d95',
  strokeWidth: 2,
}

function createId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

function hydrateCanvas() {
  isHydrating.value = true

  if (!canvas.value) {
    nodes.value = []
    edges.value = []
    isHydrating.value = false
    return
  }

  nodes.value = cloneValue(canvas.value.nodes || [])
  edges.value = cloneValue(canvas.value.edges || [])
  currentZoom.value = Number(canvas.value.viewport?.zoom || 1)

  nextTick(() => {
    const storedViewport = canvas.value?.viewport

    if (flowInstance.value && storedViewport) {
      flowInstance.value.setViewport(
        {
          x: Number(storedViewport.x || 0),
          y: Number(storedViewport.y || 0),
          zoom: Number(storedViewport.zoom || 1),
        },
        {
          duration: 0,
        },
      )
    }

    isHydrating.value = false
  })
}

function returnToCanvasHub() {
  saveCanvasNow()
  router.push('/canvas')
}

function toggleAddCardMenu() {
  showAddCardMenu.value = !showAddCardMenu.value
}

function closeAddCardMenu() {
  showAddCardMenu.value = false
}

function getCardTypeDetails(cardType) {
  return (
    cardTypes.find((type) => type.value === cardType) ||
    cardTypes[0]
  )
}

function calculateNewCardPosition() {
  const cardOffset = nodes.value.length * 18
  const viewport =
    flowInstance.value?.getViewport?.() ||
    initialViewport.value

  const stageWidth = canvasStage.value?.clientWidth || 900
  const stageHeight = canvasStage.value?.clientHeight || 600

  const zoom = Number(viewport.zoom || 1)
  const viewportX = Number(viewport.x || 0)
  const viewportY = Number(viewport.y || 0)

  return {
    x:
      (stageWidth / 2 - viewportX) / zoom -
      145 +
      (cardOffset % 160),
    y:
      (stageHeight / 2 - viewportY) / zoom -
      100 +
      (cardOffset % 120),
  }
}

function addCanvasCard(cardType = 'note') {
  const typeDetails =
    getCardTypeDetails(cardType)

  const position =
    calculateNewCardPosition()

  const result =
    createCardAndPlace(
      canvasId.value,
      {
        type: typeDetails.value,
        title: `New ${typeDetails.label}`,
        content: '',
        color: 'default',
      },
      {
        position,
        width: 290,
        height: 240,
        color: 'default',
      },
    )

  if (!result) {
    console.error(
      'Unable to create and place canvas card.',
    )

    return
  }

  const createdNode =
    canvas.value?.nodes.find(
      (node) =>
        node.id === result.placement.id,
    )

  if (createdNode) {
    nodes.value.push(
      cloneValue(createdNode),
    )
  }

  closeAddCardMenu()
  saveState.value = 'unsaved'
  scheduleCanvasSave()
}

function handleCardUpdate(payload) {
  if (!payload?.cardId || !payload?.updates) {
    return
  }

  const node = nodes.value.find(
    (canvasNode) => canvasNode.id === payload.cardId,
  )

  if (!node) {
    return
  }

  node.data = {
    ...node.data,
    ...payload.updates,
  }

  scheduleCanvasSave()
}

function deleteCanvasCard(cardId) {
  const node = nodes.value.find(
    (canvasNode) => canvasNode.id === cardId,
  )

  if (!node) {
    return
  }

  const cardTitle = node.data?.title || 'this card'

  const shouldDelete = window.confirm(
    `Delete "${cardTitle}"? Its connections will also be removed.`,
  )

  if (!shouldDelete) {
    return
  }

  nodes.value = nodes.value.filter(
    (canvasNode) => canvasNode.id !== cardId,
  )

  edges.value = edges.value.filter(
    (edge) =>
      edge.source !== cardId &&
      edge.target !== cardId,
  )

  scheduleCanvasSave()
}

function handleConnect(connection) {
  if (!connection?.source || !connection?.target) {
    return
  }

  if (connection.source === connection.target) {
    return
  }

  const duplicateConnection = edges.value.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      (edge.sourceHandle || null) ===
        (connection.sourceHandle || null) &&
      (edge.targetHandle || null) ===
        (connection.targetHandle || null),
  )

  if (duplicateConnection) {
    return
  }

  edges.value.push({
    id: createId('edge'),
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle || null,
    targetHandle: connection.targetHandle || null,
    type: 'smoothstep',
    selectable: true,
    updatable: true,
    style: {
      stroke: '#64748b',
      strokeWidth: 2,
    },
  })

  scheduleCanvasSave()
}

function handlePaneReady(instance) {
  flowInstance.value = instance

  const viewport = canvas.value?.viewport

  if (viewport) {
    instance.setViewport(
      {
        x: Number(viewport.x || 0),
        y: Number(viewport.y || 0),
        zoom: Number(viewport.zoom || 1),
      },
      {
        duration: 0,
      },
    )

    currentZoom.value = Number(viewport.zoom || 1)
  }

  isHydrating.value = false
}

function normalizeViewport(viewportEvent) {
  const possibleViewport =
    viewportEvent?.viewport ||
    viewportEvent ||
    flowInstance.value?.getViewport?.() ||
    initialViewport.value

  return {
    x: Number(possibleViewport.x || 0),
    y: Number(possibleViewport.y || 0),
    zoom: Number(possibleViewport.zoom || 1),
  }
}

function handleViewportChange(viewportEvent) {
  const viewport = normalizeViewport(viewportEvent)
  currentZoom.value = viewport.zoom
}

function handleViewportChangeEnd(viewportEvent) {
  const viewport = normalizeViewport(viewportEvent)
  currentZoom.value = viewport.zoom
  scheduleCanvasSave()
}

function getCurrentViewport() {
  return normalizeViewport(
    flowInstance.value?.getViewport?.(),
  )
}

function scheduleCanvasSave() {
  if (isHydrating.value || !canvas.value) {
    return
  }

  saveState.value = 'unsaved'

  if (saveTimer) {
    window.clearTimeout(saveTimer)
  }

  saveTimer = window.setTimeout(() => {
    saveCanvasNow()
  }, 500)
}

function saveCanvasNow() {
  if (!canvas.value) {
    return
  }

  if (saveTimer) {
    window.clearTimeout(saveTimer)
    saveTimer = null
  }

  saveState.value = 'saving'

  saveCanvasGraph(canvasId.value, {
    nodes: cloneValue(nodes.value),
    edges: cloneValue(edges.value),
    viewport: getCurrentViewport(),
  })

  window.setTimeout(() => {
    saveState.value = 'saved'
  }, 180)
}

async function fitCanvasView() {
  if (!flowInstance.value || !nodes.value.length) {
    return
  }

  await flowInstance.value.fitView({
    padding: 0.18,
    includeHiddenNodes: true,
    duration: 300,
  })

  const viewport = getCurrentViewport()
  currentZoom.value = viewport.zoom
  scheduleCanvasSave()
}

async function zoomCanvasIn() {
  if (!flowInstance.value) {
    return
  }

  await flowInstance.value.zoomIn({
    duration: 180,
  })

  currentZoom.value = getCurrentViewport().zoom
  scheduleCanvasSave()
}

async function zoomCanvasOut() {
  if (!flowInstance.value) {
    return
  }

  await flowInstance.value.zoomOut({
    duration: 180,
  })

  currentZoom.value = getCurrentViewport().zoom
  scheduleCanvasSave()
}

async function resetCanvasView() {
  if (!flowInstance.value) {
    return
  }

  await flowInstance.value.setViewport(
    {
      x: 0,
      y: 0,
      zoom: 1,
    },
    {
      duration: 250,
    },
  )

  currentZoom.value = 1
  scheduleCanvasSave()
}

function confirmClearCanvas() {
  if (!nodes.value.length && !edges.value.length) {
    return
  }

  const shouldClear = window.confirm(
    'Clear this entire canvas? All cards and connections will be deleted.',
  )

  if (!shouldClear) {
    return
  }

  nodes.value = []
  edges.value = []

  clearCanvas(canvasId.value)

  if (flowInstance.value) {
    flowInstance.value.setViewport(
      {
        x: 0,
        y: 0,
        zoom: 1,
      },
      {
        duration: 250,
      },
    )
  }

  currentZoom.value = 1
  saveState.value = 'saved'
}

function handleKeyboardShortcuts(event) {
  const activeElement = document.activeElement
  const isTyping =
    activeElement?.tagName === 'INPUT' ||
    activeElement?.tagName === 'TEXTAREA' ||
    activeElement?.isContentEditable

  if (
    (event.metaKey || event.ctrlKey) &&
    event.key.toLowerCase() === 's'
  ) {
    event.preventDefault()
    saveCanvasNow()
    return
  }

  if (event.key === 'Escape') {
    closeAddCardMenu()
    return
  }

  if (isTyping) {
    return
  }

  if (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    event.key.toLowerCase() === 'n'
  ) {
    event.preventDefault()
    addCanvasCard('note')
  }
}

watch(
  canvasId,
  () => {
    hydrateCanvas()
  },
  {
    immediate: true,
  },
)

watch(
  nodes,
  () => {
    scheduleCanvasSave()
  },
  {
    deep: true,
  },
)

watch(
  edges,
  () => {
    scheduleCanvasSave()
  },
  {
    deep: true,
  },
)

onMounted(() => {
  window.addEventListener('click', closeAddCardMenu)
  window.addEventListener('keydown', handleKeyboardShortcuts)
})

onBeforeUnmount(() => {
  if (saveTimer) {
    window.clearTimeout(saveTimer)
    saveTimer = null
  }

  if (canvas.value && !isHydrating.value) {
    saveCanvasGraph(canvasId.value, {
      nodes: cloneValue(nodes.value),
      edges: cloneValue(edges.value),
      viewport: getCurrentViewport(),
    })
  }

  window.removeEventListener('click', closeAddCardMenu)
  window.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
.canvas-detail-page {
  display: grid;
  gap: 1rem;
}

.canvas-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.canvas-header-left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.back-button {
  flex: 0 0 auto;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
  padding: 0.6rem 0.8rem;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.back-button:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.canvas-summary h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.canvas-summary p {
  max-width: 650px;
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.save-indicator {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  padding: 0.45rem 0.7rem;
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
}

.save-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4c8a66;
}

.save-indicator--saving .save-dot {
  background: #c69b2f;
  animation: save-pulse 0.8s infinite alternate;
}

.save-indicator--unsaved .save-dot {
  background: #a95770;
}

@keyframes save-pulse {
  from {
    opacity: 0.45;
  }

  to {
    opacity: 1;
  }
}

.canvas-workspace {
  overflow: visible;
  border: 1px solid var(--border-color);
  border-radius: 15px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.canvas-toolbar {
  position: relative;
  z-index: 30;
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.65rem 0.8rem;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.toolbar-group--right {
  justify-content: flex-end;
}

.primary-button,
.toolbar-button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 9px;
  padding: 0.62rem 0.82rem;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 750;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--accent-color);
  background: var(--accent-color);
  color: #ffffff;
}

.primary-button:hover {
  filter: brightness(1.06);
}

.toolbar-button {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.toolbar-button:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.toolbar-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.toolbar-button--danger {
  color: #b13b3b;
}

.toolbar-button--danger:hover:not(:disabled) {
  border-color: #d9a5a5;
  background: #fff2f2;
  color: #a12f2f;
}

.dropdown-arrow {
  margin-left: 0.1rem;
  font-size: 0.75rem;
}

.add-card-wrapper {
  position: relative;
}

.add-card-menu {
  position: absolute;
  z-index: 50;
  top: calc(100% + 0.5rem);
  left: 0;
  display: grid;
  width: 285px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
}

.add-card-menu button {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border: 0;
  border-bottom: 1px solid var(--border-color);
  background: transparent;
  padding: 0.75rem;
  color: var(--text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.add-card-menu button:last-child {
  border-bottom: 0;
}

.add-card-menu button:hover {
  background: var(--bg-secondary);
}

.card-type-icon {
  flex: 0 0 auto;
  font-size: 1.15rem;
}

.add-card-menu button span:last-child {
  display: grid;
  gap: 0.18rem;
}

.add-card-menu strong {
  font-size: 0.86rem;
}

.add-card-menu small {
  color: var(--text-secondary);
  font-size: 0.73rem;
  line-height: 1.35;
}

.canvas-count {
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.zoom-controls {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 9px;
}

.zoom-controls button {
  min-width: 38px;
  height: 38px;
  border: 0;
  border-right: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.zoom-controls button:last-child {
  border-right: 0;
}

.zoom-controls button:hover {
  background: var(--bg-secondary);
  color: var(--accent-color);
}

.canvas-stage {
  position: relative;
  height: min(72vh, 780px);
  min-height: 560px;
  overflow: hidden;
  border-radius: 0 0 14px 14px;
  background-color: #f7f8fb;
  background-image:
    linear-gradient(
      rgba(80, 96, 120, 0.09) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(80, 96, 120, 0.09) 1px,
      transparent 1px
    );
  background-size: 20px 20px;
}

.scholarory-flow {
  width: 100%;
  height: 100%;
}

.empty-canvas-overlay {
  position: absolute;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.empty-canvas-card {
  display: grid;
  width: min(90%, 460px);
  justify-items: center;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: color-mix(
    in srgb,
    var(--bg-card) 94%,
    transparent
  );
  box-shadow: var(--shadow-md);
  padding: 2rem;
  text-align: center;
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.empty-canvas-icon {
  font-size: 2.8rem;
}

.empty-canvas-card h3 {
  margin: 0.75rem 0 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.empty-canvas-card p {
  margin: 0.65rem 0 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.canvas-help {
  position: absolute;
  z-index: 15;
  right: 0.75rem;
  bottom: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
  pointer-events: none;
}

.canvas-help span {
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  padding: 0.28rem 0.52rem;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.missing-canvas {
  display: grid;
  min-height: 430px;
  justify-items: center;
  place-content: center;
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  padding: 2rem;
  text-align: center;
}

.missing-canvas-icon {
  font-size: 3rem;
}

.missing-canvas h2 {
  margin: 0.75rem 0 0;
  color: var(--text-primary);
}

.missing-canvas p {
  margin: 0.65rem 0 1.1rem;
  color: var(--text-secondary);
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #375d95;
  stroke-width: 3;
}

:deep(.vue-flow__edge-path) {
  transition:
    stroke 0.15s ease,
    stroke-width 0.15s ease;
}

:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: #375d95;
  stroke-width: 3;
}

:deep(.vue-flow__connection-path) {
  stroke: #375d95;
  stroke-width: 2;
}

:deep(.vue-flow__selection) {
  border: 1px solid #5678a8;
  background: rgba(86, 120, 168, 0.09);
}

@media (max-width: 1000px) {
  .canvas-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-group--right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .canvas-header {
    flex-direction: column;
  }

  .canvas-header-left {
    width: 100%;
    flex-direction: column;
  }

  .save-indicator {
    align-self: flex-start;
  }

  .toolbar-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .toolbar-button span {
    display: none;
  }

  .canvas-count {
    display: none;
  }

  .canvas-stage {
    height: 68vh;
    min-height: 500px;
  }

  .add-card-wrapper,
  .add-card-wrapper .primary-button {
    width: 100%;
  }

  .add-card-menu {
    width: min(90vw, 320px);
  }

  .canvas-help {
    display: none;
  }
}
</style>