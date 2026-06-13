<template>
  <AppLayout
    :title="book?.title || 'Book Detail'"
    :subtitle="book?.author || 'Book'"
    banner-key="book-detail"
    default-icon="📘"
  >
    <section v-if="book" class="book-detail-page">
      <section class="hero-card">
        <BookCoverUploader
          :cover-url="book.coverUrl"
          @update:cover-url="handleCoverUpdate"
        />

        <div class="hero-info">
          <label>
            Title
            <input v-model="book.title" class="title-input" @blur="save" />
          </label>

          <label>
            Subtitle
            <input v-model="book.subtitle" @blur="save" />
          </label>

          <label>
            Author
            <input v-model="book.author" @blur="save" />
          </label>

          <div class="two-column">
            <label>
              Status
              <select v-model="book.status" @change="save">
                <option>planned</option>
                <option>reading</option>
                <option>completed</option>
                <option>archived</option>
              </select>
            </label>

            <label>
              Rating
              <input type="number" min="0" max="5" v-model="book.rating" @blur="save" />
            </label>
          </div>

          <div class="progress-wrap">
            <div class="progress-label">
              <strong>Reading Progress</strong>
              <span>{{ progress }}%</span>
            </div>

            <div class="progress-track">
              <div class="progress-bar" :style="{ width: `${progress}%` }" />
            </div>
          </div>
        </div>
      </section>

      <section class="grid">
        <article class="detail-card">
          <h3>Book Details</h3>

          <label>
            Publisher
            <input v-model="book.publisher" @blur="save" />
          </label>

          <label>
            Publication Year
            <input v-model="book.publicationYear" @blur="save" />
          </label>

          <label>
            ISBN
            <input v-model="book.isbn" @blur="save" />
          </label>

          <label>
            Edition
            <input v-model="book.edition" @blur="save" />
          </label>

          <label>
            Genre
            <input v-model="book.genre" @blur="save" />
          </label>
        </article>

        <article class="detail-card">
          <h3>Reading Tracker</h3>

          <div class="two-column">
            <label>
              Current Page
              <input type="number" v-model="book.currentPage" @blur="save" />
            </label>

            <label>
              Total Pages
              <input type="number" v-model="book.totalPages" @blur="save" />
            </label>
          </div>

          <label>
            Start Date
            <input type="date" v-model="book.startDate" @change="save" />
          </label>

          <label>
            Finish Date
            <input type="date" v-model="book.finishDate" @change="save" />
          </label>

          <label>
            Reading Goal
            <input v-model="book.readingGoal" placeholder="Example: Finish by June 20" @blur="save" />
          </label>
        </article>

        <article class="detail-card full-width">
          <h3>Summary</h3>
          <textarea v-model="book.summary" rows="6" @blur="save" />
        </article>

        <article class="detail-card full-width">
          <div class="card-header">
            <h3>Chapter Notes</h3>
            <button class="primary-btn" @click="createChapter">+ Chapter</button>
          </div>

          <div v-for="chapter in book.chapters" :key="chapter.id" class="chapter-card">
            <div class="card-header">
              <input v-model="chapter.title" class="chapter-title" @blur="save" />

              <button class="delete-btn" @click="removeChapter(chapter.id)">
                Delete
              </button>
            </div>

            <label>
              Summary
              <textarea v-model="chapter.summary" rows="3" @blur="save" />
            </label>

            <label>
              Key Ideas
              <textarea v-model="chapter.keyIdeas" rows="3" @blur="save" />
            </label>

            <label>
              Quotes
              <textarea v-model="chapter.quotes" rows="3" @blur="save" />
            </label>

            <label>
              Questions
              <textarea v-model="chapter.questions" rows="3" @blur="save" />
            </label>

            <label>
              Application
              <textarea v-model="chapter.application" rows="3" @blur="save" />
            </label>
          </div>
        </article>
      </section>
    </section>

    <section v-else>
      <h2>Book not found</h2>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useBooks } from '@/composables/useBooks'
import BookCoverUploader from '@/components/books/BookCoverUploader.vue'

const route = useRoute()

const {
  getBookById,
  updateBook,
  addChapter,
  deleteChapter,
  getReadingProgress,
} = useBooks()

const book = computed(() => getBookById(route.params.id))

const progress = computed(() => {
  if (!book.value) return 0
  return getReadingProgress(book.value)
})

function save() {
  if (!book.value) return
  updateBook(book.value.id, { ...book.value })
}
function handleCoverUpdate(url) {
    if (!book.value) return

    book.value.coverUrl = url
    save()
}

function createChapter() {
  if (!book.value) return
  addChapter(book.value.id)
  save()
}

function removeChapter(chapterId) {
  if (!book.value) return
  deleteChapter(book.value.id, chapterId)
  save()
}
</script>

<style scoped>
.book-detail-page {
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
  grid-template-columns: 160px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.book-cover {
  min-height: 210px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--input-bg);
  font-size: 4rem;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info,
.detail-card,
.chapter-card {
  display: grid;
  gap: .85rem;
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

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.full-width {
  grid-column: 1 / -1;
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

.progress-wrap {
  display: grid;
  gap: 0.4rem;
}

.progress-label,
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.progress-track {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--input-bg);
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
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

.chapter-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
}

.chapter-title {
  font-weight: 800;
}

@media (max-width: 900px) {
  .hero-card,
  .grid,
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>