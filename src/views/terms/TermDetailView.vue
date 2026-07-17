<template>
  <AppLayout
    :title="termRecord?.term || 'Term Detail'"
    :subtitle="
      termRecord
        ? `${termRecord.discipline} · ${statusLabel(termRecord.status)}`
        : 'Glossary workspace'
    "
    banner-key="term-detail"
    default-icon="📖"
  >
    <template #actions>
      <button
        v-if="termRecord"
        class="secondary-button"
        type="button"
        @click="goBack"
      >
        ← Terms
      </button>

      <button
        v-if="termRecord"
        class="primary-button"
        type="button"
        @click="openEditModal"
      >
        Edit Term
      </button>
    </template>

    <main
      v-if="termRecord"
      class="term-detail-page"
    >
      <section
        class="term-hero"
        :class="{
          pinned: termRecord.pinned,
          archived: termRecord.archived,
        }"
      >
        <div class="hero-copy">
          <div class="badge-row">
            <span class="discipline-badge">
              {{ termRecord.discipline }}
            </span>

            <span class="speech-badge">
              {{ termRecord.partOfSpeech }}
            </span>

            <span
              class="status-badge"
              :class="`status-${termRecord.status}`"
            >
              {{ statusLabel(termRecord.status) }}
            </span>

            <span
              v-if="termRecord.pinned"
              class="pinned-badge"
            >
              📌 Pinned
            </span>

            <span
              v-if="termRecord.archived"
              class="archived-badge"
            >
              🗄️ Archived
            </span>
          </div>

          <p class="eyebrow">
            Glossary Term
          </p>

          <div class="term-heading-row">
            <h1>{{ termRecord.term }}</h1>

            <span
              v-if="termRecord.pronunciation"
              class="pronunciation"
            >
              {{ termRecord.pronunciation }}
            </span>
          </div>

          <div
            v-if="
              termRecord.originalSpelling ||
              termRecord.transliteration ||
              termRecord.originalLanguage
            "
            class="language-display"
          >
            <strong
              v-if="termRecord.originalSpelling"
              class="original-spelling"
            >
              {{ termRecord.originalSpelling }}
            </strong>

            <span v-if="termRecord.transliteration">
              {{ termRecord.transliteration }}
            </span>

            <span v-if="termRecord.originalLanguage">
              {{ termRecord.originalLanguage }}
            </span>
          </div>

          <p class="definition">
            {{
              termRecord.definition ||
              'No definition has been added yet.'
            }}
          </p>

          <div
            v-if="termRecord.aliases.length"
            class="alias-section"
          >
            <span>Also known as</span>

            <strong>
              {{ termRecord.aliases.join(', ') }}
            </strong>
          </div>

          <div
            v-if="termRecord.tags.length"
            class="tag-row"
          >
            <span
              v-for="tag in termRecord.tags"
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
                  termRecord.pinned
                    ? 'Unpin Term'
                    : 'Pin Term'
                }}
              </strong>

              <small>
                {{
                  termRecord.pinned
                    ? 'Remove it from priority views.'
                    : 'Keep it near the top of the glossary.'
                }}
              </small>
            </div>
          </button>

          <button
            v-if="!termRecord.archived"
            class="action-row"
            type="button"
            @click="handleArchive"
          >
            <span>🗄️</span>

            <div>
              <strong>Archive Term</strong>

              <small>
                Remove it from active glossary views.
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
              <strong>Restore Term</strong>

              <small>
                Return it to the active glossary.
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
              <strong>Delete Term</strong>

              <small>
                Permanently remove this glossary entry.
              </small>
            </div>
          </button>
        </aside>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span>🔗</span>

          <div>
            <small>Related Terms</small>
            <strong>{{ relatedTerms.length }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>💡</span>

          <div>
            <small>Linked Concepts</small>

            <strong>
              {{ termRecord.linkedConceptIds.length }}
            </strong>
          </div>
        </article>

        <article class="summary-card">
          <span>📚</span>

          <div>
            <small>Linked Sources</small>

            <strong>
              {{ termRecord.linkedSourceIds.length }}
            </strong>
          </div>
        </article>

        <article class="summary-card">
          <span>💬</span>

          <div>
            <small>Examples</small>
            <strong>{{ termRecord.examples.length }}</strong>
          </div>
        </article>
      </section>

      <section class="detail-grid">
        <div class="main-column">
          <section class="detail-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Definition
                </p>

                <h2>Extended Definition</h2>

                <p>
                  Historical, theological, academic, or
                  contextual explanation of the term.
                </p>
              </div>
            </div>

            <div
              v-if="termRecord.extendedDefinition"
              class="extended-definition"
            >
              {{ termRecord.extendedDefinition }}
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>📖</span>
              <strong>No extended definition</strong>

              <p>
                Use Edit Term to add a fuller explanation.
              </p>
            </div>
          </section>

          <section class="detail-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Usage
                </p>

                <h2>Examples</h2>

                <p>
                  Record sentences, quotations, or academic
                  examples showing how the term is used.
                </p>
              </div>

              <span class="count-pill">
                {{ termRecord.examples.length }}
              </span>
            </div>

            <form
              class="example-form"
              @submit.prevent="handleAddExample"
            >
              <label>
                New example

                <textarea
                  v-model="newExample"
                  rows="3"
                  placeholder="Enter an example sentence, quotation, or usage note."
                ></textarea>
              </label>

              <button
                class="primary-button"
                type="submit"
                :disabled="!newExample.trim()"
              >
                Add Example
              </button>
            </form>

            <div
              v-if="termRecord.examples.length"
              class="example-list"
            >
              <article
                v-for="(example, index) in termRecord.examples"
                :key="`${index}-${example}`"
                class="example-card"
              >
                <div>
                  <span class="example-number">
                    {{ index + 1 }}
                  </span>

                  <p>{{ example }}</p>
                </div>

                <button
                  class="remove-button"
                  type="button"
                  @click="handleRemoveExample(index)"
                >
                  Remove
                </button>
              </article>
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>💬</span>
              <strong>No examples added</strong>

              <p>
                Add examples to make the term easier to
                understand and apply.
              </p>
            </div>
          </section>

          <section class="detail-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Term Linking
                </p>

                <h2>Related Terms</h2>

                <p>
                  Build two-way relationships between glossary
                  terms.
                </p>
              </div>

              <span class="count-pill">
                {{ relatedTerms.length }}
              </span>
            </div>

            <form
              v-if="availableRelatedTerms.length"
              class="relationship-form"
              @submit.prevent="addRelationship"
            >
              <label>
                Link another term

                <select
                  v-model="selectedRelatedTermId"
                  required
                >
                  <option
                    disabled
                    value=""
                  >
                    Choose a term
                  </option>

                  <option
                    v-for="item in availableRelatedTerms"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.term }}
                    ·
                    {{ item.discipline }}
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
              v-if="relatedTerms.length"
              class="relationship-list"
            >
              <article
                v-for="related in relatedTerms"
                :key="related.id"
                class="relationship-card"
              >
                <button
                  class="relationship-main"
                  type="button"
                  @click="openRelatedTerm(related)"
                >
                  <div class="badge-row">
                    <span class="discipline-badge">
                      {{ related.discipline }}
                    </span>

                    <span class="speech-badge">
                      {{ related.partOfSpeech }}
                    </span>
                  </div>

                  <strong>{{ related.term }}</strong>

                  <p>
                    {{
                      related.definition ||
                      'No definition added.'
                    }}
                  </p>
                </button>

                <button
                  class="remove-button"
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
              <strong>No related terms</strong>

              <p>
                Link this entry to another glossary term.
              </p>
            </div>
          </section>

          <section class="detail-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Working Notes
                </p>

                <h2>Notes</h2>

                <p>
                  Add observations, quotations, usage notes,
                  questions, and research directions.
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
              placeholder="Develop your notes for this term..."
            ></textarea>
          </section>
        </div>

        <aside class="side-column">
          <section class="detail-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Metadata
                </p>

                <h2>Term Details</h2>
              </div>
            </div>

            <dl class="metadata-list">
              <div>
                <dt>Discipline</dt>
                <dd>{{ termRecord.discipline }}</dd>
              </div>

              <div>
                <dt>Part of speech</dt>
                <dd>{{ termRecord.partOfSpeech }}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>
                  {{ statusLabel(termRecord.status) }}
                </dd>
              </div>

              <div>
                <dt>Language</dt>

                <dd>
                  {{
                    termRecord.originalLanguage ||
                    'Not specified'
                  }}
                </dd>
              </div>

              <div>
                <dt>Created</dt>

                <dd>
                  {{ formatDate(termRecord.createdAt) }}
                </dd>
              </div>

              <div>
                <dt>Updated</dt>

                <dd>
                  {{ formatDate(termRecord.updatedAt) }}
                </dd>
              </div>

              <div>
                <dt>Term ID</dt>

                <dd class="id-value">
                  {{ termRecord.id }}
                </dd>
              </div>
            </dl>
          </section>

          <section class="detail-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Knowledge Links
                </p>

                <h2>Connected Records</h2>
              </div>
            </div>

            <div class="link-count-list">
              <div>
                <span>💡 Concepts</span>

                <strong>
                  {{ termRecord.linkedConceptIds.length }}
                </strong>
              </div>

              <div>
                <span>📚 Sources</span>

                <strong>
                  {{ termRecord.linkedSourceIds.length }}
                </strong>
              </div>

              <div>
                <span>🎓 Courses</span>

                <strong>
                  {{ termRecord.linkedCourseIds.length }}
                </strong>
              </div>

              <div>
                <span>📝 Assignments</span>

                <strong>
                  {{ termRecord.linkedAssignmentIds.length }}
                </strong>
              </div>

              <div>
                <span>✍️ Writing Projects</span>

                <strong>
                  {{
                    termRecord.linkedWritingProjectIds.length
                  }}
                </strong>
              </div>
            </div>

            <p class="prepared-note">
              Cross-database selectors are prepared for a later
              integration step.
            </p>
          </section>

          <section class="detail-card rory-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">
                  Rory
                </p>

                <h2>Term Assistant</h2>
              </div>
            </div>

            <ul>
              <li>Clarify a definition</li>
              <li>Explain pronunciation</li>
              <li>Compare related terms</li>
              <li>Suggest usage examples</li>
              <li>Identify original-language roots</li>
              <li>Prepare a vocabulary study set</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>

    <section
      v-else
      class="not-found-card"
    >
      <span>📖</span>
      <h2>Term not found</h2>

      <p>
        This term may have been deleted or the link may be
        incorrect.
      </p>

      <button
        class="primary-button"
        type="button"
        @click="goBack"
      >
        Return to Terms
      </button>
    </section>

    <div
      v-if="editModalOpen"
      class="modal-backdrop"
      @click.self="closeEditModal"
    >
      <form
        class="term-modal"
        @submit.prevent="saveTermChanges"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              Edit Term
            </p>

            <h2>Update glossary details</h2>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close term editor"
            @click="closeEditModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label>
            Term

            <input
              v-model.trim="editForm.term"
              type="text"
              required
            />
          </label>

          <label>
            Brief definition

            <textarea
              v-model="editForm.definition"
              rows="4"
            ></textarea>
          </label>

          <label>
            Extended definition

            <textarea
              v-model="editForm.extendedDefinition"
              rows="6"
            ></textarea>
          </label>

          <div class="form-grid three-columns">
            <label>
              Discipline

              <input
                v-model.trim="editForm.discipline"
                type="text"
                list="term-detail-discipline-options"
                placeholder="Choose or enter any discipline"
              />

              <datalist id="term-detail-discipline-options">
                <option
                  v-for="discipline in disciplineSuggestions"
                  :key="discipline"
                  :value="discipline"
                ></option>
              </datalist>
            </label>

            <label>
              Part of speech

              <select v-model="editForm.partOfSpeech">
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

              <select v-model="editForm.status">
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
                v-model="editForm.pronunciation"
                type="text"
              />
            </label>

            <label>
              Original language

              <select v-model="editForm.originalLanguage">
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
                v-model="editForm.originalSpelling"
                type="text"
              />
            </label>

            <label>
              Transliteration

              <input
                v-model="editForm.transliteration"
                type="text"
              />
            </label>
          </div>

          <div class="form-grid">
            <label>
              Aliases

              <input
                v-model="editForm.aliases"
                type="text"
              />
            </label>

            <label>
              Tags

              <input
                v-model="editForm.tags"
                type="text"
              />
            </label>
          </div>

          <label class="pin-toggle">
            <input
              v-model="editForm.pinned"
              type="checkbox"
            />

            <span>
              <strong>Pin this term</strong>

              <small>
                Keep it near the top of active glossary views.
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
import { useTerms } from '@/composables/useTerms'

const route = useRoute()
const router = useRouter()

const defaultTermDisciplines = [
  'General',
  'Agriculture',
  'Anthropology',
  'Architecture',
  'Arts & Humanities',
  'Biology',
  'Business',
  'Chemistry',
  'Communication',
  'Computer Science',
  'Criminal Justice',
  'Economics',
  'Education',
  'Engineering',
  'Environmental Science',
  'Finance',
  'Health Sciences',
  'History',
  'Law',
  'Languages & Linguistics',
  'Literature',
  'Mathematics',
  'Medicine',
  'Music',
  'Nursing',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Health',
  'Religious Studies',
  'Research Methodology',
  'Social Sciences',
  'Sociology',
  'Theology',
  'Biblical Studies',
  'Spiritual Formation',
  'Church History',
  'Ministry',
  'Original Languages',
  'Writing',
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

const {
  terms,
  updateTerm,
  deleteTerm,
  archiveTerm,
  restoreTerm,
  toggleTermPin,
  getTermById,
  getRelatedTerms,
  linkTerms,
  unlinkTerms,
  addExample,
  removeExample,
} = useTerms()

const selectedRelatedTermId = ref('')
const newExample = ref('')
const editableNotes = ref('')
const notesSaveState = ref('saved')

const editModalOpen = ref(false)
const formError = ref('')
const toastMessage = ref('')

let notesSaveTimer = null
let toastTimer = null

const editForm = reactive({
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
  pinned: false,
})

const termRecord = computed(() => {
  return getTermById(route.params.id)
})

const relatedTerms = computed(() => {
  if (!termRecord.value) {
    return []
  }

  return getRelatedTerms(termRecord.value.id)
})

const disciplineSuggestions = computed(() => {
  const usedDisciplines =
    terms.value
      .map((item) =>
        String(
          item.discipline || '',
        ).trim(),
      )
      .filter(Boolean)

  return [
    ...new Set([
      ...defaultTermDisciplines,
      ...usedDisciplines,
    ]),
  ].sort((a, b) =>
    a.localeCompare(
      b,
      undefined,
      {
        sensitivity: 'base',
      },
    ),
  )
})

const availableRelatedTerms = computed(() => {
  if (!termRecord.value) {
    return []
  }

  const relatedIds = new Set(
    termRecord.value.relatedTermIds,
  )

  return terms.value
    .filter((item) => {
      return (
        item.id !== termRecord.value.id &&
        !item.archived &&
        !relatedIds.has(item.id)
      )
    })
    .slice()
    .sort((a, b) =>
      a.term.localeCompare(
        b.term,
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
  () => termRecord.value?.id || '',
  (currentId, previousId) => {
    window.clearTimeout(notesSaveTimer)
    notesSaveTimer = null

    if (
      previousId &&
      previousId !== currentId
    ) {
      const previousTerm =
        getTermById(previousId)

      if (
        previousTerm &&
        editableNotes.value !==
          previousTerm.notes
      ) {
        updateTerm(
          previousId,
          {
            notes:
              editableNotes.value,
          },
        )
      }
    }

    const currentTerm =
      currentId
        ? getTermById(currentId)
        : null

    editableNotes.value =
      currentTerm?.notes || ''

    notesSaveState.value =
      'saved'

    selectedRelatedTermId.value =
      ''

    newExample.value =
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
      !termRecord.value ||
      newValue === oldValue ||
      newValue === termRecord.value.notes
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
    termRecord.value &&
    editableNotes.value !==
      termRecord.value.notes
  ) {
    saveNotes()
  }
})

function saveNotes() {
  window.clearTimeout(
    notesSaveTimer,
  )

  notesSaveTimer = null

  const currentTerm =
    termRecord.value

  if (!currentTerm) {
    return
  }

  if (
    editableNotes.value ===
    currentTerm.notes
  ) {
    notesSaveState.value =
      'saved'

    return
  }

  notesSaveState.value =
    'saving'

  updateTerm(
    currentTerm.id,
    {
      notes:
        editableNotes.value,
    },
  )

  notesSaveState.value =
    'saved'
}

function handleAddExample() {
  if (
    !termRecord.value ||
    !newExample.value.trim()
  ) {
    return
  }

  addExample(
    termRecord.value.id,
    newExample.value,
  )

  newExample.value = ''
  showToast('Example added.')
}

function handleRemoveExample(index) {
  if (!termRecord.value) {
    return
  }

  const confirmed = window.confirm(
    'Remove this example from the term?',
  )

  if (!confirmed) {
    return
  }

  removeExample(
    termRecord.value.id,
    index,
  )

  showToast('Example removed.')
}

function addRelationship() {
  if (
    !termRecord.value ||
    !selectedRelatedTermId.value
  ) {
    return
  }

  linkTerms(
    termRecord.value.id,
    selectedRelatedTermId.value,
  )

  selectedRelatedTermId.value = ''

  showToast('Term relationship added.')
}

function removeRelationship(related) {
  if (!termRecord.value) {
    return
  }

  const confirmed = window.confirm(
    `Remove the relationship between "${termRecord.value.term}" and "${related.term}"?`,
  )

  if (!confirmed) {
    return
  }

  unlinkTerms(
    termRecord.value.id,
    related.id,
  )

  showToast('Term relationship removed.')
}

function openRelatedTerm(related) {
  router.push(
    `/terms/${encodeURIComponent(
      related.id,
    )}`,
  )
}

function openEditModal() {
  if (!termRecord.value) {
    return
  }

  formError.value = ''

  Object.assign(editForm, {
    term: termRecord.value.term,
    definition: termRecord.value.definition,
    extendedDefinition:
      termRecord.value.extendedDefinition,
    pronunciation:
      termRecord.value.pronunciation,
    originalLanguage:
      termRecord.value.originalLanguage,
    originalSpelling:
      termRecord.value.originalSpelling,
    transliteration:
      termRecord.value.transliteration,
    partOfSpeech:
      termRecord.value.partOfSpeech,
    discipline:
      termRecord.value.discipline,
    status: termRecord.value.status,
    aliases:
      termRecord.value.aliases.join(', '),
    tags:
      termRecord.value.tags.join(', '),
    pinned: termRecord.value.pinned,
  })

  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  formError.value = ''
}

function saveTermChanges() {
  if (!termRecord.value) {
    return
  }

  const termName =
    editForm.term.trim()

  if (!termName) {
    formError.value =
      'Please enter a name for the term.'

    return
  }

  updateTerm(termRecord.value.id, {
    term: termName,

    definition:
      editForm.definition.trim(),

    extendedDefinition:
      editForm.extendedDefinition,

    pronunciation:
      editForm.pronunciation.trim(),

    originalLanguage:
      editForm.originalLanguage,

    originalSpelling:
      editForm.originalSpelling.trim(),

    transliteration:
      editForm.transliteration.trim(),

    partOfSpeech:
      editForm.partOfSpeech || 'Other',

    discipline:
      editForm.discipline.trim() ||
      'General',

    status:
      editForm.status || 'developing',

    aliases:
      parseCommaList(editForm.aliases),

    tags:
      parseCommaList(editForm.tags),

    pinned: editForm.pinned,
  })

  closeEditModal()
  showToast('Term updated.')
}

function handleTogglePin() {
  if (!termRecord.value) {
    return
  }

  const wasPinned =
    termRecord.value.pinned

  toggleTermPin(termRecord.value.id)

  showToast(
    wasPinned
      ? 'Term unpinned.'
      : 'Term pinned.',
  )
}

function handleArchive() {
  if (!termRecord.value) {
    return
  }

  archiveTerm(termRecord.value.id)
  showToast('Term archived.')
}

function handleRestore() {
  if (!termRecord.value) {
    return
  }

  restoreTerm(termRecord.value.id)
  showToast('Term restored.')
}

function confirmDelete() {
  if (!termRecord.value) {
    return
  }

  const confirmed = window.confirm(
    `Delete "${termRecord.value.term}"? This removes its relationships from other terms and cannot be undone.`,
  )

  if (!confirmed) {
    return
  }

  deleteTerm(termRecord.value.id)
  router.push('/terms')
}

function goBack() {
  router.push('/terms')
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

function statusLabel(value) {
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
.term-detail-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-button,
.secondary-button,
.action-row,
.relationship-main,
.remove-button,
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

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-text);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.term-hero {
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

.term-hero.pinned {
  border-left-color: var(--accent);
}

.term-hero.archived {
  opacity: 0.75;
}

.hero-copy {
  min-width: 0;
}

.term-heading-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.term-heading-row h1 {
  margin: 0.4rem 0 0;
  color: var(--text-primary);
}

.pronunciation {
  color: var(--text-muted);
  font-size: 0.78rem;
  font-style: italic;
}

.definition {
  max-width: 850px;
  margin: 0.8rem 0 0;
  color: var(--text-secondary);
  line-height: 1.65;
  white-space: pre-wrap;
}

.badge-row,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.discipline-badge,
.status-badge,
.speech-badge,
.pinned-badge,
.archived-badge,
.tag-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.56rem;
  font-weight: 850;
}

.discipline-badge {
  background: #edf3fb;
  color: #416e9b;
}

.speech-badge {
  background: #f0edf8;
  color: #715591;
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

.language-display {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.6rem;
  color: var(--accent-text);
  font-size: 0.72rem;
}

.language-display span + span::before {
  margin-right: 0.55rem;
  color: var(--text-muted);
  content: '·';
}

.original-spelling {
  font-size: 1.05rem;
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

.extended-definition {
  padding: 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  line-height: 1.65;
  white-space: pre-wrap;
}

.example-form {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.6rem;
}

.example-form label,
.relationship-form label,
.modal-form label {
  display: grid;
  gap: 0.3rem;
  color: var(--text-secondary);
  font-size: 0.67rem;
  font-weight: 800;
}

.example-form textarea,
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

.example-form textarea:focus,
.relationship-form select:focus,
.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.example-list,
.relationship-list {
  display: grid;
  gap: 0.6rem;
}

.example-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--bg-secondary);
}

.example-card > div {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  min-width: 0;
}

.example-number {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.6rem;
  font-weight: 850;
}

.example-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.7rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.relationship-form {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) auto;
  align-items: end;
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

.remove-button {
  min-height: 31px;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: #b4443e;
  font-size: 0.62rem;
  font-weight: 800;
}

.remove-button:hover {
  border-color: #c9453f;
}

.small-empty {
  display: grid;
  justify-items: center;
  min-height: 150px;
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
  min-height: 300px;
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

.metadata-list {
  display: grid;
  gap: 0;
  margin: 0;
}

.metadata-list div {
  display: grid;
  grid-template-columns:
    105px minmax(0, 1fr);
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

.prepared-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.62rem;
  line-height: 1.45;
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

.term-modal {
  width: min(760px, 100%);
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

.form-grid.three-columns {
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
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
  .term-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .side-column,
  .form-grid,
  .form-grid.three-columns {
    grid-template-columns: 1fr;
  }

  .relationship-form,
  .example-form {
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

  .example-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

