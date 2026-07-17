<template>
  <AppLayout
    :title="concept?.name || 'Concept Detail'"
    :subtitle="
      concept
        ? `${concept.category} · ${statusLabel(concept.status)}`
        : 'Concept workspace'
    "
    banner-key="concept-detail"
    default-icon="🧠"
  >
    <template #actions>
      <button
        v-if="concept"
        class="secondary-button"
        type="button"
        @click="goBack"
      >
        ← Concepts
      </button>

      <button
        v-if="concept"
        class="primary-button"
        type="button"
        @click="openEditModal"
      >
        Edit Concept
      </button>
    </template>

    <main
      v-if="concept"
      class="concept-detail-page"
    >
      <section
        class="concept-hero"
        :class="{
          archived: concept.archived,
          pinned: concept.pinned,
        }"
      >
        <div class="hero-copy">
          <div class="badge-row">
            <span class="category-badge">
              {{ concept.category }}
            </span>

            <span
              class="status-badge"
              :class="`status-${concept.status}`"
            >
              {{ statusLabel(concept.status) }}
            </span>

            <span
              v-if="concept.pinned"
              class="pinned-badge"
            >
              📌 Pinned
            </span>

            <span
              v-if="concept.archived"
              class="archived-badge"
            >
              🗄️ Archived
            </span>
          </div>

          <p class="eyebrow">
            Concept
          </p>

          <h1>{{ concept.name }}</h1>

          <p class="definition">
            {{
              concept.definition ||
              'No definition has been added yet.'
            }}
          </p>

          <div
            v-if="concept.aliases.length"
            class="alias-section"
          >
            <span>Also known as</span>

            <strong>
              {{ concept.aliases.join(', ') }}
            </strong>
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
        </div>

        <aside class="hero-actions-card">
          <button
            class="action-row"
            type="button"
            @click="handleTogglePin"
          >
            <span>📌</span>

            <div>
              <strong>
                {{
                  concept.pinned
                    ? 'Unpin Concept'
                    : 'Pin Concept'
                }}
              </strong>

              <small>
                {{
                  concept.pinned
                    ? 'Remove it from priority views.'
                    : 'Keep it near the top of the database.'
                }}
              </small>
            </div>
          </button>

          <button
            v-if="!concept.archived"
            class="action-row"
            type="button"
            @click="handleArchive"
          >
            <span>🗄️</span>

            <div>
              <strong>Archive Concept</strong>
              <small>
                Remove it from active concept views.
              </small>
            </div>
          </button>

          <button
            v-else
            class="action-row"
            type="button"
            @click="handleRestore"
          >
            <span>↩️</span>

            <div>
              <strong>Restore Concept</strong>
              <small>
                Return it to the active database.
              </small>
            </div>
          </button>

          <button
            class="action-row delete-action"
            type="button"
            @click="confirmDelete"
          >
            <span>🗑️</span>

            <div>
              <strong>Delete Concept</strong>
              <small>
                Permanently remove it and its relationships.
              </small>
            </div>
          </button>
        </aside>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>🔗</span>

          <div>
            <small>Related Concepts</small>
            <strong>{{ relatedConcepts.length }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>📚</span>

          <div>
            <small>Linked Sources</small>
            <strong>{{ concept.linkedSourceIds.length }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>🎓</span>

          <div>
            <small>Courses</small>
            <strong>{{ concept.linkedCourseIds.length }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>✍️</span>

          <div>
            <small>Writing Projects</small>
            <strong>
              {{ concept.linkedWritingProjectIds.length }}
            </strong>
          </div>
        </article>
      </section>

      <section class="detail-grid">
        <div class="main-column">
          <section class="detail-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Concept Development
                </p>

                <h2>Notes</h2>

                <p>
                  Develop the concept with observations,
                  quotations, questions, implications, and
                  research directions.
                </p>
              </div>

              <span
                class="save-state"
                :class="`save-${notesSaveState}`"
              >
                {{ notesSaveLabel }}
              </span>
            </div>

            <textarea
              v-model="editableNotes"
              class="notes-editor"
              placeholder="Develop this concept..."
            ></textarea>
          </section>

          <section class="detail-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Concept Linking
                </p>

                <h2>Related Concepts</h2>

                <p>
                  Build two-way relationships between ideas in
                  your knowledge system.
                </p>
              </div>

              <span class="count-pill">
                {{ relatedConcepts.length }}
              </span>
            </div>

            <form
              v-if="availableRelatedConcepts.length"
              class="relationship-form"
              @submit.prevent="addRelationship"
            >
              <label>
                Link another concept

                <select
                  v-model="selectedRelatedConceptId"
                  required
                >
                  <option
                    disabled
                    value=""
                  >
                    Choose a concept
                  </option>

                  <option
                    v-for="item in availableRelatedConcepts"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                    ·
                    {{ item.category }}
                  </option>
                </select>
              </label>

              <button
                class="primary-button"
                type="submit"
              >
                Add Relationship
              </button>
            </form>

            <div
              v-if="relatedConcepts.length"
              class="relationship-list"
            >
              <article
                v-for="related in relatedConcepts"
                :key="related.id"
                class="relationship-card"
              >
                <button
                  class="relationship-main"
                  type="button"
                  @click="openRelatedConcept(related)"
                >
                  <div class="badge-row">
                    <span class="category-badge">
                      {{ related.category }}
                    </span>

                    <span
                      class="status-badge"
                      :class="`status-${related.status}`"
                    >
                      {{ statusLabel(related.status) }}
                    </span>
                  </div>

                  <strong>{{ related.name }}</strong>

                  <p>
                    {{
                      related.definition ||
                      'No definition added.'
                    }}
                  </p>
                </button>

                <button
                  class="unlink-button"
                  type="button"
                  @click="removeRelationship(related)"
                >
                  Unlink
                </button>
              </article>
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>🔗</span>
              <strong>No related concepts</strong>

              <p>
                Link this concept to another idea to begin
                building its knowledge network.
              </p>
            </div>
          </section>
        </div>

        <aside class="side-column">
          <section class="detail-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Metadata
                </p>

                <h2>Concept Details</h2>
              </div>
            </div>

            <dl class="metadata-list">
              <div>
                <dt>Category</dt>
                <dd>{{ concept.category }}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{{ statusLabel(concept.status) }}</dd>
              </div>

              <div>
                <dt>Created</dt>
                <dd>{{ formatDate(concept.createdAt) }}</dd>
              </div>

              <div>
                <dt>Updated</dt>
                <dd>{{ formatDate(concept.updatedAt) }}</dd>
              </div>

              <div>
                <dt>Concept ID</dt>
                <dd class="id-value">
                  {{ concept.id }}
                </dd>
              </div>
            </dl>
          </section>

          <section class="detail-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Sources
                </p>

                <h2>Linked Research</h2>
              </div>

              <span class="count-pill">
                {{ concept.linkedSourceIds.length }}
              </span>
            </div>

            <div class="small-empty compact-empty">
              <span>📚</span>
              <strong>
                Source linking prepared
              </strong>

              <p>
                Source selection will connect this concept to
                books, articles, journals, and other research
                records.
              </p>
            </div>

            <button
              class="secondary-button full-width"
              type="button"
              disabled
            >
              + Link Source
            </button>
          </section>

          <section class="detail-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Academic Links
                </p>

                <h2>Courses & Assignments</h2>
              </div>
            </div>

            <div class="link-count-list">
              <div>
                <span>🎓 Courses</span>
                <strong>
                  {{ concept.linkedCourseIds.length }}
                </strong>
              </div>

              <div>
                <span>📝 Assignments</span>
                <strong>
                  {{ concept.linkedAssignmentIds.length }}
                </strong>
              </div>

              <div>
                <span>✍️ Writing Projects</span>
                <strong>
                  {{ concept.linkedWritingProjectIds.length }}
                </strong>
              </div>
            </div>
          </section>

          <section class="detail-card rory-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Rory
                </p>

                <h2>Concept Assistant</h2>
              </div>
            </div>

            <ul>
              <li>Clarify the definition</li>
              <li>Compare related concepts</li>
              <li>Suggest research questions</li>
              <li>Find missing relationships</li>
              <li>Prepare a writing outline</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>

    <section
      v-else
      class="not-found-card"
    >
      <span>🧠</span>
      <h2>Concept not found</h2>

      <p>
        This concept may have been deleted or the link may be
        incorrect.
      </p>

      <button
        class="primary-button"
        type="button"
        @click="goBack"
      >
        Return to Concepts
      </button>
    </section>

    <div
      v-if="editModalOpen"
      class="modal-backdrop"
      @click.self="closeEditModal"
    >
      <form
        class="concept-modal"
        @submit.prevent="saveConceptChanges"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              Edit Concept
            </p>

            <h2>Update concept details</h2>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close concept editor"
            @click="closeEditModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label>
            Concept name

            <input
              v-model.trim="editForm.name"
              type="text"
              required
            />
          </label>

          <label>
            Definition

            <textarea
              v-model="editForm.definition"
              rows="5"
              placeholder="Explain the concept in your own words."
            ></textarea>
          </label>

          <div class="form-grid">
            <label>
              Category

              <select v-model="editForm.category">
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

              <select v-model="editForm.status">
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
                v-model="editForm.aliases"
                type="text"
                placeholder="Alternate names"
              />
            </label>

            <label>
              Tags

              <input
                v-model="editForm.tags"
                type="text"
                placeholder="formation, community"
              />
            </label>
          </div>

          <label class="pin-toggle">
            <input
              v-model="editForm.pinned"
              type="checkbox"
            />

            <span>
              <strong>Pin this concept</strong>
              <small>
                Keep it near the top of active concept views.
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
            class="secondary-button"
            type="button"
            @click="closeEditModal"
          >
            Cancel
          </button>

          <button
            class="primary-button"
            type="submit"
          >
            Save Changes
          </button>
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
  watch,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useConcepts } from '@/composables/useConcepts'

const route = useRoute()
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

const {
  concepts,
  updateConcept,
  deleteConcept,
  archiveConcept,
  restoreConcept,
  toggleConceptPin,
  getConceptById,
  getRelatedConcepts,
  linkConcepts,
  unlinkConcepts,
} = useConcepts()

const selectedRelatedConceptId = ref('')
const editableNotes = ref('')
const notesSaveState = ref('saved')

const editModalOpen = ref(false)
const formError = ref('')
const toastMessage = ref('')

let notesSaveTimer = null
let toastTimer = null

const editForm = reactive({
  name: '',
  definition: '',
  category: 'General',
  status: 'developing',
  aliases: '',
  tags: '',
  pinned: false,
})

const concept = computed(() => {
  return getConceptById(
    route.params.id,
  )
})

const relatedConcepts = computed(() => {
  if (!concept.value) {
    return []
  }

  return getRelatedConcepts(
    concept.value.id,
  )
})

const availableRelatedConcepts = computed(() => {
  if (!concept.value) {
    return []
  }

  const relatedIds = new Set(
    concept.value.relatedConceptIds,
  )

  return concepts.value
    .filter((item) => {
      return (
        item.id !== concept.value.id &&
        !item.archived &&
        !relatedIds.has(item.id)
      )
    })
    .slice()
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        {
          sensitivity: 'base',
        },
      ),
    )
})

const notesSaveLabel = computed(() => {
  if (notesSaveState.value === 'saving') {
    return 'Saving…'
  }

  if (notesSaveState.value === 'unsaved') {
    return 'Unsaved changes'
  }

  return 'Saved'
})

watch(
  () => concept.value?.id || '',
  (currentId, previousId) => {
    window.clearTimeout(notesSaveTimer)
    notesSaveTimer = null

    if (
      previousId &&
      previousId !== currentId
    ) {
      const previousConcept =
        getConceptById(previousId)

      if (
        previousConcept &&
        editableNotes.value !==
          previousConcept.notes
      ) {
        updateConcept(
          previousId,
          {
            notes:
              editableNotes.value,
          },
        )
      }
    }

    const currentConcept =
      currentId
        ? getConceptById(currentId)
        : null

    editableNotes.value =
      currentConcept?.notes || ''

    notesSaveState.value =
      'saved'

    selectedRelatedConceptId.value =
      ''
  },
  {
    immediate: true,
  },
)

watch(
  editableNotes,
  (newValue, oldValue) => {
    if (
      !concept.value ||
      newValue === oldValue ||
      newValue === concept.value.notes
    ) {
      return
    }

    notesSaveState.value = 'unsaved'

    window.clearTimeout(notesSaveTimer)

    notesSaveTimer =
      window.setTimeout(() => {
        saveNotes()
      }, 700)
  },
)

onBeforeUnmount(() => {
  window.clearTimeout(notesSaveTimer)
  window.clearTimeout(toastTimer)

  if (
    concept.value &&
    editableNotes.value !== concept.value.notes
  ) {
    saveNotes()
  }
})

function saveNotes() {
  window.clearTimeout(
    notesSaveTimer,
  )

  notesSaveTimer = null

  const currentConcept =
    concept.value

  if (!currentConcept) {
    return
  }

  if (
    editableNotes.value ===
    currentConcept.notes
  ) {
    notesSaveState.value =
      'saved'

    return
  }

  notesSaveState.value =
    'saving'

  updateConcept(
    currentConcept.id,
    {
      notes: editableNotes.value,
    },
  )

  notesSaveState.value =
    'saved'
}

function openEditModal() {
  if (!concept.value) {
    return
  }

  formError.value = ''

  Object.assign(editForm, {
    name: concept.value.name,
    definition: concept.value.definition,
    category: concept.value.category,
    status: concept.value.status,
    aliases:
      concept.value.aliases.join(', '),
    tags:
      concept.value.tags.join(', '),
    pinned: concept.value.pinned,
  })

  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  formError.value = ''
}

function saveConceptChanges() {
  if (!concept.value) {
    return
  }

  const name =
    editForm.name.trim()

  if (!name) {
    formError.value =
      'Please enter a concept name.'

    return
  }

  updateConcept(
    concept.value.id,
    {
      name,
      definition:
        editForm.definition.trim(),

      category:
        editForm.category || 'General',

      status:
        editForm.status || 'developing',

      aliases:
        parseCommaList(
          editForm.aliases,
        ),

      tags:
        parseCommaList(
          editForm.tags,
        ),

      pinned: editForm.pinned,
    },
  )

  closeEditModal()
  showToast('Concept updated.')
}

function addRelationship() {
  if (
    !concept.value ||
    !selectedRelatedConceptId.value
  ) {
    return
  }

  linkConcepts(
    concept.value.id,
    selectedRelatedConceptId.value,
  )

  selectedRelatedConceptId.value = ''

  showToast(
    'Concept relationship added.',
  )
}

function removeRelationship(related) {
  if (!concept.value) {
    return
  }

  const confirmed =
    window.confirm(
      `Remove the relationship between "${concept.value.name}" and "${related.name}"?`,
    )

  if (!confirmed) {
    return
  }

  unlinkConcepts(
    concept.value.id,
    related.id,
  )

  showToast(
    'Concept relationship removed.',
  )
}

function openRelatedConcept(related) {
  router.push(
    `/concepts/${encodeURIComponent(
      related.id,
    )}`,
  )
}

function handleTogglePin() {
  if (!concept.value) {
    return
  }

  const wasPinned =
    concept.value.pinned

  toggleConceptPin(
    concept.value.id,
  )

  showToast(
    wasPinned
      ? 'Concept unpinned.'
      : 'Concept pinned.',
  )
}

function handleArchive() {
  if (!concept.value) {
    return
  }

  archiveConcept(
    concept.value.id,
  )

  showToast('Concept archived.')
}

function handleRestore() {
  if (!concept.value) {
    return
  }

  restoreConcept(
    concept.value.id,
  )

  showToast('Concept restored.')
}

function confirmDelete() {
  if (!concept.value) {
    return
  }

  const confirmed =
    window.confirm(
      `Delete "${concept.value.name}"? This removes its relationships from other concepts and cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  deleteConcept(
    concept.value.id,
  )

  router.push('/concepts')
}

function goBack() {
  router.push('/concepts')
}

function statusLabel(value) {
  return (
    conceptStatuses.find(
      (status) =>
        status.value === value,
    )?.label || 'Developing'
  )
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
      year: 'numeric',
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
.concept-detail-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-button,
.secondary-button,
.action-row,
.relationship-main,
.unlink-button,
.modal-close {
  font: inherit;
  cursor: pointer;
}

.primary-button,
.secondary-button {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  font-size: 0.75rem;
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

.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.full-width {
  width: 100%;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-text);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.concept-hero {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 300px;
  gap: 1rem;
  padding: 1.15rem;
  border: 1px solid var(--border-color);
  border-left: 5px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.concept-hero.pinned {
  border-left-color: var(--accent);
}

.concept-hero.archived {
  opacity: 0.75;
}

.hero-copy {
  min-width: 0;
}

.hero-copy h1 {
  margin: 0.4rem 0 0;
  color: var(--text-primary);
}

.definition {
  max-width: 850px;
  margin: 0.7rem 0 0;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.badge-row,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.category-badge,
.status-badge,
.pinned-badge,
.archived-badge,
.tag-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.56rem;
  font-weight: 850;
}

.category-badge {
  background: #edf3fb;
  color: #416e9b;
}

.status-badge {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
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

.archived-badge {
  background: #eef0f3;
  color: #5f6672;
}

.tag-badge {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.alias-section {
  display: grid;
  gap: 0.15rem;
  margin-top: 0.9rem;
}

.alias-section span {
  color: var(--text-muted);
  font-size: 0.58rem;
  font-weight: 850;
  text-transform: uppercase;
}

.alias-section strong {
  color: var(--text-secondary);
  font-size: 0.72rem;
}

.tag-row {
  margin-top: 0.8rem;
}

.hero-actions-card {
  display: grid;
  align-content: start;
  gap: 0.55rem;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-secondary);
}

.action-row {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  color: inherit;
  text-align: left;
}

.action-row:hover {
  border-color: var(--accent);
}

.action-row > span {
  font-size: 1rem;
}

.action-row div {
  display: grid;
  gap: 0.15rem;
}

.action-row strong {
  color: var(--text-primary);
  font-size: 0.7rem;
}

.action-row small {
  color: var(--text-muted);
  font-size: 0.6rem;
  line-height: 1.35;
}

.delete-action strong {
  color: #b4443e;
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
  padding: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.summary-card > span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 11px;
  background: var(--bg-secondary);
  font-size: 1.1rem;
}

.summary-card div {
  display: grid;
}

.summary-card small {
  color: var(--text-muted);
  font-size: 0.58rem;
  font-weight: 850;
  text-transform: uppercase;
}

.summary-card strong {
  color: var(--text-primary);
  font-size: 1.25rem;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(290px, 0.75fr);
  align-items: start;
  gap: 1rem;
}

.main-column,
.side-column {
  display: grid;
  gap: 1rem;
}

.detail-card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading.compact {
  align-items: center;
}

.section-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.section-heading p:not(.eyebrow) {
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.7rem;
  line-height: 1.45;
}

.count-pill {
  display: grid;
  place-items: center;
  min-width: 29px;
  height: 29px;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.67rem;
  font-weight: 850;
}

.save-state {
  color: var(--text-muted);
  font-size: 0.64rem;
  font-weight: 800;
}

.save-unsaved {
  color: #926614;
}

.save-saving {
  color: #416e9b;
}

.notes-editor {
  width: 100%;
  min-height: 340px;
  box-sizing: border-box;
  padding: 0.9rem;
  resize: vertical;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.55;
}

.notes-editor:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.relationship-form {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.6rem;
}

.relationship-form label,
.modal-form label {
  display: grid;
  gap: 0.3rem;
  color: var(--text-secondary);
  font-size: 0.67rem;
  font-weight: 800;
}

.relationship-form select,
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

.relationship-form select:focus,
.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.relationship-list {
  display: grid;
  gap: 0.6rem;
}

.relationship-card {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--bg-secondary);
}

.relationship-main {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.relationship-main strong {
  color: var(--text-primary);
  font-size: 0.77rem;
}

.relationship-main p {
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.67rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unlink-button {
  min-height: 31px;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: #b4443e;
  font-size: 0.62rem;
  font-weight: 800;
}

.unlink-button:hover {
  border-color: #c9453f;
}

.small-empty {
  display: grid;
  justify-items: center;
  min-height: 170px;
  align-content: center;
  text-align: center;
}

.small-empty > span {
  font-size: 1.5rem;
}

.small-empty strong {
  margin-top: 0.4rem;
  color: var(--text-primary);
  font-size: 0.72rem;
}

.small-empty p {
  max-width: 430px;
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.63rem;
  line-height: 1.45;
}

.compact-empty {
  min-height: 130px;
}

.metadata-list {
  display: grid;
  gap: 0;
  margin: 0;
}

.metadata-list div {
  display: grid;
  grid-template-columns:
    100px minmax(0, 1fr);
  gap: 0.65rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border-color);
}

.metadata-list div:last-child {
  border-bottom: none;
}

.metadata-list dt {
  color: var(--text-muted);
  font-size: 0.61rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metadata-list dd {
  min-width: 0;
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.68rem;
}

.id-value {
  overflow: hidden;
  font-family: monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-count-list {
  display: grid;
  gap: 0.5rem;
}

.link-count-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.65rem;
  border-radius: 9px;
  background: var(--bg-secondary);
}

.link-count-list span {
  color: var(--text-secondary);
  font-size: 0.66rem;
}

.link-count-list strong {
  color: var(--text-primary);
  font-size: 0.72rem;
}

.rory-card ul {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding-left: 1.15rem;
}

.rory-card li {
  color: var(--text-secondary);
  font-size: 0.67rem;
}

.not-found-card {
  display: grid;
  justify-items: center;
  min-height: 460px;
  align-content: center;
  padding: 2rem;
  text-align: center;
}

.not-found-card > span {
  font-size: 2.5rem;
}

.not-found-card h2 {
  margin: 0.7rem 0 0;
  color: var(--text-primary);
}

.not-found-card p {
  margin: 0.35rem 0 1rem;
  color: var(--text-muted);
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
  width: min(700px, 100%);
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
.modal-actions {
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

.modal-form textarea {
  resize: vertical;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
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
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
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

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .concept-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .side-column,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .relationship-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .relationship-card,
  .modal-actions {
    align-items: flex-start;
  }

  .section-heading,
  .modal-actions {
    flex-direction: column;
  }

  .relationship-card {
    grid-template-columns: 1fr;
  }
}
</style>