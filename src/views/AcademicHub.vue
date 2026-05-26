<template>
  <AppLayout
    title="Academic Hub"
    subtitle="Your overall academic workspace and connected learning system"
    banner-key="academic"
    default-icon="🎓"
  >
    <section class="card">
      <h2>Academic Hub</h2>
      <p>This will become the central overview for courses, assignments, research, and study progress.</p>
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