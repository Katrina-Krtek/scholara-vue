<<template>
  <AppLayout
    title="Source Relationships"
    subtitle="Connect sources, journals, articles, books, and research themes."
    banner-key="source-relationships"
    default-icon="🔗"
  >
    <div class="source-relationships-page">
      <section class="relationships-hero">
        <div>
          <p class="eyebrow">Research Hub</p>
          <h1>Source Relationships</h1>
          <p>
            Connect journals, articles, books, websites, dissertations, assignments, and themes so
            Scholarory can understand how your research fits together.
          </p>
        </div>

        <div class="hero-stats">
          <article>
            <strong>{{ sources.length }}</strong>
            <span>Sources found</span>
          </article>

          <article>
            <strong>{{ relationships.length }}</strong>
            <span>Relationships</span>
          </article>

          <article>
            <strong>{{ suggestions.length }}</strong>
            <span>Suggestions</span>
          </article>
        </div>
      </section>

      <section class="relationship-grid">
        <article class="panel relationship-builder">
          <div class="panel-header">
            <div>
              <h2>Create relationship</h2>
              <p>Choose two sources and define how they connect.</p>
            </div>
          </div>

          <div v-if="sources.length < 2" class="empty-state">
            <h3>Not enough sources yet</h3>
            <p>
              Add at least two sources first. This page will automatically detect books, articles,
              journals, websites, dissertations, and general source records from localStorage.
            </p>
          </div>

          <form v-else class="relationship-form" @submit.prevent="handleCreateRelationship">
            <label>
              First source
              <select v-model="form.fromUid">
                <option value="">Choose a source</option>
                <option
                  v-for="source in sortedSources"
                  :key="source.uid"
                  :value="source.uid"
                >
                  {{ source.title }} · {{ source.sourceType }}
                </option>
              </select>
            </label>

            <label>
              Relationship
              <select v-model="form.relationshipType">
                <option
                  v-for="relationshipType in relationshipTypes"
                  :key="relationshipType.value"
                  :value="relationshipType.value"
                >
                  {{ relationshipType.label }}
                </option>
              </select>
            </label>

            <label>
              Second source
              <select v-model="form.toUid">
                <option value="">Choose a source</option>
                <option
                  v-for="source in availableToSources"
                  :key="source.uid"
                  :value="source.uid"
                >
                  {{ source.title }} · {{ source.sourceType }}
                </option>
              </select>
            </label>

            <label class="full">
              Notes
              <textarea
                v-model="form.note"
                rows="4"
                placeholder="Why are these sources connected?"
              ></textarea>
            </label>

            <label class="full">
              Tags
              <input
                v-model="form.tags"
                type="text"
                placeholder="Example: spiritual formation, community, discipleship"
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
        </article>

        <article class="panel relationship-types">
          <div class="panel-header">
            <div>
              <h2>Relationship types</h2>
              <p>Use these to build the research map.</p>
            </div>
          </div>

          <div class="type-list">
            <button
              class="type-card"
              :class="{ active: activeTypeFilter === 'all' }"
              @click="activeTypeFilter = 'all'"
            >
              <strong>All relationships</strong>
              <span>{{ relationships.length }} total</span>
            </button>

            <button
              v-for="relationshipType in relationshipTypes"
              :key="relationshipType.value"
              class="type-card"
              :class="{ active: activeTypeFilter === relationshipType.value }"
              @click="activeTypeFilter = relationshipType.value"
            >
              <strong>{{ relationshipType.label }}</strong>
              <span>{{ relationshipType.description }}</span>

              <small
                v-if="!isDefaultRelationshipType(relationshipType.value)"
              >
                Custom type
              </small>
            </button>
          </div>

          <div class="custom-type-manager">
            <div>
              <h3>Create a relationship type</h3>

              <p>
                Add any relationship your research needs. Starter types remain
                available, but they do not limit the database.
              </p>
            </div>

            <div class="custom-type-form">
              <label>
                Forward label

                <input
                  v-model.trim="customTypeForm.label"
                  type="text"
                  placeholder="Example: expands on"
                />
              </label>

              <label>
                Reverse label

                <input
                  v-model.trim="customTypeForm.reverseLabel"
                  type="text"
                  placeholder="Example: is expanded by"
                />
              </label>

              <label class="full">
                Description

                <textarea
                  v-model="customTypeForm.description"
                  rows="3"
                  placeholder="Explain when this relationship should be used."
                ></textarea>
              </label>

              <label class="symmetric-toggle full">
                <input
                  v-model="customTypeForm.symmetric"
                  type="checkbox"
                />

                <span>
                  This relationship reads the same in either direction
                </span>
              </label>

              <div class="custom-type-actions full">
                <button
                  type="button"
                  @click="handleCreateRelationshipType"
                >
                  Add Type
                </button>
              </div>
            </div>

            <p
              v-if="customTypeError"
              class="message error"
            >
              {{ customTypeError }}
            </p>

            <p
              v-if="customTypeSuccess"
              class="message success"
            >
              {{ customTypeSuccess }}
            </p>

            <div
              v-if="customRelationshipTypes.length"
              class="custom-type-list"
            >
              <article
                v-for="type in customRelationshipTypes"
                :key="type.value"
              >
                <div>
                  <strong>{{ type.label }}</strong>

                  <span>
                    Reverse: {{ type.reverseLabel }}
                  </span>
                </div>

                <button
                  class="danger-button"
                  type="button"
                  @click="handleDeleteRelationshipType(type)"
                >
                  Delete
                </button>
              </article>
            </div>
          </div>
        </article>
      </section>

      <section v-if="suggestions.length" class="panel suggestions-panel">
        <div class="panel-header">
          <div>
            <h2>Suggested journal/article links</h2>
            <p>
              Scholarory found article records that appear to belong to existing journal records.
            </p>
          </div>
        </div>

        <div class="suggestion-list">
          <article
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="suggestion-card"
          >
            <div>
              <strong>{{ sourceTitle(suggestion.fromUid) }}</strong>
              <span>
                {{ relationshipTypeLabel(suggestion.relationshipType) }}
                {{ sourceTitle(suggestion.toUid) }}
              </span>
            </div>

            <button @click="acceptSuggestion(suggestion)">Add</button>
          </article>
        </div>
      </section>

      <section class="panel relationships-list-panel">
        <div class="panel-header list-header">
          <div>
            <h2>Relationship database</h2>
            <p>Search, filter, and review connected research items.</p>
          </div>

          <div class="list-controls">
            <input
              v-model="search"
              type="search"
              placeholder="Search relationships..."
            />

            <select v-model="activeSourceFilter">
              <option value="all">All source types</option>
              <option
                v-for="sourceType in sourceTypes"
                :key="sourceType"
                :value="sourceType"
              >
                {{ sourceType }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="filteredRelationships.length" class="relationship-list">
          <article
            v-for="relationship in filteredRelationships"
            :key="relationship.id"
            class="relationship-card"
          >
            <div class="relationship-main">
              <div class="source-pill">
                <span>{{ sourceType(relationship.fromUid) }}</span>
                <strong>{{ sourceTitle(relationship.fromUid) }}</strong>
                <small>{{ sourceSubtitle(relationship.fromUid) }}</small>
              </div>

              <div class="relationship-arrow">
                <span>{{ relationshipTypeLabel(relationship.relationshipType) }}</span>
                <strong>→</strong>
              </div>

              <div class="source-pill">
                <span>{{ sourceType(relationship.toUid) }}</span>
                <strong>{{ sourceTitle(relationship.toUid) }}</strong>
                <small>{{ sourceSubtitle(relationship.toUid) }}</small>
              </div>
            </div>

            <div v-if="relationship.note || relationship.tags" class="relationship-notes">
              <p v-if="relationship.note">{{ relationship.note }}</p>
              <small v-if="relationship.tags">Tags: {{ relationship.tags }}</small>
            </div>

            <div class="relationship-footer">
              <small>Created {{ formatDate(relationship.createdAt) }}</small>
              <button class="danger-button" @click="handleDeleteRelationship(relationship.id)">
                Delete
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3>No relationships found</h3>
          <p>
            Create your first relationship above. A strong starting point is connecting each article
            to the journal where it was published.
          </p>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import AppLayout from '@/components/AppLayout.vue'

import {
  buildSourceRelationshipSuggestions,
  createRelationshipType,
  createSourceRelationship,
  deleteRelationshipType,
  deleteSourceRelationship,
  getAllSources,
  isDefaultRelationshipType,
  readRelationshipTypes,
  readSourceRelationships,
  relationshipTypeLabel,
} from '../../lib/sourceRelationshipsStore'

const sources = ref([])
const relationships = ref([])
const relationshipTypes = ref([])

const customTypeError = ref('')
const customTypeSuccess = ref('')

const customTypeForm = ref({
  label: '',
  reverseLabel: '',
  description: '',
  symmetric: false,
})

const search = ref('')
const activeTypeFilter = ref('all')
const activeSourceFilter = ref('all')

const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  fromUid: '',
  relationshipType: 'published_in',
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

const sortedSources = computed(() => {
  return [...sources.value].sort((a, b) => {
    return a.title.localeCompare(b.title)
  })
})

const availableToSources = computed(() => {
  return sortedSources.value.filter((source) => source.uid !== form.value.fromUid)
})

const sourceTypes = computed(() => {
  return [...new Set(sources.value.map((source) => source.sourceType))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
})

const customRelationshipTypes = computed(() => {
  return relationshipTypes.value.filter(
    (type) => {
      return !isDefaultRelationshipType(
        type.value,
      )
    },
  )
})

const suggestions = computed(() => {
  return buildSourceRelationshipSuggestions(sources.value, relationships.value)
})

const filteredRelationships = computed(() => {
  const query = search.value.trim().toLowerCase()

  return relationships.value.filter((relationship) => {
    const fromSource = sourceByUid.value[relationship.fromUid]
    const toSource = sourceByUid.value[relationship.toUid]

    const matchesType =
      activeTypeFilter.value === 'all' ||
      relationship.relationshipType === activeTypeFilter.value

    const matchesSourceType =
      activeSourceFilter.value === 'all' ||
      fromSource?.sourceType === activeSourceFilter.value ||
      toSource?.sourceType === activeSourceFilter.value

    const searchableText = [
      fromSource?.title,
      fromSource?.sourceType,
      fromSource?.author,
      toSource?.title,
      toSource?.sourceType,
      toSource?.author,
      relationship.relationshipType,
      relationship.note,
      relationship.tags,
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = !query || searchableText.includes(query)

    return matchesType && matchesSourceType && matchesSearch
  })
})

onMounted(() => {
  loadData()
})

function loadData() {
  sources.value = getAllSources()
  relationships.value =
    readSourceRelationships()
  relationshipTypes.value =
    readRelationshipTypes()
}

function resetForm({
  clearMessages = true,
} = {}) {
  form.value = {
    fromUid: '',
    relationshipType:
      relationshipTypes.value[0]
        ?.value ||
      'published_in',
    toUid: '',
    note: '',
    tags: '',
  }

  if (clearMessages) {
    errorMessage.value = ''
    successMessage.value = ''
  }
}

function handleCreateRelationship() {
  errorMessage.value = ''
  successMessage.value = ''

  const result = createSourceRelationship(form.value, relationships.value)

  if (result.error) {
    errorMessage.value = result.error
    return
  }

  relationships.value = result.relationships
  resetForm({
    clearMessages: false,
  })
  successMessage.value = 'Relationship added.'
}

function acceptSuggestion(suggestion) {
  errorMessage.value = ''
  successMessage.value = ''

  const result = createSourceRelationship(
    {
      fromUid: suggestion.fromUid,
      toUid: suggestion.toUid,
      relationshipType: suggestion.relationshipType,
      note: suggestion.note,
      tags: 'auto-suggested',
    },
    relationships.value,
  )

  if (result.error) {
    errorMessage.value = result.error
    return
  }

  relationships.value = result.relationships
  successMessage.value = 'Suggested relationship added.'
}

function handleDeleteRelationship(relationshipId) {
  const confirmed = window.confirm(
    'Delete this source relationship?',
  )

  if (!confirmed) {
    return
  }

  relationships.value =
    deleteSourceRelationship(
      relationshipId,
      relationships.value,
    )

  successMessage.value =
    'Relationship deleted.'
}

function resetCustomTypeForm() {
  customTypeForm.value = {
    label: '',
    reverseLabel: '',
    description: '',
    symmetric: false,
  }
}

function handleCreateRelationshipType() {
  customTypeError.value = ''
  customTypeSuccess.value = ''

  const result =
    createRelationshipType({
      label:
        customTypeForm.value.label,
      reverseLabel:
        customTypeForm.value
          .reverseLabel ||
        customTypeForm.value.label,
      description:
        customTypeForm.value
          .description,
      symmetric:
        customTypeForm.value
          .symmetric,
    })

  if (result.error) {
    customTypeError.value =
      result.error
    return
  }

  relationshipTypes.value =
    result.relationshipTypes

  form.value.relationshipType =
    result.relationshipType.value

  resetCustomTypeForm()

  customTypeSuccess.value =
    'Relationship type added.'
}

function handleDeleteRelationshipType(
  relationshipType,
) {
  const confirmed = window.confirm(
    `Delete the relationship type "${relationshipType.label}"?`,
  )

  if (!confirmed) {
    return
  }

  customTypeError.value = ''
  customTypeSuccess.value = ''

  const result =
    deleteRelationshipType(
      relationshipType.value,
      relationships.value,
    )

  if (result.error) {
    customTypeError.value =
      result.error
    return
  }

  relationshipTypes.value =
    result.relationshipTypes

  if (
    form.value.relationshipType ===
    relationshipType.value
  ) {
    form.value.relationshipType =
      relationshipTypes.value[0]
        ?.value ||
      'published_in'
  }

  customTypeSuccess.value =
    'Relationship type deleted.'
}

function sourceTitle(uid) {
  return sourceByUid.value[uid]?.title || 'Missing source'
}

function sourceType(uid) {
  return sourceByUid.value[uid]?.sourceType || 'Unknown'
}

function sourceSubtitle(uid) {
  const source = sourceByUid.value[uid]
  if (!source) return ''

  return [source.author, source.year].filter(Boolean).join(' · ')
}

function formatDate(value) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<style scoped>
.source-relationships-page {
  display: grid;
  gap: 1.5rem;
}

.relationships-hero {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(204, 164, 75, 0.35);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(204, 164, 75, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(10, 31, 68, 0.96), rgba(13, 45, 91, 0.92));
  color: white;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #f4d58d;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.relationships-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.1rem);
}

.relationships-hero p {
  max-width: 760px;
  margin: 0.65rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.65;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(110px, 1fr));
  gap: 0.75rem;
  align-self: stretch;
  min-width: 360px;
}

.hero-stats article {
  display: grid;
  align-content: center;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid rgba(244, 213, 141, 0.32);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
}

.hero-stats strong {
  font-size: 2rem;
  color: #f4d58d;
}

.hero-stats span {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.74);
}

.relationship-grid {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.relationship-builder {
  flex: 1.35 1 0;
  align-self: flex-start !important;
  width: 100%;
  height: auto !important;
  min-height: 0 !important;
}

.relationship-types {
  flex: 0.65 1 320px;
  align-self: flex-start !important;
  width: 100%;
  height: auto !important;
  min-height: 0 !important;
}

.panel {
  border: 1px solid rgba(10, 31, 68, 0.12);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 45px rgba(10, 31, 68, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
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

.relationship-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  min-width: 0;
  padding: 1.25rem;
}

.relationship-form label {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
  color: #0a1f44;
  font-size: 0.85rem;
  font-weight: 800;
}

.relationship-form label.full {
  grid-column: 1 / -1;
}

.relationship-form input,
.relationship-form select,
.relationship-form textarea,
.list-controls input,
.list-controls select {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid rgba(10, 31, 68, 0.15);
  border-radius: 14px;
  background: #f8fafc;
  color: #0a1f44;
  font: inherit;
}

.relationship-form input,
.relationship-form select,
.list-controls input,
.list-controls select {
  min-height: 44px;
  padding: 0 0.9rem;
}

.relationship-form textarea {
  resize: vertical;
  padding: 0.8rem 0.9rem;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

button {
  border: 0;
  border-radius: 999px;
  background: #0a1f44;
  color: white;
  padding: 0.75rem 1.1rem;
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

.danger-button {
  background: rgba(190, 18, 60, 0.1);
  color: #be123c;
}

.message {
  grid-column: 1 / -1;
  margin: 0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
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

.type-list {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
}

.type-card {
  display: grid;
  gap: 0.25rem;
  width: 100%;
  border: 1px solid rgba(10, 31, 68, 0.1);
  border-radius: 16px;
  background: #f8fafc;
  color: #0a1f44;
  padding: 0.9rem;
  text-align: left;
}

.type-card.active {
  border-color: rgba(204, 164, 75, 0.8);
  background: rgba(204, 164, 75, 0.16);
}

.type-card span {
  color: #667085;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.4;
}

.custom-type-manager {
  display: grid;
  gap: 0.9rem;
  margin: 0 1.25rem 1.25rem;
  padding-top: 1.15rem;
  border-top: 1px solid rgba(10, 31, 68, 0.12);
}

.custom-type-manager h3 {
  margin: 0;
  color: #0a1f44;
}

.custom-type-manager > div > p {
  margin: 0.35rem 0 0;
  color: #667085;
  font-size: 0.82rem;
  line-height: 1.45;
}

.custom-type-form {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.custom-type-form label {
  display: grid;
  gap: 0.4rem;
  color: #0a1f44;
  font-size: 0.78rem;
  font-weight: 800;
}

.custom-type-form .full {
  grid-column: 1 / -1;
}

.custom-type-form input,
.custom-type-form textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(10, 31, 68, 0.15);
  border-radius: 12px;
  background: #f8fafc;
  color: #0a1f44;
  padding: 0.7rem;
  font: inherit;
}

.symmetric-toggle {
  display: flex !important;
  align-items: center;
  grid-template-columns: auto 1fr;
}

.symmetric-toggle input {
  width: 18px;
  height: 18px;
}

.custom-type-actions {
  display: flex;
  justify-content: flex-end;
}

.custom-type-list {
  display: grid;
  gap: 0.55rem;
}

.custom-type-list article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid rgba(10, 31, 68, 0.1);
  border-radius: 13px;
  background: #f8fafc;
  padding: 0.7rem;
}

.custom-type-list article > div {
  display: grid;
  gap: 0.2rem;
}

.custom-type-list span {
  color: #667085;
  font-size: 0.74rem;
}

.type-card small {
  color: #8a6a18;
  font-size: 0.68rem;
}

.suggestions-panel,
.relationships-list-panel {
  overflow: hidden;
}

.suggestion-list,
.relationship-list {
  display: grid;
  gap: 0.9rem;
  padding: 1.25rem;
}

.suggestion-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(204, 164, 75, 0.28);
  border-radius: 18px;
  background: rgba(204, 164, 75, 0.1);
  padding: 1rem;
}

.suggestion-card div {
  display: grid;
  gap: 0.25rem;
}

.suggestion-card strong {
  color: #0a1f44;
}

.suggestion-card span {
  color: #667085;
}

.list-header {
  align-items: flex-start;
}

.list-controls {
  display: flex;
  gap: 0.75rem;
  min-width: min(460px, 100%);
}

.relationship-card {
  display: grid;
  gap: 1rem;
  border: 1px solid rgba(10, 31, 68, 0.1);
  border-radius: 20px;
  background: #ffffff;
  padding: 1rem;
}

.relationship-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}

.source-pill {
  display: grid;
  gap: 0.3rem;
  border: 1px solid rgba(10, 31, 68, 0.1);
  border-radius: 18px;
  background: #f8fafc;
  padding: 1rem;
}

.source-pill span {
  width: fit-content;
  border-radius: 999px;
  background: rgba(10, 31, 68, 0.08);
  color: #0a1f44;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 900;
}

.source-pill strong {
  color: #0a1f44;
}

.source-pill small,
.relationship-footer small {
  color: #667085;
}

.relationship-arrow {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  color: #0a1f44;
  font-size: 0.82rem;
  font-weight: 900;
  text-align: center;
}

.relationship-arrow strong {
  color: #cca44b;
  font-size: 1.5rem;
}

.relationship-notes {
  display: grid;
  gap: 0.35rem;
  border-left: 4px solid #cca44b;
  padding-left: 0.85rem;
}

.relationship-notes p {
  margin: 0;
  color: #334155;
  line-height: 1.55;
}

.relationship-notes small {
  color: #667085;
  font-weight: 700;
}

.relationship-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.empty-state {
  margin: 1.25rem;
  border: 1px dashed rgba(10, 31, 68, 0.2);
  border-radius: 18px;
  background: #f8fafc;
  padding: 1.25rem;
}

.empty-state h3 {
  margin: 0;
  color: #0a1f44;
}

.empty-state p {
  margin: 0.4rem 0 0;
  color: #667085;
  line-height: 1.55;
}

@media (max-width: 1050px) {
  .relationships-hero {
    grid-template-columns: 1fr;
  }

  .relationships-hero {
    display: grid;
  }

  .relationship-grid {
    flex-direction: column;
  }

  .relationship-builder,
  .relationship-types {
    flex: none;
    width: 100%;
  }

  .hero-stats {
    min-width: 0;
  }

  .relationship-form,
  .custom-type-form {
    grid-template-columns: 1fr;
  }

  .custom-type-form .full {
    grid-column: auto;
  }

  .relationship-main {
    grid-template-columns: 1fr;
  }

  .relationship-arrow {
    justify-items: start;
  }

  .list-controls {
    width: 100%;
    flex-direction: column;
  }

  .panel-header {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .suggestion-card,
  .relationship-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

