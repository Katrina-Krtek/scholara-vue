<template>
  <div class="graph-canvas-container">
    <div class="graph-toolbar">
      <button
        class="toolbar-btn"
        @click="zoomIn"
      >
        +
      </button>

      <button
        class="toolbar-btn"
        @click="zoomOut"
      >
        −
      </button>

      <button
        class="toolbar-btn"
        @click="resetView"
      >
        Reset
      </button>
    </div>

    <div
      ref="viewportRef"
      class="graph-viewport"
      @mousedown="startPan"
      @mousemove="handlePan"
      @mouseup="endPan"
      @mouseleave="endPan"
    >
      <div
        class="graph-surface"
        :style="surfaceStyle"
      >
        <svg
          class="graph-lines"
          width="100%"
          height="100%"
        >
          <line
            v-for="(line, index) in renderedLinks"
            :key="index"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            class="graph-line"
          />
        </svg>

        <div
          v-for="node in renderedNodes"
          :key="node.id"
          class="graph-node"
          :class="{
            selected: selectedNode?.id === node.id
          }"
          :style="{
            left: `${node.x}px`,
            top: `${node.y}px`,
            borderColor: node.color
          }"
          @click="select(node)"
        >
          <div
            class="node-dot"
            :style="{
              backgroundColor: node.color
            }"
          />

          <span class="node-label">
            {{ node.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },

  links: {
    type: Array,
    default: () => []
  },

  selectedNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-node'
])

const scale = ref(1)

const offsetX = ref(0)
const offsetY = ref(0)

const dragging = ref(false)

const lastX = ref(0)
const lastY = ref(0)

const renderedNodes = computed(() => {
  return props.nodes.map((node, index) => {
    const column = index % 5
    const row = Math.floor(index / 5)

    return {
      ...node,
      x: 150 + column * 220,
      y: 120 + row * 180
    }
  })
})

const renderedLinks = computed(() => {
  return props.links
    .map(link => {
      const source = renderedNodes.value.find(
        node => node.id === link.source
      )

      const target = renderedNodes.value.find(
        node => node.id === link.target
      )

      if (!source || !target) {
        return null
      }

      return {
        x1: source.x + 70,
        y1: source.y + 25,
        x2: target.x + 70,
        y2: target.y + 25
      }
    })
    .filter(Boolean)
})

const surfaceStyle = computed(() => {
  return {
    transform: `
      translate(${offsetX.value}px, ${offsetY.value}px)
      scale(${scale.value})
    `
  }
})

const zoomIn = () => {
  scale.value += 0.1
}

const zoomOut = () => {
  scale.value = Math.max(
    0.5,
    scale.value - 0.1
  )
}

const resetView = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

const startPan = (event) => {
  dragging.value = true

  lastX.value = event.clientX
  lastY.value = event.clientY
}

const handlePan = (event) => {
  if (!dragging.value) return

  const deltaX =
    event.clientX - lastX.value

  const deltaY =
    event.clientY - lastY.value

  offsetX.value += deltaX
  offsetY.value += deltaY

  lastX.value = event.clientX
  lastY.value = event.clientY
}

const endPan = () => {
  dragging.value = false
}

const select = (node) => {
  emit('select-node', node)
}
</script>

<style scoped>
.graph-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.graph-toolbar {
  display: flex;
  gap: 0.5rem;

  margin-bottom: 1rem;
}

.toolbar-btn {
  border: none;
  border-radius: 10px;

  padding: 0.55rem 0.85rem;

  cursor: pointer;

  background: rgba(212,175,55,0.12);
  color: #d4af37;

  font-weight: 700;
}

.graph-viewport {
  position: relative;

  width: 100%;
  height: 700px;

  overflow: hidden;

  border-radius: 18px;

  background: var(--bg-secondary);
  border: 1px solid var(--border-color);

  cursor: grab;
}

.graph-viewport:active {
  cursor: grabbing;
}

.graph-surface {
  position: relative;
  width: 1800px;
  height: 1400px;

  transform-origin: top left;
}

.graph-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.graph-line {
  stroke: rgba(212,175,55,0.35);
  stroke-width: 2;
}

.graph-node {
  position: absolute;

  min-width: 140px;

  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding: 0.85rem;

  border-radius: 14px;

  background: var(--bg-primary);

  border: 2px solid transparent;

  cursor: pointer;

  transition: all 0.2s ease;
}

.graph-node:hover {
  transform: translateY(-2px);
}

.graph-node.selected {
  box-shadow: 0 0 0 3px rgba(212,175,55,0.25);
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-label {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .graph-viewport {
    height: 500px;
  }

  .graph-node {
    min-width: 120px;
  }
}
</style>