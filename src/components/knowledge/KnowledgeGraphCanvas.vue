<template>
  <div class="graph-canvas">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      fit-view-on-init
      :min-zoom="0.2"
      :max-zoom="2"
      class="vue-flow-container"
    >
      <Background />

      <MiniMap />

      <Controls />

      <template #node-default="nodeProps">
        <div
          class="custom-node"
          :class="nodeProps.data.type"
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
import { computed } from 'vue'

import {
  VueFlow,
} from '@vue-flow/core'

import {
  MiniMap,
} from '@vue-flow/minimap'

import {
  Controls,
} from '@vue-flow/controls'

import {
  Background,
} from '@vue-flow/background'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

import {
  mockKnowledgeGraphNodes,
  mockKnowledgeGraphLinks,
} from '../../data/mockKnowledgeGraph'

const emit = defineEmits([
  'select-node',
])

const nodes = computed(() => {
  return mockKnowledgeGraphNodes.map((node, index) => ({
    id: node.id,

    type: 'default',

    position: {
      x: (index % 4) * 280,
      y: Math.floor(index / 4) * 180,
    },

    data: {
      ...node,
    },
  }))
})

const edges = computed(() => {
  return mockKnowledgeGraphLinks.map((link) => ({
    id: link.id,

    source: link.source,

    target: link.target,

    label: link.label,

    animated: false,
  }))
})

function handleNodeClick(nodeProps) {
  emit('select-node', nodeProps.data)
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
}

.custom-node:hover {
  border-color: var(--accent);
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
</style>