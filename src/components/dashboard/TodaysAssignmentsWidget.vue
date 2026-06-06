<template>
  <section class="widget-card">
    <div class="widget-header">
      <div>
        <p class="eyebrow">Today</p>
        <h2>Assignments</h2>
      </div>

      <span class="count-pill">{{ assignments.length }}</span>
    </div>

    <div v-if="assignments.length" class="item-list">
      <article
        v-for="assignment in assignments"
        :key="assignment.id"
        class="assignment-item"
      >
        <div class="assignment-topline">
          <span class="course-pill">{{ assignment.course }}</span>
          <span class="due-label">Due Today</span>
        </div>

        <h3>{{ assignment.title }}</h3>

        <p v-if="assignment.description" class="item-description">
          {{ assignment.description }}
        </p>

        <div class="badge-row">
          <StatusBadge :status="assignment.status" />
          <PriorityBadge :priority="assignment.priority" />
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>No assignments due today.</p>
    </div>
  </section>
</template>

<script setup>
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'

defineProps({
  assignments: {
    type: Array,
    default: () => [],
  },
})
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

.assignment-item {
  display: grid;
  gap: 0.55rem;
  padding: 0.95rem;
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.assignment-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.course-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: rgba(15, 23, 42, 0.08);
  color: var(--text-primary, #111827);
  font-size: 0.72rem;
  font-weight: 800;
}

.due-label {
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 800;
}

h3 {
  margin: 0;
  font-size: 0.98rem;
  color: var(--text-primary, #111827);
}

.item-description {
  margin: 0;
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
