<template>
  <AppLayout
    title="Concepts"
    :subtitle="`${conceptCount} active concept${conceptCount === 1 ? '' : 's'}`"
    banner-key="concepts"
    default-icon="🧠"
  >
    <template #actions>
      <button
        class="primary-button"
        type="button"
        @click="openCreateModal"
      >
        + New Concept
      </button>
    </template>

    <main class="concepts-page">
      <section class="summary-grid">
        <article class="summary-card">
          <span class="summary-icon">🧠</span>

          <div>
            <p>Active Concepts</p>
            <strong>{{ conceptCount }}</strong>
            <small>Available in your knowledge system</small>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">📌</span>

          <div>
            <p>Pinned</p>
            <strong>{{ pinnedConcepts.length }}</strong>
            <small>Priority ideas and themes</small>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">🔗</span>

          <div>
            <p>Relationships</p>
            <strong>{{ relationshipCount }}</strong>
            <small>Connections between concepts</small>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">🗄️</span>

          <div>
            <p>Archived</p>
            <strong>{{ archivedCount }}</strong>
            <small>Stored outside the active database</small>
          </div>
        </article>
      </section>

      <section class="database-card">
        <div class="database-toolbar">
          <div class="view-tabs">
            <button
              v-for="tab in viewTabs"
              :key="tab.value"
              class="view-tab"
              :class="{ active: activeView === tab.value }"
              type="button"
              @click="activeView = tab.value"
            >
              {{ tab.label }}

              <span>
                {{ getViewCount(tab.value) }}
              </span>
            </button>
          </div>

          <div class="filter-grid">
            <label class="search-field">
              <span>Search</span>

              <input
                v-model.trim="searchQuery"
                type="search"
                placeholder="Search concepts, aliases, tags, or definitions"
              />
            </label>

            <label>
              <span>Category</span>

              <select v-model="categoryFilter">
                <option value="all">
                  All categories
                </option>

                <option
                  v-for="category in availableCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </label>

            <label>
              <span>Status</span>

              <select v-model="statusFilter">
                <option value="all">
                  All statuses
                </option>

                <option
                  v-for="status in conceptStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </label>

            <label>
              <span>Sort</span>

              <select v-model="sortOrder">
                <option value="name">
                  Name A–Z
                </option>

                <option value="newest">
                  Newest first
                </option>

                <option value="updated">
                  Recently updated
                </option>

                <option value="connections">
                  Most connected
                </option>
              </select>
            </label>
          </div>
        </div>

        <div class="results-heading">
          <div>
            <p class="eyebrow">
              {{ activeViewLabel }}
            </p>

            <h2>
              {{ filteredConcepts.length }}
              concept{{ filteredConcepts.length === 1 ? '' : 's' }}
            </h2>
          </div>

          <button
            v-if="hasFilters"
            class="text-button"
            type="button"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>

        <div
          v-if="filteredConcepts.length"
          class="concept-grid"
        >
          <article
            v-for="concept in filteredConcepts"
            :key="concept.id"
            class="concept-card"
            :class="{
              pinned: concept.pinned,
              archived: concept.archived,
            }"
          >
            <header class="concept-card-header">
              <div class="concept-badges">
                <span class="category-badge">
                  {{ concept.category }}
                </span>

                <span
                  class="status-badge"
                  :class="`status-${concept.status}`"
                >
                  {{ getStatusLabel(concept.status) }}
                </span>

                <span
                  v-if="concept.pinned"
                  class="pinned-badge"
                >
                  📌 Pinned
                </span>
              </div>

              <button
                class="pin-button"
                :class="{ active: concept.pinned }"
                type="button"
                :title="concept.pinned ? 'Unpin concept' : 'Pin concept'"
                @click="handleTogglePin(concept)"
              >
                📌
              </button>
            </header>

            <button
              class="concept-main"
              type="button"
              @click="openConcept(concept)"
            >
              <h3>{{ concept.name }}</h3>

              <p>
                {{
                  concept.definition ||
                  'No definition has been added yet.'
                }}
              </p>
            </button>

            <div
              v-if="concept.aliases.length"
              class="alias-row"
            >
              <span class="detail-label">
                Also known as
              </span>

              <span>
                {{ concept.aliases.join(', ') }}
              </span>
            </div>

            <div
              v-if="concept.tags.length"
              class="tag-row"
            >
              <span
                v-for="tag in concept.tags"
                :key="tag"
                class="tag-badge"
              >
                #{{ tag }}
              </span>
            </div>

            <div class="connection-row">
              <span>
                🔗
                {{ concept.relatedConceptIds.length }}
                related
              </span>

              <span>
                📚
                {{ concept.linkedSourceIds.length }}
                sources
              </span>

              <span>
                ✍️
                {{ concept.linkedWritingProjectIds.length }}
                writing
              </span>
            </div>

            <footer class="concept-footer">
              <span>
                Updated {{ formatDate(concept.updatedAt) }}
              </span>

              <div class="concept-actions">
                <button
                  class="small-button"
                  type="button"
                  @click="openEditModal(concept)"
                >
                  Edit
                </button>

                <button
                  class="small-button"
                  type="button"
                  @click="openConcept(concept)"
                >
                  Open
                </button>

                <button
                  v-if="!concept.archived"
                  class="small-button"
                  type="button"
                  @click="handleArchive(concept)"
                >
                  Archive
                </button>

                <button
                  v-else
                  class="small-button"
                  type="button"
                  @click="handleRestore(concept)"
                >
                  Restore
                </button>

                <button
                  class="small-button delete-button"
                  type="button"
                  @click="confirmDelete(concept)"
                >
                  Delete
                </button>
              </div>
            </footer>
          </article>
        </div>

        <div
          v-else
          class="empty-state"
        >
          <span>{{ emptyStateIcon }}</span>
          <h3>{{ emptyStateTitle }}</h3>
          <p>{{ emptyStateMessage }}</p>

          <button
            v-if="activeView === 'active' && !hasFilters"
            class="primary-button"
            type="button"
            @click="openCreateModal"
          >
            Create First Concept
          </button>

          <button
            v-else-if="hasFilters"
            class="secondary-button"
            type="button"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </div>
      </section>
    </main>

    <div
      v-if="conceptModalOpen"
      class="modal-backdrop"
      @click.self="closeConceptModal"
    >
      <form
        class="concept-modal"
        @submit.prevent="saveConcept"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              Concepts Database
            </p>

            <h2>
              {{
                editingConceptId
                  ? 'Edit Concept'
                  : 'Create Concept'
              }}
            </h2>

            <p>
              Define the idea and prepare it for linking across
              Scholarory.
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close concept editor"
            @click="closeConceptModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label class="full-field">
            Concept name

            <input
              v-model.trim="conceptForm.name"
              type="text"
              required
              placeholder="Example: Communal spiritual formation"
            />
          </label>

          <label class="full-field">
            Definition

            <textarea
              v-model.trim="conceptForm.definition"
              rows="5"
              placeholder="Explain the concept in your own words."
            ></textarea>
          </label>

          <div class="form-grid">
            <label>
              Category

              <select v-model="conceptForm.category">
                <option
                  v-for="category in conceptCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </label>

            <label>
              Status

              <select v-model="conceptForm.status">
                <option
                  v-for="status in conceptStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-grid">
            <label>
              Aliases

              <input
                v-model="conceptForm.aliases"
                type="text"
                placeholder="Alternate name, abbreviation"
              />
            </label>

            <label>
              Tags

              <input
                v-model="conceptForm.tags"
                type="text"
                placeholder="formation, community, ministry"
              />
            </label>
          </div>

          <label class="full-field">
            Notes

            <textarea
              v-model="conceptForm.notes"
              rows="6"
              placeholder="Add observations, questions, quotations, implications, or research directions."
            ></textarea>
          </label>

          <label class="pin-toggle">
            <input
              v-model="conceptForm.pinned"
              type="checkbox"
            />

            <span>
              <strong>Pin this concept</strong>
              <small>
                Keep it near the top of the active database.
              </small>
            </span>
          </label>

          <p
            v-if="formError"
            class="form-error"
          >
            {{ formError }}
          </p>
        </div>

        <div class="modal-actions">
          <button
            v-if="editingConceptId"
            class="delete-modal-button"
            type="button"
            @click="deleteEditingConcept"
          >
            Delete Concept
          </button>

          <div class="modal-actions-right">
            <button
              class="secondary-button"
              type="button"
              @click="closeConceptModal"
            >
              Cancel
            </button>

            <button
              class="primary-button"
              type="submit"
            >
              {{
                editingConceptId
                  ? 'Save Changes'
                  : 'Create Concept'
              }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div
      v-if="toastMessage"
      class="save-toast"
    >
      {{ toastMessage }}
    </div>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useConcepts } from '@/composables/useConcepts'

const router = useRouter()

const conceptCategories = [
  'General',
  'Theology',
  'Biblical Studies',
  'Spiritual Formation',
  'Ministry',
  'Leadership',
  'Research Methodology',
  'Writing',
  'Education',
  'History',
  'Philosophy',
  'Personal Knowledge',
  'Other',
]

const conceptStatuses = [
  {
    value: 'developing',
    label: 'Developing',
  },
  {
    value: 'established',
    label: 'Established',
  },
  {
    value: 'question',
    label: 'Open Question',
  },
  {
    value: 'contested',
    label: 'Contested',
  },
]

const viewTabs = [
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'pinned',
    label: 'Pinned',
  },
  {
    value: 'archived',
    label: 'Archived',
  },
  {
    value: 'all',
    label: 'All',
  },
]

const {
  concepts,
  activeConcepts,
  archivedConcepts,
  pinnedConcepts,
  conceptCount,
  archivedCount,

  addConcept,
  updateConcept,
  deleteConcept,
  archiveConcept,
  restoreConcept,
  toggleConceptPin,
} = useConcepts()

const activeView = ref('active')
const searchQuery = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const sortOrder = ref('name')

const conceptModalOpen = ref(false)
const editingConceptId = ref('')
const formError = ref('')
const toastMessage = ref('')

let toastTimer = null

const conceptForm = reactive(
  createBlankConceptForm(),
)

const relationshipCount = computed(() => {
  const totalConnections =
    concepts.value.reduce(
      (total, concept) => {
        return (
          total +
          concept.relatedConceptIds.length
        )
      },
      0,
    )

  return Math.floor(totalConnections / 2)
})

const availableCategories = computed(() => {
  return [
    ...new Set(
      concepts.value
        .map((concept) => concept.category)
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    a.localeCompare(b),
  )
})

const sourceConcepts = computed(() => {
  if (activeView.value === 'pinned') {
    return pinnedConcepts.value
  }

  if (activeView.value === 'archived') {
    return archivedConcepts.value
  }

  if (activeView.value === 'all') {
    return concepts.value
  }

  return activeConcepts.value
})

const filteredConcepts = computed(() => {
  const query =
    searchQuery.value
      .trim()
      .toLowerCase()

  const result =
    sourceConcepts.value.filter(
      (concept) => {
        if (
          categoryFilter.value !== 'all' &&
          concept.category !==
            categoryFilter.value
        ) {
          return false
        }

        if (
          statusFilter.value !== 'all' &&
          concept.status !==
            statusFilter.value
        ) {
          return false
        }

        if (!query) {
          return true
        }

        const searchableText = [
          concept.name,
          concept.definition,
          concept.category,
          concept.notes,
          ...concept.aliases,
          ...concept.tags,
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(query)
      },
    )

  return result
    .slice()
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }

      if (sortOrder.value === 'newest') {
        return String(
          b.createdAt,
        ).localeCompare(
          String(a.createdAt),
        )
      }

      if (sortOrder.value === 'updated') {
        return String(
          b.updatedAt,
        ).localeCompare(
          String(a.updatedAt),
        )
      }

      if (
        sortOrder.value === 'connections'
      ) {
        return (
          b.relatedConceptIds.length -
          a.relatedConceptIds.length
        )
      }

      return a.name.localeCompare(
        b.name,
        undefined,
        {
          sensitivity: 'base',
        },
      )
    })
})

const activeViewLabel = computed(() => {
  return (
    viewTabs.find(
      (tab) =>
        tab.value === activeView.value,
    )?.label || 'Active'
  )
})

const hasFilters = computed(() => {
  return Boolean(
    searchQuery.value ||
      categoryFilter.value !== 'all' ||
      statusFilter.value !== 'all' ||
      sortOrder.value !== 'name',
  )
})

const emptyStateIcon = computed(() => {
  if (hasFilters.value) {
    return '🔍'
  }

  if (activeView.value === 'archived') {
    return '🗄️'
  }

  if (activeView.value === 'pinned') {
    return '📌'
  }

  return '🧠'
})

const emptyStateTitle = computed(() => {
  if (hasFilters.value) {
    return 'No matching concepts'
  }

  if (activeView.value === 'archived') {
    return 'No archived concepts'
  }

  if (activeView.value === 'pinned') {
    return 'No pinned concepts'
  }

  return 'Create your first concept'
})

const emptyStateMessage = computed(() => {
  if (hasFilters.value) {
    return 'Try changing your search or filter selections.'
  }

  if (activeView.value === 'archived') {
    return 'Archived concepts will remain available here.'
  }

  if (activeView.value === 'pinned') {
    return 'Pin an important concept to keep it easy to find.'
  }

  return 'Build a reusable database of ideas, themes, doctrines, theories, and research concepts.'
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
})

function createBlankConceptForm() {
  return {
    name: '',
    definition: '',
    category: 'General',
    status: 'developing',
    aliases: '',
    tags: '',
    notes: '',
    pinned: false,
  }
}

function openCreateModal() {
  editingConceptId.value = ''
  formError.value = ''

  Object.assign(
    conceptForm,
    createBlankConceptForm(),
  )

  conceptModalOpen.value = true
}

function openEditModal(concept) {
  editingConceptId.value = concept.id
  formError.value = ''

  Object.assign(conceptForm, {
    name: concept.name,
    definition: concept.definition,
    category: concept.category,
    status: concept.status,
    aliases: concept.aliases.join(', '),
    tags: concept.tags.join(', '),
    notes: concept.notes,
    pinned: concept.pinned,
  })

  conceptModalOpen.value = true
}

function closeConceptModal() {
  conceptModalOpen.value = false
  editingConceptId.value = ''
  formError.value = ''

  Object.assign(
    conceptForm,
    createBlankConceptForm(),
  )
}

function saveConcept() {
  const name =
    conceptForm.name.trim()

  if (!name) {
    formError.value =
      'Please enter a name for the concept.'

    return
  }

  const conceptData = {
    name,
    definition:
      conceptForm.definition.trim(),

    category:
      conceptForm.category || 'General',

    status:
      conceptForm.status || 'developing',

    aliases:
      parseCommaList(
        conceptForm.aliases,
      ),

    tags:
      parseCommaList(
        conceptForm.tags,
      ),

    notes: conceptForm.notes,
    pinned: conceptForm.pinned,
  }

  if (editingConceptId.value) {
    updateConcept(
      editingConceptId.value,
      conceptData,
    )

    showToast('Concept updated.')
  } else {
    addConcept(conceptData)
    showToast('Concept created.')
  }

  closeConceptModal()
}

function openConcept(concept) {
  router.push(
    `/concepts/${encodeURIComponent(
      concept.id,
    )}`,
  )
}

function handleTogglePin(concept) {
  const wasPinned = concept.pinned

  toggleConceptPin(concept.id)

  showToast(
    wasPinned
      ? 'Concept unpinned.'
      : 'Concept pinned.',
  )
}

function handleArchive(concept) {
  archiveConcept(concept.id)
  showToast('Concept archived.')
}

function handleRestore(concept) {
  restoreConcept(concept.id)
  showToast('Concept restored.')
}

function confirmDelete(concept) {
  const confirmed =
    window.confirm(
      `Delete "${concept.name}"? This removes its relationships from other concepts and cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  deleteConcept(concept.id)
  showToast('Concept deleted.')
}

function deleteEditingConcept() {
  const concept =
    concepts.value.find(
      (item) =>
        String(item.id) ===
        String(editingConceptId.value),
    )

  if (!concept) {
    return
  }

  const confirmed =
    window.confirm(
      `Delete "${concept.name}"? This cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  deleteConcept(concept.id)
  closeConceptModal()
  showToast('Concept deleted.')
}

function getViewCount(view) {
  if (view === 'active') {
    return activeConcepts.value.length
  }

  if (view === 'pinned') {
    return pinnedConcepts.value.length
  }

  if (view === 'archived') {
    return archivedConcepts.value.length
  }

  return concepts.value.length
}

function clearFilters() {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  statusFilter.value = 'all'
  sortOrder.value = 'name'
}

function parseCommaList(value) {
  return [
    ...new Set(
      String(value || '')
        .split(/[,\n]/)
        .map((item) =>
          item
            .replace(/^#/, '')
            .trim(),
        )
        .filter(Boolean),
    ),
  ]
}

function getStatusLabel(value) {
  return (
    conceptStatuses.find(
      (status) =>
        status.value === value,
    )?.label || 'Developing'
  )
}

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !==
        new Date().getFullYear()
          ? 'numeric'
          : undefined,
    },
  ).format(date)
}

function showToast(message) {
  window.clearTimeout(toastTimer)

  toastMessage.value = message

  toastTimer =
    window.setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
}
</script>

<style scoped>
.concepts-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-button,
.secondary-button,
.text-button,
.view-tab,
.pin-button,
.concept-main,
.small-button,
.modal-close,
.delete-modal-button {
  font: inherit;
  cursor: pointer;
}

.primary-button,
.secondary-button {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  font-size: 0.76rem;
  font-weight: 800;
}

.primary-button {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: white;
}

.primary-button:hover {
  filter: brightness(1.08);
}

.secondary-button {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-primary);
}

.secondary-button:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.text-button {
  padding: 0.35rem;
  border: none;
  background: transparent;
  color: var(--accent-text);
  font-size: 0.7rem;
  font-weight: 800;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-text);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  flex: 0 0 auto;
  border-radius: 11px;
  background: var(--bg-secondary);
  font-size: 1.15rem;
}

.summary-card div {
  display: grid;
  min-width: 0;
}

.summary-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.58rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.summary-card strong {
  color: var(--text-primary);
  font-size: 1.25rem;
}

.summary-card small {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.61rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.database-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.database-toolbar {
  display: grid;
  gap: 0.8rem;
}

.view-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  font-size: 0.67rem;
  font-weight: 800;
}

.view-tab span {
  min-width: 20px;
  padding: 0.15rem 0.3rem;
  border-radius: 999px;
  background: var(--bg-secondary);
  text-align: center;
  font-size: 0.56rem;
}

.view-tab.active,
.view-tab:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-text);
}

.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(260px, 1.5fr)
    repeat(3, minmax(140px, 0.5fr));
  gap: 0.6rem;
}

.filter-grid label,
.modal-form label {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 0.67rem;
  font-weight: 800;
}

.filter-grid input,
.filter-grid select,
.modal-form input,
.modal-form select,
.modal-form textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.75rem;
}

.filter-grid input:focus,
.filter-grid select:focus,
.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color);
}

.results-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.concept-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.concept-card {
  display: grid;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid var(--border-color);
  border-left: 5px solid var(--border-color);
  border-radius: 13px;
  background: var(--bg-secondary);
}

.concept-card.pinned {
  border-left-color: var(--accent);
}

.concept-card.archived {
  opacity: 0.65;
}

.concept-card-header,
.concept-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.concept-badges,
.tag-row,
.connection-row,
.concept-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.category-badge,
.status-badge,
.pinned-badge,
.tag-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.55rem;
  font-weight: 850;
}

.category-badge {
  background: #edf3fb;
  color: #416e9b;
}

.status-badge {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-muted);
}

.status-established {
  background: #e9f6ef;
  color: #347154;
}

.status-question {
  background: #fff5dc;
  color: #926614;
}

.status-contested {
  background: #f9eceb;
  color: #a04c46;
}

.pinned-badge {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.tag-badge {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
}

.pin-button {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  flex: 0 0 auto;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  opacity: 0.55;
}

.pin-button.active,
.pin-button:hover {
  border-color: var(--accent);
  opacity: 1;
}

.concept-main {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.concept-main h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.92rem;
}

.concept-main p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1.5;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.alias-row {
  display: grid;
  gap: 0.15rem;
  color: var(--text-secondary);
  font-size: 0.65rem;
}

.detail-label {
  color: var(--text-muted);
  font-size: 0.55rem;
  font-weight: 850;
  text-transform: uppercase;
}

.connection-row {
  padding: 0.6rem;
  border-radius: 9px;
  background: var(--bg-card);
}

.connection-row span {
  color: var(--text-muted);
  font-size: 0.59rem;
  font-weight: 750;
}

.concept-footer {
  align-items: flex-end;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
}

.concept-footer > span {
  color: var(--text-muted);
  font-size: 0.57rem;
}

.small-button {
  min-height: 30px;
  padding: 0.36rem 0.52rem;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.61rem;
  font-weight: 800;
}

.small-button:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.delete-button {
  color: #b4443e;
}

.empty-state {
  display: grid;
  justify-items: center;
  min-height: 330px;
  align-content: center;
  padding: 1.5rem;
  text-align: center;
}

.empty-state > span {
  font-size: 2.4rem;
}

.empty-state h3 {
  margin: 0.65rem 0 0;
  color: var(--text-primary);
}

.empty-state p {
  max-width: 510px;
  margin: 0.35rem 0 1rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  line-height: 1.5;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.65);
}

.concept-modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.15rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow:
    0 24px 70px
    rgba(15, 23, 42, 0.3);
}

.modal-heading,
.modal-actions,
.modal-actions-right {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.modal-heading {
  align-items: flex-start;
}

.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-heading p:not(.eyebrow) {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  font-size: 0.74rem;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 1.15rem;
}

.modal-form {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.modal-form textarea {
  resize: vertical;
  line-height: 1.5;
}

.pin-toggle {
  display: flex !important;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
  cursor: pointer;
}

.pin-toggle input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.pin-toggle span {
  display: grid;
}

.pin-toggle strong {
  color: var(--text-primary);
  font-size: 0.72rem;
}

.pin-toggle small {
  color: var(--text-muted);
  font-size: 0.61rem;
}

.form-error {
  margin: 0;
  padding: 0.7rem;
  border: 1px solid #efc2bf;
  border-radius: 9px;
  background: #fff1f0;
  color: #aa3e38;
  font-size: 0.7rem;
  font-weight: 750;
}

.modal-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.modal-actions-right {
  margin-left: auto;
}

.delete-modal-button {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid #c9453f;
  border-radius: 9px;
  background: #c9453f;
  color: white;
  font-size: 0.74rem;
  font-weight: 800;
}

.save-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 140;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 0.76rem;
  font-weight: 800;
  box-shadow:
    0 18px 34px
    rgba(15, 23, 42, 0.28);
}

@media (max-width: 1050px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .concept-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .summary-grid,
  .filter-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .results-heading,
  .concept-footer,
  .modal-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .concept-actions {
    justify-content: flex-start;
  }

  .modal-actions-right {
    width: 100%;
    margin-left: 0;
  }

  .modal-actions-right button {
    flex: 1;
  }
}
</style>