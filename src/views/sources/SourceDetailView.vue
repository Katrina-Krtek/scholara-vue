Library
/
Scholarory App Build
/SourceDetailView_dissertation_thesis.txt

<template>
  <AppLayout
    :title="source?.title || 'Source Detail'"
    :subtitle="source?.type || 'Research Source'"
    banner-key="source-detail"
    default-icon="📚"
  >
    <section v-if="source" class="source-page">
      <div class="source-header-card">
        <h3>Source Identity</h3>

        <label>
          Title
          <input
            v-model="source.title"
            class="title-input"
            @blur="save"
          />
        </label>

        <label>
          Subtitle
          <input
            v-model="source.subtitle"
            @blur="save"
          />
        </label>

        <div class="two-column">
          <label>
            First Author First Name
            <input
              v-model="source.firstAuthorFirstName"
              @blur="save"
            />
          </label>

          <label>
            First Author Last Name
            <input
              v-model="source.firstAuthorLastName"
              @blur="save"
            />
          </label>
        </div>

        <div class="two-column">
          <label>
            Second Author First Name
            <input
              v-model="source.secondAuthorFirstName"
              @blur="save"
            />
          </label>

          <label>
            Second Author Last Name
            <input
              v-model="source.secondAuthorLastName"
              @blur="save"
            />
          </label>
        </div>

        <label>
          Additional Contributors
          <input
            v-model="source.contributorsText"
            placeholder="Editors, translators, organizations, etc."
            @blur="save"
          />
        </label>

        <label>
          Foreword By
          <input
            v-model="source.forewordBy"
            @blur="save"
          />
        </label>

        <div class="source-actions">
          <button
            class="save-btn"
            type="button"
            @click="save"
          >
            Save Source
          </button>
        </div>
      </div>

      <SourceRelationshipPanel
        :source-id="source.id"
        :source-type="source.type"
        heading="Connected Sources"
      />

      <div class="source-grid">
        <section class="detail-card">
          <h3>Publication Details</h3>

          <label>
            Type
            <select
              :value="source.type"
              @change="handleTypeChange($event.target.value)"
            >
              <option value="Book">Book</option>
              <option value="Journal Article">Journal Article</option>
              <option value="Dissertation">Dissertation</option>
              <option value="Thesis">Thesis</option>
              <option value="Website">Website</option>
              <option value="Sermon">Sermon</option>
              <option value="Video">Video</option>
              <option value="Podcast">Podcast</option>
            </select>
          </label>

          <label>
            Publication Location
            <input
              v-model="source.publicationLocation"
              placeholder="Grand Rapids, MI"
              @blur="save"
            />
          </label>

          <label>
            Publisher
            <input
              v-model="source.publisher"
              @blur="save"
            />
          </label>

          <label>
            Publication Year
            <input
              v-model="source.year"
              @blur="save"
            />
          </label>

          <label>
            Language
            <input
              v-model="source.language"
              placeholder="English"
              @blur="save"
            />
          </label>

          <label>
            Status
            <select
              v-model="source.status"
              @change="save"
            >
              <option>planned</option>
              <option>reading</option>
              <option>completed</option>
              <option>archived</option>
            </select>
          </label>
        </section>

        <section class="detail-card">
          <h3>{{ detailSectionTitle }}</h3>

          <template v-if="source.type === 'Book'">
            <label>
              Short Title
              <input
                v-model="source.shortTitle"
                placeholder="Used for short notes"
                @blur="save"
              />
            </label>

            <label>
              ISBN
              <input
                v-model="source.isbn"
                @blur="save"
              />
            </label>

            <label>
              Edition
              <input
                v-model="source.edition"
                @blur="save"
              />
            </label>

            <label>
              Page Count / Page Range
              <input
                v-model="source.pages"
                @blur="save"
              />
            </label>
          </template>

          <template v-else-if="source.type === 'Journal Article'">
            <label>
              Journal
              <input
                v-model="source.journal"
                @blur="save"
              />
            </label>

            <label>
              Volume
              <input
                v-model="source.volume"
                @blur="save"
              />
            </label>

            <label>
              Issue
              <input
                v-model="source.issue"
                @blur="save"
              />
            </label>

            <label>
              Pages
              <input
                v-model="source.pages"
                @blur="save"
              />
            </label>

            <label>
              DOI
              <input
                v-model="source.doi"
                @blur="save"
              />
            </label>

            <label>
              URL
              <input
                v-model="source.url"
                @blur="save"
              />
            </label>
          </template>

          <template v-else-if="source.type === 'Website'">
            <label>
              Website Name
              <input
                v-model="source.websiteName"
                placeholder="Website or organization name"
                @blur="save"
              />
            </label>

            <label>
              URL
              <input
                v-model="source.url"
                @blur="save"
              />
            </label>

            <label>
              Access Date
              <input
                v-model="source.accessDate"
                type="date"
                @change="save"
              />
            </label>
          </template>

          <template
            v-else-if="
              source.type === 'Dissertation' ||
              source.type === 'Thesis'
            "
          >
            <label>
              University / Institution
              <input
                v-model="source.institution"
                placeholder="Liberty University"
                @blur="save"
              />
            </label>

            <label>
              Degree
              <input
                v-model="source.degree"
                placeholder="Doctor of Ministry, PhD, ThM, MA, etc."
                @blur="save"
              />
            </label>

            <label>
              Department / Program
              <input
                v-model="source.department"
                placeholder="School, department, or academic program"
                @blur="save"
              />
            </label>

            <label>
              Advisor / Committee Chair
              <input
                v-model="source.advisor"
                @blur="save"
              />
            </label>

            <label>
              Database
              <input
                v-model="source.database"
                placeholder="ProQuest Dissertations & Theses Global"
                @blur="save"
              />
            </label>

            <label>
              Repository
              <input
                v-model="source.repository"
                placeholder="Institutional repository or archive"
                @blur="save"
              />
            </label>

            <label>
              Publication / Document Number
              <input
                v-model="source.publicationNumber"
                @blur="save"
              />
            </label>

            <label>
              DOI
              <input
                v-model="source.doi"
                @blur="save"
              />
            </label>

            <label>
              URL
              <input
                v-model="source.url"
                @blur="save"
              />
            </label>

            <label>
              Abstract
              <textarea
                v-model="source.abstract"
                rows="6"
                placeholder="Paste or summarize the abstract."
                @blur="save"
              />
            </label>
          </template>

          <template v-else>
            <label>
              URL
              <input
                v-model="source.url"
                @blur="save"
              />
            </label>
          </template>
        </section>

        <section class="detail-card">
          <h3>Academic Links</h3>

          <label>
            Linked Course
            <select
              v-model="source.courseId"
              @change="save"
            >
              <option :value="null">
                No Course
              </option>

              <option
                v-for="course in courses"
                :key="course.id"
                :value="course.id"
              >
                {{ course.code }} — {{ course.title }}
              </option>
            </select>
          </label>

          <label>
            Linked Assignment
            <select
              v-model="source.assignmentId"
              @change="save"
            >
              <option :value="null">
                No Assignment
              </option>

              <option
                v-for="assignment in allAssignments"
                :key="assignment.id"
                :value="assignment.id"
              >
                {{ assignment.title }}
              </option>
            </select>
          </label>
        </section>

        <section class="detail-card">
          <h3>Source Template</h3>

          <SourceTemplateSelector
            :model-value="templateType"
            :options="templateOptions"
            @update:modelValue="handleTemplateChange"
          />
        </section>

        <section
          v-if="source.templateNotes"
          class="detail-card"
        >
          <SourceTemplateRenderer
            v-model="source.templateNotes"
            :template="template"
          />
        </section>

        <section class="detail-card">
          <div class="card-header">
            <h3>Source Notes</h3>

            <button
              class="citation-btn"
              type="button"
              @click="addSourceNote"
            >
              + Note
            </button>
          </div>

          <div
            v-for="note in source.sourceNotes"
            :key="note.id"
            class="source-note"
          >
            <div class="note-actions">
              <button
                class="delete-note-btn"
                type="button"
                @click="deleteSourceNote(note.id)"
              >
                Delete
              </button>
            </div>

            <input
              v-model="note.title"
              placeholder="Chapter, Section, Topic"
              @blur="save"
            />

            <input
              v-model="note.page"
              placeholder="Page or Location"
              @blur="save"
            />

            <textarea
              v-model="note.quote"
              rows="3"
              placeholder="Quote"
              @blur="save"
            />

            <textarea
              v-model="note.reflection"
              rows="4"
              placeholder="My Thoughts / Reflection"
              @blur="save"
            />
          </div>
        </section>

        <section class="detail-card">
          <div class="card-header">
            <div>
              <h3>Citations</h3>
              <p>
                Generated from the shared Scholarory citation engine.
              </p>
            </div>

            <button
              class="citation-btn"
              type="button"
              @click="copyCitation"
            >
              Copy Citation
            </button>
          </div>

          <div class="citation-tabs">
            <button
              v-for="style in citationStyles"
              :key="style.value"
              type="button"
              :class="{
                active:
                  selectedCitationStyle === style.value,
              }"
              @click="
                selectedCitationStyle = style.value
              "
            >
              {{ style.label }}
            </button>
          </div>

          <div class="citation-box">
            <p v-html="activeCitation"></p>
          </div>

          <label>
            Saved / Manual Citation
            <textarea
              v-model="source.citation"
              rows="5"
              placeholder="Save the generated citation here or manually adjust it."
              @blur="save"
            />
          </label>

          <div class="citation-actions">
            <button
              class="secondary-btn"
              type="button"
              @click="saveGeneratedCitation"
            >
              Save Generated Citation
            </button>
          </div>
        </section>

        <section class="detail-card">
          <h3>Tags</h3>

          <input
            v-model="tagsText"
            placeholder="spiritual formation, church, discipleship"
            @blur="saveTags"
          />
        </section>
      </div>

      <div
        v-if="saveMessage"
        class="save-toast"
      >
        {{ saveMessage }}
      </div>
    </section>

    <section v-else>
      <h2>Source not found</h2>
    </section>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import { useRoute } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import SourceRelationshipPanel from '@/components/sources/SourceRelationshipPanel.vue'
import SourceTemplateSelector from '@/components/sources/SourceTemplateSelector.vue'
import SourceTemplateRenderer from '@/components/sources/SourceTemplateRenderer.vue'

import { useSources } from '@/composables/useSources'
import { useCourses } from '@/composables/useCourses'
import { useAssignments } from '@/composables/useAssignments'
import { useSourceTemplates } from '@/composables/useSourceTemplates'

import {
  normalizeSourceTemplateKey,
} from '@/data/sourceTemplates'

import {
  generateCitationSet,
} from '@/utils/citations'

const route = useRoute()

const {
  getSourceById,
  updateSource,
} = useSources()

const {
  courses,
} = useCourses()

const {
  allAssignments,
} = useAssignments()

const source = computed(() => {
  return getSourceById(route.params.id)
})

const {
  template,
  templateOptions,
  ensureTemplateNotes,
  changeSourceType,
} = useSourceTemplates(source)

const tagsText = ref('')
const selectedCitationStyle =
  ref('turabianBibliography')

const saveMessage = ref('')

const citationStyles = [
  {
    label: 'Turabian Bibliography',
    value: 'turabianBibliography',
  },
  {
    label: 'Turabian Footnote',
    value: 'turabianFootnote',
  },
  {
    label: 'Turabian Short Note',
    value: 'turabianShortNote',
  },
  {
    label: 'APA',
    value: 'apa',
  },
  {
    label: 'MLA',
    value: 'mla',
  },
  {
    label: 'Chicago Bibliography',
    value: 'chicagoBibliography',
  },
  {
    label: 'Chicago Footnote',
    value: 'chicagoFootnote',
  },
  {
    label: 'Chicago Short Note',
    value: 'chicagoShortNote',
  },
]

const templateType = computed(() => {
  return normalizeSourceTemplateKey(
    source.value?.type,
  )
})

const detailSectionTitle = computed(() => {
  const type = source.value?.type

  if (type === 'Book') {
    return 'Book Details'
  }

  if (type === 'Journal Article') {
    return 'Article Details'
  }

  if (type === 'Website') {
    return 'Website Details'
  }

  if (type === 'Dissertation') {
    return 'Dissertation Details'
  }

  if (type === 'Thesis') {
    return 'Thesis Details'
  }

  if (type === 'Sermon') {
    return 'Sermon Details'
  }

  if (type === 'Video') {
    return 'Video Details'
  }

  if (type === 'Podcast') {
    return 'Podcast Details'
  }

  return 'Source Details'
})

const citationItem = computed(() => {
  if (!source.value) {
    return null
  }

  return {
    id: source.value.id,
    type: getCitationSourceType(
      source.value.type,
    ),
    title: source.value.title,
    author: getAuthorText(),
    authors: getCitationAuthors(),

    metadata: {
      authors: getCitationAuthors(),
      author: getAuthorText(),
      subtitle: source.value.subtitle,
      shortTitle:
        source.value.shortTitle ||
        source.value.title,

      publisher:
        source.value.publisher ||
        source.value.institution,

      placeOfPublication:
        source.value.publicationLocation,

      year:
        source.value.year,

      date:
        source.value.year ||
        source.value.accessDate,

      isbn:
        source.value.isbn,

      edition:
        source.value.edition,

      pages:
        source.value.pages,

      pageRange:
        source.value.pages,

      journalTitle:
        source.value.journal,

      journalName:
        source.value.journal,

      volume:
        source.value.volume,

      issue:
        source.value.issue,

      doi:
        source.value.doi,

      url:
        source.value.url,

      websiteName:
        source.value.websiteName ||
        source.value.publisher,

      siteName:
        source.value.websiteName ||
        source.value.publisher,

      accessDate:
        source.value.accessDate,

      institution:
        source.value.institution,

      university:
        source.value.institution,

      degree:
        source.value.degree,

      department:
        source.value.department,

      advisor:
        source.value.advisor,

      database:
        source.value.database,

      repository:
        source.value.repository,

      publicationNumber:
        source.value.publicationNumber,

      abstract:
        source.value.abstract,

      language:
        source.value.language,

      sourceType:
        source.value.type,
    },
  }
})

const citationSet = computed(() => {
  if (!citationItem.value) {
    return {}
  }

  return generateCitationSet(
    citationItem.value,
  )
})

const activeCitation = computed(() => {
  return (
    citationSet.value[
      selectedCitationStyle.value
    ] ||
    ''
  )
})

watch(
  source,
  (newSource) => {
    if (!newSource) {
      return
    }

    ensureTemplateNotes()

    if (!Array.isArray(newSource.sourceNotes)) {
      newSource.sourceNotes = []
    }

    if (
      !newSource.firstAuthorFirstName &&
      !newSource.firstAuthorLastName &&
      newSource.author
    ) {
      const parts =
        newSource.author
          .trim()
          .split(/\s+/)

      newSource.firstAuthorFirstName =
        parts.slice(0, -1).join(' ')

      newSource.firstAuthorLastName =
        parts.slice(-1).join('')
    }

    tagsText.value =
      (newSource.tags || []).join(', ')
  },
  {
    immediate: true,
  },
)

function handleTypeChange(type) {
  if (!source.value) {
    return
  }

  changeSourceType(type)
  save()
}

function handleTemplateChange(templateKey) {
  if (!source.value) {
    return
  }

  changeSourceType(templateKey)
  save()
}

function save() {
  if (!source.value) {
    return
  }

  updateSource(
    source.value.id,
    {
      ...source.value,
      sourceNotes:
        [...(source.value.sourceNotes || [])],

      templateNotes:
        {
          ...(source.value.templateNotes || {}),
        },
    },
  )
}

function saveTags() {
  if (!source.value) {
    return
  }

  updateSource(
    source.value.id,
    {
      tags:
        tagsText.value
          .split(',')
          .map((tag) => {
            return tag.trim()
          })
          .filter(Boolean),
    },
  )
}

function getCitationSourceType(type) {
  if (type === 'Book') {
    return 'book'
  }

  if (type === 'Journal Article') {
    return 'article'
  }

  if (type === 'Website') {
    return 'website'
  }

  if (type === 'Dissertation') {
    return 'dissertation'
  }

  if (type === 'Thesis') {
    return 'thesis'
  }

  return 'generic'
}

function getCitationAuthors() {
  if (!source.value) {
    return []
  }

  const authors = []

  if (
    source.value.firstAuthorFirstName ||
    source.value.firstAuthorLastName
  ) {
    authors.push({
      firstName:
        source.value.firstAuthorFirstName ||
        '',

      initial: '',

      lastName:
        source.value.firstAuthorLastName ||
        '',
    })
  }

  if (
    source.value.secondAuthorFirstName ||
    source.value.secondAuthorLastName
  ) {
    authors.push({
      firstName:
        source.value.secondAuthorFirstName ||
        '',

      initial: '',

      lastName:
        source.value.secondAuthorLastName ||
        '',
    })
  }

  if (
    !authors.length &&
    source.value.author
  ) {
    authors.push(
      source.value.author,
    )
  }

  return authors
}

function getAuthorText() {
  const authors =
    getCitationAuthors()

  if (!authors.length) {
    return (
      source.value?.author ||
      ''
    )
  }

  return authors
    .map((author) => {
      if (typeof author === 'string') {
        return author
      }

      return [
        author.firstName,
        author.initial,
        author.lastName,
      ]
        .filter(Boolean)
        .join(' ')
    })
    .filter(Boolean)
    .join('; ')
}

function addSourceNote() {
  if (!source.value) {
    return
  }

  source.value.sourceNotes ??= []

  source.value.sourceNotes.push({
    id: Date.now(),
    title: '',
    page: '',
    quote: '',
    reflection: '',
  })

  save()
}

function deleteSourceNote(noteId) {
  if (!source.value) {
    return
  }

  source.value.sourceNotes =
    source.value.sourceNotes.filter((note) => {
      return note.id !== noteId
    })

  save()
}

function saveGeneratedCitation() {
  if (!source.value) {
    return
  }

  source.value.citation =
    activeCitation.value.replace(
      /<[^>]+>/g,
      '',
    )

  save()
  showMessage(
    'Generated citation saved.',
  )
}

async function copyCitation() {
  const plainCitation =
    activeCitation.value.replace(
      /<[^>]+>/g,
      '',
    )

  try {
    await navigator.clipboard.writeText(
      plainCitation,
    )

    showMessage(
      'Citation copied.',
    )
  } catch {
    showMessage(
      'Could not copy citation.',
    )
  }
}

function showMessage(message) {
  saveMessage.value = message

  setTimeout(() => {
    saveMessage.value = ''
  }, 2200)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.source-page {
  display: grid;
  gap: 1rem;
}

.source-header-card,
.detail-card {
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  padding: 1rem;
  box-shadow: var(--shadow);
}

.source-header-card label,
.detail-card label {
  display: grid;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.two-column {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.title-input {
  font-size: 2rem;
  font-weight: 800;
}

.source-actions,
.citation-actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn,
.citation-btn,
.secondary-btn {
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 800;
  cursor: pointer;
}

.save-btn,
.citation-btn {
  background: var(--accent);
  color: white;
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
}

.source-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

input,
textarea,
select {
  width: 100%;
  max-width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
  color: var(--text-primary);
  padding: 0.75rem;
}

textarea {
  resize: vertical;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-header h3,
.card-header p {
  margin: 0;
}

.card-header p {
  margin-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.source-note {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-note-btn {
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  padding: 0.4rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.citation-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.citation-tabs button {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--input-bg);
  color: var(--text-secondary);
  padding: 0.55rem 0.85rem;
  font-weight: 800;
  cursor: pointer;
}

.citation-tabs button.active {
  border-color: #0f172a;
  background: #0f172a;
  color: white;
}

.citation-box {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--input-bg);
  color: var(--text-primary);
  padding: 1rem;
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
  background: #0f172a;
  color: white;
  padding: 0.8rem 1rem;
  font-weight: 850;
  box-shadow:
    0 18px 34px
    rgba(15, 23, 42, 0.28);
}

@media (max-width: 900px) {
  .source-grid,
  .two-column {
    grid-template-columns: 1fr;
  }

  .card-header {
    display: grid;
  }
}
</style>

