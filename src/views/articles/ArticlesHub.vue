<template>
  <AppLayout
    title="Articles"
    subtitle="Search and manage journal articles across every journal."
    banner-key="articles-hub"
    default-icon="📰"
  >
    <section class="articles-page">
      <section class="toolbar-card">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search articles by title, author, journal, tags, or notes..."
        />

        <select v-model="statusFilter">
          <option value="all">All statuses</option>
          <option value="planned">Planned</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </section>

      <section class="stats-grid">
        <article class="stat-card">
          <p>Total Articles</p>
          <h3>{{ allArticles.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Filtered</p>
          <h3>{{ filteredArticles.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Journals</p>
          <h3>{{ allJournals.length }}</h3>
        </article>
      </section>

      <section class="articles-list">
        <RouterLink
          v-for="article in filteredArticles"
          :key="article.id"
          class="article-row"
          :to="`/articles/${article.id}`"
        >
          <div>
            <p class="journal-pill">{{ article.journalName }}</p>
            <h3>{{ article.title }}</h3>
            <p v-if="article.subtitle" class="subtitle">{{ article.subtitle }}</p>
            <p class="meta">
              {{ article.author || 'Unknown Author' }}
              <span v-if="article.year"> · {{ article.year }}</span>
              <span v-if="article.volume"> · Vol. {{ article.volume }}</span>
              <span v-if="article.issue">, Issue {{ article.issue }}</span>
              <span v-if="article.pages"> · pp. {{ article.pages }}</span>
            </p>
          </div>

          <span class="status-pill">{{ article.status }}</span>
        </RouterLink>

        <div v-if="!filteredArticles.length" class="empty-state">
          No articles found.
        </div>
      </section>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useJournals } from '@/composables/useJournals'

const { allJournals, allArticles } = useJournals()

const searchQuery = ref('')
const statusFilter = ref('all')

const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return allArticles.value.filter((article) => {
    const matchesStatus =
      statusFilter.value === 'all' || article.status === statusFilter.value

    const searchableText = [
      article.title,
      article.subtitle,
      article.author,
      article.year,
      article.journalName,
      article.abstract,
      article.sectionNotes,
      article.keyQuotes,
      article.useForWriting,
      ...(article.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = !query || searchableText.includes(query)

    return matchesStatus && matchesSearch
  })
})
</script>

<style scoped>
.articles-page {
  display: grid;
  gap: 1rem;
}

.toolbar-card,
.stat-card,
.article-row {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.toolbar-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 0.75rem;
  padding: 1rem;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
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

.articles-list {
  display: grid;
  gap: 0.75rem;
}

.article-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.article-row:hover {
  transform: translateY(-2px);
  border-color: rgba(79, 70, 229, 0.35);
}

.journal-pill,
.status-pill {
  display: inline-block;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: capitalize;
}

.journal-pill {
  margin: 0 0 0.35rem;
  background: rgba(79, 70, 229, 0.12);
  color: var(--accent);
}

.status-pill {
  align-self: start;
  background: var(--input-bg);
  color: var(--text-muted);
}

.article-row h3 {
  margin: 0;
}

.subtitle,
.meta {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
}

.empty-state {
  padding: 1rem;
  color: var(--text-muted);
  font-weight: 700;
}

@media (max-width: 900px) {
  .toolbar-card,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .article-row {
    display: grid;
  }
}
</style>