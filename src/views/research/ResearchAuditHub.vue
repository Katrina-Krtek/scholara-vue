<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import {
  AUDIT_SEVERITIES,
  AUDIT_STATUSES,
  getAuditSeverityLabel,
  getAuditStatusLabel,
  runResearchAudit,
} from '@/utils/ResearchAudit'

const router = useRouter()

const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const severityFilter = ref('all')
const sortBy = ref('priority')
const expandedRecords = ref(new Set())
const isRefreshing = ref(false)

const emptySummary = {
  totalRecords: 0,
  readyCount: 0,
  needsReviewCount: 0,
  criticalCount: 0,
  citationReadyCount: 0,
  totalIssues: 0,
  criticalIssues: 0,
  warningIssues: 0,
  infoIssues: 0,
  healthScore: 100,
  citationReadiness: 100,
}

const auditResult = ref({
  records: [],
  summary: emptySummary,
  auditedAt: '',
})

const records = computed(() => auditResult.value.records || [])
const summary = computed(() => auditResult.value.summary || emptySummary)

const sourceTypes = computed(() => {
  const types = records.value.map((record) => ({
    value: record.type,
    label: record.typeLabel,
  }))

  const uniqueTypes = new Map()

  types.forEach((type) => {
    if (!uniqueTypes.has(type.value)) {
      uniqueTypes.set(type.value, type)
    }
  })

  return Array.from(uniqueTypes.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  )
})

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    statusFilter.value !== 'all' ||
    typeFilter.value !== 'all' ||
    severityFilter.value !== 'all'
  )
})

const filteredRecords = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const filtered = records.value.filter((record) => {
    if (
      statusFilter.value !== 'all' &&
      record.status !== statusFilter.value
    ) {
      return false
    }

    if (
      typeFilter.value !== 'all' &&
      record.type !== typeFilter.value
    ) {
      return false
    }

    if (
      severityFilter.value !== 'all' &&
      !record.issues.some(
        (issue) => issue.severity === severityFilter.value,
      )
    ) {
      return false
    }

    if (!query) {
      return true
    }

    const searchableText = [
      record.title,
      record.authorDisplay,
      record.typeLabel,
      record.publicationYear,
      record.publicationContainer,
      ...record.tags,
      ...record.issues.map((issue) => issue.label),
      ...record.issues.map((issue) => issue.message),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(query)
  })

  return [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'score-low':
        return a.score - b.score

      case 'score-high':
        return b.score - a.score

      case 'title':
        return (a.title || 'Untitled').localeCompare(
          b.title || 'Untitled',
        )

      case 'issues':
        return b.issueCount - a.issueCount

      case 'priority':
      default:
        if (b.criticalCount !== a.criticalCount) {
          return b.criticalCount - a.criticalCount
        }

        if (b.warningCount !== a.warningCount) {
          return b.warningCount - a.warningCount
        }

        if (a.score !== b.score) {
          return a.score - b.score
        }

        return (a.title || 'Untitled').localeCompare(
          b.title || 'Untitled',
        )
    }
  })
})

const healthTone = computed(() => {
  if (summary.value.healthScore >= 85) {
    return 'healthy'
  }

  if (summary.value.healthScore >= 60) {
    return 'attention'
  }

  return 'critical'
})

const healthMessage = computed(() => {
  if (summary.value.totalRecords === 0) {
    return 'Add research records to begin measuring research health.'
  }

  if (summary.value.healthScore >= 85) {
    return 'Your research library is in strong condition.'
  }

  if (summary.value.healthScore >= 60) {
    return 'Your library is usable, but several records need attention.'
  }

  return 'Important metadata gaps may prevent accurate citations and retrieval.'
})

const lastAuditedLabel = computed(() => {
  if (!auditResult.value.auditedAt) {
    return 'Not yet audited'
  }

  const date = new Date(auditResult.value.auditedAt)

  if (Number.isNaN(date.getTime())) {
    return 'Recently audited'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
})

function runAudit() {
  isRefreshing.value = true

  auditResult.value = runResearchAudit()

  window.setTimeout(() => {
    isRefreshing.value = false
  }, 250)
}

function handleStorageChange() {
  runAudit()
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
  severityFilter.value = 'all'
}

function applyStatusFilter(status) {
  statusFilter.value = status
}

function applySeverityFilter(severity) {
  severityFilter.value = severity
}

function toggleRecord(recordId) {
  const updated = new Set(expandedRecords.value)

  if (updated.has(recordId)) {
    updated.delete(recordId)
  } else {
    updated.add(recordId)
  }

  expandedRecords.value = updated
}

function isExpanded(recordId) {
  return expandedRecords.value.has(recordId)
}

function visibleIssues(record) {
  if (severityFilter.value === 'all') {
    return record.issues
  }

  return record.issues.filter(
    (issue) => issue.severity === severityFilter.value,
  )
}

function openRecord(record) {
  if (!record.detailPath) {
    return
  }

  router.push(record.detailPath)
}

function statusClass(status) {
  return {
    'status-ready': status === AUDIT_STATUSES.READY,
    'status-review': status === AUDIT_STATUSES.NEEDS_REVIEW,
    'status-critical': status === AUDIT_STATUSES.CRITICAL,
  }
}

function severityClass(severity) {
  return {
    'severity-critical':
      severity === AUDIT_SEVERITIES.CRITICAL,
    'severity-warning':
      severity === AUDIT_SEVERITIES.WARNING,
    'severity-info':
      severity === AUDIT_SEVERITIES.INFO,
  }
}

function scoreClass(score) {
  if (score >= 85) {
    return 'score-good'
  }

  if (score >= 60) {
    return 'score-medium'
  }

  return 'score-low'
}

function issueIcon(severity) {
  switch (severity) {
    case AUDIT_SEVERITIES.CRITICAL:
      return '!'

    case AUDIT_SEVERITIES.WARNING:
      return '△'

    default:
      return 'i'
  }
}

onMounted(() => {
  runAudit()
  window.addEventListener('storage', handleStorageChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <AppLayout
    title="Research Audit"
    subtitle="Find incomplete records, citation gaps, and disconnected research."
  >
    <div class="research-audit-page">
      <section class="audit-overview">
        <div class="health-panel" :class="`health-${healthTone}`">
          <div
            class="health-ring"
            :style="{
              '--health-progress': `${summary.healthScore * 3.6}deg`,
            }"
          >
            <div class="health-ring-inner">
              <strong>{{ summary.healthScore }}</strong>
              <span>Health</span>
            </div>
          </div>

          <div class="health-copy">
            <p class="eyebrow">Research Health Score</p>
            <h2>{{ healthMessage }}</h2>

            <div class="health-meta">
              <span>
                {{ summary.totalRecords }}
                {{
                  summary.totalRecords === 1
                    ? 'record audited'
                    : 'records audited'
                }}
              </span>

              <span class="meta-divider" aria-hidden="true"></span>

              <span>Last checked {{ lastAuditedLabel }}</span>
            </div>
          </div>

          <button
            class="refresh-button"
            type="button"
            :disabled="isRefreshing"
            @click="runAudit"
          >
            <span
              class="refresh-icon"
              :class="{ spinning: isRefreshing }"
              aria-hidden="true"
            >
              ↻
            </span>
            {{ isRefreshing ? 'Auditing…' : 'Run Audit' }}
          </button>
        </div>

        <div class="metric-grid">
          <button
            class="metric-card"
            :class="{
              active: statusFilter === 'all',
            }"
            type="button"
            @click="applyStatusFilter('all')"
          >
            <span class="metric-label">Research Records</span>
            <strong>{{ summary.totalRecords }}</strong>
            <span class="metric-detail">
              Across your research library
            </span>
          </button>

          <button
            class="metric-card metric-ready"
            :class="{
              active: statusFilter === AUDIT_STATUSES.READY,
            }"
            type="button"
            @click="applyStatusFilter(AUDIT_STATUSES.READY)"
          >
            <span class="metric-label">Audit Ready</span>
            <strong>{{ summary.readyCount }}</strong>
            <span class="metric-detail">
              No identified issues
            </span>
          </button>

          <button
            class="metric-card metric-review"
            :class="{
              active:
                statusFilter === AUDIT_STATUSES.NEEDS_REVIEW,
            }"
            type="button"
            @click="
              applyStatusFilter(AUDIT_STATUSES.NEEDS_REVIEW)
            "
          >
            <span class="metric-label">Needs Review</span>
            <strong>{{ summary.needsReviewCount }}</strong>
            <span class="metric-detail">
              Missing supporting information
            </span>
          </button>

          <button
            class="metric-card metric-critical"
            :class="{
              active: statusFilter === AUDIT_STATUSES.CRITICAL,
            }"
            type="button"
            @click="applyStatusFilter(AUDIT_STATUSES.CRITICAL)"
          >
            <span class="metric-label">Critical Records</span>
            <strong>{{ summary.criticalCount }}</strong>
            <span class="metric-detail">
              Citation-blocking metadata gaps
            </span>
          </button>
        </div>
      </section>

      <section
        v-if="summary.totalRecords > 0"
        class="citation-readiness-panel"
      >
        <div class="readiness-heading">
          <div>
            <p class="eyebrow">Citation Readiness</p>
            <h3>
              {{ summary.citationReadyCount }} of
              {{ summary.totalRecords }} records contain the required
              citation metadata
            </h3>
          </div>

          <strong>{{ summary.citationReadiness }}%</strong>
        </div>

        <div
          class="progress-track"
          role="progressbar"
          aria-label="Citation readiness"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="summary.citationReadiness"
        >
          <span
            class="progress-fill"
            :style="{
              width: `${summary.citationReadiness}%`,
            }"
          ></span>
        </div>

        <div class="issue-totals">
          <button
            type="button"
            :class="{
              selected:
                severityFilter === AUDIT_SEVERITIES.CRITICAL,
            }"
            @click="
              applySeverityFilter(
                severityFilter === AUDIT_SEVERITIES.CRITICAL
                  ? 'all'
                  : AUDIT_SEVERITIES.CRITICAL,
              )
            "
          >
            <span class="issue-dot dot-critical"></span>
            {{ summary.criticalIssues }} critical
          </button>

          <button
            type="button"
            :class="{
              selected:
                severityFilter === AUDIT_SEVERITIES.WARNING,
            }"
            @click="
              applySeverityFilter(
                severityFilter === AUDIT_SEVERITIES.WARNING
                  ? 'all'
                  : AUDIT_SEVERITIES.WARNING,
              )
            "
          >
            <span class="issue-dot dot-warning"></span>
            {{ summary.warningIssues }} warnings
          </button>

          <button
            type="button"
            :class="{
              selected:
                severityFilter === AUDIT_SEVERITIES.INFO,
            }"
            @click="
              applySeverityFilter(
                severityFilter === AUDIT_SEVERITIES.INFO
                  ? 'all'
                  : AUDIT_SEVERITIES.INFO,
              )
            "
          >
            <span class="issue-dot dot-info"></span>
            {{ summary.infoIssues }} improvements
          </button>
        </div>
      </section>

      <section class="audit-workspace">
        <div class="workspace-heading">
          <div>
            <p class="eyebrow">Audit Results</p>
            <h2>Research records</h2>
            <p>
              Review critical records first, then complete supporting
              metadata and research connections.
            </p>
          </div>

          <div class="result-count">
            {{ filteredRecords.length }}
            {{
              filteredRecords.length === 1
                ? 'record shown'
                : 'records shown'
            }}
          </div>
        </div>

        <div class="filter-toolbar">
          <label class="search-field">
            <span class="sr-only">Search research audit</span>
            <span class="search-icon" aria-hidden="true">⌕</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search titles, authors, tags, or issues…"
            />
          </label>

          <label class="filter-field">
            <span>Status</span>
            <select v-model="statusFilter">
              <option value="all">All statuses</option>
              <option :value="AUDIT_STATUSES.CRITICAL">
                Critical
              </option>
              <option :value="AUDIT_STATUSES.NEEDS_REVIEW">
                Needs Review
              </option>
              <option :value="AUDIT_STATUSES.READY">
                Ready
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Source type</span>
            <select v-model="typeFilter">
              <option value="all">All types</option>
              <option
                v-for="type in sourceTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Issue level</span>
            <select v-model="severityFilter">
              <option value="all">All issues</option>
              <option :value="AUDIT_SEVERITIES.CRITICAL">
                Critical
              </option>
              <option :value="AUDIT_SEVERITIES.WARNING">
                Warning
              </option>
              <option :value="AUDIT_SEVERITIES.INFO">
                Improvement
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Sort</span>
            <select v-model="sortBy">
              <option value="priority">Priority</option>
              <option value="issues">Most issues</option>
              <option value="score-low">Lowest score</option>
              <option value="score-high">Highest score</option>
              <option value="title">Title</option>
            </select>
          </label>

          <button
            v-if="hasActiveFilters"
            class="clear-filter-button"
            type="button"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>

        <div
          v-if="summary.totalRecords === 0"
          class="empty-state empty-library"
        >
          <div class="empty-icon" aria-hidden="true">⌕</div>
          <h3>No research records were found</h3>
          <p>
            Add a source, book, journal, or article. The Research Audit
            Hub will automatically evaluate it the next time the audit
            runs.
          </p>

          <div class="empty-actions">
            <RouterLink class="primary-action" to="/sources">
              Open Sources
            </RouterLink>

            <RouterLink class="secondary-action" to="/books">
              Open Books
            </RouterLink>

            <RouterLink class="secondary-action" to="/journals">
              Open Journals
            </RouterLink>

            <RouterLink class="secondary-action" to="/articles">
              Open Articles
            </RouterLink>
          </div>
        </div>

        <div
          v-else-if="filteredRecords.length === 0"
          class="empty-state"
        >
          <div class="empty-icon" aria-hidden="true">✓</div>
          <h3>No records match these filters</h3>
          <p>
            Try another search or clear the filters to view the full
            audit.
          </p>

          <button
            class="primary-action"
            type="button"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </div>

        <div v-else class="record-list">
          <article
            v-for="record in filteredRecords"
            :key="`${record.storageKey}-${record.id}`"
            class="audit-record"
            :class="statusClass(record.status)"
          >
            <div class="record-main">
              <div class="record-status-column">
                <div
                  class="score-badge"
                  :class="scoreClass(record.score)"
                >
                  <strong>{{ record.score }}</strong>
                  <span>score</span>
                </div>
              </div>

              <div class="record-content">
                <div class="record-heading-row">
                  <div class="record-heading">
                    <div class="record-labels">
                      <span class="type-badge">
                        {{ record.typeLabel }}
                      </span>

                      <span
                        class="status-badge"
                        :class="statusClass(record.status)"
                      >
                        {{ getAuditStatusLabel(record.status) }}
                      </span>

                      <span
                        v-if="record.citationReady"
                        class="citation-ready-badge"
                      >
                        Citation ready
                      </span>
                    </div>

                    <h3>
                      {{ record.title || 'Untitled research record' }}
                    </h3>

                    <p class="record-byline">
                      <span v-if="record.authorDisplay">
                        {{ record.authorDisplay }}
                      </span>

                      <span
                        v-if="
                          record.authorDisplay &&
                          record.publicationYear
                        "
                        aria-hidden="true"
                      >
                        ·
                      </span>

                      <span v-if="record.publicationYear">
                        {{ record.publicationYear }}
                      </span>

                      <span
                        v-if="
                          (record.authorDisplay ||
                            record.publicationYear) &&
                          record.publicationContainer
                        "
                        aria-hidden="true"
                      >
                        ·
                      </span>

                      <span v-if="record.publicationContainer">
                        {{ record.publicationContainer }}
                      </span>

                      <span
                        v-if="
                          !record.authorDisplay &&
                          !record.publicationYear &&
                          !record.publicationContainer
                        "
                      >
                        Core publication information is missing
                      </span>
                    </p>
                  </div>

                  <div class="record-actions">
                    <button
                      class="review-button"
                      type="button"
                      @click="openRecord(record)"
                    >
                      Review Record
                    </button>

                    <button
                      class="expand-button"
                      type="button"
                      :aria-expanded="isExpanded(record.id)"
                      :aria-label="
                        isExpanded(record.id)
                          ? 'Collapse audit issues'
                          : 'Expand audit issues'
                      "
                      @click="toggleRecord(record.id)"
                    >
                      <span
                        :class="{
                          rotated: isExpanded(record.id),
                        }"
                        aria-hidden="true"
                      >
                        ⌄
                      </span>
                    </button>
                  </div>
                </div>

                <div v-if="record.issueCount > 0" class="issue-preview">
                  <div
                    v-for="issue in visibleIssues(record).slice(0, 3)"
                    :key="issue.id"
                    class="issue-chip"
                    :class="severityClass(issue.severity)"
                  >
                    <span class="issue-chip-icon">
                      {{ issueIcon(issue.severity) }}
                    </span>
                    {{ issue.label }}
                  </div>

                  <span
                    v-if="visibleIssues(record).length > 3"
                    class="additional-issues"
                  >
                    +{{ visibleIssues(record).length - 3 }} more
                  </span>
                </div>

                <div v-else class="ready-message">
                  <span aria-hidden="true">✓</span>
                  This record passed every current audit check.
                </div>

                <div class="record-stats">
                  <span>
                    <strong>{{ record.criticalCount }}</strong>
                    critical
                  </span>

                  <span>
                    <strong>{{ record.warningCount }}</strong>
                    warnings
                  </span>

                  <span>
                    <strong>{{ record.infoCount }}</strong>
                    improvements
                  </span>

                  <span>
                    <strong>{{ record.tags.length }}</strong>
                    tags
                  </span>

                  <span>
                    <strong>{{ record.relationships.length }}</strong>
                    source links
                  </span>
                </div>

                <div
                  v-if="isExpanded(record.id)"
                  class="expanded-audit"
                >
                  <div class="expanded-heading">
                    <div>
                      <h4>Audit findings</h4>
                      <p>
                        Complete these fields from highest to lowest
                        priority.
                      </p>
                    </div>

                    <span>
                      {{ visibleIssues(record).length }}
                      {{
                        visibleIssues(record).length === 1
                          ? 'finding'
                          : 'findings'
                      }}
                    </span>
                  </div>

                  <div
                    v-if="visibleIssues(record).length > 0"
                    class="finding-list"
                  >
                    <div
                      v-for="issue in visibleIssues(record)"
                      :key="issue.id"
                      class="finding-row"
                      :class="severityClass(issue.severity)"
                    >
                      <div class="finding-icon">
                        {{ issueIcon(issue.severity) }}
                      </div>

                      <div class="finding-copy">
                        <div class="finding-title">
                          <strong>{{ issue.label }}</strong>

                          <span>
                            {{
                              getAuditSeverityLabel(issue.severity)
                            }}
                          </span>

                          <span
                            v-if="issue.citationBlocking"
                            class="blocking-label"
                          >
                            Citation blocking
                          </span>
                        </div>

                        <p>{{ issue.message }}</p>
                      </div>
                    </div>
                  </div>

                  <div v-else class="expanded-ready">
                    No findings remain under the selected issue filter.
                  </div>

                  <div class="expanded-actions">
                    <button
                      class="primary-action"
                      type="button"
                      @click="openRecord(record)"
                    >
                      Open and Correct Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<style scoped>
.research-audit-page {
  display: grid;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.audit-overview {
  display: grid;
  gap: 1rem;
}

.health-panel {
  --health-color: #a87912;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow: hidden;
  background:
    radial-gradient(
      circle at top right,
      rgba(212, 175, 55, 0.14),
      transparent 34%
    ),
    linear-gradient(135deg, #10233f, #18395f);
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 20px;
  color: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 35, 63, 0.14);
}

.health-panel.health-healthy {
  --health-color: #47a478;
}

.health-panel.health-attention {
  --health-color: #e2ad3c;
}

.health-panel.health-critical {
  --health-color: #dc6a62;
}

.health-ring {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: conic-gradient(
    var(--health-color) var(--health-progress),
    rgba(255, 255, 255, 0.13) 0deg
  );
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.health-ring-inner {
  display: grid;
  place-items: center;
  align-content: center;
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: #142c4b;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

.health-ring strong {
  font-size: 1.75rem;
  line-height: 1;
}

.health-ring span {
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.health-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #a87912;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.health-copy .eyebrow {
  color: #e9c86a;
}

.health-copy h2 {
  max-width: 720px;
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.65rem);
  line-height: 1.3;
}

.health-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.8rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.82rem;
}

.meta-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 42px;
  padding: 0.65rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.refresh-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.refresh-icon {
  display: inline-block;
  font-size: 1rem;
}

.refresh-icon.spinning {
  animation: spin 700ms linear infinite;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.metric-card {
  position: relative;
  display: grid;
  gap: 0.25rem;
  min-width: 0;
  padding: 1.1rem;
  overflow: hidden;
  text-align: left;
  border: 1px solid #dde4ec;
  border-radius: 15px;
  background: #ffffff;
  color: #172033;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 35, 63, 0.05);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.metric-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  content: '';
  background: #7f8ca0;
}

.metric-card:hover,
.metric-card.active {
  border-color: #b7c4d3;
  box-shadow: 0 12px 30px rgba(15, 35, 63, 0.09);
  transform: translateY(-2px);
}

.metric-card.active {
  outline: 2px solid rgba(15, 35, 63, 0.08);
}

.metric-card.metric-ready::before {
  background: #318864;
}

.metric-card.metric-review::before {
  background: #c28a18;
}

.metric-card.metric-critical::before {
  background: #c84c46;
}

.metric-label {
  color: #657184;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.metric-card strong {
  margin-top: 0.15rem;
  color: #10233f;
  font-size: 1.8rem;
  line-height: 1;
}

.metric-detail {
  color: #7a8495;
  font-size: 0.78rem;
}

.citation-readiness-panel,
.audit-workspace {
  padding: 1.25rem;
  border: 1px solid #dde4ec;
  border-radius: 17px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 35, 63, 0.05);
}

.readiness-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.readiness-heading h3 {
  margin: 0;
  color: #1c2a3d;
  font-size: 1rem;
  font-weight: 700;
}

.readiness-heading > strong {
  color: #10233f;
  font-size: 1.4rem;
}

.progress-track {
  height: 9px;
  margin-top: 0.9rem;
  overflow: hidden;
  border-radius: 999px;
  background: #edf1f5;
}

.progress-fill {
  display: block;
  min-width: 3px;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #b3821d, #d2ac45);
  transition: width 300ms ease;
}

.issue-totals {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.issue-totals button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.38rem 0.62rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #f5f7fa;
  color: #536075;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.issue-totals button:hover,
.issue-totals button.selected {
  border-color: #cfd7e1;
  background: #ffffff;
}

.issue-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-critical {
  background: #c84c46;
}

.dot-warning {
  background: #d29925;
}

.dot-info {
  background: #5884b3;
}

.audit-workspace {
  display: grid;
  gap: 1.1rem;
}

.workspace-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.workspace-heading h2 {
  margin: 0;
  color: #172033;
  font-size: 1.3rem;
}

.workspace-heading p:not(.eyebrow) {
  max-width: 650px;
  margin: 0.3rem 0 0;
  color: #6a7587;
  font-size: 0.86rem;
  line-height: 1.5;
}

.result-count {
  flex: 0 0 auto;
  color: #6a7587;
  font-size: 0.8rem;
  font-weight: 700;
}

.filter-toolbar {
  display: grid;
  grid-template-columns:
    minmax(220px, 1.8fr)
    repeat(4, minmax(120px, 0.75fr))
    auto;
  align-items: end;
  gap: 0.65rem;
  padding: 0.8rem;
  border: 1px solid #e1e6ed;
  border-radius: 13px;
  background: #f8fafc;
}

.search-field {
  position: relative;
}

.search-field input,
.filter-field select {
  width: 100%;
  min-height: 42px;
  border: 1px solid #ccd5df;
  border-radius: 9px;
  background: #ffffff;
  color: #263448;
  font: inherit;
  font-size: 0.82rem;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.search-field input {
  padding: 0.65rem 0.75rem 0.65rem 2.15rem;
}

.filter-field {
  display: grid;
  gap: 0.3rem;
}

.filter-field > span {
  color: #637085;
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.filter-field select {
  padding: 0.55rem 2rem 0.55rem 0.65rem;
}

.search-field input:focus,
.filter-field select:focus {
  border-color: #9e7a27;
  box-shadow: 0 0 0 3px rgba(169, 126, 27, 0.12);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  color: #7b8797;
  font-size: 1rem;
  pointer-events: none;
  transform: translateY(-50%);
}

.clear-filter-button {
  min-height: 42px;
  padding: 0.55rem 0.75rem;
  border: 1px solid #ccd5df;
  border-radius: 9px;
  background: #ffffff;
  color: #556276;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 750;
  cursor: pointer;
}

.clear-filter-button:hover {
  border-color: #aeb9c6;
  color: #172033;
}

.record-list {
  display: grid;
  gap: 0.85rem;
}

.audit-record {
  overflow: hidden;
  border: 1px solid #dce3eb;
  border-left-width: 4px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(15, 35, 63, 0.04);
}

.audit-record.status-ready {
  border-left-color: #318864;
}

.audit-record.status-review {
  border-left-color: #d29925;
}

.audit-record.status-critical {
  border-left-color: #c84c46;
}

.record-main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.record-status-column {
  padding-top: 0.1rem;
}

.score-badge {
  display: grid;
  place-items: center;
  align-content: center;
  width: 58px;
  height: 58px;
  border: 1px solid;
  border-radius: 13px;
}

.score-badge strong {
  font-size: 1.12rem;
  line-height: 1;
}

.score-badge span {
  margin-top: 0.16rem;
  font-size: 0.61rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.score-good {
  border-color: #b8dccb;
  background: #edf8f2;
  color: #226c4f;
}

.score-medium {
  border-color: #ead5a7;
  background: #fff8e8;
  color: #926614;
}

.score-low {
  border-color: #edc3c0;
  background: #fff0ef;
  color: #a43b36;
}

.record-content {
  min-width: 0;
}

.record-heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.record-heading {
  min-width: 0;
}

.record-labels {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.type-badge,
.status-badge,
.citation-ready-badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0.2rem 0.48rem;
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.type-badge {
  background: #edf2f7;
  color: #536075;
}

.status-badge.status-ready {
  background: #e9f6ef;
  color: #287354;
}

.status-badge.status-review {
  background: #fff4dc;
  color: #926614;
}

.status-badge.status-critical {
  background: #fdeceb;
  color: #a43b36;
}

.citation-ready-badge {
  background: #edf3fb;
  color: #3e6f9f;
}

.record-heading h3 {
  margin: 0.5rem 0 0;
  overflow-wrap: anywhere;
  color: #172033;
  font-size: 1.03rem;
  line-height: 1.35;
}

.record-byline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.3rem 0 0;
  color: #6e798b;
  font-size: 0.78rem;
  line-height: 1.45;
}

.record-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.4rem;
}

.review-button,
.expand-button {
  border: 1px solid #ccd5df;
  border-radius: 9px;
  background: #ffffff;
  color: #263448;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 750;
  cursor: pointer;
}

.review-button {
  min-height: 36px;
  padding: 0.48rem 0.72rem;
}

.expand-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
}

.review-button:hover,
.expand-button:hover {
  border-color: #9e7a27;
  color: #7c5c15;
}

.expand-button span {
  display: inline-block;
  font-size: 1rem;
  transition: transform 180ms ease;
}

.expand-button span.rotated {
  transform: rotate(180deg);
}

.issue-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.issue-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 27px;
  padding: 0.3rem 0.5rem;
  border: 1px solid;
  border-radius: 7px;
  font-size: 0.7rem;
  font-weight: 700;
}

.issue-chip-icon {
  display: grid;
  place-items: center;
  width: 15px;
  height: 15px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 0.58rem;
  line-height: 1;
}

.severity-critical {
  border-color: #efc7c4;
  background: #fff2f1;
  color: #a43b36;
}

.severity-warning {
  border-color: #edd9aa;
  background: #fff8e8;
  color: #8c6317;
}

.severity-info {
  border-color: #cbdcec;
  background: #f0f6fc;
  color: #416e9b;
}

.additional-issues {
  color: #788394;
  font-size: 0.7rem;
  font-weight: 700;
}

.ready-message {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  color: #287354;
  font-size: 0.76rem;
  font-weight: 700;
}

.ready-message span {
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #e9f6ef;
}

.record-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.8rem;
  padding-top: 0.7rem;
  border-top: 1px solid #edf0f4;
  color: #778294;
  font-size: 0.68rem;
}

.record-stats strong {
  color: #4b586c;
}

.expanded-audit {
  margin-top: 0.95rem;
  padding: 1rem;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  background: #f8fafc;
}

.expanded-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.expanded-heading h4 {
  margin: 0;
  color: #1e2b3e;
  font-size: 0.9rem;
}

.expanded-heading p {
  margin: 0.2rem 0 0;
  color: #758093;
  font-size: 0.72rem;
}

.expanded-heading > span {
  color: #657184;
  font-size: 0.7rem;
  font-weight: 750;
}

.finding-list {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.8rem;
}

.finding-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid;
  border-radius: 9px;
}

.finding-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 800;
}

.finding-copy {
  min-width: 0;
}

.finding-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.finding-title strong {
  color: currentColor;
  font-size: 0.78rem;
}

.finding-title > span {
  padding: 0.16rem 0.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.finding-title .blocking-label {
  background: #ffffff;
  color: #a43b36;
}

.finding-copy p {
  margin: 0.25rem 0 0;
  color: #5e6b7e;
  font-size: 0.73rem;
  line-height: 1.45;
}

.expanded-ready {
  margin-top: 0.8rem;
  padding: 0.75rem;
  border-radius: 9px;
  background: #edf8f2;
  color: #287354;
  font-size: 0.76rem;
  font-weight: 700;
}

.expanded-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.8rem;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 39px;
  padding: 0.55rem 0.8rem;
  border-radius: 9px;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
}

.primary-action {
  border: 1px solid #10233f;
  background: #10233f;
  color: #ffffff;
}

.primary-action:hover {
  background: #193c63;
}

.secondary-action {
  border: 1px solid #ccd5df;
  background: #ffffff;
  color: #344258;
}

.secondary-action:hover {
  border-color: #a87912;
  color: #7c5c15;
}

.empty-state {
  display: grid;
  justify-items: center;
  padding: 3rem 1rem;
  text-align: center;
  border: 1px dashed #ccd5df;
  border-radius: 14px;
  background: #fafbfd;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 0.8rem;
  border-radius: 16px;
  background: #eef2f7;
  color: #516075;
  font-size: 1.5rem;
}

.empty-state h3 {
  margin: 0;
  color: #1d2a3d;
  font-size: 1.05rem;
}

.empty-state p {
  max-width: 570px;
  margin: 0.45rem 0 1rem;
  color: #6c788b;
  font-size: 0.82rem;
  line-height: 1.55;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-toolbar {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .search-field {
    grid-column: span 2;
  }
}

@media (max-width: 820px) {
  .health-panel {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .refresh-button {
    grid-column: 1 / -1;
    width: 100%;
  }

  .filter-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-field {
    grid-column: 1 / -1;
  }

  .record-heading-row {
    display: grid;
  }

  .record-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 580px) {
  .research-audit-page {
    gap: 1rem;
  }

  .health-panel {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .health-meta {
    justify-content: center;
  }

  .metric-grid,
  .filter-toolbar {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: auto;
  }

  .workspace-heading,
  .readiness-heading {
    display: grid;
    align-items: start;
  }

  .record-main {
    grid-template-columns: 1fr;
  }

  .record-status-column {
    display: flex;
  }

  .score-badge {
    width: 54px;
    height: 48px;
  }

  .record-actions {
    width: 100%;
  }

  .review-button {
    flex: 1;
  }

  .record-stats {
    gap: 0.55rem;
  }
}
</style>