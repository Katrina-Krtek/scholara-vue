<template>
  <AppLayout
    :title="book?.title || 'Book Detail'"
    :subtitle="bookAuthorDisplay || 'Book'"
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
            <input
              v-model="book.title"
              class="title-input"
              @blur="save"
            />
          </label>

          <label>
            Subtitle
            <input
              v-model="book.subtitle"
              @blur="save"
            />
          </label>

          <section class="authors-editor">
            <div class="authors-header">
              <div>
                <strong>Authors</strong>

                <p>
                  Enter each author separately and in citation order.
                </p>
              </div>

              <button
                class="secondary-btn"
                type="button"
                @click="addAuthorDraft"
              >
                + Add Author
              </button>
            </div>

            <div class="author-card-list">
              <article
                v-for="(author, index) in authorDrafts"
                :key="`book-author-${index}`"
                class="author-card"
              >
                <div class="author-card-header">
                  <div>
                    <strong>
                      {{ getAuthorCardLabel(index) }}
                    </strong>

                    <span>
                      Citation position {{ index + 1 }}
                    </span>
                  </div>

                  <div class="author-card-actions">
                    <select
                      v-model="author.creatorType"
                      class="author-type-select"
                      @change="saveAuthors"
                    >
                      <option value="person">
                        Person
                      </option>

                      <option value="literal">
                        Organization / Group
                      </option>
                    </select>

                    <button
                      class="author-remove-btn"
                      type="button"
                      :aria-label="`Clear ${getAuthorCardLabel(index)}`"
                      @click="removeAuthorDraft(index)"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <label
                  v-if="author.creatorType === 'literal'"
                >
                  {{ getAuthorCardLabel(index) }} Organization or Group Name

                  <input
                    v-model="author.literal"
                    :placeholder="`${getAuthorCardLabel(index)} organization or group name`"
                    @blur="saveAuthors"
                  />
                </label>

                <div
                  v-else
                  class="author-name-grid"
                >
                  <label>
                    {{ getAuthorCardLabel(index) }} First Name

                    <input
                      v-model="author.firstName"
                      :placeholder="`${getAuthorCardLabel(index)} first name`"
                      @blur="saveAuthors"
                    />
                  </label>

                  <label>
                    {{ getAuthorCardLabel(index) }} Middle Name / Initial

                    <input
                      v-model="author.middleName"
                      :placeholder="`${getAuthorCardLabel(index)} middle name or initial`"
                      @blur="saveAuthors"
                    />
                  </label>

                  <label>
                    {{ getAuthorCardLabel(index) }} Last Name

                    <input
                      v-model="author.lastName"
                      :placeholder="`${getAuthorCardLabel(index)} last name`"
                      @blur="saveAuthors"
                    />
                  </label>

                  <label>
                    {{ getAuthorCardLabel(index) }} Suffix

                    <input
                      v-model="author.suffix"
                      placeholder="Jr., Sr., III, etc."
                      @blur="saveAuthors"
                    />
                  </label>
                </div>

                <details
                  v-if="author.creatorType === 'person'"
                  class="author-advanced"
                >
                  <summary>
                    Additional name details
                  </summary>

                  <div class="author-advanced-grid">
                    <label>
                      Name Particle

                      <input
                        v-model="author.nameParticle"
                        placeholder="de, van, von, etc."
                        @blur="saveAuthors"
                      />
                    </label>

                    <label>
                      Separate Initial Field

                      <input
                        v-model="author.initial"
                        placeholder="Optional legacy initial"
                        @blur="saveAuthors"
                      />
                    </label>
                  </div>
                </details>
              </article>
            </div>
          </section>

          <div class="two-column">
            <label>
              Status
              <select
                v-model="book.status"
                @change="save"
              >
                <option>planned</option>
                <option>reading</option>
                <option>completed</option>
                <option>archived</option>
              </select>
            </label>

            <label>
              Rating
              <input
                v-model="book.rating"
                type="number"
                min="0"
                max="5"
                @blur="save"
              />
            </label>
          </div>

          <div class="progress-wrap">
            <div class="progress-label">
              <strong>Reading Progress</strong>
              <span>{{ progress }}%</span>
            </div>

            <div class="progress-track">
              <div
                class="progress-bar"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <SourceRelationshipPanel
        :source-id="book.id"
        :source-title="book.title"
        :source-author="bookAuthorDisplay"
        source-type="Book"
        heading="Connected Sources"
      />

      <section class="grid">
        <article class="detail-card">
          <h3>Book Details</h3>

          <label>
            Short Title
            <input
              v-model="book.shortTitle"
              placeholder="Used for short notes"
              @blur="save"
            />
          </label>

          <label>
            Publisher
            <input
              v-model="book.publisher"
              @blur="save"
            />
          </label>

          <label>
            Place of Publication
            <input
              v-model="book.placeOfPublication"
              placeholder="Grand Rapids, MI"
              @blur="save"
            />
          </label>

          <label>
            Publication Year
            <input
              v-model="book.publicationYear"
              @blur="save"
            />
          </label>

          <label>
            ISBN
            <input
              v-model="book.isbn"
              @blur="save"
            />
          </label>

          <label>
            Edition
            <input
              v-model="book.edition"
              @blur="save"
            />
          </label>

          <label>
            Genre
            <input
              v-model="book.genre"
              @blur="save"
            />
          </label>
        </article>

        <article class="detail-card">
          <h3>Reading Tracker</h3>

          <div class="two-column">
            <label>
              Current Page
              <input
                v-model="book.currentPage"
                type="number"
                @blur="save"
              />
            </label>

            <label>
              Total Pages
              <input
                v-model="book.totalPages"
                type="number"
                @blur="save"
              />
            </label>
          </div>

          <label>
            Start Date
            <input
              v-model="book.startDate"
              type="date"
              @change="save"
            />
          </label>

          <label>
            Finish Date
            <input
              v-model="book.finishDate"
              type="date"
              @change="save"
            />
          </label>

          <label>
            Reading Goal
            <input
              v-model="book.readingGoal"
              placeholder="Example: Finish by June 20"
              @blur="save"
            />
          </label>
        </article>

        <CitationPanel
          v-if="citationItem"
          class="full-width"
          :item="citationItem"
        />

        <article class="detail-card full-width">
          <h3>Summary</h3>

          <textarea
            v-model="book.summary"
            rows="6"
            @blur="save"
          />
        </article>

        <article class="detail-card full-width">
          <div class="card-header">
            <h3>Chapter Notes</h3>

            <button
              class="primary-btn"
              type="button"
              @click="createChapter"
            >
              + Chapter
            </button>
          </div>

          <div
            v-for="chapter in book.chapters"
            :key="chapter.id"
            class="chapter-card"
          >
            <div class="card-header">
              <input
                v-model="chapter.title"
                class="chapter-title"
                @blur="save"
              />

              <button
                class="delete-btn"
                type="button"
                @click="
                  removeChapter(chapter.id)
                "
              >
                Delete
              </button>
            </div>

            <label>
              Summary
              <textarea
                v-model="chapter.summary"
                rows="3"
                @blur="save"
              />
            </label>

            <label>
              Key Ideas
              <textarea
                v-model="chapter.keyIdeas"
                rows="3"
                @blur="save"
              />
            </label>

            <label>
              Quotes
              <textarea
                v-model="chapter.quotes"
                rows="3"
                @blur="save"
              />
            </label>

            <label>
              Questions
              <textarea
                v-model="chapter.questions"
                rows="3"
                @blur="save"
              />
            </label>

            <label>
              Application
              <textarea
                v-model="chapter.application"
                rows="3"
                @blur="save"
              />
            </label>
          </div>
        </article>
      </section>

      <div
        v-if="saveMessage"
        class="save-toast"
      >
        {{ saveMessage }}
      </div>
    </section>

    <section v-else class="not-found-card">
      <h2>Book not found</h2>
    </section>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  watchEffect,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import BookCoverUploader from '@/components/books/BookCoverUploader.vue'
import SourceRelationshipPanel from '@/components/sources/SourceRelationshipPanel.vue'
import CitationPanel from '@/components/citations/CitationPanel.vue'
import {
  cleanBookAuthors,
  createEmptyBookAuthor,
  formatBookAuthors,
  normalizeBookAuthor,
  useBooks,
} from '@/composables/useBooks'

const route = useRoute()
const router = useRouter()

const {
  getBookByRouteValue,
  getBookPath,
  updateBook,
  addChapter,
  deleteChapter,
  getReadingProgress,
} = useBooks()

const book = computed(() => {
  return getBookByRouteValue(
    route.params.id,
  )
})

watchEffect(() => {
  const currentBook = book.value

  if (!currentBook) {
    return
  }

  const canonicalPath =
    getBookPath(currentBook)

  if (route.path !== canonicalPath) {
    router.replace(canonicalPath)
  }
})

const saveMessage = ref('')
const authorDrafts = ref([])

const MINIMUM_AUTHOR_SLOTS = 5

const bookAuthorDisplay =
  computed(() => {
    const draftDisplay =
      formatBookAuthors(
        cleanBookAuthors(
          authorDrafts.value,
        ),
      )

    return (
      draftDisplay ||
      book.value?.author ||
      ''
    )
  })

watch(
  () => book.value?.id,

  () => {
    loadAuthorDrafts()
  },

  {
    immediate: true,
  },
)

function loadAuthorDrafts() {
  const currentBook = book.value

  if (!currentBook) {
    authorDrafts.value = []
    return
  }

  const storedAuthors =
    Array.isArray(
      currentBook.authors,
    )
      ? currentBook.authors
      : []

  const authorSource =
    storedAuthors.length
      ? storedAuthors
      : currentBook.author

  authorDrafts.value =
    cleanBookAuthors(
      authorSource,
    ).map((author) => ({
      ...normalizeBookAuthor(
        author,
      ),
    }))

  ensureMinimumAuthorSlots()
}

function ensureMinimumAuthorSlots() {
  if (authorDrafts.value.length > 0) {
    return
  }

  while (
    authorDrafts.value.length <
    MINIMUM_AUTHOR_SLOTS
  ) {
    authorDrafts.value.push(
      createEmptyBookAuthor(),
    )
  }
}

function addAuthorDraft() {
  authorDrafts.value.push(
    createEmptyBookAuthor(),
  )
}

function removeAuthorDraft(index) {
  authorDrafts.value.splice(
    index,
    1,
  )

  if (
    authorDrafts.value.length === 0
  ) {
    authorDrafts.value.push(
      createEmptyBookAuthor(),
    )
  }

  saveAuthors()
}

function getAuthorCardLabel(index) {
  const ordinalLabels = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
  ]

  return index <
    ordinalLabels.length
    ? `${ordinalLabels[index]} Author`
    : `Author ${index + 1}`
}

function saveAuthors() {
  save()
}

function getCleanBookAuthors() {
  return cleanBookAuthors(
    authorDrafts.value,
  )
}

const progress = computed(() => {
  if (!book.value) {
    return 0
  }

  return getReadingProgress(
    book.value,
  )
})

const citationItem = computed(() => {
  if (!book.value) {
    return null
  }

  const authors =
    getCleanBookAuthors()

  const authorDisplay =
    formatBookAuthors(authors)

  return {
    id: book.value.id,
    type: 'book',
    title: book.value.title,
    subtitle:
      book.value.subtitle || '',
    author: authorDisplay,
    authors,

    metadata: {
      author: authorDisplay,
      authors,

      subtitle:
        book.value.subtitle || '',

      shortTitle:
        book.value.shortTitle ||
        book.value.title,

      publisher:
        book.value.publisher,

      placeOfPublication:
        book.value.placeOfPublication,

      year:
        book.value.publicationYear,

      isbn:
        book.value.isbn,

      edition:
        book.value.edition,

      genre:
        book.value.genre,
    },
  }
})

function save() {
  const currentBook = book.value

  if (!currentBook) {
    return
  }

  const authors =
    getCleanBookAuthors()

  const updatedBook = updateBook(
    currentBook.id,
    {
      ...currentBook,
      authors,
      author:
        formatBookAuthors(
          authors,
        ),
    },
  )

  if (!updatedBook) {
    return
  }

  const canonicalPath =
    getBookPath(updatedBook)

  if (route.path !== canonicalPath) {
    router.replace(canonicalPath)
  }
}

function handleCoverUpdate(url) {
  if (!book.value) {
    return
  }

  book.value.coverUrl = url
  save()
}

function createChapter() {
  if (!book.value) {
    return
  }

  addChapter(book.value.id)
  save()
}

function removeChapter(chapterId) {
  if (!book.value) {
    return
  }

  deleteChapter(
    book.value.id,
    chapterId,
  )

  save()
}

function showMessage(message) {
  saveMessage.value = message

  setTimeout(() => {
    saveMessage.value = ''
  }, 2200)
}
</script>

<style scoped>
.book-detail-page {
  display: grid;
  gap: 1rem;
}

.hero-card,
.detail-card,
.not-found-card {
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

.authors-editor {
  display: grid;
  gap: 0.75rem;
}

.authors-header,
.author-card-header,
.author-card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.authors-header,
.author-card-header {
  justify-content: space-between;
}

.authors-header p {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 500;
}

.author-card-list {
  display: grid;
  gap: 0.75rem;
}

.author-card {
  display: grid;
  gap: 0.75rem;
  border:
    1px solid
    var(--border-color);
  border-radius: 14px;
  background: var(--input-bg);
  padding: 0.85rem;
}

.author-card-header > div:first-child {
  display: grid;
  gap: 0.15rem;
}

.author-card-header span {
  color: var(--text-muted);
  font-size: 0.74rem;
  font-weight: 500;
}

.author-type-select {
  min-width: 170px;
}

.author-remove-btn {
  width: 40px;
  height: 40px;
  border:
    1px solid
    var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 1.15rem;
  cursor: pointer;
}

.author-name-grid,
.author-advanced-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 0.75rem;
}

.author-advanced {
  border-top:
    1px solid
    var(--border-color);
  padding-top: 0.65rem;
}

.author-advanced summary {
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.author-advanced-grid {
  margin-top: 0.65rem;
}

.two-column {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
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
  border:
    1px solid
    var(--border-color);
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

.card-header h3,
.card-header p {
  margin: 0;
}

.card-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
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
.secondary-btn,
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

.secondary-btn {
  background: var(--input-bg);
  color: var(--text-primary);
  border:
    1px solid
    var(--border-color);
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.chapter-card {
  border:
    1px solid
    var(--border-color);
  border-radius: 14px;
  padding: 1rem;
}

.chapter-title {
  font-weight: 800;
}

.citation-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.citation-tabs button {
  border:
    1px solid
    var(--border-color);
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  background: var(--input-bg);
  color: var(--text-secondary);
  font-weight: 800;
  cursor: pointer;
}

.citation-tabs button.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.citation-box {
  padding: 1rem;
  border-radius: 18px;
  background: var(--input-bg);
  border:
    1px solid
    var(--border-color);
  color: var(--text-primary);
  line-height: 1.65;
}

.citation-box p {
  margin: 0;
}

.save-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 20;
  border-radius: 999px;
  padding: 0.8rem 1rem;
  background: #0f172a;
  color: white;
  font-weight: 850;
  box-shadow:
    0 18px 34px
    rgba(15, 23, 42, 0.28);
}

@media (max-width: 900px) {
  .hero-card,
  .grid,
  .two-column,
  .author-name-grid,
  .author-advanced-grid {
    grid-template-columns: 1fr;
  }

  .authors-header,
  .author-card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .author-card-actions {
    width: 100%;
  }

  .author-type-select {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>