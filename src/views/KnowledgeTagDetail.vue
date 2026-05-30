<template>
  <AppLayout
    :title="tag?.name || 'Knowledge Tag'"
    subtitle="Knowledge graph tag detail"
    banner-key="knowledge-tags"
    default-icon="🏷️"
  >
    <main class="tag-detail-page">
      <section v-if="tag" class="tag-header">
        <div class="tag-icon">{{ tag.icon || getKindIcon(tag.kind) }}</div>

        <div>
          <p class="breadcrumb">Knowledge Tags / {{ tag.name }}</p>
          <h1>{{ tag.name }}</h1>
          <p class="tag-description">
            {{ tag.description || 'No description yet.' }}
          </p>
        </div>
      </section>

      <section v-if="tag" class="stats-grid">
        <div class="stat-card">
          <span>Linked Sources</span>
          <strong>{{ linkedSources.length }}</strong>
        </div>

        <div class="stat-card">
          <span>Child Tags</span>
          <strong>{{ childTags.length }}</strong>
        </div>

        <div class="stat-card">
          <span>Related Tags</span>
          <strong>{{ relatedTags.length }}</strong>
        </div>
      </section>

      <section v-if="tag" class="properties-list">
        <div class="property-row">
          <span>Kind</span>
          <strong>{{ getKindLabel(tag.kind) }}</strong>
        </div>

        <div class="property-row">
          <span>Parent Tag</span>
          <strong>
            <RouterLink
              v-if="parentTag"
              :to="`/knowledge-tags/${parentTag.id}`"
              class="inline-link"
            >
              {{ parentTag.icon || getKindIcon(parentTag.kind) }} {{ parentTag.name }}
            </RouterLink>

            <span v-else>—</span>
          </strong>
        </div>

        <div class="property-row">
          <span>Aliases</span>
          <strong>{{ tag.aliases?.length ? tag.aliases.join(', ') : '—' }}</strong>
        </div>

        <div class="property-row">
          <span>Supertags</span>
          <strong>{{ tag.supertags?.length ? tag.supertags.join(', ') : '—' }}</strong>
        </div>
      </section>

      <section v-if="tag && childTags.length" class="linked-section">
        <h2>Child Tags</h2>

        <div class="tag-pill-grid">
          <RouterLink
            v-for="child in childTags"
            :key="child.id"
            :to="`/knowledge-tags/${child.id}`"
            class="tag-pill-card"
          >
            {{ child.icon || getKindIcon(child.kind) }} {{ child.name }}
          </RouterLink>
        </div>
      </section>

      <section v-if="tag" class="linked-section">
        <h2>Related Tags</h2>

        <p v-if="relatedTags.length === 0" class="muted-text">
          No related tags found yet. Related tags appear when tags share linked sources.
        </p>

        <div v-else class="tag-pill-grid">
          <RouterLink
            v-for="related in relatedTags"
            :key="related.tag.id"
            :to="`/knowledge-tags/${related.tag.id}`"
            class="tag-pill-card"
          >
            {{ related.tag.icon || getKindIcon(related.tag.kind) }} {{ related.tag.name }}
            <span>{{ related.sharedCount }} shared</span>
          </RouterLink>
        </div>
      </section>

      <section v-if="tag" class="linked-section">
        <h2>Linked Research Sources</h2>

        <p v-if="linkedSources.length === 0" class="muted-text">
          No research sources are connected to this tag yet.
        </p>

        <RouterLink
          v-for="source in linkedSources"
          :key="source.id"
          :to="`/research/items/${source.id}`"
          class="source-card"
        >
          <div class="source-icon">{{ getItemIcon(source) }}</div>

          <div>
            <h3>{{ source.title }}</h3>
            <p>{{ source.summary || 'No summary yet.' }}</p>
          </div>
        </RouterLink>
      </section>

      <section v-else class="tag-detail-page">
        <h1>Loading tag...</h1>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import { useKnowledgeTags } from '../composables/useKnowledgeTags'
import { useResearch } from '../composables/useResearch'
import { getResearchTypeById } from '../data/researchTypes'

const route = useRoute()

const {
  allKnowledgeTags,
  allResearchItemTags,
  loadKnowledgeTags,
  loadResearchItemTags,
  getChildTags
} = useKnowledgeTags()

const {
  loadResearchItems,
  getResearchItemById
} = useResearch()

const tag = computed(() => {
  return allKnowledgeTags.value.find((item) => item.id === route.params.id)
})

const parentTag = computed(() => {
  if (!tag.value?.parentId) return null
  return allKnowledgeTags.value.find((item) => item.id === tag.value.parentId) || null
})

const childTags = computed(() => {
  if (!tag.value) return []
  return getChildTags(tag.value.id)
})

const linkedSourceIds = computed(() => {
  if (!tag.value) return []

  return allResearchItemTags.value
    .filter((link) => link.knowledgeTagId === tag.value.id)
    .map((link) => link.researchItemId)
})

const linkedSources = computed(() => {
  return linkedSourceIds.value
    .map((id) => getResearchItemById(id))
    .filter(Boolean)
})

const relatedTags = computed(() => {
  if (!tag.value) return []

  const sourceIdSet = new Set(linkedSourceIds.value)
  const relatedMap = new Map()

  allResearchItemTags.value.forEach((link) => {
    if (!sourceIdSet.has(link.researchItemId)) return
    if (link.knowledgeTagId === tag.value.id) return

    const current = relatedMap.get(link.knowledgeTagId) || 0
    relatedMap.set(link.knowledgeTagId, current + 1)
  })

  return Array.from(relatedMap.entries())
    .map(([tagId, sharedCount]) => ({
      tag: allKnowledgeTags.value.find((item) => item.id === tagId),
      sharedCount
    }))
    .filter((item) => item.tag)
    .sort((a, b) => b.sharedCount - a.sharedCount)
})

onMounted(async () => {
  await loadKnowledgeTags()
  await loadResearchItemTags()
  await loadResearchItems()
})

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
.tag-detail-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.5rem 2rem 8rem;
  color: var(--text-primary);
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.tag-icon {
  width: 76px;
  height: 76px;
  border-radius: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: grid;
  place-items: center;
  font-size: 2.25rem;
  box-shadow: var(--shadow);
}

.breadcrumb {
  margin: 0 0 0.35rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.tag-header h1 {
  margin: 0;
  font-size: 2.25rem;
  letter-spacing: -0.04em;
}

.tag-description {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow);
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

.properties-list {
  margin: 1.5rem 0 3rem;
  max-width: 820px;
}

.property-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1.25rem;
  align-items: center;
  padding: 0.65rem 0;
}

.property-row span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.property-row strong {
  font-weight: 500;
  color: var(--text-primary);
}

.linked-section {
  margin: 2.25rem 0;
}

.linked-section h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.muted-text {
  color: var(--text-muted);
}

.inline-link {
  color: var(--accent);
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.tag-pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag-pill-card {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.45rem 0.7rem;
  text-decoration: none;
  font-size: 0.85rem;
}

.tag-pill-card:hover {
  border-color: var(--accent);
}

.tag-pill-card span {
  color: var(--text-muted);
  margin-left: 0.35rem;
}

.source-card {
  display: flex;
  gap: 0.9rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-decoration: none;
}

.source-card:hover {
  border-color: var(--accent);
}

.source-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--btn-bg);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.source-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
}

.source-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.88rem;
}
</style>