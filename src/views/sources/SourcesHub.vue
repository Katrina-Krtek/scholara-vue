<template>
  <AppLayout
    title="Sources"
    subtitle="Research books, articles, journals, dissertations, and media"
    banner-key="sources-hub"
    default-icon="📚"
  >
    <div class="sources-header">
      <button class="primary-btn" @click="createSource">
        + New Source
      </button>
    </div>

    <div class="sources-grid">
      <button
        v-for="source in sources"
        :key="source.id"
        class="source-card"
        @click="goToSource(source.id)"
      >
        <div class="source-type">{{ source.type }}</div>
        <h3>{{ source.title }}</h3>
        <p>{{ source.author }}</p>
        <small>{{ source.course }} · {{ source.status }}</small>
      </button>
    </div>
  </AppLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useSources } from '@/composables/useSources'

const router = useRouter()
const { sources, addSource } = useSources()

function createSource() {
  const source = addSource({
    title: 'Untitled Source',
  })

  router.push(`/sources/${source.id}`)
}

function goToSource(id) {
  router.push(`/sources/${id}`)
}
</script>

<style scoped>
.sources-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.primary-btn {
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 700;
  background: var(--accent);
  color: white;
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.source-card {
  text-align: left;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
}

.source-type {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--accent-text);
  text-transform: uppercase;
}

.source-card h3 {
  margin: 0.5rem 0;
  color: var(--text-primary);
}

.source-card p,
.source-card small {
  color: var(--text-secondary);
}
</style>