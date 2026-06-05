<template>
  <div class="graph-stats">
    <div class="stat-card">
      <div class="stat-value">
        {{ totalNodes }}
      </div>

      <div class="stat-label">
        Total Nodes
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-value">
        {{ totalConnections }}
      </div>

      <div class="stat-label">
        Connections
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-value stat-text">
        {{ mostConnectedName }}
      </div>

      <div class="stat-label">
        Most Connected
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-value">
        {{ orphanCount }}
      </div>

      <div class="stat-label">
        Orphan Nodes
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  },

  mostConnectedNode: {
    type: Object,
    default: null
  },

  orphanNodes: {
    type: Array,
    default: () => []
  }
})

const totalNodes = computed(() => {
  return props.stats?.totalNodes ?? 0
})

const totalConnections = computed(() => {
  return props.stats?.totalConnections ?? 0
})

const mostConnectedName = computed(() => {
  return (
    props.mostConnectedNode?.label ||
    'None'
  )
})

const orphanCount = computed(() => {
  return props.orphanNodes.length
})
</script>

<style scoped>
.graph-stats {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(180px, 1fr)
  );
  gap: 1rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  min-height: 95px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1.1;
}

.stat-text {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.stat-label {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .graph-stats {
    grid-template-columns: 1fr 1fr;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 520px) {
  .graph-stats {
    grid-template-columns: 1fr;
  }
}
</style>