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
          <input v-model="source.title" class="title-input" @blur="save" />
        </label>

        <div class="two-column">
          <label>
            First Author First Name
            <input v-model="source.firstAuthorFirstName" @blur="save" />
          </label>

          <label>
            First Author Last Name
            <input v-model="source.firstAuthorLastName" @blur="save" />
          </label>
        </div>

        <div class="two-column">
          <label>
            Second Author First Name
            <input v-model="source.secondAuthorFirstName" @blur="save" />
          </label>

          <label>
            Second Author Last Name
            <input v-model="source.secondAuthorLastName" @blur="save" />
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
          <input v-model="source.forewordBy" @blur="save" />
        </label>

        <div class="source-actions">
          <button class="save-btn" @click="save">Save Source</button>
        </div>
      </div>

      <div class="source-grid">
        <section class="detail-card">
          <h3>Publication Details</h3>

          <label>
            Type
            <select v-model="source.type" @change="save">
              <option>Book</option>
              <option>Journal Article</option>
              <option>Dissertation</option>
              <option>Website</option>
              <option>Video</option>
              <option>Podcast</option>
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
            <input v-model="source.publisher" @blur="save" />
          </label>

          <label>
            Publication Year
            <input v-model="source.year" @blur="save" />
          </label>

          <label>
            Status
            <select v-model="source.status" @change="save">
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
              ISBN
              <input v-model="source.isbn" @blur="save" />
            </label>

            <label>
              Edition
              <input v-model="source.edition" @blur="save" />
            </label>

            <label>
              Page Count / Page Range
              <input v-model="source.pages" @blur="save" />
            </label>
          </template>

          <template v-else-if="source.type === 'Journal Article'">
            <label>
              Journal
              <input v-model="source.journal" @blur="save" />
            </label>

            <label>
              Volume
              <input v-model="source.volume" @blur="save" />
            </label>

            <label>
              Issue
              <input v-model="source.issue" @blur="save" />
            </label>

            <label>
              Pages
              <input v-model="source.pages" @blur="save" />
            </label>

            <label>
              DOI
              <input v-model="source.doi" @blur="save" />
            </label>
          </template>

          <template v-else-if="source.type === 'Website'">
            <label>
              URL
              <input v-model="source.url" @blur="save" />
            </label>

            <label>
              Access Date
              <input type="date" v-model="source.accessDate" @change="save" />
            </label>
          </template>

          <template v-else-if="source.type === 'Dissertation'">
            <label>
              University / Institution
              <input v-model="source.publisher" @blur="save" />
            </label>

            <label>
              URL
              <input v-model="source.url" @blur="save" />
            </label>
          </template>

          <template v-else>
            <label>
              URL
              <input v-model="source.url" @blur="save" />
            </label>
          </template>
        </section>

        <section class="detail-card">
          <h3>Academic Links</h3>

          <label>
            Linked Course
            <select v-model="source.courseId" @change="save">
              <option :value="null">No Course</option>

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
            <select v-model="source.assignmentId" @change="save">
              <option :value="null">No Assignment</option>

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
  <h3>Research Notes</h3>

  <textarea
    v-model="source.notes"
    rows="12"
    placeholder="Capture chapter notes, quotes, reflections, paper ideas, and observations..."
    @blur="save"
  />
</section>

<section class="detail-card">
  <div class="card-header">
    <h3>Source Notes</h3>

    <button
      class="citation-btn"
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
            <h3>Citation</h3>

            <button class="citation-btn" @click="generateCitation">
              Generate Citation
            </button>
          </div>

          <textarea v-model="source.citation" rows="6" @blur="save" />
        </section>

        <section class="detail-card">
          <h3>Tags</h3>

          <input
            v-model="tagsText"
            @blur="saveTags"
            placeholder="spiritual formation, church, discipleship"
          />
        </section>
      </div>
    </section>

    <section v-else>
      <h2>Source not found</h2>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useSources } from '@/composables/useSources'
import { useCourses } from '@/composables/useCourses'
import { useAssignments } from '@/composables/useAssignments'

const route = useRoute()

const { getSourceById, updateSource } = useSources()
const { courses } = useCourses()
const { allAssignments } = useAssignments()

const source = computed(() => getSourceById(route.params.id))

const tagsText = ref('')

const detailSectionTitle = computed(() => {
  if (!source.value) return 'Source Details'
  if (source.value.type === 'Book') return 'Book Details'
  if (source.value.type === 'Journal Article') return 'Article Details'
  if (source.value.type === 'Website') return 'Website Details'
  if (source.value.type === 'Dissertation') return 'Dissertation Details'
  if (source.value.type === 'Video') return 'Video Details'
  if (source.value.type === 'Podcast') return 'Podcast Details'
  return 'Source Details'
})

watch(
  source,
  (newSource) => {
    if (!newSource) return

    if (!newSource.firstAuthorFirstName && !newSource.firstAuthorLastName && newSource.author) {
      const parts = newSource.author.split(' ')
      newSource.firstAuthorFirstName = parts.slice(0, -1).join(' ')
      newSource.firstAuthorLastName = parts.slice(-1).join('')
    }

    tagsText.value = (newSource.tags || []).join(', ')
  },
  { immediate: true },
)

function save() {
  if (!source.value) return
  updateSource(source.value.id, { ...source.value })
}

function saveTags() {
  if (!source.value) return

  updateSource(source.value.id, {
    tags: tagsText.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  })
}

function getBibliographyAuthor() {
  const first = source.value.firstAuthorFirstName || ''
  const last = source.value.firstAuthorLastName || ''
  const secondFirst = source.value.secondAuthorFirstName || ''
  const secondLast = source.value.secondAuthorLastName || ''

  const firstAuthor = last
    ? `${last}, ${first}`.trim()
    : source.value.author || 'Unknown Author'

  const secondAuthor = [secondFirst, secondLast].filter(Boolean).join(' ')

  if (secondAuthor) {
    return `${firstAuthor}, and ${secondAuthor}`
  }

  return firstAuthor
}
function addSourceNote() {
  if (!source.value) return

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
  if (!source.value) return

  source.value.sourceNotes =
    source.value.sourceNotes.filter(
      note => note.id !== noteId,
    )

  save()
}
function generateCitation() {
  if (!source.value) return

  if (source.value.type === 'Book') {
    const author = getBibliographyAuthor()
    const title = source.value.title || 'Untitled'
    const location = source.value.publicationLocation || ''
    const publisher = source.value.publisher || 'Unknown Publisher'
    const year = source.value.year || 'n.d.'

    const publicationInfo = location
      ? `${location}: ${publisher}, ${year}`
      : `${publisher}, ${year}`

    source.value.citation = `${author}. ${title}. ${publicationInfo}.`
    save()
  }
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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.title-input {
  font-size: 2rem;
  font-weight: 800;
}

.source-actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn,
.citation-btn {
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  font-weight: 800;
  background: var(--accent);
  color: white;
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

input,
textarea,
select {
  width: 100%;
  max-width: 100%;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.75rem;
}

textarea {
  resize: vertical;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
}
.source-note {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}
.note-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-note-btn {
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  background: #dc2626;
  color: white;
  font-weight: 700;
}
@media (max-width: 900px) {
  .source-grid,
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>