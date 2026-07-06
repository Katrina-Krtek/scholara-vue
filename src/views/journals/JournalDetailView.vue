<template>
  <AppLayout
    :title="journal?.name || 'Journal Detail'"
    :subtitle="journal?.field || 'Academic Journal'"
    banner-key="journal-detail"
    default-icon="📖"
  >
    <section v-if="journal" class="journal-detail-page">
      <section class="hero-card">
        <div class="journal-icon">📖</div>

        <div class="hero-info">
          <label>
            Journal Name
            <input v-model="journal.name" class="title-input" @blur="save" />
          </label>

          <label>
            Subtitle
            <input v-model="journal.subtitle" @blur="save" />
          </label>

          <div class="two-column">
            <label>
              Field
              <input v-model="journal.field" @blur="save" />
            </label>

            <label>
              Publisher
              <input v-model="journal.publisher" @blur="save" />
            </label>
          </div>

          <div class="two-column">
            <label>
              ISSN
              <input v-model="journal.issn" @blur="save" />
            </label>

            <label>
              Website
              <input v-model="journal.website" @blur="save" />
            </label>
          </div>

          <div class="two-column">
            <label class="checkbox-row">
              <input type="checkbox" v-model="journal.peerReviewed" @change="save" />
              <span>Peer reviewed</span>
            </label>

            <label class="checkbox-row">
              <input type="checkbox" v-model="journal.favorite" @change="save" />
              <span>Favorite journal</span>
            </label>
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <article class="stat-card">
          <p>Journal Articles</p>
          <h3>{{ journalArticles.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Research Links</p>
          <h3>{{ linkedResearchArticles.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Total Connected</p>
          <h3>{{ totalConnectedArticles }}</h3>
        </article>
      </section>

      <section class="detail-card">
        <h3>Journal Notes</h3>
        <textarea
          v-model="journal.notes"
          rows="5"
          placeholder="Submission notes, scope, favorite issue themes, citation notes..."
          @blur="save"
        />
      </section>

      <section class="detail-card">
        <div class="card-header">
          <div>
            <h3>Articles in This Journal</h3>
            <p>
              Articles created inside this journal and articles linked from the research database.
            </p>
          </div>

          <div class="header-actions">
            <RouterLink to="/articles" class="secondary-btn">
              Articles Hub
            </RouterLink>

            <button class="primary-btn" type="button" @click="createArticle">
              + Article
            </button>
          </div>
        </div>

        <div v-if="!totalConnectedArticles" class="empty-state">
          No articles are connected to this journal yet.
        </div>

        <div v-if="journalArticles.length" class="section-subheader">
          <h4>Journal Database Articles</h4>
          <p>These articles live inside this journal record.</p>
        </div>

        <article
          v-for="article in journalArticles"
          :key="article.id"
          class="article-card"
        >
          <div class="article-card-top">
            <div class="article-title-row">
              <span class="source-pill">Journal DB</span>

              <input
                v-model="article.title"
                class="article-title"
                placeholder="Article title"
                @blur="save"
              />
            </div>

            <div class="article-actions">
              <RouterLink :to="`/articles/${article.id}`" class="open-btn">
                Open Detail →
              </RouterLink>

              <button class="delete-btn" type="button" @click="removeArticle(article.id)">
                Delete
              </button>
            </div>
          </div>

          <label>
            Subtitle
            <input v-model="article.subtitle" @blur="save" />
          </label>

          <div class="two-column">
            <label>
              Author
              <input v-model="article.author" @blur="save" />
            </label>

            <label>
              Year
              <input v-model="article.year" @blur="save" />
            </label>
          </div>

          <div class="four-column">
            <label>
              Volume
              <input v-model="article.volume" @blur="save" />
            </label>

            <label>
              Issue
              <input v-model="article.issue" @blur="save" />
            </label>

            <label>
              Pages
              <input v-model="article.pages" @blur="save" />
            </label>

            <label>
              Status
              <select v-model="article.status" @change="save">
                <option value="planned">planned</option>
                <option value="reading">reading</option>
                <option value="completed">completed</option>
                <option value="archived">archived</option>
              </select>
            </label>
          </div>

          <div class="two-column">
            <label>
              DOI
              <input v-model="article.doi" @blur="save" />
            </label>

            <label>
              URL
              <input v-model="article.url" @blur="save" />
            </label>
          </div>

          <label>
            Abstract / Summary
            <textarea v-model="article.abstract" rows="4" @blur="save" />
          </label>

          <label>
            Section Notes
            <textarea v-model="article.sectionNotes" rows="4" @blur="save" />
          </label>

          <label>
            Key Quotes
            <textarea v-model="article.keyQuotes" rows="4" @blur="save" />
          </label>

          <label>
            How I Might Use This
            <textarea v-model="article.useForWriting" rows="4" @blur="save" />
          </label>
        </article>

        <div v-if="linkedResearchArticles.length" class="section-subheader">
          <h4>Linked Research Articles</h4>
          <p>These articles are stored in the Research Hub and point back to this journal.</p>
        </div>

        <article
          v-for="article in linkedResearchArticles"
          :key="article.id"
          class="linked-article-card"
        >
          <div>
            <span class="source-pill research">Research DB</span>
            <h4>{{ article.title || 'Untitled Article' }}</h4>

            <p class="article-meta">
              {{ getResearchArticleAuthors(article) }}
              <span v-if="article.metadata?.year"> · {{ article.metadata.year }}</span>
              <span v-if="article.metadata?.volume"> · Vol. {{ article.metadata.volume }}</span>
              <span v-if="article.metadata?.issue">, Issue {{ article.metadata.issue }}</span>
              <span v-if="article.metadata?.pages"> · pp. {{ article.metadata.pages }}</span>
            </p>

            <p v-if="article.summary" class="article-summary">
              {{ article.summary }}
            </p>

            <div v-if="article.topicTags?.length" class="tag-row">
              <span v-for="tag in article.topicTags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>

          <RouterLink :to="`/articles/${article.id}`" class="open-btn">
            Open Detail →
          </RouterLink>
        </article>
      </section>
    </section>

    <section v-else class="not-found-card">
      <h2>Journal not found</h2>
      <p>This journal record could not be found.</p>
      <RouterLink to="/journals" class="primary-btn">Back to Journals</RouterLink>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useJournals } from '@/composables/useJournals'
import { useResearch } from '@/composables/useResearch'

const route = useRoute()

const {
  getJournalById,
  updateJournal,
  addArticle,
  deleteArticle,
} = useJournals()

const {
  allResearchItems,
  loadResearchItems,
} = useResearch()

onMounted(() => {
  loadResearchItems()
})

const journal = computed(() => getJournalById(route.params.id))

const journalArticles = computed(() => {
  return journal.value?.articles || []
})

const journalArticleIds = computed(() => {
  return new Set(journalArticles.value.map((article) => String(article.id)))
})

const linkedResearchArticles = computed(() => {
  if (!journal.value) return []

  const journalId = String(journal.value.id)
  const journalName = String(journal.value.name || '').toLowerCase()

  return allResearchItems.value.filter((item) => {
    if (item.type !== 'article') return false
    if (journalArticleIds.value.has(String(item.id))) return false

    const metadata = item.metadata || {}

    const linkedJournalId = String(metadata.journalId || metadata.journal_id || '')
    const linkedJournalTitle = String(
      metadata.journalTitle ||
      metadata.journalName ||
      metadata.journal ||
      metadata.publication ||
      '',
    ).toLowerCase()

    return linkedJournalId === journalId || linkedJournalTitle === journalName
  })
})

const totalConnectedArticles = computed(() => {
  return journalArticles.value.length + linkedResearchArticles.value.length
})

function save() {
  if (!journal.value) return
  updateJournal(journal.value.id, { ...journal.value })
}

function createArticle() {
  if (!journal.value) return
  addArticle(journal.value.id)
  save()
}

function removeArticle(articleId) {
  if (!journal.value) return
  deleteArticle(journal.value.id, articleId)
  save()
}

function getResearchArticleAuthors(article) {
  const metadata = article.metadata || {}

  if (Array.isArray(metadata.authors) && metadata.authors.length) {
    return metadata.authors
      .map((person) => {
        if (typeof person === 'string') return person

        return [
          person.firstName,
          person.initial,
          person.lastName,
        ]
          .filter(Boolean)
          .join(' ')
      })
      .filter(Boolean)
      .join('; ')
  }

  return metadata.author || 'No author listed'
}
</script>

<style scoped>
.journal-detail-page {
  display: grid;
  gap: 1rem;
}

.hero-card,
.detail-card,
.stat-card,
.not-found-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.hero-card {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.journal-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: var(--input-bg);
  font-size: 2.25rem;
}

.hero-info,
.detail-card,
.article-card {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card p {
  margin: 0;
  color: var(--text-muted);
  font-weight: 800;
}

.stat-card h3 {
  margin: 0.35rem 0 0;
  font-size: 2rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-weight: 700;
}

.title-input {
  font-size: 1.55rem;
  font-weight: 800;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.four-column {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

input,
textarea,
select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.75rem;
}

textarea {
  resize: vertical;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-row input {
  width: auto;
}

.card-header,
.article-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-header h3,
.section-subheader h4,
.linked-article-card h4 {
  margin: 0;
}

.card-header p,
.section-subheader p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.header-actions,
.article-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.delete-btn,
.open-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  cursor: pointer;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.primary-btn {
  background: var(--accent);
  color: white;
}

.secondary-btn,
.open-btn {
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.article-card,
.linked-article-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
  background: var(--bg-card);
}

.article-title-row {
  display: grid;
  gap: 0.5rem;
  flex: 1;
}

.article-title {
  font-weight: 800;
}

.linked-article-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.article-meta,
.article-summary {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  line-height: 1.45;
}

.section-subheader {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.source-pill {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: rgba(245, 158, 11, 0.14);
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 850;
}

.source-pill.research {
  background: rgba(79, 70, 229, 0.12);
  color: var(--accent);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
}

.tag {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: var(--input-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  font-size: 0.75rem;
  font-weight: 800;
}

.empty-state {
  color: var(--text-muted);
  font-weight: 700;
  padding: 1rem;
  border: 1px dashed var(--border-color);
  border-radius: 14px;
  background: var(--input-bg);
}

.not-found-card p {
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .hero-card,
  .two-column,
  .four-column,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header,
  .article-card-top,
  .linked-article-card {
    display: grid;
  }
}
</style>