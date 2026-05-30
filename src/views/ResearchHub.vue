<template>
  <AppLayout
    title="Research Hub"
    subtitle="Connected knowledge, sources, notes, and graph relationships"
    banner-key="research"
    default-icon="🔎"
  >
    <section class="create-card">
      <h2>➕ Create Research Item</h2>

      <div v-if="researchError" class="error-box">
        {{ researchError }}
      </div>

      <div class="form-group">
        <label>Title</label>
        <input v-model="newTitle" type="text" placeholder="Enter a title..." />
      </div>

      <div class="form-group">
        <label>Summary</label>
        <textarea v-model="newSummary" placeholder="Add a quick summary..."></textarea>
      </div>

      <div class="form-group">
        <label>Object Type</label>
        <select v-model="selectedType">
          <option v-for="type in researchTypes" :key="type.id" :value="type.id">
            {{ type.icon }} {{ type.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Topic Tags</label>
        <input v-model="topicTagsInput" type="text" placeholder="Paul, Messiah, Theology" />
      </div>

      <div v-if="suggestedTopicTags.length" class="suggestions-box">
        <div class="suggestions-title">Suggested Topic Tags</div>

        <div class="suggestions-row">
          <button
            v-for="tag in suggestedTopicTags"
            :key="tag"
            type="button"
            class="suggestion-chip"
            @click="addSuggestedTag(tag)"
          >
            + {{ tag }}
          </button>
        </div>
      </div>

      <section v-if="selectedResearchType" class="metadata-section">
        <h3>📋 Source Details</h3>

        <div v-for="field in selectedResearchType.fields" :key="field" class="form-group">
          <label>{{ formatFieldName(field) }}</label>
          <input
            v-model="metadata[field]"
            type="text"
            :placeholder="`Enter ${formatFieldName(field)}`"
          />
        </div>
      </section>

      <button class="create-btn" :disabled="isLoadingResearch" @click="createItem">
        {{ isLoadingResearch ? 'Saving...' : 'Create Item' }}
      </button>
    </section>

    <section class="filter-card">
      <div class="form-group">
        <label>Search Research Hub</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search title, summary, tags, type..."
        />
      </div>

      <div class="form-group">
        <label>Filter by Object Type</label>
        <select v-model="selectedFilter">
          <option value="all">🌐 All Items</option>
          <option v-for="type in researchTypes" :key="type.id" :value="type.id">
            {{ type.icon }} {{ type.name }}
          </option>
        </select>
      </div>
    </section>

    <div v-if="isLoadingResearch && allResearchItems.length === 0" class="loading-card">
      Loading research items...
    </div>

    <div class="research-grid">
      <section class="card">
        <div class="card-header">
          <h2>🕸️ Knowledge Graph</h2>
          <span>{{ filteredGraphNodes.length }} nodes</span>
        </div>

        <ResearchGraph :nodes="filteredGraphNodes" :edges="filteredGraphEdges" />
      </section>

      <section class="card">
        <div class="card-header">
          <h2>🧠 Research Items</h2>
          <span>{{ filteredItems.length }} items</span>
        </div>

        <div v-if="filteredItems.length === 0" class="empty">
          No research items match your search.
        </div>

        <div v-else class="items-list">
          <RouterLink
            v-for="item in filteredItems"
            :key="item.id"
            :to="`/research/items/${item.id}`"
            class="research-item-link"
          >
            <article class="research-item">
              <div class="item-top">
                <span class="item-icon">{{ getItemIcon(item) }}</span>

                <div class="item-info">
                  <div class="item-title">{{ item.title }}</div>
                  <div class="item-summary">{{ item.summary }}</div>
                </div>
              </div>

              <div class="tag-row">
                <span v-for="tag in item.supertags" :key="tag" class="tag">
                  #{{ tag }}
                </span>
              </div>

              <div v-if="item.topicTags?.length" class="topic-row">
                <span v-for="tag in item.topicTags" :key="tag" class="topic-tag">
                  {{ tag }}
                </span>
              </div>
            </article>
          </RouterLink>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import ResearchGraph from '../components/ResearchGraph.vue'
import { useResearch } from '../composables/useResearch'
import { researchTypes, getResearchTypeById } from '../data/researchTypes'
import { suggestTopicTags } from '../utils/topicSuggestions'

const {
  allResearchItems,
  graphNodes,
  graphEdges,
  addResearchItem,
  loadResearchItems,
  isLoadingResearch,
  researchError
} = useResearch()

const newTitle = ref('')
const newSummary = ref('')
const selectedType = ref('note')
const topicTagsInput = ref('')
const metadata = ref({})
const selectedFilter = ref('all')
const searchQuery = ref('')

const selectedResearchType = computed(() => {
  return getResearchTypeById(selectedType.value)
})

const suggestedTopicTags = computed(() => {
  const existingTags = parseTopicTags(topicTagsInput.value).map((tag) => tag.toLowerCase())

  return suggestTopicTags(newTitle.value, newSummary.value).filter(
    (tag) => !existingTags.includes(tag.toLowerCase())
  )
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return allResearchItems.value.filter((item) => {
    const matchesType =
      selectedFilter.value === 'all' || item.type === selectedFilter.value

    const typeName =
      getResearchTypeById(item.type)?.name?.toLowerCase() || ''

    const searchableText = [
      item.title,
      item.summary,
      item.type,
      typeName,
      ...(item.supertags || []),
      ...(item.topicTags || []),
      ...Object.values(item.metadata || {})
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = !query || searchableText.includes(query)

    return matchesType && matchesSearch
  })
})

const filteredGraphNodes = computed(() => {
  const visibleIds = new Set(filteredItems.value.map((item) => item.id))
  return graphNodes.value.filter((node) => visibleIds.has(node.id))
})

const filteredGraphEdges = computed(() => {
  const visibleNodeIds = new Set(filteredGraphNodes.value.map((node) => node.id))

  return graphEdges.value.filter(
    (edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
  )
})

onMounted(() => {
  loadResearchItems()
})

watch(selectedType, () => {
  metadata.value = {}
})

function parseTopicTags(text) {
  return text
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function addSuggestedTag(tag) {
  const currentTags = parseTopicTags(topicTagsInput.value)

  if (currentTags.some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase())) {
    return
  }

  currentTags.push(tag)
  topicTagsInput.value = currentTags.join(', ')
}

async function createItem() {
  if (!newTitle.value.trim()) return

  const type = getResearchTypeById(selectedType.value)

  await addResearchItem({
    title: newTitle.value,
    summary: newSummary.value,
    type: selectedType.value,
    supertags: type?.defaultSupertags || ['note'],
    topicTags: parseTopicTags(topicTagsInput.value),
    links: [],
    metadata: metadata.value
  })

  newTitle.value = ''
  newSummary.value = ''
  selectedType.value = 'note'
  topicTagsInput.value = ''
  metadata.value = {}
}

function getItemIcon(item) {
  const type = getResearchTypeById(item.type)
  return type?.icon || '📄'
}

function formatFieldName(field) {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
}
</script>

<style scoped>
.create-card,
.filter-card,
.loading-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: var(--shadow);
}

.create-card h2,
.metadata-section h3 {
  margin: 0;
}

.error-box {
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea,
.form-group select {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.7rem;
  color: var(--text-primary);
  font: inherit;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.suggestions-box {
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--btn-bg);
}

.suggestions-title {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.suggestions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.suggestion-chip {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
}

.suggestion-chip:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.metadata-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: 0.5rem;
}

.create-btn {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.research-grid {
  display: grid;
  gap: 1rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.2rem;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty {
  color: var(--text-muted);
  margin-top: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.research-item-link {
  text-decoration: none;
  color: inherit;
}

.research-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.85rem;
  background: var(--btn-bg);
}

.item-top {
  display: flex;
  gap: 0.75rem;
}

.item-icon {
  font-size: 1.2rem;
}

.item-title {
  font-weight: 600;
}

.item-summary {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.tag-row,
.topic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.topic-row {
  margin-top: 0.45rem;
}

.tag {
  background: var(--accent-soft);
  color: var(--accent-text);
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72rem;
}

.topic-tag {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72rem;
}
</style>