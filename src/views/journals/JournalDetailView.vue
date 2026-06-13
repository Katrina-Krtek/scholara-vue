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
          <h3>Articles in This Journal</h3>

          <button class="primary-btn" @click="createArticle">
            + Article
          </button>
        </div>

        <div v-if="!journal.articles?.length" class="empty-state">
          No articles saved yet.
        </div>

        <article
          v-for="article in journal.articles"
          :key="article.id"
          class="article-card"
        >
          <div class="card-header">
            <input
              v-model="article.title"
              class="article-title"
              placeholder="Article title"
              @blur="save"
            />

            <button class="delete-btn" @click="removeArticle(article.id)">
              Delete
            </button>
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
                <option>planned</option>
                <option>reading</option>
                <option>completed</option>
                <option>archived</option>
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
      </section>
    </section>

    <section v-else>
      <h2>Journal not found</h2>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useJournals } from '@/composables/useJournals'

const route = useRoute()

const {
  getJournalById,
  updateJournal,
  addArticle,
  deleteArticle,
} = useJournals()

const journal = computed(() => getJournalById(route.params.id))

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
</script>

<style scoped>
.journal-detail-page {
  display: grid;
  gap: 1rem;
}

.hero-card,
.detail-card {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
}

.primary-btn,
.delete-btn {
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  cursor: pointer;
  font-weight: 800;
}

.primary-btn {
  background: var(--accent);
  color: white;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.article-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
}

.article-title {
  font-weight: 800;
}

.empty-state {
  color: var(--text-muted);
  font-weight: 700;
}

@media (max-width: 900px) {
  .hero-card,
  .two-column,
  .four-column {
    grid-template-columns: 1fr;
  }
}
</style>