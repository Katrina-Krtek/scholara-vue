<template>
  <AppLayout
    title="Research Dashboard"
    subtitle="Your books, sources, journals, articles, themes, and research connections"
    banner-key="research-dashboard"
    default-icon="🔎"
  >
    <div class="research-dashboard">
      <section class="dashboard-hero">
        <div class="hero-content">
          <p class="eyebrow">Research Hub</p>
          <h2>Build a connected research library.</h2>
          <p class="hero-description">
            Track reading progress, organize source records, review incomplete
            citations, and see how your research connects across Scholarory.
          </p>

          <div class="hero-actions">
            <button type="button" class="primary-action" @click="createSource">
              + New Source
            </button>

            <RouterLink class="secondary-action" to="/research/workspace">
              Research Workspace
            </RouterLink>

            <RouterLink class="secondary-action" to="/knowledge-graph">
              Open Knowledge Graph
            </RouterLink>
          </div>
        </div>

        <div class="hero-summary">
          <div class="hero-number">{{ totalResearchRecords }}</div>
          <div class="hero-label">Unique research records</div>
          <div class="hero-detail">
            {{ relationships.length }} relationships · {{ uniqueTags.length }} tags
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <RouterLink
          v-for="stat in dashboardStats"
          :key="stat.label"
          :to="stat.route"
          class="stat-card"
        >
          <div class="stat-icon">{{ stat.icon }}</div>
          <div>
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </RouterLink>
      </section>

      <section class="panel filters-panel">
        <div class="panel-header filters-header">
          <div>
            <p class="panel-eyebrow">Find your research</p>
            <h3>Research filters</h3>
            <p class="panel-description">
              Combined filters use AND logic. Matching Source metadata is merged
              into its Book, Journal, or Article record automatically.
            </p>
          </div>

          <div class="filter-header-actions">
            <span class="result-total">
              {{ filteredResearchRecords.length }}
              result{{ filteredResearchRecords.length === 1 ? '' : 's' }}
            </span>

            <button
              v-if="hasActiveFilters"
              type="button"
              class="clear-filters-btn"
              @click="clearFilters"
            >
              Clear all
            </button>
          </div>
        </div>

        <div class="filters-grid">
          <label class="filter-field search-field">
            <span>Search research</span>
            <input
              v-model="filters.search"
              type="search"
              placeholder="Search research — use + to require multiple terms"
            />
          </label>

          <label class="filter-field">
            <span>Record type</span>
            <select v-model="filters.type">
              <option value="all">All record types</option>
              <option
                v-for="option in recordTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.icon }} {{ option.label }} ({{ option.count }})
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Status</span>
            <select v-model="filters.status">
              <option value="all">All statuses</option>
              <option
                v-for="status in statusFilterOptions"
                :key="status"
                :value="status"
              >
                {{ formatStatus(status) }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Tag or theme</span>
            <select v-model="filters.tag">
              <option value="all">All tags</option>
              <option
                v-for="tag in tagFilterOptions"
                :key="tag.name"
                :value="normalizeTag(tag.name)"
              >
                {{ tag.name }} ({{ tag.count }})
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Course</span>
            <select v-model="filters.course">
              <option value="all">All courses</option>
              <option
                v-for="course in courseFilterOptions"
                :key="course.filterValue"
                :value="course.filterValue"
              >
                {{ course.code ? `${course.code} · ` : '' }}{{ course.title }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Assignment</span>
            <select v-model="filters.assignment">
              <option value="all">All assignments</option>
              <option
                v-for="assignment in assignmentFilterOptions"
                :key="assignment.filterValue"
                :value="assignment.filterValue"
              >
                {{ assignment.title }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Priority</span>
            <select v-model="filters.priority">
              <option value="all">All priorities</option>
              <option
                v-for="priority in priorityFilterOptions"
                :key="priority"
                :value="priority"
              >
                {{ formatStatus(priority) }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Connections</span>
            <select v-model="filters.connection">
              <option value="all">All research</option>
              <option value="connected">Connected research</option>
              <option value="unconnected">Unconnected research</option>
            </select>
          </label>

          <label class="filter-field">
            <span>Metadata</span>
            <select v-model="filters.completeness">
              <option value="all">All metadata</option>
              <option value="complete">Complete records</option>
              <option value="incomplete">Needs information</option>
            </select>
          </label>

          <label class="filter-field">
            <span>Sort results</span>
            <select v-model="filters.sort">
              <option value="title">Title A–Z</option>
              <option value="newest">Newest first</option>
              <option value="type">Record type</option>
              <option value="status">Research status</option>
            </select>
          </label>
        </div>

        <div v-if="activeFilterChips.length" class="active-filter-row">
          <span class="active-filter-label">Active filters:</span>

          <button
            v-for="chip in activeFilterChips"
            :key="chip.key"
            type="button"
            class="active-filter-chip"
            @click="removeFilter(chip.key)"
          >
            {{ chip.label }}
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </section>

      <section class="panel library-results-panel">
        <div class="panel-header results-header">
          <div>
            <p class="panel-eyebrow">Unified library</p>
            <h3>Research library results</h3>
            <p class="panel-description">
              Showing {{ visibleFilteredRecords.length }} of
              {{ filteredResearchRecords.length }} matching records.
            </p>
          </div>

          <RouterLink class="text-link" to="/sources">
            Open source database
          </RouterLink>
        </div>

        <div v-if="visibleFilteredRecords.length" class="library-results-grid">
          <article
            v-for="record in visibleFilteredRecords"
            :key="record.uid"
            class="library-result-card"
          >
            <RouterLink :to="record.route" class="library-card-main">
              <div class="library-card-top">
                <div class="library-record-icon">{{ record.icon }}</div>

                <div class="library-card-heading">
                  <div class="library-badge-row">
                    <span class="record-type-badge">{{ record.typeLabel }}</span>

                    <span v-if="record.status" class="status-badge">
                      {{ formatStatus(record.status) }}
                    </span>

                    <span
                      v-if="record.priority"
                      class="priority-badge"
                      :class="`priority-${record.priority}`"
                    >
                      {{ formatStatus(record.priority) }}
                    </span>
                  </div>

                  <h4>{{ record.title }}</h4>
                  <p>{{ record.subtitle }}</p>
                </div>
              </div>

              <div class="record-health-row">
                <span
                  class="health-badge"
                  :class="record.metadataComplete ? 'complete' : 'incomplete'"
                >
                  {{
                    record.metadataComplete
                      ? '✓ Metadata complete'
                      : 'Needs metadata'
                  }}
                </span>

                <span
                  class="health-badge"
                  :class="record.connected ? 'connected' : 'unconnected'"
                >
                  {{ record.connected ? '🔗 Connected' : 'Unconnected' }}
                </span>
              </div>
            </RouterLink>

            <div
              v-if="record.courseNames.length || record.assignmentNames.length"
              class="record-linkage-row"
            >
              <span
                v-for="courseName in record.courseNames"
                :key="`course-${courseName}`"
                class="linkage-chip"
              >
                📘 {{ courseName }}
              </span>

              <span
                v-for="assignmentName in record.assignmentNames"
                :key="`assignment-${assignmentName}`"
                class="linkage-chip"
              >
                📋 {{ assignmentName }}
              </span>
            </div>

            <div v-if="record.tags.length" class="record-tag-row">
              <RouterLink
                v-for="tag in record.tags.slice(0, 4)"
                :key="tag"
                :to="getTagRoute(tag)"
                class="result-tag-chip"
              >
                {{ tag }}
              </RouterLink>

              <span v-if="record.tags.length > 4" class="more-tags-chip">
                +{{ record.tags.length - 4 }}
              </span>
            </div>

            <RouterLink :to="record.route" class="open-record-link">
              Open record
              <span>→</span>
            </RouterLink>
          </article>
        </div>

        <div v-else class="empty-state filter-empty-state">
          <div class="empty-icon">🔎</div>
          <strong>No research matches these filters</strong>
          <p>
            Try changing your search, removing a filter, or clearing all
            filters.
          </p>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="empty-clear-btn"
            @click="clearFilters"
          >
            Clear research filters
          </button>
        </div>

        <div v-if="hasMoreResults" class="show-more-row">
          <button type="button" class="show-more-btn" @click="showMoreResults">
            Show more results
          </button>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="main-column">
          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Start here</p>
                <h3>Quick actions</h3>
              </div>
            </div>

            <div class="quick-actions">
              <button type="button" class="quick-action" @click="createSource">
                <span class="quick-icon">📄</span>
                <span>
                  <strong>New source</strong>
                  <small>Create a general research source</small>
                </span>
              </button>

              <button type="button" class="quick-action" @click="createBook">
                <span class="quick-icon">📚</span>
                <span>
                  <strong>New book</strong>
                  <small>Create a chapter-based book record</small>
                </span>
              </button>

              <button type="button" class="quick-action" @click="createJournal">
                <span class="quick-icon">📰</span>
                <span>
                  <strong>New journal</strong>
                  <small>Add an academic journal</small>
                </span>
              </button>

              <RouterLink class="quick-action" to="/articles">
                <span class="quick-icon">📑</span>
                <span>
                  <strong>Browse articles</strong>
                  <small>Manage journal article records</small>
                </span>
              </RouterLink>

              <RouterLink class="quick-action" to="/sources/relationships">
                <span class="quick-icon">🔗</span>
                <span>
                  <strong>Connect sources</strong>
                  <small>Create research relationships</small>
                </span>
              </RouterLink>

              <RouterLink class="quick-action" to="/knowledge-tags">
                <span class="quick-icon">🏷️</span>
                <span>
                  <strong>Browse tags</strong>
                  <small>Explore themes and concepts</small>
                </span>
              </RouterLink>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Library</p>
                <h3>Latest research records</h3>
              </div>
            </div>

            <div v-if="latestRecords.length" class="record-list">
              <RouterLink
                v-for="record in latestRecords"
                :key="record.uid"
                :to="record.route"
                class="record-row"
              >
                <div class="record-icon">{{ record.icon }}</div>
                <div class="record-information">
                  <strong>{{ record.title }}</strong>
                  <span>{{ record.subtitle }}</span>
                </div>
                <span class="record-type">{{ record.typeLabel }}</span>
              </RouterLink>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Workflow</p>
                <h3>Research status</h3>
              </div>
              <span class="header-detail">{{ statusRecordTotal }} tracked</span>
            </div>

            <div v-if="statusRows.length" class="status-list">
              <div
                v-for="status in statusRows"
                :key="status.key"
                class="status-row"
              >
                <div class="status-heading">
                  <div class="status-name">
                    <span
                      class="status-dot"
                      :class="`status-${status.key}`"
                    ></span>
                    <span>{{ status.label }}</span>
                  </div>
                  <strong>{{ status.count }}</strong>
                </div>

                <div class="progress-track">
                  <span
                    class="progress-fill"
                    :class="`status-${status.key}`"
                    :style="{ width: `${status.percent}%` }"
                  ></span>
                </div>
              </div>
            </div>

            <div class="reading-summary">
              <div>
                <span>Books currently being read</span>
                <strong>{{ readingBookCount }}</strong>
              </div>

              <div>
                <span>Average reading progress</span>
                <strong>{{ averageReadingProgress }}%</strong>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Collection</p>
                <h3>Library breakdown</h3>
              </div>
            </div>

            <div class="breakdown-list">
              <div
                v-for="item in sourceBreakdown"
                :key="item.label"
                class="breakdown-row"
              >
                <div class="breakdown-heading">
                  <span>{{ item.icon }} {{ item.label }}</span>
                  <strong>{{ item.count }}</strong>
                </div>

                <div class="progress-track">
                  <span
                    class="progress-fill breakdown-fill"
                    :style="{ width: `${item.percent}%` }"
                  ></span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside class="side-column">
          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Quality check</p>
                <h3>Research needing attention</h3>
              </div>
              <span class="attention-total">{{ totalAttentionItems }}</span>
            </div>

            <div v-if="attentionItems.length" class="attention-list">
              <RouterLink
                v-for="item in attentionItems"
                :key="item.label"
                :to="item.route"
                class="attention-row"
              >
                <span>{{ item.icon }}</span>
                <div>
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.description }}</small>
                </div>
                <span class="attention-count">{{ item.count }}</span>
              </RouterLink>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Connections</p>
                <h3>Connected research</h3>
              </div>

              <RouterLink class="text-link" to="/sources/relationships">
                Open
              </RouterLink>
            </div>

            <div class="connection-stats">
              <div>
                <strong>{{ relationships.length }}</strong>
                <span>Relationships</span>
              </div>
              <div>
                <strong>{{ connectedSourceCount }}</strong>
                <span>Connected records</span>
              </div>
              <div>
                <strong>{{ relationshipSuggestions.length }}</strong>
                <span>Suggestions</span>
              </div>
            </div>

            <div v-if="mostConnectedSources.length" class="connected-list">
              <p class="section-label">Most connected</p>

              <div
                v-for="source in mostConnectedSources"
                :key="source.uid"
                class="connected-row"
              >
                <div>
                  <strong>{{ source.title }}</strong>
                  <small>{{ source.sourceType }}</small>
                </div>
                <span>{{ source.connectionCount }}</span>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Themes</p>
                <h3>Top research tags</h3>
              </div>

              <RouterLink class="text-link" to="/knowledge-tags">
                Browse
              </RouterLink>
            </div>

            <div v-if="topTags.length" class="tag-cloud">
              <RouterLink
                v-for="tag in topTags"
                :key="tag.name"
                :to="getTagRoute(tag.name)"
                class="tag-chip"
              >
                <span>{{ tag.name }}</span>
                <strong>{{ tag.count }}</strong>
              </RouterLink>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <p class="panel-eyebrow">Navigation</p>
                <h3>Research tools</h3>
              </div>
            </div>

            <nav class="research-navigation">
              <RouterLink to="/sources"><span>📄</span>Source Database</RouterLink>
              <RouterLink to="/books"><span>📚</span>Book Database</RouterLink>
              <RouterLink to="/journals"><span>📰</span>Journal Database</RouterLink>
              <RouterLink to="/articles"><span>📑</span>Article Database</RouterLink>
              <RouterLink to="/sources/relationships">
                <span>🔗</span>Source Relationships
              </RouterLink>
              <RouterLink to="/knowledge-graph">
                <span>🕸️</span>Knowledge Graph
              </RouterLink>
            </nav>
          </article>
        </aside>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useAssignments } from '@/composables/useAssignments'
import { useBooks } from '@/composables/useBooks'
import { useCourses } from '@/composables/useCourses'
import { useJournals } from '@/composables/useJournals'
import { useSources } from '@/composables/useSources'

import {
  buildSourceRelationshipSuggestions,
  getAllSources,
  readSourceRelationships,
} from '@/lib/sourceRelationshipsStore'

const router = useRouter()

const { allSources, addSource } = useSources()
const { allBooks, addBook, getReadingProgress } = useBooks()
const { allJournals, allArticles, addJournal } = useJournals()
const { allCourses } = useCourses()
const { allAssignments } = useAssignments()

const relationshipSources = ref([])
const relationships = ref([])
const resultLimit = ref(12)

const filters = reactive({
  search: '',
  type: 'all',
  status: 'all',
  tag: 'all',
  course: 'all',
  assignment: 'all',
  priority: 'all',
  connection: 'all',
  completeness: 'all',
  sort: 'title',
})

const courseFilterOptions = computed(() => {
  return [...allCourses.value]
    .map((course) => ({
      ...course,
      filterValue: getCourseFilterValue(course),
    }))
    .sort((a, b) => {
      const first = `${a.code || ''} ${a.title || ''}`.trim()
      const second = `${b.code || ''} ${b.title || ''}`.trim()
      return first.localeCompare(second)
    })
})

const assignmentFilterOptions = computed(() => {
  return [...allAssignments.value]
    .map((assignment) => ({
      ...assignment,
      filterValue: getAssignmentFilterValue(assignment),
      courseKeys: getCourseKeysFromRecord(assignment),
    }))
    .filter((assignment) => {
      return (
        filters.course === 'all' ||
        assignment.courseKeys.includes(filters.course)
      )
    })
    .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
})

const courseByFilterValue = computed(() => {
  return courseFilterOptions.value.reduce((lookup, course) => {
    lookup[course.filterValue] = course
    return lookup
  }, {})
})

const assignmentByFilterValue = computed(() => {
  return assignmentFilterOptions.value.reduce((lookup, assignment) => {
    lookup[assignment.filterValue] = assignment
    return lookup
  }, {})
})

const relationshipSourceByUid = computed(() => {
  return relationshipSources.value.reduce((lookup, source) => {
    lookup[String(source.uid)] = source
    return lookup
  }, {})
})

const connectedRelationshipUids = computed(() => {
  const uids = new Set()

  relationships.value.forEach((relationship) => {
    if (relationship.fromUid) uids.add(String(relationship.fromUid))
    if (relationship.toUid) uids.add(String(relationship.toUid))
  })

  return uids
})

const specializedSourceMatches = computed(() => {
  const matchedSourceIds = new Set()
  const bookMatches = new Map()
  const journalMatches = new Map()
  const articleMatches = new Map()

  allBooks.value.forEach((book) => {
    const peers = findMatchingSources(book, 'book')
    bookMatches.set(String(book.id), peers)
    peers.forEach((source) => matchedSourceIds.add(String(source.id)))
  })

  allJournals.value.forEach((journal) => {
    const peers = findMatchingSources(journal, 'journal')
    journalMatches.set(String(journal.id), peers)
    peers.forEach((source) => matchedSourceIds.add(String(source.id)))
  })

  allArticles.value.forEach((article) => {
    const peers = findMatchingSources(article, 'article')
    articleMatches.set(String(article.id), peers)
    peers.forEach((source) => matchedSourceIds.add(String(source.id)))
  })

  return {
    matchedSourceIds,
    bookMatches,
    journalMatches,
    articleMatches,
  }
})

const unifiedResearchRecords = computed(() => {
  const sourceRecords = allSources.value
    .filter((source) => {
      return !specializedSourceMatches.value.matchedSourceIds.has(String(source.id))
    })
    .map((source) => {
      return buildUnifiedRecord({
        id: source.id,
        kind: 'source',
        typeLabel: source.type || 'Source',
        icon: sourceTypeIcon(source.type),
        title: source.title || 'Untitled Source',
        route: `/sources/${source.id}`,
        primary: source,
        peers: [],
      })
    })

  const bookRecords = allBooks.value.map((book) => {
    return buildUnifiedRecord({
      id: book.id,
      kind: 'book',
      typeLabel: 'Book',
      icon: '📚',
      title: book.title || 'Untitled Book',
      route: `/books/${book.id}`,
      primary: book,
      peers:
        specializedSourceMatches.value.bookMatches.get(String(book.id)) || [],
    })
  })

  const journalRecords = allJournals.value.map((journal) => {
    return buildUnifiedRecord({
      id: journal.id,
      kind: 'journal',
      typeLabel: 'Journal',
      icon: '📰',
      title: journal.name || 'Untitled Journal',
      route: `/journals/${journal.id}`,
      primary: journal,
      peers:
        specializedSourceMatches.value.journalMatches.get(String(journal.id)) || [],
    })
  })

  const articleRecords = allArticles.value.map((article) => {
    return buildUnifiedRecord({
      id: article.id,
      kind: 'article',
      typeLabel: 'Journal Article',
      icon: '📑',
      title: article.title || 'Untitled Article',
      route: `/articles/${article.id}`,
      primary: article,
      peers:
        specializedSourceMatches.value.articleMatches.get(String(article.id)) || [],
    })
  })

  return [
    ...sourceRecords,
    ...bookRecords,
    ...journalRecords,
    ...articleRecords,
  ]
})

const totalResearchRecords = computed(() => unifiedResearchRecords.value.length)

const dashboardStats = computed(() => [
  {
    icon: '📄',
    label: 'Sources',
    value: allSources.value.length,
    route: '/sources',
  },
  {
    icon: '📚',
    label: 'Books',
    value: allBooks.value.length,
    route: '/books',
  },
  {
    icon: '📰',
    label: 'Journals',
    value: allJournals.value.length,
    route: '/journals',
  },
  {
    icon: '📑',
    label: 'Articles',
    value: allArticles.value.length,
    route: '/articles',
  },
  {
    icon: '🔗',
    label: 'Relationships',
    value: relationships.value.length,
    route: '/sources/relationships',
  },
  {
    icon: '🏷️',
    label: 'Research Tags',
    value: uniqueTags.value.length,
    route: '/knowledge-tags',
  },
])

const recordTypeOptions = computed(() => {
  const options = [
    { value: 'source', label: 'Sources', icon: '📄' },
    { value: 'book', label: 'Books', icon: '📚' },
    { value: 'journal', label: 'Journals', icon: '📰' },
    { value: 'article', label: 'Articles', icon: '📑' },
  ]

  return options.map((option) => ({
    ...option,
    count: unifiedResearchRecords.value.filter(
      (record) => record.kind === option.value,
    ).length,
  }))
})

const statusFilterOptions = computed(() => {
  const statuses = new Set()

  unifiedResearchRecords.value.forEach((record) => {
    record.statusValues.forEach((status) => statuses.add(status))
  })

  return [...statuses].sort((a, b) => a.localeCompare(b))
})

const priorityFilterOptions = computed(() => {
  const priorities = new Set()

  unifiedResearchRecords.value.forEach((record) => {
    record.priorityValues.forEach((priority) => priorities.add(priority))
  })

  const preferredOrder = ['urgent', 'high', 'medium', 'low']

  return [
    ...preferredOrder.filter((priority) => priorities.has(priority)),
    ...[...priorities]
      .filter((priority) => !preferredOrder.includes(priority))
      .sort((a, b) => a.localeCompare(b)),
  ]
})

const topTagData = computed(() => {
  const counts = new Map()

  unifiedResearchRecords.value.forEach((record) => {
    record.tags.forEach((tag) => {
      const key = normalizeTag(tag)
      const existing = counts.get(key)

      counts.set(key, {
        name: existing?.name || tag,
        count: (existing?.count || 0) + 1,
      })
    })
  })

  return [...counts.values()].sort((a, b) => {
    return b.count - a.count || a.name.localeCompare(b.name)
  })
})

const tagFilterOptions = computed(() => topTagData.value)
const topTags = computed(() => topTagData.value.slice(0, 12))
const uniqueTags = computed(() => topTagData.value.map((tag) => tag.name))

const filteredResearchRecords = computed(() => {
  const searchTerms = parseSearchTerms(filters.search)

  const records = unifiedResearchRecords.value.filter((record) => {
    const matchesSearch =
      searchTerms.length === 0 ||
      searchTerms.every((term) => record.searchText.includes(term))
    const matchesType = filters.type === 'all' || record.kind === filters.type

    const matchesStatus =
      filters.status === 'all' ||
      record.statusValues.includes(filters.status)

    const matchesTag =
      filters.tag === 'all' ||
      record.normalizedTags.includes(filters.tag)

    const matchesCourse =
      filters.course === 'all' ||
      record.courseKeys.includes(filters.course)

    const matchesAssignment =
      filters.assignment === 'all' ||
      record.assignmentKeys.includes(filters.assignment)

    const matchesPriority =
      filters.priority === 'all' ||
      record.priorityValues.includes(filters.priority)

    const matchesConnection =
      filters.connection === 'all' ||
      (filters.connection === 'connected' && record.connected) ||
      (filters.connection === 'unconnected' && !record.connected)

    const matchesCompleteness =
      filters.completeness === 'all' ||
      (filters.completeness === 'complete' && record.metadataComplete) ||
      (filters.completeness === 'incomplete' && !record.metadataComplete)

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesTag &&
      matchesCourse &&
      matchesAssignment &&
      matchesPriority &&
      matchesConnection &&
      matchesCompleteness
    )
  })

  return sortResearchRecords(records, filters.sort)
})

const visibleFilteredRecords = computed(() => {
  return filteredResearchRecords.value.slice(0, resultLimit.value)
})

const hasMoreResults = computed(() => {
  return visibleFilteredRecords.value.length < filteredResearchRecords.value.length
})

const hasActiveFilters = computed(() => {
  return (
    hasText(filters.search) ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.tag !== 'all' ||
    filters.course !== 'all' ||
    filters.assignment !== 'all' ||
    filters.priority !== 'all' ||
    filters.connection !== 'all' ||
    filters.completeness !== 'all'
  )
})

const activeFilterChips = computed(() => {
  const chips = []

  if (hasText(filters.search)) {
    chips.push({ key: 'search', label: `Search: ${filters.search}` })
  }

  if (filters.type !== 'all') {
    chips.push({
      key: 'type',
      label: `Type: ${formatStatus(filters.type)}`,
    })
  }

  if (filters.status !== 'all') {
    chips.push({
      key: 'status',
      label: `Status: ${formatStatus(filters.status)}`,
    })
  }

  if (filters.tag !== 'all') {
    const tagName =
      topTagData.value.find((tag) => normalizeTag(tag.name) === filters.tag)
        ?.name || filters.tag

    chips.push({ key: 'tag', label: `Tag: ${tagName}` })
  }

  if (filters.course !== 'all') {
    const course = courseByFilterValue.value[filters.course]

    chips.push({
      key: 'course',
      label: `Course: ${course?.code || course?.title || filters.course}`,
    })
  }

  if (filters.assignment !== 'all') {
    const assignment = assignmentByFilterValue.value[filters.assignment]

    chips.push({
      key: 'assignment',
      label: `Assignment: ${assignment?.title || filters.assignment}`,
    })
  }

  if (filters.priority !== 'all') {
    chips.push({
      key: 'priority',
      label: `Priority: ${formatStatus(filters.priority)}`,
    })
  }

  if (filters.connection !== 'all') {
    chips.push({
      key: 'connection',
      label:
        filters.connection === 'connected'
          ? 'Connected research'
          : 'Unconnected research',
    })
  }

  if (filters.completeness !== 'all') {
    chips.push({
      key: 'completeness',
      label:
        filters.completeness === 'complete'
          ? 'Complete metadata'
          : 'Needs metadata',
    })
  }

  return chips
})

const latestRecords = computed(() => {
  return sortResearchRecords(unifiedResearchRecords.value, 'newest').slice(0, 8)
})

const statusRows = computed(() => {
  const counts = new Map()

  unifiedResearchRecords.value.forEach((record) => {
    record.statusValues.forEach((status) => {
      counts.set(status, (counts.get(status) || 0) + 1)
    })
  })

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
  const preferredOrder = [
    'planned',
    'reading',
    'reviewing',
    'in-progress',
    'completed',
    'archived',
  ]

  const keys = [
    ...preferredOrder.filter((key) => counts.has(key)),
    ...[...counts.keys()].filter((key) => !preferredOrder.includes(key)),
  ]

  return keys.map((key) => ({
    key,
    label: formatStatus(key),
    count: counts.get(key) || 0,
    percent: total ? Math.round(((counts.get(key) || 0) / total) * 100) : 0,
  }))
})

const statusRecordTotal = computed(() => unifiedResearchRecords.value.length)

const readingBooks = computed(() => {
  return unifiedResearchRecords.value.filter((record) => {
    return record.kind === 'book' && record.statusValues.includes('reading')
  })
})

const readingBookCount = computed(() => readingBooks.value.length)

const averageReadingProgress = computed(() => {
  if (!readingBooks.value.length) return 0

  const total = readingBooks.value.reduce((sum, record) => {
    return sum + getReadingProgress(record.primary)
  }, 0)

  return Math.round(total / readingBooks.value.length)
})

const sourceBreakdown = computed(() => {
  const rows = [
    {
      icon: '📄',
      label: 'Sources',
      count: unifiedResearchRecords.value.filter((record) => record.kind === 'source')
        .length,
    },
    {
      icon: '📚',
      label: 'Books',
      count: unifiedResearchRecords.value.filter((record) => record.kind === 'book')
        .length,
    },
    {
      icon: '📰',
      label: 'Journals',
      count: unifiedResearchRecords.value.filter(
        (record) => record.kind === 'journal',
      ).length,
    },
    {
      icon: '📑',
      label: 'Articles',
      count: unifiedResearchRecords.value.filter(
        (record) => record.kind === 'article',
      ).length,
    },
  ]

  const largest = Math.max(1, ...rows.map((row) => row.count))

  return rows.map((row) => ({
    ...row,
    percent: Math.round((row.count / largest) * 100),
  }))
})

const attentionItems = computed(() => {
  const incompleteByKind = (kind) =>
    unifiedResearchRecords.value.filter(
      (record) => record.kind === kind && !record.metadataComplete,
    ).length

  return [
    {
      icon: '📝',
      label: 'Incomplete source records',
      description: 'Citation or publication information is missing',
      count: incompleteByKind('source'),
      route: '/sources',
    },
    {
      icon: '📚',
      label: 'Incomplete book records',
      description: 'Publisher, year, or ISBN is missing',
      count: incompleteByKind('book'),
      route: '/books',
    },
    {
      icon: '📰',
      label: 'Incomplete journal records',
      description: 'ISSN or website is missing',
      count: incompleteByKind('journal'),
      route: '/journals',
    },
    {
      icon: '📑',
      label: 'Incomplete article records',
      description: 'Publication metadata is missing',
      count: incompleteByKind('article'),
      route: '/articles',
    },
    {
      icon: '🔗',
      label: 'Unlinked research',
      description: 'No source relationship exists',
      count: unifiedResearchRecords.value.filter((record) => !record.connected)
        .length,
      route: '/sources/relationships',
    },
    {
      icon: '🏷️',
      label: 'Records without tags',
      description: 'No themes or topic tags assigned',
      count: unifiedResearchRecords.value.filter((record) => !record.tags.length)
        .length,
      route: '/knowledge-tags',
    },
  ].filter((item) => item.count > 0)
})

const totalAttentionItems = computed(() => {
  return attentionItems.value.reduce((sum, item) => sum + item.count, 0)
})

const relationshipSuggestions = computed(() => {
  return buildSourceRelationshipSuggestions(
    relationshipSources.value,
    relationships.value,
  )
})

const connectedSourceCount = computed(() => connectedRelationshipUids.value.size)

const mostConnectedSources = computed(() => {
  const counts = new Map()

  relationships.value.forEach((relationship) => {
    counts.set(
      String(relationship.fromUid),
      (counts.get(String(relationship.fromUid)) || 0) + 1,
    )
    counts.set(
      String(relationship.toUid),
      (counts.get(String(relationship.toUid)) || 0) + 1,
    )
  })

  return [...counts.entries()]
    .map(([uid, connectionCount]) => {
      const source = relationshipSourceByUid.value[uid]

      return {
        uid,
        title: source?.title || 'Missing source',
        sourceType: source?.sourceType || 'Unknown',
        connectionCount,
      }
    })
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, 4)
})

watch(
  () => [
    filters.search,
    filters.type,
    filters.status,
    filters.tag,
    filters.course,
    filters.assignment,
    filters.priority,
    filters.connection,
    filters.completeness,
    filters.sort,
  ],
  () => {
    resultLimit.value = 12
  },
)

watch(
  () => filters.course,
  () => {
    if (filters.assignment === 'all') return

    const stillAvailable = assignmentFilterOptions.value.some(
      (assignment) => assignment.filterValue === filters.assignment,
    )

    if (!stillAvailable) filters.assignment = 'all'
  },
)

onMounted(() => {
  refreshRelationshipData()
  window.addEventListener('storage', refreshRelationshipData)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', refreshRelationshipData)
})

function findMatchingSources(record, kind) {
  const title = getRecordTitle(record, kind)
  const author = getRecordAuthor(record)

  return allSources.value.filter((source) => {
    const sourceTitle = normalizeComparableText(source.title)
    const recordTitle = normalizeComparableText(title)

    if (!recordTitle || sourceTitle !== recordTitle) return false
    if (!sourceTypeMatchesKind(source.type, kind)) return false

    const sourceAuthor = normalizeComparableText(source.author)
    const recordAuthor = normalizeComparableText(author)

    return !sourceAuthor || !recordAuthor || sourceAuthor === recordAuthor
  })
}

function sourceTypeMatchesKind(type, kind) {
  const normalizedType = normalizeComparableText(type)

  if (!normalizedType) return true
  if (kind === 'book') return normalizedType.includes('book')
  if (kind === 'journal') return normalizedType.includes('journal')
  if (kind === 'article') return normalizedType.includes('article')

  return true
}

function getRecordTitle(record, kind) {
  if (kind === 'journal') return record.name || ''
  return record.title || ''
}

function getRecordAuthor(record) {
  return record.author || ''
}

function buildUnifiedRecord({
  id,
  kind,
  typeLabel,
  icon,
  title,
  route,
  primary,
  peers,
}) {
  const records = [primary, ...peers]
  const tags = collectTags(records)
  const statusValues = collectNormalizedValues(records, [
    'status',
    'researchStatus',
  ])
  const priorityValues = collectNormalizedValues(records, ['priority'])
  const courseKeys = collectCourseKeys(records)
  const assignmentKeys = collectAssignmentKeys(records)
  const courseNames = getCourseNames(courseKeys, records)
  const assignmentNames = getAssignmentNames(assignmentKeys, records)
  const status = normalizeOptionalValue(primary.status) || statusValues[0] || ''
  const priority =
    normalizeOptionalValue(primary.priority) || priorityValues[0] || ''
  const merged = mergeRecords(records)
  const connected = records.some((record) =>
    isRecordConnected(record, kind, title),
  )

  return {
    uid: `${kind}-${id}`,
    id,
    kind,
    typeLabel,
    icon,
    title,
    route,
    primary,
    peers,
    merged,
    subtitle: buildSubtitle(kind, merged),
    tags,
    normalizedTags: tags.map((tag) => normalizeTag(tag)),
    status,
    statusValues,
    priority,
    priorityValues,
    courseKeys,
    assignmentKeys,
    courseNames,
    assignmentNames,
    connected,
    createdAt: getNewestDate(records),
    metadataComplete: isMergedMetadataComplete(kind, merged),
    searchText: buildSearchText(records, {
      title,
      typeLabel,
      tags,
      courseNames,
      assignmentNames,
      statusValues,
      priorityValues,
    }),
  }
}

function mergeRecords(records) {
  const merged = {}

  records.forEach((record) => {
    Object.entries(record || {}).forEach(([key, value]) => {
      if (!hasMeaningfulValue(merged[key]) && hasMeaningfulValue(value)) {
        merged[key] = value
      }
    })
  })

  return merged
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return hasText(value)
}

function collectTags(records) {
  const tags = []

  records.forEach((record) => {
    const values = [
      ...(Array.isArray(record.tags) ? record.tags : []),
      ...(Array.isArray(record.topicTags) ? record.topicTags : []),
      ...(Array.isArray(record.supertags) ? record.supertags : []),
    ]

    values.forEach((tag) => {
      const cleaned = String(tag || '').trim()

      if (
        cleaned &&
        !tags.some((existing) => normalizeTag(existing) === normalizeTag(cleaned))
      ) {
        tags.push(cleaned)
      }
    })
  })

  return tags
}

function collectNormalizedValues(records, fields) {
  const values = []

  records.forEach((record) => {
    fields.forEach((field) => {
      const rawValue = record?.[field]
      const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue]

      rawValues.forEach((value) => {
        const normalized = normalizeOptionalValue(value)

        if (normalized && !values.includes(normalized)) {
          values.push(normalized)
        }
      })
    })
  })

  return values
}

function collectCourseKeys(records) {
  const keys = new Set()

  records.forEach((record) => {
    getCourseKeysFromRecord(record).forEach((key) => keys.add(key))
  })

  return [...keys]
}

function getCourseKeysFromRecord(record = {}) {
  const keys = new Set()

  const ids = normalizeIdArray([
    record.courseId,
    ...(Array.isArray(record.relatedCourseIds)
      ? record.relatedCourseIds
      : []),
    ...(Array.isArray(record.courseIds) ? record.courseIds : []),
  ])

  ids.forEach((id) => {
    keys.add(`course-id:${id}`)

    const course = allCourses.value.find(
      (item) => String(item.id) === String(id),
    )

    if (course) keys.add(getCourseFilterValue(course))
  })

  const textValues = [record.course, record.courseCode, record.courseName]

  textValues.forEach((value) => {
    const normalized = normalizeComparableText(value)
    if (!normalized) return

    keys.add(`course-text:${normalized}`)

    const course = allCourses.value.find((item) => {
      return [
        item.code,
        item.title,
        `${item.code || ''} ${item.title || ''}`,
      ].some((candidate) => {
        const normalizedCandidate = normalizeComparableText(candidate)
        return (
          normalizedCandidate === normalized ||
          normalizedCandidate.includes(normalized) ||
          normalized.includes(normalizedCandidate)
        )
      })
    })

    if (course) {
      keys.add(getCourseFilterValue(course))
      keys.add(`course-id:${course.id}`)
    }
  })

  return [...keys]
}

function getCourseFilterValue(course) {
  const code = normalizeComparableText(course.code)

  if (code) return `course-code:${code}`
  return `course-id:${course.id}`
}

function collectAssignmentKeys(records) {
  const keys = new Set()

  records.forEach((record) => {
    getAssignmentKeysFromRecord(record).forEach((key) => keys.add(key))
  })

  return [...keys]
}

function getAssignmentKeysFromRecord(record = {}) {
  const keys = new Set()

  const ids = normalizeIdArray([
    record.assignmentId,
    ...(Array.isArray(record.relatedAssignmentIds)
      ? record.relatedAssignmentIds
      : []),
    ...(Array.isArray(record.assignmentIds) ? record.assignmentIds : []),
  ])

  ids.forEach((id) => {
    keys.add(`assignment-id:${id}`)

    const assignment = allAssignments.value.find(
      (item) => String(item.id) === String(id),
    )

    if (assignment) keys.add(getAssignmentFilterValue(assignment))
  })

  const textValues = [record.assignment, record.assignmentName]

  textValues.forEach((value) => {
    const normalized = normalizeComparableText(value)
    if (!normalized) return

    keys.add(`assignment-text:${normalized}`)

    const assignment = allAssignments.value.find((item) => {
      return normalizeComparableText(item.title) === normalized
    })

    if (assignment) {
      keys.add(getAssignmentFilterValue(assignment))
      keys.add(`assignment-id:${assignment.id}`)
    }
  })

  return [...keys]
}

function getAssignmentFilterValue(assignment) {
  return `assignment-id:${assignment.id}`
}

function getCourseNames(courseKeys, records) {
  const names = new Set()

  allCourses.value.forEach((course) => {
    const courseKeysForOption = [
      getCourseFilterValue(course),
      `course-id:${course.id}`,
    ]

    if (courseKeysForOption.some((key) => courseKeys.includes(key))) {
      names.add(course.code || course.title)
    }
  })

  records.forEach((record) => {
    if (hasText(record.course)) names.add(String(record.course).trim())
  })

  return [...names].filter(Boolean)
}

function getAssignmentNames(assignmentKeys, records) {
  const names = new Set()

  allAssignments.value.forEach((assignment) => {
    const keys = [
      getAssignmentFilterValue(assignment),
      `assignment-id:${assignment.id}`,
    ]

    if (keys.some((key) => assignmentKeys.includes(key))) {
      names.add(assignment.title)
    }
  })

  records.forEach((record) => {
    if (hasText(record.assignment)) names.add(String(record.assignment).trim())
  })

  return [...names].filter(Boolean)
}

function buildSubtitle(kind, record) {
  if (kind === 'book') {
    return (
      joinMetadata([
        record.author,
        record.publicationYear || record.year,
        record.publisher,
      ]) || 'Book record'
    )
  }

  if (kind === 'journal') {
    return (
      joinMetadata([record.publisher, record.field]) || 'Journal record'
    )
  }

  if (kind === 'article') {
    return (
      joinMetadata([
        record.author,
        record.journalName || record.journal,
        record.year,
      ]) || 'Journal article'
    )
  }

  return (
    joinMetadata([record.author, record.year, record.publisher]) ||
    'General source'
  )
}

function isMergedMetadataComplete(kind, record) {
  if (kind === 'book') {
    return (
      hasText(record.title) &&
      hasText(record.author) &&
      hasText(record.publisher) &&
      hasText(record.publicationYear || record.year) &&
      hasText(record.isbn)
    )
  }

  if (kind === 'journal') {
    return (
      hasText(record.name || record.title) &&
      hasText(record.publisher) &&
      hasText(record.issn) &&
      hasText(record.website || record.url)
    )
  }

  if (kind === 'article') {
    return (
      hasText(record.title) &&
      hasText(record.author) &&
      hasText(record.year) &&
      hasText(record.journalName || record.journal) &&
      hasText(record.pages) &&
      (hasText(record.doi) || hasText(record.url))
    )
  }

  return (
    hasText(record.title) &&
    (hasText(record.author) || hasText(record.publisher)) &&
    (hasText(record.year) || hasText(record.accessDate)) &&
    hasText(record.citation)
  )
}

function buildSearchText(records, extras) {
  const values = [
    extras.title,
    extras.typeLabel,
    ...extras.tags,
    ...extras.courseNames,
    ...extras.assignmentNames,
    ...extras.statusValues,
    ...extras.priorityValues,
  ]

  records.forEach((record) => {
    values.push(
      record.title,
      record.name,
      record.subtitle,
      record.author,
      record.publisher,
      record.year,
      record.publicationYear,
      record.notes,
      record.summary,
      record.abstract,
      record.sectionNotes,
      record.keyQuotes,
      record.useForWriting,
      record.genre,
      record.field,
      record.journalName,
      record.journal,
      record.doi,
      record.url,
      record.isbn,
      record.issn,
      record.citation,
      record.course,
      record.assignment,
    )
  })

  return values.filter(Boolean).join(' ').toLowerCase()
}

function getNewestDate(records) {
  const timestamps = records
    .map((record) => record.createdAt || record.created_at || '')
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value))

  if (!timestamps.length) return ''
  return new Date(Math.max(...timestamps)).toISOString()
}

function isRecordConnected(record, kind, fallbackTitle) {
  const idValues = [
    record.id,
    record.sourceId,
    record.originalId,
    record.recordId,
  ]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value))

  const title = normalizeComparableText(
    record.title || record.name || fallbackTitle,
  )
  const author = normalizeComparableText(record.author)

  return relationshipSources.value.some((source) => {
    const sourceIds = [
      source.id,
      source.sourceId,
      source.originalId,
      source.recordId,
    ]
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value))

    const idMatch = sourceIds.some((id) => idValues.includes(id))
    const titleMatch =
      title && normalizeComparableText(source.title) === title
    const authorMatch =
      !author ||
      !source.author ||
      normalizeComparableText(source.author) === author
    const typeMatch = relationshipTypeMatchesKind(source.sourceType, kind)

    return (
      typeMatch &&
      (idMatch || (titleMatch && authorMatch)) &&
      connectedRelationshipUids.value.has(String(source.uid))
    )
  })
}

function relationshipTypeMatchesKind(sourceType, kind) {
  const type = normalizeComparableText(sourceType)

  if (!type) return true
  if (kind === 'source') return true
  return type.includes(kind)
}

function sortResearchRecords(records, mode) {
  const sorted = [...records]

  if (mode === 'newest') {
    return sorted.sort((a, b) => {
      const first = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const second = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return second - first || a.title.localeCompare(b.title)
    })
  }

  if (mode === 'type') {
    return sorted.sort((a, b) => {
      return (
        a.typeLabel.localeCompare(b.typeLabel) ||
        a.title.localeCompare(b.title)
      )
    })
  }

  if (mode === 'status') {
    return sorted.sort((a, b) => {
      return (
        String(a.status || 'zzzz').localeCompare(String(b.status || 'zzzz')) ||
        a.title.localeCompare(b.title)
      )
    })
  }

  return sorted.sort((a, b) => a.title.localeCompare(b.title))
}

function refreshRelationshipData() {
  relationshipSources.value = getAllSources()
  relationships.value = readSourceRelationships()
}

function createSource() {
  const source = addSource({ title: 'Untitled Source' })
  router.push(`/sources/${source.id}`)
}

function createBook() {
  const book = addBook({ title: 'Untitled Book' })
  router.push(`/books/${book.id}`)
}

function createJournal() {
  const journal = addJournal({ name: 'Untitled Journal' })
  router.push(`/journals/${journal.id}`)
}

function showMoreResults() {
  resultLimit.value += 12
}

function clearFilters() {
  filters.search = ''
  filters.type = 'all'
  filters.status = 'all'
  filters.tag = 'all'
  filters.course = 'all'
  filters.assignment = 'all'
  filters.priority = 'all'
  filters.connection = 'all'
  filters.completeness = 'all'
  filters.sort = 'title'
  resultLimit.value = 12
}

function removeFilter(key) {
  if (key === 'search') {
    filters.search = ''
    return
  }

  if (Object.prototype.hasOwnProperty.call(filters, key)) {
    filters[key] = 'all'
  }
}

function getTagRoute(name) {
  return {
    path: `/knowledge-tags/${slugifyTag(name)}`,
    query: { name },
  }
}

function parseSearchTerms(value) {
  return String(value || '')
    .split(/\s*\+\s*/)
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)
}

function sourceTypeIcon(type) {
  const normalized = normalizeComparableText(type)

  if (normalized.includes('book')) return '📚'
  if (normalized.includes('article')) return '📑'
  if (normalized.includes('journal')) return '📰'
  if (normalized.includes('website')) return '🌐'
  if (normalized.includes('dissertation')) return '🎓'
  if (normalized.includes('media')) return '🎧'

  return '📄'
}

function normalizeIdArray(values) {
  const list = Array.isArray(values) ? values : [values]

  return [
    ...new Set(
      list
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== '',
        )
        .map((value) => String(value)),
    ),
  ]
}

function normalizeStatus(value) {
  return String(value || 'planned')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function normalizeOptionalValue(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

  return normalized || ''
}

function normalizeComparableText(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeTag(value) {
  return slugifyTag(value)
}

function slugifyTag(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function formatStatus(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function joinMetadata(values) {
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' · ')
}

function hasText(value) {
  return String(value || '').trim().length > 0
}
</script>

<style scoped>
.research-dashboard {
  display: grid;
  gap: 1.5rem;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  padding: 2rem;
  border: 1px solid rgba(204, 164, 75, 0.36);
  border-radius: 26px;
  background:
    radial-gradient(circle at top left, rgba(204, 164, 75, 0.28), transparent 36%),
    linear-gradient(135deg, #0a1f44, #12376f);
  color: white;
  box-shadow: 0 22px 55px rgba(10, 31, 68, 0.22);
}

.hero-content {
  max-width: 760px;
}

.eyebrow,
.panel-eyebrow {
  margin: 0 0 0.35rem;
  color: #cca44b;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.dashboard-hero .eyebrow {
  color: #f4d58d;
}

.dashboard-hero h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1.08;
}

.hero-description {
  max-width: 680px;
  margin: 0.9rem 0 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.4rem;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  font: inherit;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
}

.primary-action {
  border: 1px solid #cca44b;
  background: #cca44b;
  color: #0a1f44;
}

.secondary-action {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.hero-summary {
  display: grid;
  align-content: center;
  justify-items: center;
  min-width: 230px;
  border: 1px solid rgba(244, 213, 141, 0.3);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  text-align: center;
}

.hero-number {
  color: #f4d58d;
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 900;
  line-height: 1;
}

.hero-label {
  margin-top: 0.45rem;
  font-weight: 900;
}

.hero-detail {
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.82rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(135px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  padding: 1rem;
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow);
}

.stat-card:hover,
.quick-action:hover,
.library-result-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.stat-icon,
.quick-icon,
.library-record-icon,
.record-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 14px;
  background: var(--accent-soft);
  font-size: 1.15rem;
}

.stat-card div:last-child {
  display: grid;
  min-width: 0;
}

.stat-card strong {
  color: var(--text-primary);
  font-size: 1.45rem;
}

.stat-card span {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.panel {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.panel-description {
  max-width: 720px;
  margin: 0.4rem 0 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.5;
}

.text-link {
  color: var(--accent-text);
  font-size: 0.8rem;
  font-weight: 900;
  text-decoration: none;
}

.filters-header,
.results-header {
  align-items: center;
}

.filter-header-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.result-total {
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  padding: 0.4rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
}

.clear-filters-btn,
.empty-clear-btn,
.show-more-btn {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.6rem 0.9rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 900;
  cursor: pointer;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 0.9rem;
  padding: 1.25rem;
}

.filter-field {
  display: grid;
  min-width: 0;
  gap: 0.4rem;
}

.filter-field > span {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 800;
}

.filter-field input,
.filter-field select {
  width: 100%;
  min-width: 0;
  min-height: 43px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.82rem;
}

.search-field {
  grid-column: span 2;
}

.active-filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  border-top: 1px solid var(--border-color);
  background: var(--btn-bg);
  padding: 0.9rem 1.25rem;
}

.active-filter-label {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 900;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.3rem 0.55rem;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.active-filter-chip span {
  color: var(--accent-text);
  font-size: 0.9rem;
  font-weight: 900;
}

.library-results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 1.25rem;
}

.library-result-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--btn-bg);
}

.library-card-main {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
}

.library-card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.library-card-heading {
  display: grid;
  min-width: 0;
  gap: 0.35rem;
}

.library-badge-row,
.record-health-row,
.record-linkage-row,
.record-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.record-type-badge,
.status-badge,
.priority-badge,
.health-badge,
.linkage-chip,
.result-tag-chip,
.more-tags-chip {
  border-radius: 999px;
  padding: 0.22rem 0.48rem;
  font-size: 0.66rem;
  font-weight: 900;
}

.record-type-badge {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.status-badge,
.linkage-chip,
.result-tag-chip,
.more-tags-chip {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
}

.priority-badge {
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}

.priority-urgent {
  background: rgba(190, 18, 60, 0.12);
  color: #be123c;
}

.priority-high {
  background: rgba(234, 88, 12, 0.12);
  color: #c2410c;
}

.priority-medium {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.priority-low {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.library-card-heading h4 {
  overflow: hidden;
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library-card-heading p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.78rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.health-badge {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
}

.health-badge.complete {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.health-badge.incomplete {
  background: rgba(190, 18, 60, 0.1);
  color: #be123c;
}

.health-badge.connected {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.health-badge.unconnected {
  color: var(--text-secondary);
}

.record-linkage-row,
.record-tag-row {
  padding: 0 1rem 0.75rem;
}

.result-tag-chip {
  text-decoration: none;
}

.open-record-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--accent-text);
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 900;
  text-decoration: none;
}

.show-more-row {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  padding: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.75fr);
  gap: 1.5rem;
  align-items: start;
}

.main-column,
.side-column {
  display: grid;
  gap: 1.5rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  padding: 1.25rem;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--btn-bg);
  padding: 0.95rem;
  color: inherit;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.quick-action span:last-child {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.quick-action strong {
  color: var(--text-primary);
}

.quick-action small {
  color: var(--text-secondary);
}

.record-list,
.status-list,
.breakdown-list,
.attention-list {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
}

.record-row,
.attention-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--btn-bg);
  padding: 0.85rem;
  color: inherit;
  text-decoration: none;
}

.record-information,
.attention-row div,
.connected-row div {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.record-information strong,
.connected-row strong {
  overflow: hidden;
  color: var(--text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-information span,
.connected-row small,
.attention-row small {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.record-type {
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  padding: 0.25rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 900;
}

.status-row,
.breakdown-row {
  display: grid;
  gap: 0.45rem;
}

.status-heading,
.breakdown-heading,
.connected-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.status-name {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--accent);
}

.progress-track {
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  background: var(--btn-bg);
}

.progress-fill {
  display: block;
  height: 100%;
  min-width: 4px;
  border-radius: inherit;
  background: var(--accent);
}

.status-planned {
  background: #94a3b8;
}

.status-reading,
.status-in-progress {
  background: #2563eb;
}

.status-reviewing {
  background: #8b5cf6;
}

.status-completed {
  background: #16a34a;
}

.status-archived {
  background: #64748b;
}

.reading-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--border-color);
  background: var(--btn-bg);
}

.reading-summary div {
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
}

.reading-summary div + div {
  border-left: 1px solid var(--border-color);
}

.reading-summary span {
  color: var(--text-secondary);
  font-size: 0.76rem;
}

.reading-summary strong {
  color: var(--text-primary);
  font-size: 1.3rem;
}

.breakdown-fill {
  background: linear-gradient(90deg, #cca44b, #e6c46d);
}

.attention-total,
.attention-count {
  border-radius: 999px;
  background: rgba(190, 18, 60, 0.1);
  color: #be123c;
  padding: 0.25rem 0.5rem;
  font-weight: 900;
}

.connection-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  padding: 1.25rem;
}

.connection-stats div {
  display: grid;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 15px;
  background: var(--btn-bg);
  padding: 0.75rem;
  text-align: center;
}

.connection-stats strong {
  color: var(--text-primary);
  font-size: 1.25rem;
}

.connection-stats span {
  color: var(--text-secondary);
  font-size: 0.68rem;
}

.connected-list {
  display: grid;
  gap: 0.55rem;
  padding: 0 1.25rem 1.25rem;
}

.section-label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.connected-row {
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding: 0.55rem 0;
}

.connected-row > span {
  color: var(--accent-text);
  font-weight: 900;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 1.25rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.35rem 0.6rem;
  font-size: 0.76rem;
  text-decoration: none;
}

.tag-chip strong {
  color: var(--accent-text);
}

.research-navigation {
  display: grid;
  padding: 0.75rem 1.25rem 1.25rem;
}

.research-navigation a {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-radius: 12px;
  padding: 0.7rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.research-navigation a:hover {
  background: var(--btn-bg);
  color: var(--text-primary);
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  margin: 1.25rem;
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  background: var(--btn-bg);
  padding: 1.4rem;
  color: var(--text-primary);
  text-align: center;
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: var(--accent-soft);
  font-size: 1.3rem;
}

@media (max-width: 1250px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }

  .filters-grid {
    grid-template-columns: repeat(3, minmax(170px, 1fr));
  }

  .library-results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.75fr);
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 950px) {
  .dashboard-hero {
    display: grid;
  }

  .hero-summary {
    min-width: 0;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: repeat(2, minmax(170px, 1fr));
  }
}

@media (max-width: 680px) {
  .dashboard-hero {
    padding: 1.35rem;
  }

  .stats-grid,
  .quick-actions,
  .filters-grid,
  .library-results-grid {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: span 1;
  }

  .filters-header,
  .results-header {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-header-actions {
    justify-content: space-between;
  }

  .hero-actions {
    display: grid;
  }

  .reading-summary,
  .connection-stats {
    grid-template-columns: 1fr;
  }

  .reading-summary div + div {
    border-top: 1px solid var(--border-color);
    border-left: 0;
  }
}
</style>
