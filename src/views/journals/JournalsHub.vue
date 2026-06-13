<template>
  <AppLayout
    title="Journals"
    subtitle="Track academic journals and the articles published within them."
    banner-key="journals-hub"
    default-icon="📖"
  >
    <section class="journals-page">
      <div class="page-actions">
        <button class="primary-btn" @click="createJournal">
          + New Journal
        </button>
      </div>

      <section class="stats-grid">
        <article class="stat-card">
          <p>Total Journals</p>
          <h3>{{ allJournals.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Favorites</p>
          <h3>{{ favoriteJournals.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Total Articles</p>
          <h3>{{ allArticles.length }}</h3>
        </article>
      </section>

      <section class="journals-grid">
        <RouterLink
          v-for="journal in allJournals"
          :key="journal.id"
          class="journal-card"
          :to="`/journals/${journal.id}`"
        >
          <div class="journal-icon">📖</div>

          <div>
            <p v-if="journal.favorite" class="favorite-pill">Favorite</p>
            <h3>{{ journal.name }}</h3>
            <p v-if="journal.subtitle" class="subtitle">{{ journal.subtitle }}</p>
            <p class="meta">{{ journal.field || 'Academic Journal' }}</p>
            <p class="meta">{{ journal.articles?.length || 0 }} articles</p>
          </div>
        </RouterLink>
      </section>
    </section>
  </AppLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useJournals } from '@/composables/useJournals'

const router = useRouter()

const {
  allJournals,
  favoriteJournals,
  allArticles,
  addJournal,
} = useJournals()

function createJournal() {
  const journal = addJournal()
  router.push(`/journals/${journal.id}`)
}
</script>

<style scoped>
.journals-page {
  display: grid;
  gap: 1rem;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 800;
  background: var(--accent);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card,
.journal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.stat-card {
  padding: 1rem;
}

.stat-card p {
  margin: 0;
  color: var(--text-muted);
  font-weight: 700;
}

.stat-card h3 {
  margin: 0.35rem 0 0;
  font-size: 2rem;
}

.journals-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.journal-card {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1rem;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
}

.journal-card:hover {
  transform: translateY(-2px);
}

.journal-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: var(--input-bg);
  font-size: 2rem;
}

.favorite-pill {
  display: inline-block;
  margin: 0 0 0.35rem;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: rgba(79, 70, 229, 0.12);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 800;
}

.journal-card h3 {
  margin: 0;
}

.subtitle,
.meta {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .stats-grid,
  .journals-grid {
    grid-template-columns: 1fr;
  }
}
</style>