<template>
  <AppLayout
    title="Research Hub"
    subtitle="Sources, notes, topics, supertags, and graph connections"
    banner-key="research"
    default-icon="🔎"
  >
    <div class="page-grid">
      <section class="card">
        <h2>🧠 Research Brain</h2>
        <p>This will become the center of Scholarory.</p>
        <ul>
          <li>Sources</li>
          <li>Notes</li>
          <li>Quotes</li>
          <li>Topics</li>
          <li>Supertags</li>
          <li>Graph View</li>
        </ul>
      </section>

      <section class="card">
        <h2>🏷️ Supertags</h2>
        <p>Supertags turn items into smart types like Book, Article, Assignment, Course, Person, or Concept.</p>
      </section>

      <section class="card">
        <h2>🕸️ Graph View</h2>
        <p>This will show how everything connects across your academic work.</p>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
}

.card h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.card p,
.card li {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>