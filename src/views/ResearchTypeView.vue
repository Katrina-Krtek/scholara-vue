<template>
  <AppLayout
    :title="pageTitle"
    subtitle="Filtered research items"
    banner-key="research"
    :default-icon="pageIcon"
  >
    <section class="toolbar-card">
      <div>
        <h2>{{ pageIcon }} {{ pageTitle }}</h2>
        <p>{{ visibleItems.length }} item{{ visibleItems.length === 1 ? '' : 's' }}</p>
      </div>

      <div class="toolbar-actions">
        <RouterLink to="/research" class="back-link">
          ← Research Hub
        </RouterLink>

        <button class="new-source-btn" type="button" @click="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Close' : '+ New Source' }}
        </button>
      </div>
    </section>

    <section v-if="showCreateForm" class="create-card">
      <div class="create-header">
        <h2>Create {{ pageTitle }}</h2>
      </div>

      <div class="form-group">
        <label>Title</label>
        <input v-model="newTitle" type="text" placeholder="Enter a title..." />
      </div>

      <div class="form-group">
        <label>Summary</label>
        <textarea v-model="newSummary" placeholder="Add a quick summary..."></textarea>
      </div>

      <div class="form-group">
        <label>Status</label>
        <select v-model="newStatus">
          <option
            v-for="status in researchStatuses"
            :key="status.id"
            :value="status.id"
          >
            {{ status.icon }} {{ status.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Topic Tags</label>
        <input v-model="topicTagsInput" type="text" placeholder="Paul, Messiah, Theology" />
      </div>

      <section v-if="typeId === 'book'" class="source-details">
        <h3>Book Details</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Cover Image URL</label>
            <input v-model="bookFields.coverImageUrl" type="text" placeholder="Paste book cover image URL..." />
          </div>

          <div class="form-group">
            <label>Banner Image URL</label>
            <input v-model="bookFields.bannerImageUrl" type="text" placeholder="Paste banner image URL..." />
          </div>
        </div>

        <div class="people-section">
          <label>Authors</label>

          <div v-for="(author, index) in authors" :key="index" class="person-row">
            <input v-model="author.firstName" placeholder="First name" />
            <input v-model="author.initial" placeholder="Initial" />
            <input v-model="author.lastName" placeholder="Last name" />

            <button type="button" class="remove-btn" @click="removeAuthor(index)">
              ×
            </button>
          </div>

          <button type="button" class="small-btn" @click="addAuthor">
            + Add Author
          </button>
        </div>

        <div class="people-section">
          <label>Editors</label>

          <div v-for="(editor, index) in editors" :key="index" class="person-row">
            <input v-model="editor.firstName" placeholder="First name" />
            <input v-model="editor.initial" placeholder="Initial" />
            <input v-model="editor.lastName" placeholder="Last name" />

            <button type="button" class="remove-btn" @click="removeEditor(index)">
              ×
            </button>
          </div>

          <button type="button" class="small-btn" @click="addEditor">
            + Add Editor
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Short Title</label>
            <input v-model="bookFields.shortTitle" type="text" placeholder="Short title..." />
          </div>

          <div class="form-group">
            <label>Publisher</label>
            <input v-model="bookFields.publisher" type="text" placeholder="Publisher..." />
          </div>

          <div class="form-group">
            <label>Place of Publication</label>
            <input v-model="bookFields.placeOfPublication" type="text" placeholder="Grand Rapids, MI" />
          </div>

          <div class="form-group">
            <label>Year</label>
            <input v-model="bookFields.year" type="text" placeholder="2026" />
          </div>

          <div class="form-group">
            <label>Edition</label>
            <input v-model="bookFields.edition" type="text" placeholder="2nd ed." />
          </div>

          <div class="form-group">
            <label>ISBN</label>
            <input v-model="bookFields.isbn" type="text" placeholder="ISBN..." />
          </div>

          <div class="form-group">
            <label>Page Range</label>
            <input v-model="bookFields.pageRange" type="text" placeholder="1–250" />
          </div>

          <div class="form-group">
            <label>Library Location</label>
            <input v-model="bookFields.libraryLocation" type="text" placeholder="Shelf, room, Logos, Kindle..." />
          </div>
        </div>
      </section>

      <section v-else-if="researchType" class="source-details">
        <h3>{{ pageTitle }} Details</h3>

        <div v-for="field in researchType.fields" :key="field" class="form-group">
          <label>{{ formatFieldName(field) }}</label>
          <input
            v-model="metadata[field]"
            type="text"
            :placeholder="`Enter ${formatFieldName(field)}`"
          />
        </div>
      </section>

      <div class="create-actions">
        <button class="secondary-btn" type="button" @click="showCreateForm = false">
          Cancel
        </button>

        <button class="create-btn" @click="createItem">
          Create {{ pageTitle }}
        </button>
      </div>
    </section>

    <section class="content-card">
      <div class="browse-toolbar">
        <input
          v-model="searchQuery"
          class="search-input"
          type="text"
          :placeholder="`Search ${pageTitle.toLowerCase()}...`"
        />

        <select v-model="sortMode" class="sort-select">
          <option value="recent">Recently Added</option>
          <option value="title">Title A–Z</option>
          <option value="yearDesc">Year Newest</option>
          <option value="yearAsc">Year Oldest</option>
        </select>
      </div>

      <ViewSwitcher v-model="selectedView" />

      <div v-if="visibleItems.length === 0" class="empty">
        No matching {{ pageTitle.toLowerCase() }} found.
      </div>

      <div v-else-if="selectedView === 'board'" class="board-view">
        <section
          v-for="status in researchStatuses"
          :key="status.id"
          class="board-column"
          :class="{ 'drop-target': draggedItemId }"
          @dragover.prevent
          @drop.prevent="handleDrop(status.id)"
        >
          <div class="board-column-header">
            <span>{{ status.icon }} {{ status.name }}</span>
            <span>{{ getItemsByStatus(status.id).length }}</span>
          </div>

          <div class="board-cards">
            <RouterLink
              v-for="item in getItemsByStatus(status.id)"
              :key="item.id"
              :to="getDetailRoute(item)"
              class="board-card"
              draggable="true"
              @dragstart="handleDragStart(item.id)"
              @dragend="handleDragEnd"
            >
              <div class="board-card-title">
                {{ getItemIcon(item) }} {{ item.title }}
              </div>

              <div class="board-card-meta">
                {{ formatAuthors(item) }}
                <span v-if="item.metadata?.year"> · {{ item.metadata.year }}</span>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>

      <div v-else-if="selectedView === 'gallery'" class="gallery-grid">
        <RouterLink
          v-for="item in visibleItems"
          :key="item.id"
          :to="getDetailRoute(item)"
          class="gallery-link"
        >
          <article class="gallery-card">
            <div class="gallery-banner" :style="getGalleryBannerStyle(item)">
              <img
                v-if="item.metadata?.coverImageUrl"
                :src="item.metadata.coverImageUrl"
                alt=""
                class="book-cover"
              />
            </div>

            <div class="gallery-body">
              <div class="gallery-title">
                {{ getItemIcon(item) }} {{ item.title }}
              </div>

              <div class="gallery-meta">
                {{ formatAuthors(item) }}
                <span v-if="item.metadata?.year"> · {{ item.metadata.year }}</span>
              </div>

              <div class="gallery-summary">
                {{ item.summary }}
              </div>

              <div v-if="item.topicTags?.length" class="topic-row">
                <span v-for="tag in item.topicTags" :key="tag" class="topic-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </RouterLink>
      </div>

      <div v-else-if="selectedView === 'list'" class="list-view">
        <RouterLink
          v-for="item in visibleItems"
          :key="item.id"
          :to="getDetailRoute(item)"
          class="list-row"
        >
          <span>{{ getItemIcon(item) }} {{ item.title }}</span>
          <span class="list-summary">{{ formatAuthors(item) }}</span>
        </RouterLink>
      </div>

      <div v-else-if="selectedView === 'table'" class="table-wrapper">
        <table class="items-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Authors</th>
              <th>Status</th>
              <th>Year</th>
              <th>Topics</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in visibleItems" :key="item.id">
              <td>
                <RouterLink :to="getDetailRoute(item)">
                  {{ getItemIcon(item) }} {{ item.title }}
                </RouterLink>
              </td>

              <td>{{ formatAuthors(item) }}</td>
              <td>{{ getStatusLabel(item.metadata?.status) }}</td>
              <td>{{ item.metadata?.year || '—' }}</td>
              <td>{{ item.topicTags?.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="placeholder-view">
        {{ selectedView }} view coming next.
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import ViewSwitcher from '../components/ViewSwitcher.vue'

import { useResearch } from '../composables/useResearch'
import { useBoardDrag } from '../composables/useBoardDrag'
import { useViewPreferences } from '../composables/useViewPreferences'
import { getResearchTypeById } from '../data/researchTypes'
import { researchStatuses, getResearchStatusById } from '../data/researchStatuses'

const route = useRoute()

const {
  allResearchItems,
  loadResearchItems,
  addResearchItem,
  updateResearchItem
} = useResearch()

const {
  draggedItemId,
  handleDragStart,
  handleDragEnd,
  handleDrop
} = useBoardDrag(updateResearchItem)

const typeId = computed(() => route.params.type)

const { selectedView } = useViewPreferences(
  `research-type-${typeId.value}`,
  'gallery'
)

const showCreateForm = ref(false)
const searchQuery = ref('')
const sortMode = ref('recent')

const newTitle = ref('')
const newSummary = ref('')
const newStatus = ref('inbox')
const topicTagsInput = ref('')
const metadata = ref({})

const authors = ref([
  { firstName: '', initial: '', lastName: '' }
])

const editors = ref([])

const bookFields = ref({
  coverImageUrl: '',
  bannerImageUrl: '',
  shortTitle: '',
  publisher: '',
  placeOfPublication: '',
  year: '',
  edition: '',
  isbn: '',
  pageRange: '',
  libraryLocation: ''
})

onMounted(() => {
  loadResearchItems()
})

const researchType = computed(() => {
  return getResearchTypeById(typeId.value)
})

const pageTitle = computed(() => {
  return researchType.value?.name || 'Research Items'
})

const pageIcon = computed(() => {
  return researchType.value?.icon || '🔎'
})

const filteredItems = computed(() => {
  return allResearchItems.value.filter(
    (item) => item.type === typeId.value
  )
})

const visibleItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  let items = filteredItems.value.filter((item) => {
    const searchable = [
      item.title,
      item.summary,
      item.metadata?.shortTitle,
      item.metadata?.publisher,
      item.metadata?.placeOfPublication,
      item.metadata?.year,
      item.metadata?.libraryLocation,
      item.metadata?.status,
      formatAuthors(item),
      ...(item.topicTags || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })

  items = [...items]

  if (sortMode.value === 'title') {
    items.sort((a, b) => a.title.localeCompare(b.title))
  }

  if (sortMode.value === 'yearDesc') {
    items.sort((a, b) =>
      String(b.metadata?.year || '').localeCompare(String(a.metadata?.year || ''))
    )
  }

  if (sortMode.value === 'yearAsc') {
    items.sort((a, b) =>
      String(a.metadata?.year || '').localeCompare(String(b.metadata?.year || ''))
    )
  }

  if (sortMode.value === 'recent') {
    items.sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    )
  }

  return items
})

watch(typeId, () => {
  resetForm()
  showCreateForm.value = false
  searchQuery.value = ''
})

function getDetailRoute(item) {
  if (item.type === 'article') {
    return `/articles/${item.id}`
  }

  if (item.type === 'book') {
    return `/books/${item.id}`
  }

  if (item.type === 'journal') {
    return `/journals/${item.id}`
  }

  return `/research/items/${item.id}`
}

function getItemsByStatus(statusId) {
  return visibleItems.value.filter((item) => {
    return (item.metadata?.status || 'inbox') === statusId
  })
}

function getStatusLabel(statusId = 'inbox') {
  const status = getResearchStatusById(statusId || 'inbox')
  return status ? `${status.icon} ${status.name}` : '📥 Inbox'
}

function parseTopicTags(text) {
  return text
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function addAuthor() {
  authors.value.push({ firstName: '', initial: '', lastName: '' })
}

function removeAuthor(index) {
  authors.value.splice(index, 1)

  if (authors.value.length === 0) {
    addAuthor()
  }
}

function addEditor() {
  editors.value.push({ firstName: '', initial: '', lastName: '' })
}

function removeEditor(index) {
  editors.value.splice(index, 1)
}

function cleanPeopleList(people) {
  return people
    .map((person) => ({
      firstName: person.firstName.trim(),
      initial: person.initial.trim(),
      lastName: person.lastName.trim()
    }))
    .filter((person) => person.firstName || person.initial || person.lastName)
}

function buildBookMetadata() {
  return {
    status: newStatus.value,
    coverImageUrl: bookFields.value.coverImageUrl,
    bannerImageUrl: bookFields.value.bannerImageUrl,
    authors: cleanPeopleList(authors.value),
    editors: cleanPeopleList(editors.value),
    shortTitle: bookFields.value.shortTitle,
    publisher: bookFields.value.publisher,
    placeOfPublication: bookFields.value.placeOfPublication,
    year: bookFields.value.year,
    edition: bookFields.value.edition,
    isbn: bookFields.value.isbn,
    pageRange: bookFields.value.pageRange,
    libraryLocation: bookFields.value.libraryLocation
  }
}

async function createItem() {
  if (!newTitle.value.trim()) return
  if (!researchType.value) return

  const finalMetadata =
    typeId.value === 'book'
      ? buildBookMetadata()
      : {
          ...metadata.value,
          status: newStatus.value
        }

  await addResearchItem({
    title: newTitle.value,
    summary: newSummary.value,
    type: typeId.value,
    supertags: researchType.value.defaultSupertags || ['source'],
    topicTags: parseTopicTags(topicTagsInput.value),
    links: [],
    metadata: finalMetadata
  })

  resetForm()
  showCreateForm.value = false
}

function resetForm() {
  newTitle.value = ''
  newSummary.value = ''
  newStatus.value = 'inbox'
  topicTagsInput.value = ''
  metadata.value = {}

  authors.value = [
    { firstName: '', initial: '', lastName: '' }
  ]

  editors.value = []

  bookFields.value = {
    coverImageUrl: '',
    bannerImageUrl: '',
    shortTitle: '',
    publisher: '',
    placeOfPublication: '',
    year: '',
    edition: '',
    isbn: '',
    pageRange: '',
    libraryLocation: ''
  }
}

function formatAuthors(item) {
  const people = item.metadata?.authors || []

  if (!people.length) return 'No author listed'

  return people
    .map((person) => {
      const parts = [
        person.firstName,
        person.initial,
        person.lastName
      ].filter(Boolean)

      return parts.join(' ')
    })
    .join(', ')
}

function getGalleryBannerStyle(item) {
  if (item.metadata?.bannerImageUrl) {
    return {
      backgroundImage: `url(${item.metadata.bannerImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }

  return {}
}

function getItemIcon(item) {
  const type = getResearchTypeById(item.type)
  return type?.icon || '📄'
}

function formatFieldName(field) {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
}
</script>

<style scoped>
.toolbar-card,
.create-card,
.content-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow);
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.toolbar-card h2 {
  margin: 0;
}

.toolbar-card p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.toolbar-actions,
.browse-toolbar,
.create-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.browse-toolbar {
  margin-bottom: 0.75rem;
}

.search-input,
.sort-select,
.form-group select {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font: inherit;
}

.search-input {
  flex: 1;
}

.back-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.85rem;
}

.new-source-btn,
.create-btn,
.secondary-btn {
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.new-source-btn,
.create-btn {
  background: var(--accent);
  color: white;
  border: none;
}

.secondary-btn {
  background: var(--btn-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.create-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.create-header h2,
.source-details h3 {
  margin: 0;
}

.source-details {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-top: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
}

.form-group,
.people-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label,
.people-section label {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea,
.person-row input {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.7rem;
  color: var(--text-primary);
  font: inherit;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.person-row {
  display: grid;
  grid-template-columns: 1fr 90px 1fr 36px;
  gap: 0.5rem;
  align-items: center;
}

.small-btn,
.remove-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
}

.small-btn {
  align-self: flex-start;
  padding: 0.45rem 0.7rem;
}

.remove-btn {
  height: 38px;
}

.board-view {
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.board-column {
  min-width: 220px;
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem;
  transition: 0.2s ease;
}

.board-column.drop-target {
  border-color: var(--accent);
}

.board-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.board-cards {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-height: 80px;
}

.board-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem;
  color: inherit;
  text-decoration: none;
  cursor: grab;
}

.board-card:hover {
  border-color: var(--accent);
}

.board-card:active {
  cursor: grabbing;
}

.board-card-title {
  font-weight: 700;
  font-size: 0.9rem;
}

.board-card-meta {
  color: var(--text-muted);
  font-size: 0.76rem;
  margin-top: 0.25rem;
}

.empty {
  color: var(--text-muted);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 260px));
  gap: 1rem;
  align-items: start;
}

.gallery-link {
  text-decoration: none;
  color: inherit;
}

.gallery-card {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  transition: 0.2s ease;
  max-width: 260px;
}

.gallery-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.gallery-banner {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.12),
    rgba(168, 85, 247, 0.12)
  );
}

.book-cover {
  width: 58px;
  height: 84px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
}

.gallery-body {
  padding: 0.85rem;
}

.gallery-title {
  font-weight: 700;
  font-size: 0.95rem;
}

.gallery-meta {
  color: var(--text-muted);
  font-size: 0.76rem;
  margin-top: 0.25rem;
}

.gallery-summary {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.35rem;
  line-height: 1.4;
}

.list-view {
  display: flex;
  flex-direction: column;
}

.list-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
}

.list-summary {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.table-wrapper {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  border-bottom: 1px solid var(--border-color);
  padding: 0.8rem;
  text-align: left;
}

.items-table a {
  color: inherit;
  text-decoration: none;
}

.placeholder-view {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

.topic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.topic-tag {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72rem;
}
</style>