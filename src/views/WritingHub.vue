<template>
  <AppLayout
    title="Writing Hub"
    subtitle="Drafts, papers, outlines, citations, and writing projects"
    banner-key="writing"
    default-icon="✍️"
  >
    <section class="card">
      <h2>Writing Hub</h2>
      <p>This page will eventually support essays, academic papers, outlines, citations, and linked research writing.</p>
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