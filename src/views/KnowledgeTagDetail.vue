<template>
  <AppLayout
    :title="resolvedTag?.name || 'Knowledge Tag'"
    subtitle="Everything connected to this research theme"
    banner-key="knowledge-tags"
    default-icon="🏷️"
  >
    <main class="tag-detail-page">
      <section v-if="!hasLoaded" class="loading-state">
        <div class="loading-icon">🏷️</div>
        <h2>Loading tag...</h2>
      </section>

      <template v-else-if="resolvedTag">
        <section class="tag-header">
          <div class="tag-icon">
            {{ resolvedTag.icon || getKindIcon(resolvedTag.kind) }}
          </div>

          <div class="tag-heading">
            <p class="breadcrumb">
              <RouterLink to="/knowledge-tags">
                Knowledge Tags
              </RouterLink>

              <span>/</span>

              {{ resolvedTag.name }}
            </p>

            <h1>{{ resolvedTag.name }}</h1>

            <p class="tag-description">
              {{
                resolvedTag.description ||
                `Every Scholarory record tagged with “${resolvedTag.name}.”`
              }}
            </p>

            <div class="tag-heading-meta">
              <span>
                {{ getKindLabel(resolvedTag.kind) }}
              </span>

              <span v-if="resolvedTag.aliases?.length">
                Aliases: {{ resolvedTag.aliases.join(', ') }}
              </span>
            </div>
          </div>
        </section>

        <section class="stats-grid">
          <article class="stat-card primary-stat">
            <span>All Records</span>
            <strong>{{ totalLinkedRecords }}</strong>
          </article>

          <article class="stat-card">
            <span>Sources</span>
            <strong>{{ sourceMatches.length }}</strong>
          </article>

          <article class="stat-card">
            <span>Books</span>
            <strong>{{ bookMatches.length }}</strong>
          </article>

          <article class="stat-card">
            <span>Journals</span>
            <strong>{{ journalMatches.length }}</strong>
          </article>

          <article class="stat-card">
            <span>Articles</span>
            <strong>{{ articleMatches.length }}</strong>
          </article>

          <article class="stat-card">
            <span>Research Items</span>
            <strong>{{ researchItemMatches.length }}</strong>
          </article>
        </section>

        <section v-if="formalTag" class="properties-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Tag Properties</p>
              <h2>Knowledge tag details</h2>
            </div>
          </div>

          <div class="properties-list">
            <div class="property-row">
              <span>Kind</span>
              <strong>{{ getKindLabel(formalTag.kind) }}</strong>
            </div>

            <div class="property-row">
              <span>Parent Tag</span>

              <strong>
                <RouterLink
                  v-if="parentTag"
                  :to="getTagRoute(parentTag.name, parentTag.id)"
                  class="inline-link"
                >
                  {{ parentTag.icon || getKindIcon(parentTag.kind) }}
                  {{ parentTag.name }}
                </RouterLink>

                <span v-else>—</span>
              </strong>
            </div>

            <div class="property-row">
              <span>Aliases</span>

              <strong>
                {{
                  formalTag.aliases?.length
                    ? formalTag.aliases.join(', ')
                    : '—'
                }}
              </strong>
            </div>

            <div class="property-row">
              <span>Supertags</span>

              <strong>
                {{
                  formalTag.supertags?.length
                    ? formalTag.supertags.join(', ')
                    : '—'
                }}
              </strong>
            </div>
          </div>
        </section>

        <section v-else class="library-tag-notice">
          <span>🏷️</span>

          <div>
            <strong>Library tag</strong>

            <p>
              This tag was found inside your local research records. Scholarory
              is gathering every item that uses the same tag name.
            </p>
          </div>
        </section>

        <section v-if="childTags.length" class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Hierarchy</p>
              <h2>Child tags</h2>
            </div>

            <span class="section-count">
              {{ childTags.length }}
            </span>
          </div>

          <div class="tag-pill-grid">
            <RouterLink
              v-for="child in childTags"
              :key="child.id"
              :to="getTagRoute(child.name, child.id)"
              class="tag-pill-card"
            >
              <span>
                {{ child.icon || getKindIcon(child.kind) }}
                {{ child.name }}
              </span>
            </RouterLink>
          </div>
        </section>

        <section class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Connections</p>
              <h2>Related tags</h2>
            </div>

            <span class="section-count">
              {{ relatedTags.length }}
            </span>
          </div>

          <p v-if="relatedTags.length === 0" class="muted-text">
            Related tags will appear when research records share multiple tags.
          </p>

          <div v-else class="tag-pill-grid">
            <RouterLink
              v-for="related in relatedTags"
              :key="related.slug"
              :to="getTagRoute(related.name)"
              class="tag-pill-card"
            >
              <span>🏷️ {{ related.name }}</span>
              <strong>{{ related.count }}</strong>
            </RouterLink>
          </div>
        </section>

        <section v-if="sourceMatches.length" class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Source Database</p>
              <h2>Sources</h2>
            </div>

            <span class="section-count">
              {{ sourceMatches.length }}
            </span>
          </div>

          <div class="record-grid">
            <RouterLink
              v-for="source in sourceMatches"
              :key="source.id"
              :to="`/sources/${source.id}`"
              class="record-card"
            >
              <div class="record-icon">
                {{ getSourceIcon(source.type) }}
              </div>

              <div class="record-content">
                <div class="record-top">
                  <span class="record-type">
                    {{ source.type || 'Source' }}
                  </span>

                  <span v-if="source.status" class="record-status">
                    {{ formatStatus(source.status) }}
                  </span>
                </div>

                <h3>{{ source.title || 'Untitled Source' }}</h3>

                <p class="record-meta">
                  {{
                    joinMetadata([
                      source.author,
                      source.year,
                      source.publisher,
                    ])
                  }}
                </p>

                <p v-if="source.notes" class="record-description">
                  {{ source.notes }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>

        <section v-if="bookMatches.length" class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Book Database</p>
              <h2>Books</h2>
            </div>

            <span class="section-count">
              {{ bookMatches.length }}
            </span>
          </div>

          <div class="record-grid">
            <RouterLink
              v-for="book in bookMatches"
              :key="book.id"
              :to="`/books/${book.id}`"
              class="record-card"
            >
              <div class="record-icon">
                📚
              </div>

              <div class="record-content">
                <div class="record-top">
                  <span class="record-type">Book</span>

                  <span v-if="book.status" class="record-status">
                    {{ formatStatus(book.status) }}
                  </span>
                </div>

                <h3>{{ book.title || 'Untitled Book' }}</h3>

                <p class="record-meta">
                  {{
                    joinMetadata([
                      book.author,
                      book.publicationYear,
                      book.genre,
                    ])
                  }}
                </p>

                <p
                  v-if="book.summary || book.notes"
                  class="record-description"
                >
                  {{ book.summary || book.notes }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>

        <section v-if="journalMatches.length" class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Journal Database</p>
              <h2>Journals</h2>
            </div>

            <span class="section-count">
              {{ journalMatches.length }}
            </span>
          </div>

          <div class="record-grid">
            <RouterLink
              v-for="journal in journalMatches"
              :key="journal.id"
              :to="`/journals/${journal.id}`"
              class="record-card"
            >
              <div class="record-icon">
                📰
              </div>

              <div class="record-content">
                <div class="record-top">
                  <span class="record-type">Journal</span>

                  <span v-if="journal.peerReviewed" class="record-status">
                    Peer Reviewed
                  </span>
                </div>

                <h3>{{ journal.name || 'Untitled Journal' }}</h3>

                <p class="record-meta">
                  {{
                    joinMetadata([
                      journal.publisher,
                      journal.field,
                    ])
                  }}
                </p>

                <p v-if="journal.notes" class="record-description">
                  {{ journal.notes }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>

        <section v-if="articleMatches.length" class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Article Database</p>
              <h2>Journal articles</h2>
            </div>

            <span class="section-count">
              {{ articleMatches.length }}
            </span>
          </div>

          <div class="record-grid">
            <RouterLink
              v-for="article in articleMatches"
              :key="article.id"
              :to="`/articles/${article.id}`"
              class="record-card"
            >
              <div class="record-icon">
                📑
              </div>

              <div class="record-content">
                <div class="record-top">
                  <span class="record-type">Journal Article</span>

                  <span v-if="article.status" class="record-status">
                    {{ formatStatus(article.status) }}
                  </span>
                </div>

                <h3>{{ article.title || 'Untitled Article' }}</h3>

                <p class="record-meta">
                  {{
                    joinMetadata([
                      article.author,
                      article.journalName,
                      article.year,
                    ])
                  }}
                </p>

                <p v-if="article.abstract" class="record-description">
                  {{ article.abstract }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>

        <section v-if="researchItemMatches.length" class="content-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Research Workspace</p>
              <h2>Research items</h2>
            </div>

            <span class="section-count">
              {{ researchItemMatches.length }}
            </span>
          </div>

          <div class="record-grid">
            <RouterLink
              v-for="item in researchItemMatches"
              :key="item.id"
              :to="`/research/items/${item.id}`"
              class="record-card"
            >
              <div class="record-icon">
                {{ getItemIcon(item) }}
              </div>

              <div class="record-content">
                <div class="record-top">
                  <span class="record-type">
                    {{ getResearchTypeLabel(item) }}
                  </span>
                </div>

                <h3>{{ item.title || 'Untitled Research Item' }}</h3>

                <p v-if="item.summary" class="record-description">
                  {{ item.summary }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>

        <section v-if="totalLinkedRecords === 0" class="empty-state">
          <div class="empty-icon">🏷️</div>

          <h2>No records use this tag yet</h2>

          <p>
            Add “{{ resolvedTag.name }}” to a source, book, journal, article, or
            research item and it will appear here automatically.
          </p>

          <RouterLink to="/research" class="primary-link">
            Return to Research Dashboard
          </RouterLink>
        </section>
      </template>
    </main>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
  useRoute,
} from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useBooks } from '@/composables/useBooks'
import { useJournals } from '@/composables/useJournals'
import { useKnowledgeTags } from '@/composables/useKnowledgeTags'
import { useResearch } from '@/composables/useResearch'
import { useSources } from '@/composables/useSources'
import { getResearchTypeById } from '@/data/researchTypes'

const route = useRoute()
const hasLoaded = ref(false)

const {
  allKnowledgeTags,
  allResearchItemTags,
  loadKnowledgeTags,
  loadResearchItemTags,
  getChildTags,
} = useKnowledgeTags()

const {
  allResearchItems,
  loadResearchItems,
} = useResearch()

const {
  allSources,
} = useSources()

const {
  allBooks,
} = useBooks()

const {
  allJournals,
  allArticles,
} = useJournals()

const routeTagValue = computed(() => {
  return decodeURIComponent(String(route.params.id || ''))
})

const requestedTagName = computed(() => {
  return String(route.query.name || '').trim()
})

const formalTag = computed(() => {
  const routeValue = routeTagValue.value
  const routeSlug = slugify(requestedTagName.value || routeValue)

  return (
    allKnowledgeTags.value.find((item) => {
      if (String(item.id) === routeValue) {
        return true
      }

      if (item.slug && item.slug === routeValue) {
        return true
      }

      if (slugify(item.name) === routeSlug) {
        return true
      }

      return (item.aliases || []).some((alias) => {
        return slugify(alias) === routeSlug
      })
    }) || null
  )
})

const resolvedTag = computed(() => {
  if (formalTag.value) {
    return formalTag.value
  }

  const name =
    requestedTagName.value ||
    titleFromSlug(routeTagValue.value) ||
    'Knowledge Tag'

  return {
    id: null,
    name,
    slug: slugify(name),
    kind: 'topic',
    parentId: null,
    description: '',
    supertags: [],
    aliases: [],
    color: '',
    icon: '🏷️',
  }
})

const tagTerms = computed(() => {
  const values = [
    resolvedTag.value?.name,
    requestedTagName.value,
    routeTagValue.value,
    ...(formalTag.value?.aliases || []),
  ]

  return new Set(
    values
      .map((value) => normalizeTag(value))
      .filter(Boolean),
  )
})

const parentTag = computed(() => {
  if (!formalTag.value?.parentId) {
    return null
  }

  return (
    allKnowledgeTags.value.find((item) => {
      return String(item.id) === String(formalTag.value.parentId)
    }) || null
  )
})

const childTags = computed(() => {
  if (!formalTag.value) {
    return []
  }

  return getChildTags(formalTag.value.id)
})

const formalLinkedResearchIds = computed(() => {
  if (!formalTag.value) {
    return new Set()
  }

  return new Set(
    allResearchItemTags.value
      .filter((link) => {
        return (
          String(link.knowledgeTagId) === String(formalTag.value.id)
        )
      })
      .map((link) => String(link.researchItemId)),
  )
})

const sourceMatches = computed(() => {
  return allSources.value.filter((source) => {
    return recordMatchesTag(source)
  })
})

const bookMatches = computed(() => {
  return allBooks.value.filter((book) => {
    return recordMatchesTag(book)
  })
})

const journalMatches = computed(() => {
  return allJournals.value.filter((journal) => {
    return recordMatchesTag(journal)
  })
})

const articleMatches = computed(() => {
  return allArticles.value.filter((article) => {
    return recordMatchesTag(article)
  })
})

const researchItemMatches = computed(() => {
  return allResearchItems.value.filter((item) => {
    return (
      recordMatchesTag(item) ||
      formalLinkedResearchIds.value.has(String(item.id))
    )
  })
})

const totalLinkedRecords = computed(() => {
  return (
    sourceMatches.value.length +
    bookMatches.value.length +
    journalMatches.value.length +
    articleMatches.value.length +
    researchItemMatches.value.length
  )
})

const relatedTags = computed(() => {
  const relatedMap = new Map()

  const addTags = (tags = []) => {
    tags.forEach((tagName) => {
      const cleanName = String(tagName || '').trim()
      const normalized = normalizeTag(cleanName)

      if (!cleanName || !normalized || tagTerms.value.has(normalized)) {
        return
      }

      const existing = relatedMap.get(normalized)

      relatedMap.set(normalized, {
        name: existing?.name || cleanName,
        slug: normalized,
        count: (existing?.count || 0) + 1,
      })
    })
  }

  sourceMatches.value.forEach((source) => {
    addTags(getRecordTags(source))
  })

  bookMatches.value.forEach((book) => {
    addTags(getRecordTags(book))
  })

  journalMatches.value.forEach((journal) => {
    addTags(getRecordTags(journal))
  })

  articleMatches.value.forEach((article) => {
    addTags(getRecordTags(article))
  })

  researchItemMatches.value.forEach((item) => {
    addTags(getRecordTags(item))
    addTags(getFormalTagNamesForResearchItem(item.id))
  })

  return [...relatedMap.values()]
    .sort((a, b) => {
      return b.count - a.count || a.name.localeCompare(b.name)
    })
    .slice(0, 20)
})

onMounted(async () => {
  try {
    await Promise.all([
      loadKnowledgeTags(),
      loadResearchItemTags(),
      loadResearchItems(),
    ])
  } finally {
    hasLoaded.value = true
  }
})

function getRecordTags(record) {
  return [
    ...(Array.isArray(record?.tags) ? record.tags : []),
    ...(Array.isArray(record?.topicTags) ? record.topicTags : []),
    ...(Array.isArray(record?.supertags) ? record.supertags : []),
  ]
}

function recordMatchesTag(record) {
  return getRecordTags(record).some((tagName) => {
    return tagTerms.value.has(normalizeTag(tagName))
  })
}

function getFormalTagNamesForResearchItem(researchItemId) {
  const tagIds = allResearchItemTags.value
    .filter((link) => {
      return String(link.researchItemId) === String(researchItemId)
    })
    .map((link) => String(link.knowledgeTagId))

  return tagIds
    .map((tagId) => {
      return allKnowledgeTags.value.find((item) => {
        return String(item.id) === tagId
      })?.name
    })
    .filter(Boolean)
}

function getTagRoute(name, id = null) {
  if (id) {
    return {
      path: `/knowledge-tags/${id}`,
    }
  }

  return {
    path: `/knowledge-tags/${slugify(name)}`,
    query: {
      name,
    },
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function normalizeTag(text) {
  return slugify(text)
}

function titleFromSlug(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function joinMetadata(values = []) {
  const result = values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' · ')

  return result || 'No additional details yet.'
}

function formatStatus(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getSourceIcon(type) {
  const normalizedType = String(type || '').toLowerCase()

  if (normalizedType.includes('book')) return '📚'
  if (normalizedType.includes('article')) return '📑'
  if (normalizedType.includes('journal')) return '📰'
  if (normalizedType.includes('website')) return '🌐'
  if (normalizedType.includes('dissertation')) return '🎓'
  if (normalizedType.includes('media')) return '🎧'

  return '📄'
}

function getItemIcon(researchItem) {
  const type = getResearchTypeById(researchItem.type)
  return type?.icon || '📄'
}

function getResearchTypeLabel(researchItem) {
  const type = getResearchTypeById(researchItem.type)
  return type?.name || 'Research Item'
}

function getKindLabel(kind) {
  const labels = {
    topic: 'Topic',
    subtopic: 'Subtopic',
    schema: 'Schema / Supertag',
    shortcut: 'Shortcut',
    doctrine: 'Doctrine',
    person: 'Person',
    passage: 'Bible Passage',
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
    passage: '🔖',
  }

  return icons[kind] || '🏷️'
}
</script>

<style scoped>
.tag-detail-page {
  display: grid;
  gap: 1.5rem;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1rem 0 7rem;
  color: var(--text-primary);
}

.loading-state,
.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  border: 1px dashed var(--border-color);
  border-radius: 22px;
  background: var(--bg-card);
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-icon,
.empty-icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: var(--accent-soft);
  font-size: 1.7rem;
}

.loading-state h2,
.empty-state h2 {
  margin: 0;
}

.empty-state p {
  max-width: 620px;
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background: var(--bg-card);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.tag-icon {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  flex: 0 0 78px;
  border: 1px solid var(--border-color);
  border-radius: 21px;
  background: var(--accent-soft);
  font-size: 2.1rem;
}

.tag-heading {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 0.35rem;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.breadcrumb a {
  color: var(--accent-text);
  text-decoration: none;
}

.tag-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.04em;
}

.tag-description {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
  line-height: 1.55;
}

.tag-heading-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.tag-heading-meta span {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.3rem 0.6rem;
  font-size: 0.74rem;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(130px, 1fr));
  gap: 0.85rem;
}

.stat-card {
  display: grid;
  gap: 0.3rem;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--bg-card);
  padding: 1rem;
  box-shadow: var(--shadow);
}

.stat-card span {
  color: var(--text-secondary);
  font-size: 0.76rem;
}

.stat-card strong {
  font-size: 1.55rem;
}

.primary-stat {
  border-color: rgba(204, 164, 75, 0.55);
  background: var(--accent-soft);
}

.properties-panel,
.content-panel {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.panel-heading h2 {
  margin: 0;
  font-size: 1.2rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: var(--accent-text);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.section-count {
  display: grid;
  place-items: center;
  min-width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-weight: 900;
}

.properties-list {
  display: grid;
  padding: 1.25rem;
}

.property-row {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.8rem 0;
}

.property-row:last-child {
  border-bottom: 0;
}

.property-row > span {
  color: var(--text-secondary);
  font-size: 0.84rem;
}

.property-row strong {
  font-weight: 600;
}

.inline-link {
  color: var(--accent-text);
  text-decoration: none;
}

.library-tag-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  border: 1px solid rgba(204, 164, 75, 0.45);
  border-radius: 18px;
  background: var(--accent-soft);
  padding: 1rem 1.15rem;
}

.library-tag-notice > span {
  font-size: 1.25rem;
}

.library-tag-notice div {
  display: grid;
  gap: 0.25rem;
}

.library-tag-notice p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tag-pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 1.25rem;
}

.tag-pill-card {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.45rem 0.7rem;
  text-decoration: none;
  font-size: 0.82rem;
}

.tag-pill-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.tag-pill-card strong {
  color: var(--accent-text);
}

.muted-text {
  margin: 0;
  padding: 1.25rem;
  color: var(--text-muted);
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding: 1.25rem;
}

.record-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--btn-bg);
  padding: 1rem;
  color: inherit;
  text-decoration: none;
}

.record-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.record-icon {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  border-radius: 14px;
  background: var(--accent-soft);
  font-size: 1.1rem;
}

.record-content {
  display: grid;
  min-width: 0;
  gap: 0.3rem;
}

.record-top {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.record-type,
.record-status {
  border-radius: 999px;
  padding: 0.2rem 0.45rem;
  font-size: 0.67rem;
  font-weight: 900;
}

.record-type {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.record-status {
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.record-card h3 {
  overflow: hidden;
  margin: 0.15rem 0 0;
  color: var(--text-primary);
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-meta,
.record-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.45;
}

.record-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  padding: 0.7rem 1rem;
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }
}

@media (max-width: 760px) {
  .tag-header {
    align-items: flex-start;
  }

  .record-grid {
    grid-template-columns: 1fr;
  }

  .property-row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
}

@media (max-width: 560px) {
  .tag-header {
    display: grid;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>