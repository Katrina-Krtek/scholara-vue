<template>
  <section class="dashboard-widget">
    <div class="widget-header">
      <h3>Upcoming Assignments</h3>
      <span class="assignment-count">{{ assignments.length }}</span>
    </div>

    <div class="assignment-list">
      <div
        v-for="assignment in assignments"
        :key="assignment.id"
        class="assignment-item"
      >
        <div>
          <strong>{{ assignment.title }}</strong>
          <p>{{ assignment.course }}</p>
        </div>

        <div class="assignment-meta">
          <span>{{ assignment.dueDate }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const assignments = [
  {
    id: 1,
    title: 'Discussion Question Response',
    course: 'DMIN 851',
    dueDate: 'Jun 12',
  },
  {
    id: 2,
    title: 'Implementation Paper',
    course: 'DMIN 851',
    dueDate: 'Jun 26',
  },
]
</script>

<style scoped>
.dashboard-widget {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.assignment-count {
  font-weight: 800;
  color: var(--accent-text);
}

.assignment-list {
  display: grid;
  gap: 0.75rem;
}

.assignment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
}

.assignment-item p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.assignment-meta {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-text);
}
</style>