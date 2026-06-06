<template>
  <section class="widget-card">
    <div class="widget-header">
      <div>
        <p class="eyebrow">Today</p>
        <h2>Tasks</h2>
      </div>

      <span class="count-pill">{{ tasks.length }}</span>
    </div>

    <div v-if="tasks.length" class="item-list">
      <article v-for="task in tasks" :key="task.id" class="task-item">
        <div class="item-main">
          <label class="checkbox-row">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              @change="$emit('toggle-complete', task.id)"
            />
            <span>{{ task.title }}</span>
          </label>

          <p v-if="task.description" class="item-description">
            {{ task.description }}
          </p>
        </div>

        <div class="badge-row">
          <StatusBadge :status="task.status" />
          <PriorityBadge :priority="task.priority" />
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>No tasks scheduled for today.</p>
    </div>
  </section>
</template>

<script setup>
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'

defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['toggle-complete'])
</script>

<style scoped>
.widget-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.widget-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d4a017;
}

h2 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-primary, #111827);
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-primary, #111827);
  font-size: 0.8rem;
  font-weight: 800;
}

.item-list {
  display: grid;
  gap: 0.85rem;
}

.task-item {
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem;
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.item-main {
  display: grid;
  gap: 0.35rem;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-primary, #111827);
  font-weight: 700;
}

.checkbox-row input {
  width: 1rem;
  height: 1rem;
  accent-color: #d4a017;
}

.item-description {
  margin: 0;
  padding-left: 1.6rem;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
  line-height: 1.45;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.empty-state {
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 1rem;
  padding: 1rem;
  color: var(--text-secondary, #64748b);
  background: rgba(248, 250, 252, 0.7);
}

.empty-state p {
  margin: 0;
}
</style>