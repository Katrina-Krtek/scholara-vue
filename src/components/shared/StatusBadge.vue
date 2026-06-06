<template>
  <span class="status-badge" :class="statusClass">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'not-started',
  },
})

const statusMap = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed',
  overdue: 'Overdue',
}

const label = computed(() => statusMap[props.status] || 'Not Started')

const statusClass = computed(() => `status-${props.status}`)
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-not-started {
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
}

.status-in-progress {
  background: rgba(59, 130, 246, 0.14);
  color: #2563eb;
}

.status-waiting {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}

.status-completed {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}

.status-overdue {
  background: rgba(239, 68, 68, 0.14);
  color: #dc2626;
}
</style>