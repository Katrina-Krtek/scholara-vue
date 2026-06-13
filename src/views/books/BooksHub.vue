<template>
  <AppLayout
    title="Books"
    subtitle="Track reading, chapter notes, quotes, and academic connections."
    banner-key="books-hub"
    default-icon="📘"
  >
    <section class="books-page">
      <div class="books-actions">
        <button class="primary-btn" @click="createBook">
          + New Book
        </button>
      </div>

      <section class="stats-grid">
        <article class="stat-card">
          <p>Total Books</p>
          <h3>{{ allBooks.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Reading</p>
          <h3>{{ readingBooks.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Planned</p>
          <h3>{{ plannedBooks.length }}</h3>
        </article>

        <article class="stat-card">
          <p>Completed</p>
          <h3>{{ completedBooks.length }}</h3>
        </article>
      </section>

      <section class="books-grid">
        <RouterLink
          v-for="book in allBooks"
          :key="book.id"
          class="book-card"
          :to="`/books/${book.id}`"
        >
          <div class="book-cover">
            <img
              v-if="book.coverUrl"
              :src="book.coverUrl"
              :alt="book.title"
            />
            <span v-else>📘</span>
          </div>

          <div class="book-info">
            <p class="status-pill">{{ book.status }}</p>
            <h3>{{ book.title }}</h3>
            <p v-if="book.subtitle" class="subtitle">{{ book.subtitle }}</p>
            <p class="author">{{ book.author || 'Unknown Author' }}</p>

            <div class="progress-wrap">
              <div class="progress-label">
                <span>Progress</span>
                <strong>{{ getReadingProgress(book) }}%</strong>
              </div>

              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{ width: `${getReadingProgress(book)}%` }"
                />
              </div>
            </div>
          </div>
        </RouterLink>
      </section>
    </section>
  </AppLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useBooks } from '@/composables/useBooks'

const router = useRouter()

const {
  allBooks,
  readingBooks,
  plannedBooks,
  completedBooks,
  addBook,
  getReadingProgress,
} = useBooks()

function createBook() {
  const book = addBook()
  router.push(`/books/${book.id}`)
}
</script>

<style scoped>
.books-page {
  display: grid;
  gap: 1rem;
}

.books-actions {
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card,
.book-card {
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.book-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
}

.book-card:hover {
  transform: translateY(-2px);
}

.book-cover {
  min-height: 220px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--input-bg);
  font-size: 3rem;
}
.book-cover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  display: grid;
  align-content: start;
  gap: 0.45rem;
}

.status-pill {
  justify-self: start;
  margin: 0;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: rgba(79, 70, 229, 0.12);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: capitalize;
}

.book-info h3 {
  margin: 0;
  font-size: 1.25rem;
}

.subtitle,
.author {
  margin: 0;
  color: var(--text-muted);
}

.progress-wrap {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
}

.progress-track {
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--input-bg);
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

@media (max-width: 900px) {
  .stats-grid,
  .books-grid {
    grid-template-columns: 1fr;
  }

  .book-card {
    grid-template-columns: 1fr;
  }
}
</style>