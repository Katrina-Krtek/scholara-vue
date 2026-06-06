<template>
  <span class="priority-badge" :class="priorityClass">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: {
    type: String,
    default: 'medium',
  },
})

const priorityMap = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const label = computed(() => priorityMap[props.priority] || 'Medium')

const priorityClass = computed(() => `priority-${props.priority}`)
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.priority-low {
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
}

.priority-medium {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.priority-high {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}

.priority-urgent {
  background: rgba(220, 38, 38, 0.14);
  color: #dc2626;
}
</style>