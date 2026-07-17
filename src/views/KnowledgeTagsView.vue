<template>
  <AppLayout
    title="Knowledge Tags"
    subtitle="Build your topic wiki, supertags, and schema shortcuts."
    banner-key="knowledge-tags"
    default-icon="🏷️"
  >
    <main class="knowledge-page">
      <section class="toolbar-card">
        <div>
          <h2>🏷️ Knowledge Tags</h2>

          <p>
            {{ allKnowledgeTags.length }}
            tag{{ allKnowledgeTags.length === 1 ? '' : 's' }}
          </p>
        </div>

        <button
          class="new-tag-btn"
          type="button"
          @click="showCreateForm = !showCreateForm"
        >
          {{ showCreateForm ? 'Close' : '+ New Tag' }}
        </button>
      </section>

      <section v-if="showCreateForm" class="create-card">
        <div class="create-header">
          <h2>Create Knowledge Tag</h2>

          <p>
            Create topic pages, child topics, schemas, subjects, people,
            methods, projects, or any custom kind you need.
          </p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Name</label>

            <input
              v-model="newTag.name"
              type="text"
              placeholder="Photosynthesis, Case Law, Primary Source..."
            />
          </div>

          <div class="form-group">
            <label>Kind</label>

            <input
              v-model.trim="newTag.kind"
              type="text"
              list="knowledge-tag-kind-options"
              placeholder="Choose or enter any kind"
            />

            <datalist id="knowledge-tag-kind-options">
              <option
                v-for="kind in kindSuggestions"
                :key="kind"
                :value="kind"
              ></option>
            </datalist>
          </div>

          <div class="form-group">
            <label>Parent Tag</label>

            <select v-model="newTag.parentId">
              <option :value="null">No parent</option>

              <option
                v-for="tag in allKnowledgeTags"
                :key="tag.id"
                :value="tag.id"
              >
                {{ tag.icon || getKindIcon(tag.kind) }} {{ tag.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Icon</label>

            <input
              v-model="newTag.icon"
              type="text"
              placeholder="🏷️"
            />
          </div>

          <div class="form-group">
            <label>Color</label>

            <input
              v-model="newTag.color"
              type="color"
              aria-label="Knowledge tag color"
            />
          </div>

          <div class="form-group wide">
            <label>Description</label>

            <textarea
              v-model="newTag.description"
              placeholder="What does this topic, schema, or shortcut represent?"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Supertags</label>

            <input
              v-model="newTag.supertagsInput"
              type="text"
              placeholder="topic, theology, schema"
            />
          </div>

          <div class="form-group">
            <label>Aliases</label>

            <input
              v-model="newTag.aliasesInput"
              type="text"
              placeholder="Christ, Anointed One"
            />
          </div>
        </div>

        <div v-if="knowledgeTagsError" class="error-box">
          {{ knowledgeTagsError }}
        </div>

        <div class="create-actions">
          <button
            class="secondary-btn"
            type="button"
            @click="resetForm"
          >
            Cancel
          </button>

          <button
            class="create-btn"
            type="button"
            :disabled="!newTag.name.trim()"
            @click="handleCreateTag"
          >
            Create Tag
          </button>
        </div>
      </section>

      <section class="content-card">
        <div class="browse-toolbar">
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Search knowledge tags..."
          />

          <select v-model="kindFilter" class="sort-select">
            <option value="all">All kinds</option>

            <option
              v-for="kind in availableKinds"
              :key="kind"
              :value="kind"
            >
              {{ getKindLabel(kind) }}
            </option>
          </select>
        </div>

        <div v-if="isLoadingKnowledgeTags" class="empty">
          Loading knowledge tags...
        </div>

        <div v-else-if="visibleTags.length === 0" class="empty">
          No knowledge tags found yet.
        </div>

        <div v-else class="tag-grid">
          <article
            v-for="tag in visibleTags"
            :key="tag.id"
            class="tag-card"
            role="link"
            tabindex="0"
            :aria-label="`Open ${tag.name} tag page`"
            @click="openTag(tag)"
            @keydown.enter.prevent="openTag(tag)"
            @keydown.space.prevent="openTag(tag)"
          >
            <div class="tag-card-header">
              <div class="tag-title-area">
                <div class="tag-title-line">
                  <span class="tag-main-icon">
                    {{ tag.icon || getKindIcon(tag.kind) }}
                  </span>

                  <h3>{{ tag.name }}</h3>
                </div>

                <p>{{ getKindLabel(tag.kind) }}</p>
              </div>

              <button
                v-if="getParentTag(tag.parentId)"
                class="parent-pill"
                type="button"
                @click.stop="openTag(getParentTag(tag.parentId))"
              >
                Parent: {{ getParentName(tag.parentId) }}
              </button>
            </div>

            <p v-if="tag.description" class="tag-description">
              {{ tag.description }}
            </p>

            <div
              v-if="getChildTags(tag.id).length"
              class="child-section"
            >
              <strong>Child tags</strong>

              <div class="pill-row">
                <button
                  v-for="child in getChildTags(tag.id)"
                  :key="child.id"
                  class="tag-pill"
                  type="button"
                  @click.stop="openTag(child)"
                >
                  {{ child.icon || getKindIcon(child.kind) }}
                  {{ child.name }}
                </button>
              </div>
            </div>

            <div
              v-if="tag.supertags?.length"
              class="supertag-section"
            >
              <strong>Supertags</strong>

              <div class="pill-row">
                <button
                  v-for="supertag in tag.supertags"
                  :key="supertag"
                  class="schema-pill"
                  type="button"
                  @click.stop="openNamedTag(supertag)"
                >
                  #{{ supertag }}
                </button>
              </div>
            </div>

            <div v-if="tag.aliases?.length" class="alias-section">
              <strong>Also known as</strong>

              <div class="pill-row">
                <button
                  v-for="alias in tag.aliases"
                  :key="alias"
                  class="alias-pill"
                  type="button"
                  @click.stop="openTag(tag)"
                >
                  {{ alias }}
                </button>
              </div>
            </div>

            <div class="open-tag-row">
              <span>View everything tagged {{ tag.name }}</span>
              <strong>→</strong>
            </div>
          </article>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import { useKnowledgeTags } from '../composables/useKnowledgeTags'

const router = useRouter()

const {
  allKnowledgeTags,
  isLoadingKnowledgeTags,
  knowledgeTagsError,
  loadKnowledgeTagSystem,
  createKnowledgeTag,
  getChildTags,
  clearKnowledgeTagsError,
} = useKnowledgeTags()

const defaultKindSuggestions = [
  'topic',
  'subject',
  'subtopic',
  'schema',
  'shortcut',
  'person',
  'place',
  'organization',
  'method',
  'vocabulary',
  'source-type',
  'project',
  'course',
  'discipline',
  'doctrine',
  'passage',
]

const showCreateForm = ref(false)
const searchQuery = ref('')
const kindFilter = ref('all')

const newTag = ref(getEmptyTagForm())

onMounted(async () => {
  await loadKnowledgeTagSystem()
})

const availableKinds = computed(() => {
  return [
    ...new Set(
      allKnowledgeTags.value
        .map((tag) =>
          String(tag.kind || 'topic')
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    getKindLabel(a).localeCompare(
      getKindLabel(b),
    ),
  )
})

const kindSuggestions = computed(() => {
  return [
    ...new Set([
      ...defaultKindSuggestions,
      ...availableKinds.value,
    ]),
  ].sort((a, b) =>
    getKindLabel(a).localeCompare(
      getKindLabel(b),
    ),
  )
})

const visibleTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return allKnowledgeTags.value
    .filter((tag) => {
      if (
        kindFilter.value !== 'all' &&
        tag.kind !== kindFilter.value
      ) {
        return false
      }

      const searchable = [
        tag.name,
        tag.kind,
        tag.description,
        ...(tag.supertags || []),
        ...(tag.aliases || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
    .sort((a, b) => {
      if (!a.parentId && b.parentId) return -1
      if (a.parentId && !b.parentId) return 1

      return a.name.localeCompare(b.name)
    })
})

function getEmptyTagForm() {
  return {
    name: '',
    kind: 'topic',
    parentId: null,
    description: '',
    supertagsInput: '',
    aliasesInput: '',
    icon: '',
    color: '#cca44b',
  }
}

function parseCommaList(text) {
  return String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function handleCreateTag() {
  const created = await createKnowledgeTag({
    name: newTag.value.name,
    kind: newTag.value.kind,
    parentId: newTag.value.parentId,
    description: newTag.value.description,
    supertags: parseCommaList(newTag.value.supertagsInput),
    aliases: parseCommaList(newTag.value.aliasesInput),
    icon: newTag.value.icon,
    color: newTag.value.color,
  })

  if (created) {
    resetForm()
  }
}

function resetForm() {
  clearKnowledgeTagsError()
  newTag.value = getEmptyTagForm()
  showCreateForm.value = false
}

function openTag(tag) {
  if (!tag?.id) {
    return
  }

  router.push(`/knowledge-tags/${tag.id}`)
}

function openNamedTag(name) {
  const matchingTag = allKnowledgeTags.value.find((tag) => {
    const names = [
      tag.name,
      ...(tag.aliases || []),
    ]

    return names.some((value) => {
      return normalizeTag(value) === normalizeTag(name)
    })
  })

  if (matchingTag) {
    openTag(matchingTag)
    return
  }

  router.push({
    path: `/knowledge-tags/${slugifyTag(name)}`,
    query: {
      name,
    },
  })
}

function getParentTag(parentId) {
  if (!parentId) {
    return null
  }

  return (
    allKnowledgeTags.value.find((tag) => {
      return String(tag.id) === String(parentId)
    }) || null
  )
}

function getParentName(parentId) {
  return getParentTag(parentId)?.name || ''
}

function normalizeTag(text) {
  return slugifyTag(text)
}

function slugifyTag(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function getKindLabel(kind) {
  const labels = {
    topic: 'Topic',
    subject: 'Subject',
    subtopic: 'Subtopic',
    schema: 'Schema / Supertag',
    shortcut: 'Shortcut',
    person: 'Person',
    place: 'Place',
    organization: 'Organization',
    method: 'Method',
    vocabulary: 'Vocabulary',
    'source-type': 'Source Type',
    project: 'Project',
    course: 'Course',
    discipline: 'Discipline',
    doctrine: 'Doctrine',
    passage: 'Bible Passage',
  }

  if (labels[kind]) {
    return labels[kind]
  }

  return String(kind || 'Tag')
    .replace(/[_-]+/g, ' ')
    .replace(/\w/g, (letter) =>
      letter.toUpperCase(),
    )
}

function getKindIcon(kind) {
  const icons = {
    topic: '🌐',
    subject: '📘',
    subtopic: '↳',
    schema: '▣',
    shortcut: '⚡',
    person: '👤',
    place: '📍',
    organization: '🏢',
    method: '🧭',
    vocabulary: '🔤',
    'source-type': '📚',
    project: '📁',
    course: '🎓',
    discipline: '🧠',
    doctrine: '📖',
    passage: '🔖',
  }

  return icons[kind] || '🏷️'
}
</script>

<style scoped>
.knowledge-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.5rem 2rem 5rem;
}

.toolbar-card,
.create-card,
.content-card {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  padding: 1.2rem;
  box-shadow: var(--shadow);
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.toolbar-card h2,
.create-header h2 {
  margin: 0;
}

.toolbar-card p,
.create-header p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.new-tag-btn,
.create-btn,
.secondary-btn {
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.new-tag-btn,
.create-btn {
  border: none;
  background: var(--accent);
  color: white;
}

.create-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(220px, 1fr)
  );
  gap: 0.9rem;
  margin-top: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group.wide {
  grid-column: 1 / -1;
}

.form-group label {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.form-group input,
.form-group textarea,
.form-group select,
.search-input,
.sort-select {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.7rem;
  font: inherit;
}

.form-group textarea {
  min-height: 90px;
  resize: vertical;
}

.create-actions,
.browse-toolbar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.create-actions {
  justify-content: flex-end;
}

.search-input {
  flex: 1;
}

.error-box {
  margin-top: 1rem;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.empty {
  color: var(--text-muted);
  padding: 1rem 0;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  );
  gap: 1rem;
  margin-top: 1rem;
}

.tag-card {
  display: flex;
  flex-direction: column;
  min-height: 210px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 1rem;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.tag-card:hover {
  border-color: var(--accent);
  box-shadow: 0 12px 28px rgba(10, 31, 68, 0.12);
  transform: translateY(-2px);
}

.tag-card:focus-visible {
  outline: 3px solid var(--accent-soft);
  outline-offset: 3px;
  border-color: var(--accent);
}

.tag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.tag-title-area {
  min-width: 0;
}

.tag-title-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.tag-main-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.tag-card h3 {
  overflow: hidden;
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-card-header p,
.tag-description {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.tag-card-header p {
  margin: 0.25rem 0 0;
}

.tag-description {
  margin: 0.85rem 0;
  line-height: 1.5;
}

.parent-pill,
.tag-pill,
.schema-pill,
.alias-pill {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  padding: 0.25rem 0.5rem;
  font: inherit;
  font-size: 0.72rem;
  white-space: nowrap;
  cursor: pointer;
}

.parent-pill {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.tag-pill,
.alias-pill {
  color: var(--text-secondary);
}

.schema-pill {
  color: var(--accent-text);
}

.parent-pill:hover,
.tag-pill:hover,
.schema-pill:hover,
.alias-pill:hover {
  border-color: var(--accent);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.child-section,
.supertag-section,
.alias-section {
  margin: 0.85rem 0 0;
}

.child-section > strong,
.supertag-section > strong,
.alias-section > strong {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.open-tag-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding-top: 0.85rem;
  color: var(--accent-text);
  font-size: 0.78rem;
  font-weight: 800;
}

.open-tag-row strong {
  font-size: 1rem;
}

@media (max-width: 700px) {
  .knowledge-page {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .toolbar-card,
  .browse-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .new-tag-btn,
  .sort-select {
    width: 100%;
  }

  .tag-grid {
    grid-template-columns: 1fr;
  }
}
</style>