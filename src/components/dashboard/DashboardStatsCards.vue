<template>
  <section class="stats-grid">
    <article class="stat-card">
      <span class="stat-label">Assignments Due</span>
      <strong>4</strong>
      <p>Due in the next 7 days</p>
    </article>

    <article class="stat-card">
      <span class="stat-label">Active Courses</span>
      <strong>1</strong>
      <p>Courses currently in progress</p>
    </article>

    <article class="stat-card">
      <span class="stat-label">Tasks Today</span>
      <strong>2</strong>
      <p>Academic tasks due today</p>
    </article>

    <article class="stat-card">
      <span class="stat-label">Current GPA</span>
      <strong>4.0</strong>
      <p>Projected academic standing</p>
    </article>
  </section>
</template>

<script setup>
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.stat-label {
  display: block;
  color: var(--accent-text);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card strong {
  display: block;
  margin: 0.35rem 0;
  color: var(--text-primary);
  font-size: 2rem;
  line-height: 1;
}

.stat-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>