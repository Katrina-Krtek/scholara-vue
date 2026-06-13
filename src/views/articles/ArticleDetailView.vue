<template>
  <AppLayout
    :title="article?.title || 'Article Detail'"
    :subtitle="article?.journalName || 'Journal Article'"
    banner-key="article-detail"
    default-icon="📰"
  >
    <section v-if="article" class="article-page">
      <section class="hero-card">
        <div>
          <p class="journal-pill">{{ article.journalName }}</p>

          <label>
            Title
            <input
              v-model="article.title"
              class="title-input"
              @blur="save"
            />
          </label>

          <label>
            Subtitle
            <input
              v-model="article.subtitle"
              @blur="save"
            />
          </label>

          <div class="two-column">
            <label>
              Author
              <input
                v-model="article.author"
                @blur="save"
              />
            </label>

            <label>
              Year
              <input
                v-model="article.year"
                @blur="save"
              />
            </label>
          </div>

          <div class="four-column">
            <label>
              Volume
              <input
                v-model="article.volume"
                @blur="save"
              />
            </label>

            <label>
              Issue
              <input
                v-model="article.issue"
                @blur="save"
              />
            </label>

            <label>
              Pages
              <input
                v-model="article.pages"
                @blur="save"
              />
            </label>

            <label>
              Status
              <select
                v-model="article.status"
                @change="save"
              >
                <option>planned</option>
                <option>reading</option>
                <option>completed</option>
                <option>archived</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section class="detail-card">
        <h3>Abstract</h3>

        <textarea
          v-model="article.abstract"
          rows="6"
          @blur="save"
        />
      </section>

      <section class="detail-card">
        <h3>Section Notes</h3>

        <textarea
          v-model="article.sectionNotes"
          rows="8"
          @blur="save"
        />
      </section>

      <section class="detail-card">
        <h3>Key Quotes</h3>

        <textarea
          v-model="article.keyQuotes"
          rows="6"
          @blur="save"
        />
      </section>

      <section class="detail-card">
        <h3>How I Might Use This</h3>

        <textarea
          v-model="article.useForWriting"
          rows="6"
          @blur="save"
        />
      </section>
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
  getArticleById,
  updateArticle,
} = useJournals()

const article = computed(() =>
  getArticleById(route.params.id),
)

function save() {
  if (!article.value) return

  updateArticle(
    article.value.journalId,
    article.value.id,
    article.value,
  )
}
</script>

<style scoped>
.article-page {
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

.journal-pill {
  display: inline-block;
  margin-bottom: 1rem;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: rgba(79,70,229,.12);
  color: var(--accent);
  font-size: .75rem;
  font-weight: 800;
}

label {
  display: grid;
  gap: .4rem;
  font-weight: 700;
}

.title-input {
  font-size: 1.5rem;
  font-weight: 800;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: .75rem;
}

.four-column {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: .75rem;
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
  padding: .75rem;
}

@media (max-width: 900px) {
  .two-column,
  .four-column {
    grid-template-columns: 1fr;
  }
}
</style>