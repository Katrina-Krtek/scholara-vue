<template>
  <AppLayout
    title="Notes"
    subtitle="Class notes, research notes, ideas, and linked thoughts"
    banner-key="notes"
    default-icon="📓"
  >
    <section class="card">
      <h2>Notes Hub</h2>
      <p>This page will hold notes that can link to courses, assignments, sources, topics, and supertags.</p>
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