<template>
  <AppLayout
    title="Calendar"
    subtitle="Deadlines, events, focus sessions, and planning"
    banner-key="calendar"
    default-icon="📅"
  >
    <section class="card">
      <h2>Calendar Hub</h2>
      <p>This page will eventually show assignments, tasks, study blocks, and academic scheduling.</p>
    </section>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
}

.card h2 {
  margin: 0 0 0.5rem;
}

.card p {
  color: var(--text-secondary);
}
</style>