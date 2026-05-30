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
          <p>{{ allKnowledgeTags.length }} tag{{ allKnowledgeTags.length === 1 ? '' : 's' }}</p>
        </div>

        <button class="new-tag-btn" type="button" @click="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Close' : '+ New Tag' }}
        </button>
      </section>

      <section v-if="showCreateForm" class="create-card">
        <div class="create-header">
          <h2>Create Knowledge Tag</h2>
          <p>Create topic pages, child topics, schema tags, and shortcut tags.</p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newTag.name" type="text" placeholder="Messiah, Paul, Book, Primary Source..." />
          </div>

          <div class="form-group">
            <label>Kind</label>
            <select v-model="newTag.kind">
              <option value="topic">Topic</option>
              <option value="subtopic">Subtopic</option>
              <option value="schema">Schema / Supertag</option>
              <option value="shortcut">Shortcut</option>
              <option value="doctrine">Doctrine</option>
              <option value="person">Person</option>
              <option value="passage">Bible Passage</option>
            </select>
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
                {{ tag.icon || '🏷️' }} {{ tag.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Icon</label>
            <input v-model="newTag.icon" type="text" placeholder="🏷️" />
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
            <input v-model="newTag.supertagsInput" type="text" placeholder="topic, theology, schema" />
          </div>

          <div class="form-group">
            <label>Aliases</label>
            <input v-model="newTag.aliasesInput" type="text" placeholder="Christ, Anointed One" />
          </div>
        </div>

        <div v-if="knowledgeTagsError" class="error-box">
          {{ knowledgeTagsError }}
        </div>

        <div class="create-actions">
          <button class="secondary-btn" type="button" @click="resetForm">
            Cancel
          </button>

          <button class="create-btn" type="button" @click="handleCreateTag">
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
            <option value="topic">Topics</option>
            <option value="subtopic">Subtopics</option>
            <option value="schema">Schemas / Supertags</option>
            <option value="shortcut">Shortcuts</option>
            <option value="doctrine">Doctrines</option>
            <option value="person">People</option>
            <option value="passage">Bible Passages</option>
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
          >
            <div class="tag-card-header">
              <div>
                <h3>{{ tag.icon || getKindIcon(tag.kind) }} {{ tag.name }}</h3>
                <p>{{ getKindLabel(tag.kind) }}</p>
              </div>

              <span v-if="getParentName(tag.parentId)" class="parent-pill">
                Parent: {{ getParentName(tag.parentId) }}
              </span>
            </div>

            <p v-if="tag.description" class="tag-description">
              {{ tag.description }}
            </p>

            <div v-if="getChildTags(tag.id).length" class="child-section">
              <strong>Child tags</strong>

              <div class="pill-row">
                <span
                  v-for="child in getChildTags(tag.id)"
                  :key="child.id"
                  class="tag-pill"
                >
                  {{ child.icon || getKindIcon(child.kind) }} {{ child.name }}
                </span>
              </div>
            </div>

            <div v-if="tag.supertags?.length" class="pill-row">
              <span
                v-for="supertag in tag.supertags"
                :key="supertag"
                class="schema-pill"
              >
                #{{ supertag }}
              </span>
            </div>

            <div v-if="tag.aliases?.length" class="alias-line">
              Also known as: {{ tag.aliases.join(', ') }}
            </div>
          </article>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import AppLayout from '../components/AppLayout.vue'
import { useKnowledgeTags } from '../composables/useKnowledgeTags'

const {
  allKnowledgeTags,
  isLoadingKnowledgeTags,
  knowledgeTagsError,
  loadKnowledgeTags,
  createKnowledgeTag,
  getChildTags
} = useKnowledgeTags()

const showCreateForm = ref(false)
const searchQuery = ref('')
const kindFilter = ref('all')

const newTag = ref(getEmptyTagForm())

onMounted(() => {
  loadKnowledgeTags()
})

const visibleTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return allKnowledgeTags.value
    .filter((tag) => {
      if (kindFilter.value !== 'all' && tag.kind !== kindFilter.value) {
        return false
      }

      const searchable = [
        tag.name,
        tag.kind,
        tag.description,
        ...(tag.supertags || []),
        ...(tag.aliases || [])
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
    icon: ''
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
    icon: newTag.value.icon
  })

  if (created) {
    resetForm()
  }
}

function resetForm() {
  newTag.value = getEmptyTagForm()
  showCreateForm.value = false
}

function getParentName(parentId) {
  if (!parentId) return ''
  return allKnowledgeTags.value.find((tag) => tag.id === parentId)?.name || ''
}

function getKindLabel(kind) {
  const labels = {
    topic: 'Topic',
    subtopic: 'Subtopic',
    schema: 'Schema / Supertag',
    shortcut: 'Shortcut',
    doctrine: 'Doctrine',
    person: 'Person',
    passage: 'Bible Passage'
  }

  return labels[kind] || 'Tag'
}

function getKindIcon(kind) {
  const icons = {
    topic: '🌐',
    subtopic: '↳',
    schema: '▣',
    shortcut: '⚡',
    doctrine: '📖',
    person: '👤',
    passage: '🔖'
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
  cursor: pointer;
  font-weight: 600;
}

.new-tag-btn,
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
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
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.85rem;
}

.empty {
  color: var(--text-muted);
  padding: 1rem 0;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.tag-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 1rem;
}

.tag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.tag-card h3 {
  margin: 0;
  font-size: 1rem;
}

.tag-card-header p,
.tag-description,
.alias-line {
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
.schema-pill {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.2rem 0.45rem;
  font-size: 0.72rem;
  white-space: nowrap;
}

.parent-pill {
  color: var(--text-secondary);
  background: var(--bg-card);
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.tag-pill {
  color: var(--text-secondary);
  background: var(--bg-card);
}

.schema-pill {
  color: var(--accent);
  background: var(--bg-card);
}

.child-section {
  margin: 0.85rem 0;
}

.child-section strong {
  color: var(--text-secondary);
  font-size: 0.82rem;
}
</style>

