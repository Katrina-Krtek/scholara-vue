<template>
  <AppLayout
    :title="canvas?.title || 'Canvas'"
    subtitle="Arrange ideas, notes, sources, files, drawings, and concepts in a visual workspace"
    banner-key="canvas-detail"
    default-icon="🧩"
  >
    <section
      v-if="canvas"
      class="canvas-detail-page"
    >
      <input
        ref="assetInput"
        class="visually-hidden"
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,image/png,image/jpeg,image/gif,image/webp,application/pdf"
        multiple
        @change="handleAssetSelection"
      />

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
              Visual workspace for notes, ideas, drawings, files, and
              connections.
            </p>
          </div>
        </div>

        <div
          class="save-indicator"
          :class="`save-indicator--${saveState}`"
        >
          <span class="save-dot"></span>
          <span>{{ saveLabel }}</span>
        </div>
      </header>

      <section class="canvas-workspace">
        <header class="canvas-toolbar">
          <div class="toolbar-group">
            <div class="add-card-wrapper">
              <button
                class="primary-button"
                type="button"
                :disabled="drawingMode"
                @click.stop="toggleAddCardMenu"
              >
                <span aria-hidden="true">＋</span>
                Add Card

                <span
                  class="dropdown-arrow"
                  aria-hidden="true"
                >
                  ⌄
                </span>
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
                  <span
                    class="card-type-icon"
                    aria-hidden="true"
                  >
                    {{ cardType.icon }}
                  </span>

                  <span>
                    <strong>
                      {{ cardType.label }}
                    </strong>

                    <small>
                      {{ cardType.description }}
                    </small>
                  </span>
                </button>

                <div class="add-card-divider"></div>

                <button
                  type="button"
                  :disabled="isUploadingAsset"
                  @click="openAssetPicker"
                >
                  <span
                    class="card-type-icon"
                    aria-hidden="true"
                  >
                    📎
                  </span>

                  <span>
                    <strong>
                      {{
                        isUploadingAsset
                          ? 'Uploading...'
                          : 'Upload Image, GIF, or PDF'
                      }}
                    </strong>

                    <small>
                      Add PNG, JPG, JPEG, GIF, WebP, or PDF files.
                    </small>
                  </span>
                </button>
              </div>
            </div>

            <button
              class="toolbar-button draw-mode-button"
              :class="{
                'draw-mode-button--active': drawingMode,
              }"
              type="button"
              @click="toggleDrawingMode"
            >
              <span aria-hidden="true">
                {{ drawingMode ? '✓' : '✍️' }}
              </span>

              <span>
                {{ drawingMode ? 'Done Drawing' : 'Draw' }}
              </span>
            </button>

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
              {{
                edges.length === 1
                  ? 'connection'
                  : 'connections'
              }}
            </span>

            <span class="canvas-count">
              {{ drawingStrokeCount }}
              {{
                drawingStrokeCount === 1
                  ? 'drawing stroke'
                  : 'drawing strokes'
              }}
            </span>

            <div class="zoom-controls">
              <button
                type="button"
                title="Zoom out"
                aria-label="Zoom out"
                :disabled="drawingMode"
                @click="zoomCanvasOut"
              >
                −
              </button>

              <button
                type="button"
                title="Reset zoom"
                aria-label="Reset zoom"
                :disabled="drawingMode"
                @click="resetCanvasView"
              >
                {{ zoomPercentage }}%
              </button>

              <button
                type="button"
                title="Zoom in"
                aria-label="Zoom in"
                :disabled="drawingMode"
                @click="zoomCanvasIn"
              >
                ＋
              </button>
            </div>

            <button
              class="toolbar-button toolbar-button--danger"
              type="button"
              :disabled="
                !nodes.length &&
                !edges.length &&
                !drawingStrokeCount
              "
              @click="confirmClearCanvas"
            >
              Clear
            </button>
          </div>
        </header>

        <section
          v-if="drawingMode"
          class="board-drawing-toolbar"
        >
          <div class="drawing-tool-group">
            <button
              class="drawing-tool-button"
              :class="{
                'drawing-tool-button--active':
                  drawingTool === 'pen',
              }"
              type="button"
              @click="selectDrawingTool('pen')"
            >
              ✏️ Pen
            </button>

            <button
              class="drawing-tool-button"
              :class="{
                'drawing-tool-button--active':
                  drawingTool === 'highlighter',
              }"
              type="button"
              @click="selectDrawingTool('highlighter')"
            >
              🖍️ Highlighter
            </button>

            <button
              class="drawing-tool-button"
              :class="{
                'drawing-tool-button--active':
                  drawingTool === 'eraser',
              }"
              type="button"
              @click="selectDrawingTool('eraser')"
            >
              ◻️ Eraser
            </button>
          </div>

          <div class="drawing-tool-group drawing-tool-group--settings">
            <label class="drawing-color-control">
              <span>Color</span>

              <input
                v-model="drawingColor"
                type="color"
                aria-label="Drawing color"
                :disabled="drawingTool === 'eraser'"
              />
            </label>

            <label class="drawing-size-control">
              <span>
                Size {{ drawingWidth }}
              </span>

              <input
                v-model.number="drawingWidth"
                type="range"
                min="1"
                max="36"
                step="1"
                aria-label="Drawing stroke size"
              />
            </label>
          </div>

          <div class="drawing-tool-group drawing-tool-group--history">
            <button
              class="drawing-tool-button drawing-tool-button--compact"
              type="button"
              title="Undo drawing"
              aria-label="Undo drawing"
              :disabled="!drawingHistory.length"
              @click="undoDrawing"
            >
              ↶
            </button>

            <button
              class="drawing-tool-button drawing-tool-button--compact"
              type="button"
              title="Redo drawing"
              aria-label="Redo drawing"
              :disabled="!drawingFuture.length"
              @click="redoDrawing"
            >
              ↷
            </button>

            <button
              class="drawing-tool-button drawing-tool-button--clear"
              type="button"
              :disabled="!drawingStrokeCount"
              @click="clearBoardDrawing"
            >
              Clear Drawing
            </button>
          </div>
        </section>

        <div
          v-if="uploadMessage"
          class="upload-message"
          :class="{
            'upload-message--error': uploadError,
          }"
        >
          {{ uploadMessage }}
        </div>

        <div
          ref="canvasStage"
          class="canvas-stage"
          :class="{
            'canvas-stage--dragging': isDraggingFiles,
            'canvas-stage--drawing': drawingMode,
          }"
          @dragenter.prevent="handleCanvasDragEnter"
          @dragover.prevent="handleCanvasDragOver"
          @dragleave.prevent="handleCanvasDragLeave"
          @drop.prevent="handleCanvasDrop"
        >
          <svg
            class="board-drawing-visual"
            aria-hidden="true"
          >
            <g :transform="drawingTransform">
              <path
                v-for="stroke in drawingState.strokes"
                :key="stroke.id"
                class="board-drawing-path"
                :class="{
                  'board-drawing-path--highlighter':
                    stroke.tool === 'highlighter',
                }"
                :d="buildStrokePath(stroke.points)"
                fill="none"
                :stroke="stroke.color"
                :stroke-width="getStrokeDisplayWidth(stroke)"
                :stroke-opacity="stroke.opacity"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </svg>

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
            :nodes-draggable="!drawingMode"
            :nodes-connectable="!drawingMode"
            :elements-selectable="!drawingMode"
            :edges-updatable="!drawingMode"
            :zoom-on-scroll="!drawingMode"
            :zoom-on-pinch="!drawingMode"
            :pan-on-drag="!drawingMode"
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

            <template #node-canvasAsset="nodeProps">
              <CanvasAssetNode
                v-bind="nodeProps"
                @update="handleCardUpdate"
                @delete="deleteCanvasCard"
              />
            </template>

          </VueFlow>

          <svg
            ref="drawingInputLayer"
            class="board-drawing-input"
            :class="[
              `board-drawing-input--${drawingTool}`,
              {
                'board-drawing-input--active': drawingMode,
              },
            ]"
            aria-label="Canvas drawing surface"
            @pointerdown.stop.prevent="handleDrawingPointerDown"
            @pointermove.stop.prevent="handleDrawingPointerMove"
            @pointerup.stop.prevent="handleDrawingPointerUp"
            @pointercancel.stop.prevent="handleDrawingPointerCancel"
            @contextmenu.prevent
          >
            <rect
              width="100%"
              height="100%"
              fill="transparent"
            />
          </svg>

          <section
            v-if="
              !nodes.length &&
              !drawingStrokeCount &&
              !isDraggingFiles &&
              !drawingMode
            "
            class="empty-canvas-overlay"
          >
            <div class="empty-canvas-card">
              <span
                class="empty-canvas-icon"
                aria-hidden="true"
              >
                🧩
              </span>

              <h3>Start building your canvas</h3>

              <p>
                Add cards and files, or draw directly across the
                workspace.
              </p>

              <div class="empty-canvas-actions">
                <button
                  class="primary-button"
                  type="button"
                  @click="addCanvasCard('note')"
                >
                  ＋ Add Your First Note
                </button>

                <button
                  class="secondary-action-button"
                  type="button"
                  @click="activateDrawingMode"
                >
                  ✍️ Draw on Canvas
                </button>

                <button
                  class="secondary-action-button"
                  type="button"
                  :disabled="isUploadingAsset"
                  @click="openAssetPicker"
                >
                  📎 Upload a File
                </button>
              </div>
            </div>
          </section>

          <section
            v-if="isDraggingFiles"
            class="canvas-drop-overlay"
          >
            <div class="canvas-drop-card">
              <span
                class="drop-icon"
                aria-hidden="true"
              >
                📥
              </span>

              <h3>Drop files onto the canvas</h3>

              <p>
                Release to upload PNG, JPG, GIF, WebP, or PDF files
                at this location.
              </p>
            </div>
          </section>

          <div
            v-if="drawingMode"
            class="drawing-mode-notice"
          >
            <strong>
              {{
                drawingTool === 'highlighter'
                  ? 'Highlighter'
                  : drawingTool === 'eraser'
                    ? 'Eraser'
                    : 'Pen'
              }}
            </strong>

            <span>
              Draw directly anywhere on the board
            </span>
          </div>

          <aside
            v-if="!drawingMode"
            class="canvas-help"
          >
            <span>Drag empty space to pan</span>
            <span>Scroll to zoom</span>
            <span>Drop files anywhere</span>
            <span>Paste images with ⌘/Ctrl + V</span>
            <span>Select Draw for handwriting</span>
          </aside>
        </div>
      </section>
    </section>

    <section
      v-else
      class="missing-canvas"
    >
      <div
        class="missing-canvas-icon"
        aria-hidden="true"
      >
        🧩
      </div>

      <h2>Canvas not found</h2>

      <p>
        This canvas may have been deleted or its address may be
        incorrect.
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

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  VueFlow,
} from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import AppLayout from '../../components/AppLayout.vue'
import CanvasCardNode from './CanvasCardNode.vue'
import CanvasAssetNode from './CanvasAssetNode.vue'

import {
  useCanvases,
} from '../../composables/useCanvases.js'

import {
  useCanvasCards,
} from '../../composables/useCanvasCards.js'

import {
  useCanvasAssets,
} from '../../composables/useCanvasAssets.js'

const route = useRoute()
const router = useRouter()

const {
  getCanvasById,
  createCardAndPlace,
  addCardPlacement,
  saveCanvasGraph,
  clearCanvas,
} = useCanvases()

const {
  createAssetCard,
} = useCanvasCards()

const {
  uploadAsset,
  supportedMimeTypes,
} = useCanvasAssets()

const canvasStage = ref(null)
const assetInput = ref(null)
const drawingInputLayer = ref(null)
const flowInstance = shallowRef(null)

const nodes = ref([])
const edges = ref([])

const showAddCardMenu = ref(false)
const saveState = ref('saved')
const isHydrating = ref(true)

const currentViewport = ref({
  x: 0,
  y: 0,
  zoom: 1,
})

const isUploadingAsset = ref(false)
const uploadMessage = ref('')
const uploadError = ref(false)

const isDraggingFiles = ref(false)

const drawingMode = ref(false)
const drawingTool = ref('pen')
const drawingColor = ref('#17233a')
const drawingWidth = ref(4)

const drawingState = ref({
  version: 1,
  strokes: [],
})

const drawingHistory = ref([])
const drawingFuture = ref([])

const activeDrawingPointerId = ref(null)
const activeStrokeIndex = ref(-1)
const isDrawingStroke = ref(false)
const isErasing = ref(false)

let drawingOperationChanged = false
let saveTimer = null
let uploadMessageTimer = null
let dragDepth = 0

const cardTypes = [
  {
    value: 'note',
    label: 'Note',
    icon: '📝',
    description:
      'Capture information or observations.',
  },
  {
    value: 'idea',
    label: 'Idea',
    icon: '💡',
    description:
      'Record an insight or possibility.',
  },
  {
    value: 'question',
    label: 'Question',
    icon: '❓',
    description:
      'Track something to investigate.',
  },
  {
    value: 'quote',
    label: 'Quotation',
    icon: '💬',
    description:
      'Save an important quotation.',
  },
  {
    value: 'source',
    label: 'Source',
    icon: '📚',
    description:
      'Represent a research source.',
  },
  {
    value: 'concept',
    label: 'Concept',
    icon: '🧠',
    description:
      'Map a central topic or concept.',
  },
]

const canvasId = computed(() =>
  String(route.params.id || ''),
)

const canvas = computed(() =>
  getCanvasById(canvasId.value),
)

const initialViewport = computed(() => ({
  x: Number(canvas.value?.viewport?.x || 0),
  y: Number(canvas.value?.viewport?.y || 0),
  zoom: Number(canvas.value?.viewport?.zoom || 1),
}))

const zoomPercentage = computed(() =>
  Math.round(currentViewport.value.zoom * 100),
)

const drawingStrokeCount = computed(() =>
  drawingState.value.strokes.length,
)

const drawingTransform = computed(() => {
  const viewport = currentViewport.value

  return `translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`
})

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
  if (value === undefined) {
    return undefined
  }

  return JSON.parse(
    JSON.stringify(value),
  )
}

function normalizeLocalDrawing(drawing = {}) {
  return {
    version: Number(drawing.version || 1),

    strokes: Array.isArray(drawing.strokes)
      ? cloneValue(drawing.strokes)
      : [],
  }
}

function parseNodeDimension(
  value,
  fallback,
) {
  const parsedValue =
    typeof value === 'string'
      ? Number.parseFloat(value)
      : Number(value)

  return Number.isFinite(parsedValue) &&
    parsedValue > 0
    ? parsedValue
    : fallback
}

function isLegacyDrawingNode(node) {
  return (
    node?.type === 'canvasDrawing' ||
    node?.data?.cardType === 'drawing'
  )
}

function convertLegacyDrawingNodeToBoardStrokes(
  node,
) {
  const drawing =
    node?.data?.drawing

  const strokes =
    Array.isArray(drawing?.strokes)
      ? drawing.strokes
      : []

  if (!strokes.length) {
    return []
  }

  const width =
    parseNodeDimension(
      node?.dimensions?.width ??
        node?.width ??
        node?.style?.width,
      600,
    )

  const height =
    parseNodeDimension(
      node?.dimensions?.height ??
        node?.height ??
        node?.style?.height,
      450,
    )

  const nodeX =
    Number(node?.position?.x || 0)

  const nodeY =
    Number(node?.position?.y || 0)

  return strokes
    .map((stroke) => {
      const points =
        Array.isArray(stroke?.points)
          ? stroke.points
          : []

      if (!points.length) {
        return null
      }

      return {
        id: createId('stroke'),

        tool:
          stroke.tool === 'highlighter'
            ? 'highlighter'
            : 'pen',

        color:
          stroke.color ||
          '#17233a',

        width:
          Number(stroke.width || 4),

        opacity:
          stroke.tool === 'highlighter'
            ? Number(
                stroke.opacity ?? 0.28,
              )
            : Number(
                stroke.opacity ?? 1,
              ),

        points: points.map((point) => ({
          x:
            nodeX +
            Number(point.x || 0) *
              width,

          y:
            nodeY +
            Number(point.y || 0) *
              height,

          pressure:
            Number(
              point.pressure || 0.5,
            ),

          time:
            Number(
              point.time ||
              Date.now(),
            ),
        })),
      }
    })
    .filter(Boolean)
}

function hydrateCanvas() {
  isHydrating.value = true
  drawingMode.value = false

  if (!canvas.value) {
    nodes.value = []
    edges.value = []

    drawingState.value = {
      version: 1,
      strokes: [],
    }

    isHydrating.value = false
    return
  }

  const storedNodes =
    cloneValue(
      canvas.value.nodes || [],
    )

  const legacyDrawingNodes =
    storedNodes.filter(
      isLegacyDrawingNode,
    )

  nodes.value =
    storedNodes.filter(
      (node) =>
        !isLegacyDrawingNode(node),
    )

  edges.value = cloneValue(
    canvas.value.edges || [],
  ).filter((edge) => {
    const removedNodeIds =
      new Set(
        legacyDrawingNodes.map(
          (node) => node.id,
        ),
      )

    return (
      !removedNodeIds.has(
        edge.source,
      ) &&
      !removedNodeIds.has(
        edge.target,
      )
    )
  })

  const savedBoardDrawing =
    normalizeLocalDrawing(
      canvas.value.drawing,
    )

  const migratedDrawingStrokes =
    legacyDrawingNodes.flatMap(
      convertLegacyDrawingNodeToBoardStrokes,
    )

  drawingState.value = {
    version: 1,

    strokes: [
      ...savedBoardDrawing.strokes,
      ...migratedDrawingStrokes,
    ],
  }

  drawingHistory.value = []
  drawingFuture.value = []

  currentViewport.value = {
    x: Number(
      canvas.value.viewport?.x || 0,
    ),

    y: Number(
      canvas.value.viewport?.y || 0,
    ),

    zoom: Number(
      canvas.value.viewport?.zoom || 1,
    ),
  }

  nextTick(() => {
    const storedViewport =
      canvas.value?.viewport

    if (
      flowInstance.value &&
      storedViewport
    ) {
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

    if (legacyDrawingNodes.length) {
      saveCanvasNow()
    }
  })
}

function returnToCanvasHub() {
  saveCanvasNow()
  router.push('/canvas')
}

function toggleAddCardMenu() {
  if (drawingMode.value) {
    return
  }

  showAddCardMenu.value =
    !showAddCardMenu.value
}

function closeAddCardMenu() {
  showAddCardMenu.value = false
}

function getCardTypeDetails(cardType) {
  return (
    cardTypes.find(
      (type) =>
        type.value === cardType,
    ) ||
    cardTypes[0]
  )
}

function calculateNewCardPosition(
  width = 290,
  height = 240,
) {
  const cardOffset =
    nodes.value.length * 18

  const viewport =
    flowInstance.value?.getViewport?.() ||
    currentViewport.value

  const stageWidth =
    canvasStage.value?.clientWidth ||
    900

  const stageHeight =
    canvasStage.value?.clientHeight ||
    600

  const zoom =
    Number(viewport.zoom || 1)

  const viewportX =
    Number(viewport.x || 0)

  const viewportY =
    Number(viewport.y || 0)

  return {
    x:
      (stageWidth / 2 - viewportX) /
        zoom -
      width / 2 +
      (cardOffset % 160),

    y:
      (stageHeight / 2 - viewportY) /
        zoom -
      height / 2 +
      (cardOffset % 120),
  }
}

function calculatePositionFromClient(
  clientX,
  clientY,
) {
  const stage =
    canvasStage.value

  if (!stage) {
    return calculateNewCardPosition(
      380,
      360,
    )
  }

  const stageBounds =
    stage.getBoundingClientRect()

  const viewport =
    currentViewport.value

  return {
    x:
      (
        clientX -
        stageBounds.left -
        viewport.x
      ) /
        viewport.zoom -
      190,

    y:
      (
        clientY -
        stageBounds.top -
        viewport.y
      ) /
        viewport.zoom -
      120,
  }
}

function addCanvasCard(
  cardType = 'note',
) {
  const typeDetails =
    getCardTypeDetails(cardType)

  const position =
    calculateNewCardPosition(
      290,
      240,
    )

  const result =
    createCardAndPlace(
      canvasId.value,
      {
        type: typeDetails.value,

        title:
          `New ${typeDetails.label}`,

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
      'Unable to create and place Canvas card.',
    )

    return
  }

  const createdNode =
    canvas.value?.nodes.find(
      (node) =>
        node.id ===
        result.placement.id,
    )

  if (!createdNode) {
    console.error(
      'The new Canvas card could not be rendered.',
    )

    return
  }

  nodes.value.push(
    cloneValue(createdNode),
  )

  closeAddCardMenu()
  saveState.value = 'unsaved'
  scheduleCanvasSave()
}

function activateDrawingMode() {
  drawingMode.value = true
  closeAddCardMenu()
  resetCanvasDragState()
}

function toggleDrawingMode() {
  drawingMode.value =
    !drawingMode.value

  closeAddCardMenu()
  resetCanvasDragState()

  if (!drawingMode.value) {
    finishDrawingInteraction()
  }
}

function selectDrawingTool(tool) {
  drawingTool.value = tool

  if (tool === 'pen') {
    drawingWidth.value =
      Math.min(
        drawingWidth.value,
        12,
      )

    if (drawingWidth.value < 2) {
      drawingWidth.value = 4
    }
  }

  if (tool === 'highlighter') {
    drawingWidth.value =
      Math.max(
        drawingWidth.value,
        14,
      )
  }

  if (tool === 'eraser') {
    drawingWidth.value =
      Math.max(
        drawingWidth.value,
        18,
      )
  }
}

function pushDrawingHistory() {
  drawingHistory.value.push(
    cloneValue(
      drawingState.value,
    ),
  )

  if (
    drawingHistory.value.length >
    50
  ) {
    drawingHistory.value.shift()
  }

  drawingFuture.value = []
  drawingOperationChanged = false
}

function undoDrawing() {
  if (!drawingHistory.value.length) {
    return
  }

  drawingFuture.value.push(
    cloneValue(
      drawingState.value,
    ),
  )

  drawingState.value =
    drawingHistory.value.pop()

  scheduleCanvasSave()
}

function redoDrawing() {
  if (!drawingFuture.value.length) {
    return
  }

  drawingHistory.value.push(
    cloneValue(
      drawingState.value,
    ),
  )

  drawingState.value =
    drawingFuture.value.pop()

  scheduleCanvasSave()
}

function clearBoardDrawing() {
  if (!drawingStrokeCount.value) {
    return
  }

  const shouldClear =
    window.confirm(
      'Clear every pen and highlighter stroke from this canvas?',
    )

  if (!shouldClear) {
    return
  }

  pushDrawingHistory()

  drawingState.value = {
    version: 1,
    strokes: [],
  }

  drawingOperationChanged = true
  scheduleCanvasSave()
}

function handleDrawingPointerDown(event) {
  if (!drawingMode.value) {
    return
  }

  if (
    event.pointerType === 'mouse' &&
    event.button !== 0
  ) {
    return
  }

  activeDrawingPointerId.value =
    event.pointerId

  drawingInputLayer.value
    ?.setPointerCapture?.(
      event.pointerId,
    )

  pushDrawingHistory()

  const point =
    getBoardDrawingPoint(event)

  if (
    drawingTool.value ===
    'eraser'
  ) {
    isErasing.value = true
    eraseDrawingAtPoint(point)
    return
  }

  const stroke = {
    id: createId('stroke'),

    tool:
      drawingTool.value,

    color:
      drawingColor.value,

    width:
      drawingTool.value ===
      'highlighter'
        ? Math.max(
            drawingWidth.value,
            12,
          )
        : drawingWidth.value,

    opacity:
      drawingTool.value ===
      'highlighter'
        ? 0.28
        : 1,

    points: [
      point,
    ],
  }

  drawingState.value.strokes.push(
    stroke,
  )

  activeStrokeIndex.value =
    drawingState.value.strokes.length -
    1

  isDrawingStroke.value = true
  drawingOperationChanged = true
}

function handleDrawingPointerMove(event) {
  if (
    event.pointerId !==
    activeDrawingPointerId.value
  ) {
    return
  }

  const pointerEvents =
    typeof event.getCoalescedEvents ===
    'function'
      ? event.getCoalescedEvents()
      : [event]

  if (isErasing.value) {
    pointerEvents.forEach(
      (pointerEvent) => {
        eraseDrawingAtPoint(
          getBoardDrawingPoint(
            pointerEvent,
          ),
        )
      },
    )

    return
  }

  if (
    !isDrawingStroke.value ||
    activeStrokeIndex.value < 0
  ) {
    return
  }

  const activeStroke =
    drawingState.value.strokes[
      activeStrokeIndex.value
    ]

  if (!activeStroke) {
    return
  }

  pointerEvents.forEach(
    (pointerEvent) => {
      const point =
        getBoardDrawingPoint(
          pointerEvent,
        )

      const previousPoint =
        activeStroke.points[
          activeStroke.points.length -
            1
        ]

      if (
        !previousPoint ||
        getPointDistance(
          previousPoint,
          point,
        ) >
          0.35 /
            currentViewport.value.zoom
      ) {
        activeStroke.points.push(
          point,
        )
      }
    },
  )
}

function handleDrawingPointerUp(event) {
  if (
    event.pointerId !==
    activeDrawingPointerId.value
  ) {
    return
  }

  drawingInputLayer.value
    ?.releasePointerCapture?.(
      event.pointerId,
    )

  finishDrawingInteraction()
}

function handleDrawingPointerCancel(event) {
  if (
    event.pointerId !==
    activeDrawingPointerId.value
  ) {
    return
  }

  finishDrawingInteraction()
}

function finishDrawingInteraction() {
  if (
    !drawingOperationChanged &&
    drawingHistory.value.length
  ) {
    drawingHistory.value.pop()
  }

  const shouldSave =
    drawingOperationChanged

  activeDrawingPointerId.value =
    null

  activeStrokeIndex.value = -1
  isDrawingStroke.value = false
  isErasing.value = false
  drawingOperationChanged = false

  if (shouldSave) {
    scheduleCanvasSave()
  }
}

function getBoardDrawingPoint(event) {
  const stage =
    canvasStage.value

  if (!stage) {
    return {
      x: 0,
      y: 0,
      pressure: 0.5,
      time: Date.now(),
    }
  }

  const bounds =
    stage.getBoundingClientRect()

  const viewport =
    currentViewport.value

  const pressure =
    event.pointerType === 'mouse'
      ? 0.5
      : Number(
          event.pressure || 0.5,
        )

  return {
    x:
      (
        event.clientX -
        bounds.left -
        viewport.x
      ) /
      viewport.zoom,

    y:
      (
        event.clientY -
        bounds.top -
        viewport.y
      ) /
      viewport.zoom,

    pressure:
      Math.min(
        1,
        Math.max(
          0.05,
          pressure,
        ),
      ),

    time:
      Number(
        event.timeStamp ||
        Date.now(),
      ),
  }
}

function eraseDrawingAtPoint(point) {
  const radius =
    Math.max(
      drawingWidth.value,
      16,
    ) /
    currentViewport.value.zoom

  let removedStroke = false

  for (
    let index =
      drawingState.value.strokes.length -
      1;
    index >= 0;
    index -= 1
  ) {
    const stroke =
      drawingState.value.strokes[index]

    if (
      isPointNearStroke(
        point,
        stroke,
        radius,
      )
    ) {
      drawingState.value.strokes.splice(
        index,
        1,
      )

      removedStroke = true
    }
  }

  if (removedStroke) {
    drawingOperationChanged = true
  }
}

function isPointNearStroke(
  point,
  stroke,
  radius,
) {
  const points =
    Array.isArray(stroke.points)
      ? stroke.points
      : []

  if (!points.length) {
    return false
  }

  if (points.length === 1) {
    return (
      getPointDistance(
        point,
        points[0],
      ) <= radius
    )
  }

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const distance =
      getDistanceToSegment(
        point,
        points[index - 1],
        points[index],
      )

    if (
      distance <=
      radius +
        Number(stroke.width || 1) /
          2
    ) {
      return true
    }
  }

  return false
}

function getDistanceToSegment(
  point,
  segmentStart,
  segmentEnd,
) {
  const segmentX =
    segmentEnd.x -
    segmentStart.x

  const segmentY =
    segmentEnd.y -
    segmentStart.y

  const lengthSquared =
    segmentX * segmentX +
    segmentY * segmentY

  if (!lengthSquared) {
    return getPointDistance(
      point,
      segmentStart,
    )
  }

  const projection =
    (
      (
        point.x -
        segmentStart.x
      ) *
        segmentX +
      (
        point.y -
        segmentStart.y
      ) *
        segmentY
    ) /
    lengthSquared

  const clampedProjection =
    Math.max(
      0,
      Math.min(
        1,
        projection,
      ),
    )

  const closestPoint = {
    x:
      segmentStart.x +
      clampedProjection *
        segmentX,

    y:
      segmentStart.y +
      clampedProjection *
        segmentY,
  }

  return getPointDistance(
    point,
    closestPoint,
  )
}

function getPointDistance(
  firstPoint,
  secondPoint,
) {
  const xDifference =
    secondPoint.x -
    firstPoint.x

  const yDifference =
    secondPoint.y -
    firstPoint.y

  return Math.sqrt(
    xDifference * xDifference +
    yDifference * yDifference,
  )
}

function buildStrokePath(points = []) {
  if (!points.length) {
    return ''
  }

  const firstPoint =
    points[0]

  if (points.length === 1) {
    return (
      `M ${firstPoint.x} ${firstPoint.y} ` +
      `l 0.01 0`
    )
  }

  if (points.length === 2) {
    return (
      `M ${firstPoint.x} ${firstPoint.y} ` +
      `L ${points[1].x} ${points[1].y}`
    )
  }

  let path =
    `M ${firstPoint.x} ${firstPoint.y}`

  for (
    let index = 1;
    index < points.length - 1;
    index += 1
  ) {
    const currentPoint =
      points[index]

    const nextPoint =
      points[index + 1]

    const midpointX =
      (
        currentPoint.x +
        nextPoint.x
      ) / 2

    const midpointY =
      (
        currentPoint.y +
        nextPoint.y
      ) / 2

    path +=
      ` Q ${currentPoint.x} ${currentPoint.y}` +
      ` ${midpointX} ${midpointY}`
  }

  const lastPoint =
    points[
      points.length - 1
    ]

  path +=
    ` L ${lastPoint.x} ${lastPoint.y}`

  return path
}

function getStrokeDisplayWidth(stroke) {
  const baseWidth =
    Number(stroke.width || 4)

  if (
    stroke.tool ===
    'highlighter'
  ) {
    return baseWidth
  }

  const points =
    Array.isArray(stroke.points)
      ? stroke.points
      : []

  if (!points.length) {
    return baseWidth
  }

  const averagePressure =
    points.reduce(
      (total, point) =>
        total +
        Number(
          point.pressure || 0.5,
        ),
      0,
    ) /
    points.length

  return (
    baseWidth *
    (
      0.7 +
      averagePressure * 0.6
    )
  )
}

function openAssetPicker() {
  if (drawingMode.value) {
    return
  }

  closeAddCardMenu()

  uploadMessage.value = ''
  uploadError.value = false

  assetInput.value?.click()
}

async function handleAssetSelection(event) {
  const selectedFiles = Array.from(
    event.target?.files || [],
  )

  if (event.target) {
    event.target.value = ''
  }

  await processAssetFiles(
    selectedFiles,
    {
      uploadedFrom:
        'canvas-picker',
    },
  )
}

async function processAssetFiles(
  selectedFiles,
  options = {},
) {
  if (!selectedFiles.length) {
    return
  }

  if (isUploadingAsset.value) {
    uploadError.value = true

    uploadMessage.value =
      'Please wait for the current upload to finish.'

    return
  }

  if (uploadMessageTimer) {
    window.clearTimeout(
      uploadMessageTimer,
    )

    uploadMessageTimer = null
  }

  isUploadingAsset.value = true
  uploadError.value = false

  uploadMessage.value =
    selectedFiles.length === 1
      ? `Uploading ${selectedFiles[0].name}...`
      : `Uploading ${selectedFiles.length} files...`

  let successfulUploads = 0

  try {
    for (
      const [
        fileIndex,
        file,
      ] of selectedFiles.entries()
    ) {
      uploadMessage.value =
        selectedFiles.length === 1
          ? `Uploading ${file.name}...`
          : `Uploading ${fileIndex + 1} of ${selectedFiles.length}: ${file.name}`

      await uploadAndPlaceAsset(
        file,
        fileIndex,
        {
          basePosition:
            options.basePosition ||
            null,

          uploadedFrom:
            options.uploadedFrom ||
            'canvas',
        },
      )

      successfulUploads += 1
    }

    uploadMessage.value =
      successfulUploads === 1
        ? 'File uploaded and added to the canvas.'
        : `${successfulUploads} files uploaded and added to the canvas.`

    uploadMessageTimer =
      window.setTimeout(() => {
        if (!uploadError.value) {
          uploadMessage.value = ''
        }

        uploadMessageTimer = null
      }, 3500)
  } catch (error) {
    console.error(
      'Unable to upload Canvas file:',
      error,
    )

    uploadError.value = true

    if (successfulUploads > 0) {
      uploadMessage.value =
        `${successfulUploads} file${
          successfulUploads === 1
            ? ''
            : 's'
        } uploaded, but another file failed: ${
          error?.message ||
          'The file could not be uploaded.'
        }`
    } else {
      uploadMessage.value =
        error?.message ||
        'The selected file could not be uploaded.'
    }
  } finally {
    isUploadingAsset.value = false
  }
}

async function uploadAndPlaceAsset(
  file,
  fileIndex = 0,
  options = {},
) {
  const asset =
    await uploadAsset(
      file,
      {
        canvasId: canvasId.value,

        uploadedFrom:
          options.uploadedFrom ||
          'canvas',
      },
    )

  const card =
    createAssetCard({
      assetId: asset.id,
      assetType: asset.assetType,
      title: asset.title,

      metadata: {
        fileName:
          asset.fileName,

        mimeType:
          asset.mimeType,

        size:
          asset.size,

        storagePath:
          asset.storagePath,

        width:
          asset.width,

        height:
          asset.height,

        pageCount:
          asset.pageCount,
      },
    })

  if (!card) {
    throw new Error(
      'The file uploaded, but its Card Library record could not be created.',
    )
  }

  const assetWidth =
    asset.assetType === 'pdf'
      ? 420
      : 380

  const assetHeight =
    asset.assetType === 'pdf'
      ? 520
      : 360

  const basePosition =
    options.basePosition ||
    calculateNewCardPosition(
      assetWidth,
      assetHeight,
    )

  const placement =
    addCardPlacement(
      canvasId.value,
      card.id,
      {
        position: {
          x:
            basePosition.x +
            fileIndex * 35,

          y:
            basePosition.y +
            fileIndex * 35,
        },

        width:
          assetWidth,

        height:
          assetHeight,

        color: 'default',
      },
    )

  if (!placement) {
    throw new Error(
      'The file uploaded, but it could not be placed on this canvas.',
    )
  }

  const createdNode =
    canvas.value?.nodes.find(
      (node) =>
        node.id === placement.id,
    )

  if (!createdNode) {
    throw new Error(
      'The new file card could not be rendered.',
    )
  }

  nodes.value.push(
    cloneValue(createdNode),
  )

  saveState.value = 'unsaved'
  scheduleCanvasSave()
}

function eventContainsFiles(event) {
  const transferTypes =
    Array.from(
      event.dataTransfer?.types ||
      [],
    )

  return transferTypes.includes(
    'Files',
  )
}

function handleCanvasDragEnter(event) {
  if (
    drawingMode.value ||
    !eventContainsFiles(event)
  ) {
    return
  }

  dragDepth += 1
  isDraggingFiles.value = true

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect =
      'copy'
  }
}

function handleCanvasDragOver(event) {
  if (
    drawingMode.value ||
    !eventContainsFiles(event)
  ) {
    return
  }

  isDraggingFiles.value = true

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect =
      'copy'
  }
}

function handleCanvasDragLeave() {
  if (!isDraggingFiles.value) {
    return
  }

  dragDepth = Math.max(
    0,
    dragDepth - 1,
  )

  if (dragDepth === 0) {
    isDraggingFiles.value = false
  }
}

async function handleCanvasDrop(event) {
  if (
    drawingMode.value ||
    !eventContainsFiles(event)
  ) {
    resetCanvasDragState()
    return
  }

  const droppedFiles =
    Array.from(
      event.dataTransfer?.files ||
      [],
    )

  const dropPosition =
    calculatePositionFromClient(
      event.clientX,
      event.clientY,
    )

  resetCanvasDragState()

  await processAssetFiles(
    droppedFiles,
    {
      basePosition:
        dropPosition,

      uploadedFrom:
        'canvas-drop',
    },
  )
}

function resetCanvasDragState() {
  dragDepth = 0
  isDraggingFiles.value = false
}

async function handleClipboardPaste(event) {
  if (drawingMode.value) {
    return
  }

  const activeElement =
    document.activeElement

  const isTyping =
    activeElement?.tagName ===
      'INPUT' ||
    activeElement?.tagName ===
      'TEXTAREA' ||
    activeElement?.isContentEditable

  if (isTyping) {
    return
  }

  const clipboardItems =
    Array.from(
      event.clipboardData?.items ||
      [],
    )

  const pastedFiles =
    clipboardItems
      .filter(
        (item) =>
          item.kind === 'file',
      )
      .map(
        (item) =>
          item.getAsFile(),
      )
      .filter(Boolean)
      .filter(
        (file) =>
          supportedMimeTypes.includes(
            file.type,
          ),
      )

  if (!pastedFiles.length) {
    return
  }

  event.preventDefault()

  await processAssetFiles(
    pastedFiles,
    {
      basePosition:
        calculateNewCardPosition(
          380,
          360,
        ),

      uploadedFrom:
        'clipboard-paste',
    },
  )
}

function handleCardUpdate(payload) {
  if (
    !payload?.cardId ||
    !payload?.updates
  ) {
    return
  }

  const node =
    nodes.value.find(
      (canvasNode) =>
        canvasNode.id ===
        payload.cardId,
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
  const node =
    nodes.value.find(
      (canvasNode) =>
        canvasNode.id ===
        cardId,
    )

  if (!node) {
    return
  }

  const cardTitle =
    node.data?.title ||
    'this card'

  const shouldDelete =
    window.confirm(
      `Remove "${cardTitle}" from this canvas? Its connections on this canvas will also be removed.`,
    )

  if (!shouldDelete) {
    return
  }

  nodes.value =
    nodes.value.filter(
      (canvasNode) =>
        canvasNode.id !== cardId,
    )

  edges.value =
    edges.value.filter(
      (edge) =>
        edge.source !== cardId &&
        edge.target !== cardId,
    )

  scheduleCanvasSave()
}

function handleConnect(connection) {
  if (
    drawingMode.value ||
    !connection?.source ||
    !connection?.target
  ) {
    return
  }

  if (
    connection.source ===
    connection.target
  ) {
    return
  }

  const duplicateConnection =
    edges.value.some(
      (edge) =>
        edge.source ===
          connection.source &&
        edge.target ===
          connection.target &&
        (edge.sourceHandle || null) ===
          (
            connection.sourceHandle ||
            null
          ) &&
        (edge.targetHandle || null) ===
          (
            connection.targetHandle ||
            null
          ),
    )

  if (duplicateConnection) {
    return
  }

  edges.value.push({
    id: createId('edge'),

    source:
      connection.source,

    target:
      connection.target,

    sourceHandle:
      connection.sourceHandle ||
      null,

    targetHandle:
      connection.targetHandle ||
      null,

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

  const viewport =
    canvas.value?.viewport

  if (viewport) {
    const normalizedViewport = {
      x: Number(viewport.x || 0),
      y: Number(viewport.y || 0),
      zoom: Number(viewport.zoom || 1),
    }

    instance.setViewport(
      normalizedViewport,
      {
        duration: 0,
      },
    )

    currentViewport.value =
      normalizedViewport
  }

  isHydrating.value = false
}

function normalizeViewport(
  viewportEvent,
) {
  const possibleViewport =
    viewportEvent?.viewport ||
    viewportEvent ||
    flowInstance.value?.getViewport?.() ||
    currentViewport.value

  return {
    x: Number(
      possibleViewport.x || 0,
    ),

    y: Number(
      possibleViewport.y || 0,
    ),

    zoom: Number(
      possibleViewport.zoom || 1,
    ),
  }
}

function handleViewportChange(
  viewportEvent,
) {
  currentViewport.value =
    normalizeViewport(
      viewportEvent,
    )
}

function handleViewportChangeEnd(
  viewportEvent,
) {
  currentViewport.value =
    normalizeViewport(
      viewportEvent,
    )

  scheduleCanvasSave()
}

function getCurrentViewport() {
  return normalizeViewport(
    flowInstance.value?.getViewport?.(),
  )
}

function scheduleCanvasSave() {
  if (
    isHydrating.value ||
    !canvas.value
  ) {
    return
  }

  saveState.value = 'unsaved'

  if (saveTimer) {
    window.clearTimeout(
      saveTimer,
    )
  }

  saveTimer =
    window.setTimeout(() => {
      saveCanvasNow()
    }, 500)
}

function saveCanvasNow() {
  if (!canvas.value) {
    return
  }

  if (saveTimer) {
    window.clearTimeout(
      saveTimer,
    )

    saveTimer = null
  }

  saveState.value = 'saving'

  saveCanvasGraph(
    canvasId.value,
    {
      nodes:
        cloneValue(
          nodes.value,
        ),

      edges:
        cloneValue(
          edges.value,
        ),

      drawing:
        cloneValue(
          drawingState.value,
        ),

      viewport:
        getCurrentViewport(),
    },
  )

  window.setTimeout(() => {
    saveState.value = 'saved'
  }, 180)
}

async function fitCanvasView() {
  if (
    drawingMode.value ||
    !flowInstance.value ||
    !nodes.value.length
  ) {
    return
  }

  await flowInstance.value.fitView({
    padding: 0.18,
    includeHiddenNodes: true,
    duration: 300,
  })

  currentViewport.value =
    getCurrentViewport()

  scheduleCanvasSave()
}

async function zoomCanvasIn() {
  if (
    drawingMode.value ||
    !flowInstance.value
  ) {
    return
  }

  await flowInstance.value.zoomIn({
    duration: 180,
  })

  currentViewport.value =
    getCurrentViewport()

  scheduleCanvasSave()
}

async function zoomCanvasOut() {
  if (
    drawingMode.value ||
    !flowInstance.value
  ) {
    return
  }

  await flowInstance.value.zoomOut({
    duration: 180,
  })

  currentViewport.value =
    getCurrentViewport()

  scheduleCanvasSave()
}

async function resetCanvasView() {
  if (
    drawingMode.value ||
    !flowInstance.value
  ) {
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

  currentViewport.value = {
    x: 0,
    y: 0,
    zoom: 1,
  }

  scheduleCanvasSave()
}

function confirmClearCanvas() {
  if (
    !nodes.value.length &&
    !edges.value.length &&
    !drawingStrokeCount.value
  ) {
    return
  }

  const shouldClear =
    window.confirm(
      'Clear this entire canvas? All cards, connections, and drawing strokes will be removed from this canvas.',
    )

  if (!shouldClear) {
    return
  }

  nodes.value = []
  edges.value = []

  drawingState.value = {
    version: 1,
    strokes: [],
  }

  drawingHistory.value = []
  drawingFuture.value = []

  clearCanvas(
    canvasId.value,
  )

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

  currentViewport.value = {
    x: 0,
    y: 0,
    zoom: 1,
  }

  drawingMode.value = false
  saveState.value = 'saved'
}

function handleKeyboardShortcuts(event) {
  const activeElement =
    document.activeElement

  const isTyping =
    activeElement?.tagName ===
      'INPUT' ||
    activeElement?.tagName ===
      'TEXTAREA' ||
    activeElement?.isContentEditable

  if (
    (
      event.metaKey ||
      event.ctrlKey
    ) &&
    event.key.toLowerCase() ===
      's'
  ) {
    event.preventDefault()
    saveCanvasNow()
    return
  }

  if (
    drawingMode.value &&
    !isTyping &&
    (
      event.metaKey ||
      event.ctrlKey
    ) &&
    event.key.toLowerCase() ===
      'z'
  ) {
    event.preventDefault()

    if (event.shiftKey) {
      redoDrawing()
    } else {
      undoDrawing()
    }

    return
  }

  if (event.key === 'Escape') {
    closeAddCardMenu()
    resetCanvasDragState()

    if (drawingMode.value) {
      drawingMode.value = false
      finishDrawingInteraction()
    }

    return
  }

  if (isTyping || drawingMode.value) {
    return
  }

  if (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    event.key.toLowerCase() ===
      'n'
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
  window.addEventListener(
    'click',
    closeAddCardMenu,
  )

  window.addEventListener(
    'keydown',
    handleKeyboardShortcuts,
  )

  window.addEventListener(
    'paste',
    handleClipboardPaste,
  )

  window.addEventListener(
    'dragend',
    resetCanvasDragState,
  )
})

onBeforeUnmount(() => {
  if (saveTimer) {
    window.clearTimeout(
      saveTimer,
    )

    saveTimer = null
  }

  if (uploadMessageTimer) {
    window.clearTimeout(
      uploadMessageTimer,
    )

    uploadMessageTimer = null
  }

  if (
    canvas.value &&
    !isHydrating.value
  ) {
    saveCanvasGraph(
      canvasId.value,
      {
        nodes:
          cloneValue(
            nodes.value,
          ),

        edges:
          cloneValue(
            edges.value,
          ),

        drawing:
          cloneValue(
            drawingState.value,
          ),

        viewport:
          getCurrentViewport(),
      },
    )
  }

  window.removeEventListener(
    'click',
    closeAddCardMenu,
  )

  window.removeEventListener(
    'keydown',
    handleKeyboardShortcuts,
  )

  window.removeEventListener(
    'paste',
    handleClipboardPaste,
  )

  window.removeEventListener(
    'dragend',
    resetCanvasDragState,
  )
})
</script>

<style scoped>
.canvas-detail-page {
  display: grid;
  gap: 1rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
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
.toolbar-button,
.secondary-action-button {
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

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.toolbar-button,
.secondary-action-button {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.toolbar-button:hover:not(:disabled),
.secondary-action-button:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.toolbar-button:disabled,
.secondary-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.draw-mode-button--active {
  border-color: #375d95;
  background: #eaf1f9;
  color: #294e82;
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
  width: 300px;
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

.add-card-menu button:hover:not(:disabled) {
  background: var(--bg-secondary);
}

.add-card-menu button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.add-card-divider {
  height: 1px;
  background: var(--border-color);
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

.board-drawing-toolbar {
  position: relative;
  z-index: 28;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border-bottom: 1px solid var(--border-color);
  background:
    color-mix(
      in srgb,
      var(--accent-color) 7%,
      var(--bg-card)
    );
  padding: 0.6rem 0.8rem;
}

.drawing-tool-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.drawing-tool-group--settings {
  flex: 1 1 260px;
  justify-content: center;
}

.drawing-tool-group--history {
  justify-content: flex-end;
}

.drawing-tool-button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  padding: 0.42rem 0.6rem;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.72rem;
  font-weight: 750;
  cursor: pointer;
}

.drawing-tool-button:hover:not(:disabled) {
  border-color: #375d95;
  color: #375d95;
}

.drawing-tool-button--active {
  border-color: #375d95;
  background: #dfeaf7;
  color: #294e82;
}

.drawing-tool-button--compact {
  width: 34px;
  padding: 0;
  font-size: 1rem;
}

.drawing-tool-button--clear {
  color: #a12f2f;
}

.drawing-tool-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.drawing-color-control,
.drawing-size-control {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 750;
}

.drawing-color-control input {
  width: 32px;
  height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-card);
  padding: 2px;
  cursor: pointer;
}

.drawing-color-control input:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.drawing-size-control {
  min-width: 180px;
}

.drawing-size-control input {
  min-width: 100px;
  flex: 1 1 auto;
}

.upload-message {
  border-bottom: 1px solid var(--border-color);
  background:
    color-mix(
      in srgb,
      var(--accent-color) 10%,
      var(--bg-card)
    );
  padding: 0.65rem 0.85rem;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 700;
}

.upload-message--error {
  background: #fff1f1;
  color: #a12f2f;
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

.zoom-controls button:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--accent-color);
}

.zoom-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
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
  transition:
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.canvas-stage--drawing {
  box-shadow:
    inset 0 0 0 2px
    rgba(55, 93, 149, 0.32);
}

.canvas-stage--dragging {
  background-color: #eef4fb;
  box-shadow:
    inset 0 0 0 3px
    color-mix(
      in srgb,
      var(--accent-color) 70%,
      transparent
    );
}

.board-drawing-visual {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.board-drawing-path {
  vector-effect: none;
}

.board-drawing-path--highlighter {
  mix-blend-mode: multiply;
}

.scholarory-flow {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.board-drawing-input {
  position: absolute;
  z-index: 25;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  touch-action: none;
  user-select: none;
}

.board-drawing-input--active {
  pointer-events: all;
}

.board-drawing-input--pen,
.board-drawing-input--highlighter {
  cursor: crosshair;
}

.board-drawing-input--eraser {
  cursor: cell;
}

.drawing-mode-notice {
  position: absolute;
  z-index: 30;
  left: 0.75rem;
  bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(55, 93, 149, 0.38);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.38rem 0.65rem;
  color: #375d95;
  font-size: 0.68rem;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.drawing-mode-notice strong {
  font-weight: 800;
}

.drawing-mode-notice span {
  color: #64748b;
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
  width: min(90%, 520px);
  justify-items: center;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background:
    color-mix(
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

.empty-canvas-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
}

.canvas-drop-overlay {
  position: absolute;
  z-index: 60;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    color-mix(
      in srgb,
      var(--accent-color) 12%,
      rgba(255, 255, 255, 0.76)
    );
  pointer-events: none;
  backdrop-filter: blur(3px);
}

.canvas-drop-card {
  display: grid;
  width: min(88%, 430px);
  justify-items: center;
  border: 2px dashed var(--accent-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  text-align: center;
}

.drop-icon {
  font-size: 3rem;
}

.canvas-drop-card h3 {
  margin: 0.7rem 0 0;
  color: var(--text-primary);
}

.canvas-drop-card p {
  max-width: 360px;
  margin: 0.55rem 0 0;
  color: var(--text-secondary);
  line-height: 1.55;
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

@media (max-width: 1100px) {
  .canvas-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-group--right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .board-drawing-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .drawing-tool-group {
    width: 100%;
    justify-content: flex-start;
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

  .draw-mode-button span {
    display: inline;
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
    width: min(90vw, 330px);
  }

  .drawing-tool-group {
    flex-wrap: wrap;
  }

  .drawing-tool-group--settings {
    flex-basis: auto;
  }

  .drawing-size-control {
    width: 100%;
  }

  .empty-canvas-actions {
    width: 100%;
    flex-direction: column;
  }

  .empty-canvas-actions button {
    width: 100%;
  }

  .canvas-help {
    display: none;
  }

  .drawing-mode-notice span {
    display: none;
  }
}
</style>