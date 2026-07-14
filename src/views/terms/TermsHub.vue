<template>
  <AppLayout
    title="Terms Database"
    :subtitle="`${termCount} active term${termCount === 1 ? '' : 's'}`"
    banner-key="terms"
    default-icon="📖"
  >
    <template #actions>
      <button
        class="primary-button"
        type="button"
        @click="openCreateModal"
      >
        + New Term
      </button>
    </template>

    <main class="terms-page">
      <section class="summary-grid">
        <article class="summary-card">
          <span class="summary-icon">📖</span>

          <div>
            <p>Active Terms</p>
            <strong>{{ termCount }}</strong>
            <small>Available in your glossary</small>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">📌</span>

          <div>
            <p>Pinned</p>
            <strong>{{ pinnedTerms.length }}</strong>
            <small>Priority vocabulary</small>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">🔗</span>

          <div>
            <p>Relationships</p>
            <strong>{{ relationshipCount }}</strong>
            <small>Connections between terms</small>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">🗄️</span>

          <div>
            <p>Archived</p>
            <strong>{{ archivedCount }}</strong>
            <small>Stored outside the active glossary</small>
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
                placeholder="Search terms, definitions, aliases, or tags"
              />
            </label>

            <label>
              <span>Discipline</span>

              <select v-model="disciplineFilter">
                <option value="all">
                  All disciplines
                </option>

                <option
                  v-for="discipline in availableDisciplines"
                  :key="discipline"
                  :value="discipline"
                >
                  {{ discipline }}
                </option>
              </select>
            </label>

            <label>
              <span>Part of speech</span>

              <select v-model="partOfSpeechFilter">
                <option value="all">
                  All types
                </option>

                <option
                  v-for="item in availablePartsOfSpeech"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
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
                  v-for="status in termStatuses"
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
                <option value="alphabetical">
                  Alphabetical
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
              {{ filteredTerms.length }}
              term{{ filteredTerms.length === 1 ? '' : 's' }}
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
          v-if="filteredTerms.length"
          class="term-grid"
        >
          <article
            v-for="item in filteredTerms"
            :key="item.id"
            class="term-card"
            :class="{
              pinned: item.pinned,
              archived: item.archived,
            }"
          >
            <header class="term-card-header">
              <div class="term-badges">
                <span class="discipline-badge">
                  {{ item.discipline }}
                </span>

                <span
                  class="status-badge"
                  :class="`status-${item.status}`"
                >
                  {{ getStatusLabel(item.status) }}
                </span>

                <span class="speech-badge">
                  {{ item.partOfSpeech }}
                </span>

                <span
                  v-if="item.pinned"
                  class="pinned-badge"
                >
                  📌 Pinned
                </span>
              </div>

              <button
                class="pin-button"
                :class="{ active: item.pinned }"
                type="button"
                :title="item.pinned ? 'Unpin term' : 'Pin term'"
                @click="handleTogglePin(item)"
              >
                📌
              </button>
            </header>

            <button
              class="term-main"
              type="button"
              @click="openTerm(item)"
            >
              <div class="term-title-row">
                <h3>{{ item.term }}</h3>

                <span
                  v-if="item.pronunciation"
                  class="pronunciation"
                >
                  {{ item.pronunciation }}
                </span>
              </div>

              <div
                v-if="
                  item.originalSpelling ||
                  item.transliteration
                "
                class="language-line"
              >
                <span v-if="item.originalSpelling">
                  {{ item.originalSpelling }}
                </span>

                <span v-if="item.transliteration">
                  {{ item.transliteration }}
                </span>

                <span v-if="item.originalLanguage">
                  {{ item.originalLanguage }}
                </span>
              </div>

              <p>
                {{
                  item.definition ||
                  'No definition has been added yet.'
                }}
              </p>
            </button>

            <div
              v-if="item.aliases.length"
              class="alias-row"
            >
              <span class="detail-label">
                Also known as
              </span>

              <span>
                {{ item.aliases.join(', ') }}
              </span>
            </div>

            <div
              v-if="item.tags.length"
              class="tag-row"
            >
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="tag-badge"
              >
                #{{ tag }}
              </span>
            </div>

            <div class="connection-row">
              <span>
                🔗
                {{ item.relatedTermIds.length }}
                related
              </span>

              <span>
                💡
                {{ item.linkedConceptIds.length }}
                concepts
              </span>

              <span>
                📚
                {{ item.linkedSourceIds.length }}
                sources
              </span>

              <span>
                💬
                {{ item.examples.length }}
                examples
              </span>
            </div>

            <footer class="term-footer">
              <span>
                Updated {{ formatDate(item.updatedAt) }}
              </span>

              <div class="term-actions">
                <button
                  class="small-button"
                  type="button"
                  @click="openEditModal(item)"
                >
                  Edit
                </button>

                <button
                  class="small-button"
                  type="button"
                  @click="openTerm(item)"
                >
                  Open
                </button>

                <button
                  v-if="!item.archived"
                  class="small-button"
                  type="button"
                  @click="handleArchive(item)"
                >
                  Archive
                </button>

                <button
                  v-else
                  class="small-button"
                  type="button"
                  @click="handleRestore(item)"
                >
                  Restore
                </button>

                <button
                  class="small-button delete-button"
                  type="button"
                  @click="confirmDelete(item)"
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
            Create First Term
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
      v-if="termModalOpen"
      class="modal-backdrop"
      @click.self="closeTermModal"
    >
      <form
        class="term-modal"
        @submit.prevent="saveTerm"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              Terms Database
            </p>

            <h2>
              {{
                editingTermId
                  ? 'Edit Term'
                  : 'Create Term'
              }}
            </h2>

            <p>
              Add a word, phrase, doctrine, technical term, or
              original-language vocabulary item.
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close term editor"
            @click="closeTermModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label class="full-field">
            Term

            <input
              v-model.trim="termForm.term"
              type="text"
              required
              placeholder="Example: Sanctification"
            />
          </label>

          <label class="full-field">
            Brief definition

            <textarea
              v-model.trim="termForm.definition"
              rows="4"
              placeholder="Provide a concise glossary definition."
            ></textarea>
          </label>

          <label class="full-field">
            Extended definition

            <textarea
              v-model="termForm.extendedDefinition"
              rows="6"
              placeholder="Add historical, theological, academic, or contextual detail."
            ></textarea>
          </label>

          <div class="form-grid three-columns">
            <label>
              Discipline

              <select v-model="termForm.discipline">
                <option
                  v-for="discipline in termDisciplines"
                  :key="discipline"
                  :value="discipline"
                >
                  {{ discipline }}
                </option>
              </select>
            </label>

            <label>
              Part of speech

              <select v-model="termForm.partOfSpeech">
                <option
                  v-for="item in partsOfSpeech"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </option>
              </select>
            </label>

            <label>
              Status

              <select v-model="termForm.status">
                <option
                  v-for="status in termStatuses"
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
              Pronunciation

              <input
                v-model.trim="termForm.pronunciation"
                type="text"
                placeholder="san(k)-tə-fə-ˈkā-shən"
              />
            </label>

            <label>
              Original language

              <select v-model="termForm.originalLanguage">
                <option value="">
                  Not specified
                </option>

                <option
                  v-for="language in originalLanguages"
                  :key="language"
                  :value="language"
                >
                  {{ language }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-grid">
            <label>
              Original spelling

              <input
                v-model.trim="termForm.originalSpelling"
                type="text"
                placeholder="Greek, Hebrew, Latin, or other script"
              />
            </label>

            <label>
              Transliteration

              <input
                v-model.trim="termForm.transliteration"
                type="text"
                placeholder="Latin-alphabet transliteration"
              />
            </label>
          </div>

          <div class="form-grid">
            <label>
              Aliases

              <input
                v-model="termForm.aliases"
                type="text"
                placeholder="Alternate term, abbreviation"
              />
            </label>

            <label>
              Tags

              <input
                v-model="termForm.tags"
                type="text"
                placeholder="theology, formation, doctrine"
              />
            </label>
          </div>

          <label class="full-field">
            Examples

            <textarea
              v-model="termForm.examples"
              rows="5"
              placeholder="Enter one example per line."
            ></textarea>
          </label>

          <label class="full-field">
            Notes

            <textarea
              v-model="termForm.notes"
              rows="6"
              placeholder="Add observations, quotations, usage notes, questions, or research directions."
            ></textarea>
          </label>

          <label class="pin-toggle">
            <input
              v-model="termForm.pinned"
              type="checkbox"
            />

            <span>
              <strong>Pin this term</strong>

              <small>
                Keep it near the top of the active glossary.
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
            v-if="editingTermId"
            class="delete-modal-button"
            type="button"
            @click="deleteEditingTerm"
          >
            Delete Term
          </button>

          <div class="modal-actions-right">
            <button
              class="secondary-button"
              type="button"
              @click="closeTermModal"
            >
              Cancel
            </button>

            <button
              class="primary-button"
              type="submit"
            >
              {{
                editingTermId
                  ? 'Save Changes'
                  : 'Create Term'
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
import { useTerms } from '@/composables/useTerms'

const router = useRouter()

const termDisciplines = [
  'General',
  'Theology',
  'Biblical Studies',
  'Spiritual Formation',
  'Church History',
  'Ministry',
  'Leadership',
  'Research Methodology',
  'Writing',
  'Education',
  'Philosophy',
  'Psychology',
  'Sociology',
  'Original Languages',
  'Other',
]

const partsOfSpeech = [
  'Noun',
  'Verb',
  'Adjective',
  'Adverb',
  'Phrase',
  'Proper Noun',
  'Abbreviation',
  'Technical Term',
  'Doctrine',
  'Conceptual Term',
  'Other',
]

const originalLanguages = [
  'Greek',
  'Hebrew',
  'Aramaic',
  'Latin',
  'German',
  'French',
  'Spanish',
  'English',
  'Other',
]

const termStatuses = [
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
    label: 'Needs Review',
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
  terms,
  activeTerms,
  archivedTerms,
  pinnedTerms,
  termCount,
  archivedCount,
  addTerm,
  updateTerm,
  deleteTerm,
  archiveTerm,
  restoreTerm,
  toggleTermPin,
} = useTerms()

const activeView = ref('active')
const searchQuery = ref('')
const disciplineFilter = ref('all')
const partOfSpeechFilter = ref('all')
const statusFilter = ref('all')
const sortOrder = ref('alphabetical')

const termModalOpen = ref(false)
const editingTermId = ref('')
const formError = ref('')
const toastMessage = ref('')

let toastTimer = null

const termForm = reactive(
  createBlankTermForm(),
)

const relationshipCount = computed(() => {
  const totalConnections =
    terms.value.reduce(
      (total, item) => {
        return (
          total +
          item.relatedTermIds.length
        )
      },
      0,
    )

  return Math.floor(
    totalConnections / 2,
  )
})

const availableDisciplines = computed(() => {
  return [
    ...new Set(
      terms.value
        .map((item) => item.discipline)
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    a.localeCompare(b),
  )
})

const availablePartsOfSpeech = computed(() => {
  return [
    ...new Set(
      terms.value
        .map((item) => item.partOfSpeech)
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    a.localeCompare(b),
  )
})

const sourceTerms = computed(() => {
  if (activeView.value === 'pinned') {
    return pinnedTerms.value
  }

  if (activeView.value === 'archived') {
    return archivedTerms.value
  }

  if (activeView.value === 'all') {
    return terms.value
  }

  return activeTerms.value
})

const filteredTerms = computed(() => {
  const query =
    searchQuery.value
      .trim()
      .toLowerCase()

  const result =
    sourceTerms.value.filter(
      (item) => {
        if (
          disciplineFilter.value !== 'all' &&
          item.discipline !==
            disciplineFilter.value
        ) {
          return false
        }

        if (
          partOfSpeechFilter.value !== 'all' &&
          item.partOfSpeech !==
            partOfSpeechFilter.value
        ) {
          return false
        }

        if (
          statusFilter.value !== 'all' &&
          item.status !==
            statusFilter.value
        ) {
          return false
        }

        if (!query) {
          return true
        }

        const searchableText = [
          item.term,
          item.definition,
          item.extendedDefinition,
          item.pronunciation,
          item.originalLanguage,
          item.originalSpelling,
          item.transliteration,
          item.partOfSpeech,
          item.discipline,
          item.notes,
          ...item.aliases,
          ...item.tags,
          ...item.examples,
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(
          query,
        )
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
        sortOrder.value ===
        'connections'
      ) {
        return (
          b.relatedTermIds.length -
          a.relatedTermIds.length
        )
      }

      return a.term.localeCompare(
        b.term,
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
      disciplineFilter.value !== 'all' ||
      partOfSpeechFilter.value !== 'all' ||
      statusFilter.value !== 'all' ||
      sortOrder.value !== 'alphabetical',
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

  return '📖'
})

const emptyStateTitle = computed(() => {
  if (hasFilters.value) {
    return 'No matching terms'
  }

  if (activeView.value === 'archived') {
    return 'No archived terms'
  }

  if (activeView.value === 'pinned') {
    return 'No pinned terms'
  }

  return 'Create your first term'
})

const emptyStateMessage = computed(() => {
  if (hasFilters.value) {
    return 'Try changing your search or filter selections.'
  }

  if (activeView.value === 'archived') {
    return 'Archived terms will remain available here.'
  }

  if (activeView.value === 'pinned') {
    return 'Pin important vocabulary to keep it easy to find.'
  }

  return 'Build a searchable glossary of academic, theological, technical, and original-language terms.'
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
})

function createBlankTermForm() {
  return {
    term: '',
    definition: '',
    extendedDefinition: '',
    pronunciation: '',
    originalLanguage: '',
    originalSpelling: '',
    transliteration: '',
    partOfSpeech: 'Other',
    discipline: 'General',
    status: 'developing',
    aliases: '',
    tags: '',
    examples: '',
    notes: '',
    pinned: false,
  }
}

function openCreateModal() {
  editingTermId.value = ''
  formError.value = ''

  Object.assign(
    termForm,
    createBlankTermForm(),
  )

  termModalOpen.value = true
}

function openEditModal(item) {
  editingTermId.value = item.id
  formError.value = ''

  Object.assign(termForm, {
    term: item.term,
    definition: item.definition,
    extendedDefinition:
      item.extendedDefinition,
    pronunciation: item.pronunciation,
    originalLanguage:
      item.originalLanguage,
    originalSpelling:
      item.originalSpelling,
    transliteration:
      item.transliteration,
    partOfSpeech: item.partOfSpeech,
    discipline: item.discipline,
    status: item.status,
    aliases: item.aliases.join(', '),
    tags: item.tags.join(', '),
    examples: item.examples.join('\n'),
    notes: item.notes,
    pinned: item.pinned,
  })

  termModalOpen.value = true
}

function closeTermModal() {
  termModalOpen.value = false
  editingTermId.value = ''
  formError.value = ''

  Object.assign(
    termForm,
    createBlankTermForm(),
  )
}

function saveTerm() {
  const termName =
    termForm.term.trim()

  if (!termName) {
    formError.value =
      'Please enter a name for the term.'

    return
  }

  const termData = {
    term: termName,

    definition:
      termForm.definition.trim(),

    extendedDefinition:
      termForm.extendedDefinition,

    pronunciation:
      termForm.pronunciation.trim(),

    originalLanguage:
      termForm.originalLanguage,

    originalSpelling:
      termForm.originalSpelling.trim(),

    transliteration:
      termForm.transliteration.trim(),

    partOfSpeech:
      termForm.partOfSpeech || 'Other',

    discipline:
      termForm.discipline || 'General',

    status:
      termForm.status || 'developing',

    aliases:
      parseCommaList(
        termForm.aliases,
      ),

    tags:
      parseCommaList(
        termForm.tags,
      ),

    examples:
      parseLineList(
        termForm.examples,
      ),

    notes: termForm.notes,
    pinned: termForm.pinned,
  }

  if (editingTermId.value) {
    updateTerm(
      editingTermId.value,
      termData,
    )

    showToast('Term updated.')
  } else {
    addTerm(termData)
    showToast('Term created.')
  }

  closeTermModal()
}

function openTerm(item) {
  router.push(
    `/terms/${encodeURIComponent(
      item.id,
    )}`,
  )
}

function handleTogglePin(item) {
  const wasPinned = item.pinned

  toggleTermPin(item.id)

  showToast(
    wasPinned
      ? 'Term unpinned.'
      : 'Term pinned.',
  )
}

function handleArchive(item) {
  archiveTerm(item.id)
  showToast('Term archived.')
}

function handleRestore(item) {
  restoreTerm(item.id)
  showToast('Term restored.')
}

function confirmDelete(item) {
  const confirmed =
    window.confirm(
      `Delete "${item.term}"? This removes its relationships from other terms and cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  deleteTerm(item.id)
  showToast('Term deleted.')
}

function deleteEditingTerm() {
  const item =
    terms.value.find(
      (termItem) =>
        String(termItem.id) ===
        String(editingTermId.value),
    )

  if (!item) {
    return
  }

  const confirmed =
    window.confirm(
      `Delete "${item.term}"? This cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  deleteTerm(item.id)
  closeTermModal()
  showToast('Term deleted.')
}

function getViewCount(view) {
  if (view === 'active') {
    return activeTerms.value.length
  }

  if (view === 'pinned') {
    return pinnedTerms.value.length
  }

  if (view === 'archived') {
    return archivedTerms.value.length
  }

  return terms.value.length
}

function clearFilters() {
  searchQuery.value = ''
  disciplineFilter.value = 'all'
  partOfSpeechFilter.value = 'all'
  statusFilter.value = 'all'
  sortOrder.value = 'alphabetical'
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

function parseLineList(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getStatusLabel(value) {
  return (
    termStatuses.find(
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
.terms-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-button,
.secondary-button,
.text-button,
.view-tab,
.pin-button,
.term-main,
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
    minmax(250px, 1.5fr)
    repeat(4, minmax(125px, 0.5fr));
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
  box-shadow:
    0 0 0 3px var(--accent-soft);
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

.term-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.term-card {
  display: grid;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid var(--border-color);
  border-left: 5px solid var(--border-color);
  border-radius: 13px;
  background: var(--bg-secondary);
}

.term-card.pinned {
  border-left-color: var(--accent);
}

.term-card.archived {
  opacity: 0.65;
}

.term-card-header,
.term-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.term-badges,
.tag-row,
.connection-row,
.term-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.discipline-badge,
.status-badge,
.speech-badge,
.pinned-badge,
.tag-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.55rem;
  font-weight: 850;
}

.discipline-badge {
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

.speech-badge {
  background: #f0edf8;
  color: #715591;
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

.term-main {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.term-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.term-main h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.96rem;
}

.pronunciation {
  color: var(--text-muted);
  font-size: 0.66rem;
  font-style: italic;
}

.language-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  color: var(--accent-text);
  font-size: 0.67rem;
  font-weight: 750;
}

.language-line span + span::before {
  margin-right: 0.4rem;
  color: var(--text-muted);
  content: '·';
}

.term-main p {
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

.term-footer {
  align-items: flex-end;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
}

.term-footer > span {
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

.term-modal {
  width: min(780px, 100%);
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

.form-grid.three-columns {
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
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

@media (max-width: 1150px) {
  .filter-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1050px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .form-grid.three-columns {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .term-grid {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .summary-grid,
  .filter-grid,
  .form-grid,
  .form-grid.three-columns {
    grid-template-columns: 1fr;
  }

  .results-heading,
  .term-footer,
  .modal-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .term-actions {
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