<template>
  <section class="dashboard-widget">
    <div class="widget-header">
      <h3>Today's Tasks</h3>
      <span class="task-count">{{ tasks.length }}</span>
    </div>

    <div class="task-list">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
      >
        <div>
          <strong>{{ task.title }}</strong>
          <p>{{ task.priority }} Priority</p>
        </div>

        <span class="task-status">
          {{ task.status }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
const tasks = [
  {
    id: 1,
    title: 'Review DMIN 851 notes',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 2,
    title: 'Update Scholarory build',
    priority: 'Medium',
    status: 'Not Started',
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

.widget-header h3 {
  margin: 0;
}

.task-count {
  font-weight: 800;
  color: var(--accent-text);
}

.task-list {
  display: grid;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
}

.task-item p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.task-status {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-text);
}
</style>