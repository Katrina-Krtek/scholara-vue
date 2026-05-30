<template>
  <AppLayout
    title="Knowledge Graph"
    subtitle="Search, filter, and explore your tag-to-source relationships."
    banner-key="knowledge-graph"
    default-icon="🕸️"
  >
    <main class="graph-page">
      <section class="stats-grid">
        <div class="stat-card">
          <span>Knowledge Tags</span>
          <strong>{{ allKnowledgeTags.length }}</strong>
        </div>

        <div class="stat-card">
          <span>Research Sources</span>
          <strong>{{ allResearchItems.length }}</strong>
        </div>

        <div class="stat-card">
          <span>Tag Connections</span>
          <strong>{{ allResearchItemTags.length }}</strong>
        </div>

        <div class="stat-card">
          <span>Visible Rows</span>
          <strong>{{ visibleRows.length }}</strong>
        </div>
      </section>

      <section class="graph-card">
        <div class="graph-header">
          <div>
            <h2>Graph Explorer</h2>
            <p>Collapsed by default so the graph stays usable as your library grows.</p>
          </div>

          <button class="secondary-btn" type="button" @click="collapseAll">
            Collapse All
          </button>
        </div>

        <div class="graph-controls">
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Search tags or connected sources..."
          />

          <select v-model="kindFilter" class="filter-select">
            <option value="all">All kinds</option>
            <option value="topic">Topics</option>
            <option value="subtopic">Subtopics</option>
            <option value="schema">Schemas / Supertags</option>
            <option value="shortcut">Shortcuts</option>
            <option value="doctrine">Doctrines</option>
            <option value="person">People</option>
            <option value="passage">Bible Passages</option>
          </select>

          <select v-model="sortMode" class="filter-select">
            <option value="connections">Most connected</option>
            <option value="name">A–Z</option>
          </select>
        </div>

        <div v-if="filteredRows.length === 0" class="empty">
          No graph relationships match your current search or filters.
        </div>

        <div v-else class="graph-list">
          <article
            v-for="row in visibleRows"
            :key="row.tag.id"
            class="graph-row"
          >
            <button
              class="row-toggle"
              type="button"
              @click="toggleRow(row.tag.id)"
            >
              <span>{{ isExpanded(row.tag.id) ? '▼' : '▶' }}</span>
            </button>

            <div class="row-main">
              <div class="row-summary">
                <RouterLink
                  :to="`/knowledge-tags/${row.tag.id}`"
                  class="tag-node"
                >
                  {{ row.tag.icon || getKindIcon(row.tag.kind) }} {{ row.tag.name }}
                </RouterLink>

                <div class="row-meta">
                  <span>{{ getKindLabel(row.tag.kind) }}</span>
                  <span>{{ row.sources.length }} source{{ row.sources.length === 1 ? '' : 's' }}</span>
                </div>
              </div>

              <div v-if="isExpanded(row.tag.id)" class="source-node-list">
                <RouterLink
                  v-for="source in row.sources"
                  :key="source.id"
                  :to="`/research/items/${source.id}`"
                  class="source-node"
                >
                  {{ getItemIcon(source) }} {{ source.title }}
                </RouterLink>
              </div>
            </div>
          </article>
        </div>

        <div v-if="canShowMore" class="show-more-row">
          <button class="show-more-btn" type="button" @click="showMore">
            Show More Tags
          </button>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import { useKnowledgeTags } from '../composables/useKnowledgeTags'
import { useResearch } from '../composables/useResearch'
import { getResearchTypeById } from '../data/researchTypes'

const {
  allKnowledgeTags,
  allResearchItemTags,
  loadKnowledgeTags,
  loadResearchItemTags
} = useKnowledgeTags()

const {
  allResearchItems,
  loadResearchItems,
  getResearchItemById
} = useResearch()

const searchQuery = ref('')
const kindFilter = ref('all')
const sortMode = ref('connections')
const visibleLimit = ref(25)
const expandedRows = ref(new Set())

const graphRows = computed(() => {
  return allKnowledgeTags.value
    .map((tag) => {
      const sources = allResearchItemTags.value
        .filter((link) => link.knowledgeTagId === tag.id)
        .map((link) => getResearchItemById(link.researchItemId))
        .filter(Boolean)

      return {
        tag,
        sources
      }
    })
    .filter((row) => row.sources.length > 0)
})

const filteredRows = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return graphRows.value
    .filter((row) => {
      if (kindFilter.value !== 'all' && row.tag.kind !== kindFilter.value) {
        return false
      }

      if (!query) return true

      const searchable = [
        row.tag.name,
        row.tag.kind,
        row.tag.description,
        ...(row.tag.aliases || []),
        ...(row.tag.supertags || []),
        ...row.sources.map((source) => source.title),
        ...row.sources.map((source) => source.summary || '')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
    .sort((a, b) => {
      if (sortMode.value === 'name') {
        return a.tag.name.localeCompare(b.tag.name)
      }

      return b.sources.length - a.sources.length
    })
})

const visibleRows = computed(() => {
  return filteredRows.value.slice(0, visibleLimit.value)
})

const canShowMore = computed(() => {
  return visibleRows.value.length < filteredRows.value.length
})

onMounted(async () => {
  await loadResearchItems()
  await loadKnowledgeTags()
  await loadResearchItemTags()
})

function toggleRow(tagId) {
  const next = new Set(expandedRows.value)

  if (next.has(tagId)) {
    next.delete(tagId)
  } else {
    next.add(tagId)
  }

  expandedRows.value = next
}

function isExpanded(tagId) {
  return expandedRows.value.has(tagId)
}

function collapseAll() {
  expandedRows.value = new Set()
}

function showMore() {
  visibleLimit.value += 25
}

function getItemIcon(researchItem) {
  const type = getResearchTypeById(researchItem.type)
  return type?.icon || '📄'
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
.graph-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.5rem 2rem 6rem;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card,
.graph-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow);
}

.stat-card {
  padding: 1rem;
}

.stat-card span {
  display: block;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.stat-card strong {
  font-size: 1.6rem;
}

.graph-card {
  padding: 1.2rem;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.graph-header h2 {
  margin: 0;
}

.graph-header p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.graph-controls {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 190px 170px;
  gap: 0.75rem;
  margin-top: 1rem;
}

.search-input,
.filter-select {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0.7rem;
  font: inherit;
}

.secondary-btn,
.show-more-btn {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.secondary-btn:hover,
.show-more-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.empty {
  color: var(--text-muted);
  padding: 1rem 0;
}

.graph-list {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.graph-row {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 0.85rem;
}

.row-toggle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
}

.row-toggle:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.row-main {
  min-width: 0;
}

.row-summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.tag-node,
.source-node {
  text-decoration: none;
  color: var(--text-primary);
}

.tag-node {
  font-weight: 700;
}

.tag-node:hover,
.source-node:hover {
  color: var(--accent);
}

.row-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.row-meta span {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.source-node-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-color);
}

.source-node {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  padding: 0.4rem 0.65rem;
  font-size: 0.82rem;
}

.source-node:hover {
  border-color: var(--accent);
}

.show-more-row {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

@media (max-width: 820px) {
  .graph-controls {
    grid-template-columns: 1fr;
  }

  .graph-header,
  .row-summary {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>