<template>
  <div class="graph-shell">
    <VueFlow
      :nodes="flowNodes"
      :edges="flowEdges"
      fit-view-on-init
      class="research-flow"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { VueFlow } from '@vue-flow/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const router = useRouter()

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  edges: {
    type: Array,
    default: () => []
  }
})

const flowNodes = computed(() =>
  props.nodes.map((node, index) => ({
    id: node.id,
    label: `${node.icon || '📄'} ${node.label}`,
    position: {
      x: 80 + (index % 3) * 220,
      y: 80 + Math.floor(index / 3) * 140
    },
    data: node
  }))
)

const flowEdges = computed(() =>
  props.edges.map((edge, index) => ({
    id: `edge-${index}-${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to
  }))
)

function handleNodeClick(event) {
  const nodeId = event.node?.id

  if (!nodeId) return

  router.push(`/research/items/${nodeId}`)
}
</script>

<style scoped>
.graph-shell {
  width: 100%;
  height: 420px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-card);
}

.research-flow {
  width: 100%;
  height: 100%;
}
</style>