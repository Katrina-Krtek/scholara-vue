<template>
  <section class="source-relationship-panel">
    <div class="panel-header">
      <div>
        <p class="eyebrow">Research Map</p>
        <h2>{{ heading }}</h2>
        <p v-if="currentSource">
          Showing relationships for
          <strong>{{ currentSource.title }}</strong>
        </p>
        <p v-else>
          This panel is ready, but it could not identify the current source from this detail page yet.
        </p>
      </div>

      <div v-if="currentSource" class="relationship-count">
        <strong>{{ relationshipRows.length }}</strong>
        <span>connected</span>
      </div>
    </div>

    <div v-if="!currentSource" class="empty-state warning">
      <h3>Source not matched yet</h3>
      <p>
        This usually means the detail page has not finished loading its source information yet.
        Refresh the page once. If this message remains, send me the detail file.
      </p>
    </div>

    <template v-else>
      <form class="quick-add" @submit.prevent="handleCreateRelationship">
        <label>
          Relationship
          <select v-model="form.relationshipType">
            <option
              v-for="relationshipType in RELATIONSHIP_TYPES"
              :key="relationshipType.value"
              :value="relationshipType.value"
            >
              {{ relationshipType.label }}
            </option>
          </select>
        </label>

        <label>
          Connected source
          <select v-model="form.toUid">
            <option value="">Choose a source</option>
            <option
              v-for="source in availableSources"
              :key="source.uid"
              :value="source.uid"
            >
              {{ source.title }} · {{ source.sourceType }}
            </option>
          </select>
        </label>

        <label class="full">
          Note
          <input
            v-model="form.note"
            type="text"
            placeholder="Example: This article supports the book’s argument about spiritual formation."
          />
        </label>

        <label class="full">
          Tags
          <input
            v-model="form.tags"
            type="text"
            placeholder="Example: discipleship, community, formation"
          />
        </label>

        <div class="form-actions">
          <button type="submit">Add relationship</button>
          <button type="button" class="ghost-button" @click="resetForm">
            Clear
          </button>
        </div>

        <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      </form>

      <div v-if="relationshipRows.length" class="relationship-list">
        <article
          v-for="row in relationshipRows"
          :key="row.relationship.id"
          class="relationship-card"
        >
          <div class="relationship-main">
            <div>
              <span class="relationship-label">{{ row.label }}</span>
              <h3>{{ row.otherSource.title }}</h3>
              <p>
                {{ row.otherSource.sourceType }}
                <template v-if="sourceSubtitle(row.otherSource)">
                  · {{ sourceSubtitle(row.otherSource) }}
                </template>
              </p>
            </div>

            <button
              type="button"
              class="delete-button"
              @click="handleDeleteRelationship(row.relationship.id)"
            >
              Delete
            </button>
          </div>

          <div v-if="row.relationship.note || row.relationship.tags" class="relationship-meta">
            <p v-if="row.relationship.note">{{ row.relationship.note }}</p>
            <small v-if="row.relationship.tags">Tags: {{ row.relationship.tags }}</small>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <h3>No connected sources yet</h3>
        <p>
          Add a relationship above. Good first connections are article → journal, article → book,
          book → same theme, or source → supports.
        </p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  RELATIONSHIP_TYPES,
  createSourceRelationship,
  deleteSourceRelationship,
  getAllSources,
  readSourceRelationships,
  registerSourceSnapshot,
  relationshipTypeLabel,
} from '../../lib/sourceRelationshipsStore'

const props = defineProps({
  sourceUid: {
    type: String,
    default: '',
  },
  sourceId: {
    type: [String, Number],
    default: '',
  },
  sourceType: {
    type: String,
    default: '',
  },
  sourceTitle: {
    type: String,
    default: '',
  },
  sourceAuthor: {
    type: String,
    default: '',
  },
  sourceYear: {
    type: [String, Number],
    default: '',
  },
  heading: {
    type: String,
    default: 'Source Relationships',
  },
})

const emit = defineEmits(['changed'])

const route = useRoute()

const sources = ref([])
const relationships = ref([])
const registeredSource = ref(null)

const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  relationshipType: 'same_theme',
  toUid: '',
  note: '',
  tags: '',
})

const sourceByUid = computed(() => {
  return sources.value.reduce((lookup, source) => {
    lookup[source.uid] = source
    return lookup
  }, {})
})

const routeSourceId = computed(() => {
  const possibleParamNames = [
    'id',
    'sourceId',
    'bookId',
    'articleId',
    'journalId',
    'websiteId',
    'dissertationId',
    'thesisId',
    'slug',
  ]

  for (const paramName of possibleParamNames) {
    const value = route.params[paramName]
    if (value !== undefined && value !== null && String(value).trim()) {
      return value
    }
  }

  return ''
})

const inferredSourceType = computed(() => {
  const path = route.path.toLowerCase()

  if (path.includes('article')) return 'Journal Article'
  if (path.includes('journal')) return 'Journal'
  if (path.includes('book')) return 'Book'
  if (path.includes('dissertation')) return 'Dissertation'
  if (path.includes('thesis')) return 'Thesis'
  if (path.includes('website') || path.includes('webpage')) return 'Website'
  if (path.includes('blog')) return 'Blog'
  if (path.includes('video')) return 'Video'
  if (path.includes('communication')) return 'Communication'

  return props.sourceType || ''
})

const currentSource = computed(() => {
  if (!sources.value.length && !registeredSource.value) return null

  if (props.sourceUid) {
    const directMatch = sourceByUid.value[props.sourceUid]
    if (directMatch) return directMatch
  }

  if (registeredSource.value?.uid) {
    const registeredMatch = sourceByUid.value[registeredSource.value.uid]
    if (registeredMatch) return registeredMatch
    return registeredSource.value
  }

  const idToMatch = cleanText(props.sourceId || routeSourceId.value)
  const typeToMatch = cleanText(props.sourceType || inferredSourceType.value)
  const titleToMatch = cleanText(props.sourceTitle)
  const authorToMatch = cleanText(props.sourceAuthor)

  if (idToMatch) {
    const idMatches = sources.value.filter((source) => {
      return cleanText(source.id) === idToMatch
    })

    if (idMatches.length) {
      if (typeToMatch) {
        const typeMatch = idMatches.find((source) => {
          return cleanText(source.sourceType) === typeToMatch
        })

        if (typeMatch) return typeMatch
      }

      if (idMatches.length === 1) return idMatches[0]
    }
  }

  if (titleToMatch) {
    const titleMatches = sources.value.filter((source) => {
      const titleMatchesSource = cleanText(source.title) === titleToMatch
      const typeMatchesSource =
        !typeToMatch || cleanText(source.sourceType) === typeToMatch

      return titleMatchesSource && typeMatchesSource
    })

    if (titleMatches.length === 1) return titleMatches[0]

    if (titleMatches.length > 1 && authorToMatch) {
      const authorMatch = titleMatches.find((source) => {
        return cleanText(source.author) === authorToMatch
      })

      if (authorMatch) return authorMatch
    }
  }

  return null
})

const availableSources = computed(() => {
  if (!currentSource.value) return []

  return sources.value
    .filter((source) => source.uid !== currentSource.value.uid)
    .sort((a, b) => a.title.localeCompare(b.title))
})

const relationshipRows = computed(() => {
  if (!currentSource.value) return []

  return relationships.value
    .filter((relationship) => {
      return (
        relationship.fromUid === currentSource.value.uid ||
        relationship.toUid === currentSource.value.uid
      )
    })
    .map((relationship) => {
      const isOutgoing = relationship.fromUid === currentSource.value.uid
      const otherUid = isOutgoing ? relationship.toUid : relationship.fromUid
      const otherSource = sourceByUid.value[otherUid]

      if (!otherSource) return null

      return {
        relationship,
        direction: isOutgoing ? 'outgoing' : 'incoming',
        label: relationshipTypeLabel(relationship.relationshipType, !isOutgoing),
        otherSource,
      }
    })
    .filter(Boolean)
})

onMounted(() => {
  refreshData()
})

watch(
  () => [
    route.fullPath,
    props.sourceUid,
    props.sourceId,
    props.sourceType,
    props.sourceTitle,
    props.sourceAuthor,
    props.sourceYear,
  ],
  () => {
    refreshData()
  },
)

function refreshData() {
  registerCurrentSource()
  loadData()
}

function registerCurrentSource() {
  const title = String(props.sourceTitle || '').trim()
  const id = String(props.sourceId || routeSourceId.value || '').trim()

  if (!title && !id) return

  registeredSource.value = registerSourceSnapshot({
    sourceUid: props.sourceUid,
    sourceId: id,
    sourceType: props.sourceType || inferredSourceType.value,
    sourceTitle: title,
    sourceAuthor: props.sourceAuthor,
    sourceYear: props.sourceYear,
    routeId: routeSourceId.value,
    routePath: route.fullPath,
  })
}

function loadData() {
  sources.value = getAllSources()
  relationships.value = readSourceRelationships()
}

function resetForm() {
  form.value = {
    relationshipType: 'same_theme',
    toUid: '',
    note: '',
    tags: '',
  }

  errorMessage.value = ''
  successMessage.value = ''
}

function handleCreateRelationship() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!currentSource.value) {
    errorMessage.value = 'Scholarory could not identify the current source yet.'
    return
  }

  const result = createSourceRelationship(
    {
      fromUid: currentSource.value.uid,
      toUid: form.value.toUid,
      relationshipType: form.value.relationshipType,
      note: form.value.note,
      tags: form.value.tags,
    },
    relationships.value,
  )

  if (result.error) {
    errorMessage.value = result.error
    return
  }

  relationships.value = result.relationships
  successMessage.value = 'Relationship added.'
  emit('changed', result.relationship)
  resetForm()
}

function handleDeleteRelationship(relationshipId) {
  relationships.value = deleteSourceRelationship(relationshipId, relationships.value)
  emit('changed')
}

function sourceSubtitle(source) {
  return [source.author, source.year].filter(Boolean).join(' · ')
}

function cleanText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}
</script>

<style scoped>
.source-relationship-panel {
  display: grid;
  gap: 1rem;
  border: 1px solid rgba(10, 31, 68, 0.12);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 45px rgba(10, 31, 68, 0.08);
  padding: 1.25rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #b8892f;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.panel-header h2 {
  margin: 0;
  color: #0a1f44;
}

.panel-header p {
  margin: 0.35rem 0 0;
  color: #667085;
  line-height: 1.5;
}

.panel-header strong {
  color: #0a1f44;
}

.relationship-count {
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  min-width: 92px;
  border: 1px solid rgba(204, 164, 75, 0.45);
  border-radius: 18px;
  background: rgba(204, 164, 75, 0.12);
  padding: 0.85rem;
}

.relationship-count strong {
  color: #0a1f44;
  font-size: 1.7rem;
}

.relationship-count span {
  color: #667085;
  font-size: 0.75rem;
  font-weight: 800;
}

.quick-add {
  display: grid;
  grid-template-columns: minmax(180px, 0.65fr) minmax(220px, 1fr);
  gap: 0.85rem;
  border: 1px solid rgba(10, 31, 68, 0.08);
  border-radius: 18px;
  background: #f8fafc;
  padding: 1rem;
}

.quick-add label {
  display: grid;
  gap: 0.4rem;
  color: #0a1f44;
  font-size: 0.82rem;
  font-weight: 900;
}

.quick-add label.full {
  grid-column: 1 / -1;
}

.quick-add input,
.quick-add select {
  width: 100%;
  min-height: 42px;
  border: 1px solid rgba(10, 31, 68, 0.14);
  border-radius: 13px;
  background: white;
  color: #0a1f44;
  font: inherit;
  padding: 0 0.85rem;
  box-sizing: border-box;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.65rem;
  align-items: center;
}

button {
  border: 0;
  border-radius: 999px;
  background: #0a1f44;
  color: white;
  padding: 0.68rem 1rem;
  font-weight: 900;
  cursor: pointer;
}

button:hover {
  transform: translateY(-1px);
}

.ghost-button {
  background: rgba(10, 31, 68, 0.08);
  color: #0a1f44;
}

.delete-button {
  background: rgba(190, 18, 60, 0.1);
  color: #be123c;
}

.message {
  grid-column: 1 / -1;
  margin: 0;
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  font-weight: 800;
}

.message.error {
  background: rgba(190, 18, 60, 0.1);
  color: #be123c;
}

.message.success {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.relationship-list {
  display: grid;
  gap: 0.85rem;
}

.relationship-card {
  display: grid;
  gap: 0.85rem;
  border: 1px solid rgba(10, 31, 68, 0.1);
  border-radius: 18px;
  background: #ffffff;
  padding: 1rem;
}

.relationship-main {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.relationship-label {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  background: rgba(204, 164, 75, 0.14);
  color: #8a641d;
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: capitalize;
}

.relationship-card h3 {
  margin: 0.55rem 0 0;
  color: #0a1f44;
}

.relationship-card p {
  margin: 0.3rem 0 0;
  color: #667085;
  line-height: 1.5;
}

.relationship-meta {
  border-left: 4px solid #cca44b;
  padding-left: 0.8rem;
}

.relationship-meta p {
  margin: 0;
  color: #334155;
}

.relationship-meta small {
  display: block;
  margin-top: 0.35rem;
  color: #667085;
  font-weight: 700;
}

.empty-state {
  border: 1px dashed rgba(10, 31, 68, 0.2);
  border-radius: 18px;
  background: #f8fafc;
  padding: 1rem;
}

.empty-state.warning {
  background: rgba(204, 164, 75, 0.1);
  border-color: rgba(204, 164, 75, 0.45);
}

.empty-state h3 {
  margin: 0;
  color: #0a1f44;
}

.empty-state p {
  margin: 0.4rem 0 0;
  color: #667085;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .panel-header,
  .relationship-main {
    flex-direction: column;
  }

  .quick-add {
    grid-template-columns: 1fr;
  }
}
</style>