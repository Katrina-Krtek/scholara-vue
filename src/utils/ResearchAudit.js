// src/utils/researchAudit.js

/**
 * Scholarory Research Audit Engine
 *
 * Reviews records from the existing Sources, Books, Journals, Articles,
 * Websites, and Dissertations systems.
 *
 * Storage keys are checked in priority order. Only the first populated
 * key for each record type is used. This prevents old localStorage data
 * from appearing alongside the current Scholarory databases.
 */

export const AUDIT_SEVERITIES = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
}

export const AUDIT_STATUSES = {
  READY: 'ready',
  NEEDS_REVIEW: 'needs-review',
  CRITICAL: 'critical',
}

/**
 * The first populated key in each group is used.
 *
 * Important:
 * The current Books module uses "scholarory-books".
 * Older book keys remain only as fallbacks and will not be combined
 * with the current database.
 */
export const RESEARCH_STORAGE_GROUPS = [
  {
    type: 'source',
    keys: [
      'scholarory-sources',
      'scholarory_sources',
      'sources',
      'researchSources',
    ],
  },
  {
    type: 'book',
    keys: [
      'scholarory-books',
      'scholarory_books',
      'books',
      'researchBooks',
    ],
  },
  {
    type: 'journal',
    keys: [
      'scholarory-journals',
      'scholarory_journals',
      'journalItems',
      'journals',
      'researchJournals',
    ],
  },
  {
    type: 'article',
    keys: [
      'scholarory-articles',
      'scholarory_articles',
      'articleItems',
      'articles',
      'researchArticles',
    ],
  },
  {
    type: 'website',
    keys: [
      'scholarory-websites',
      'scholarory_websites',
      'websites',
      'researchWebsites',
    ],
  },
  {
    type: 'dissertation',
    keys: [
      'scholarory-dissertations',
      'scholarory_dissertations',
      'dissertations',
      'researchDissertations',
    ],
  },
]

const TYPE_ALIASES = {
  source: 'source',
  sources: 'source',

  book: 'book',
  books: 'book',
  monograph: 'book',

  journal: 'journal',
  journals: 'journal',
  periodical: 'journal',

  article: 'article',
  articles: 'article',
  'journal article': 'article',
  'journal-article': 'article',

  website: 'website',
  websites: 'website',
  webpage: 'website',
  web: 'website',

  dissertation: 'dissertation',
  dissertations: 'dissertation',

  thesis: 'dissertation',
  theses: 'dissertation',

  report: 'report',
  reports: 'report',

  chapter: 'chapter',
  chapters: 'chapter',
  'book chapter': 'chapter',
  'book-chapter': 'chapter',
}

const TYPE_LABELS = {
  source: 'Source',
  book: 'Book',
  journal: 'Journal',
  article: 'Article',
  website: 'Website',
  dissertation: 'Dissertation',
  report: 'Report',
  chapter: 'Book Chapter',
}

const CRITICAL_DEDUCTION = 18
const WARNING_DEDUCTION = 8
const INFO_DEDUCTION = 3

function safeString(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function firstValue(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value
    }

    if (
      value !== null &&
      value !== undefined &&
      safeString(value).length > 0
    ) {
      return value
    }
  }

  return ''
}

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.some((item) => hasValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return safeString(value).length > 0
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => hasValue(item))
  }

  if (!hasValue(value)) {
    return []
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return [value]
}

function normalizePersonList(value) {
  const people = normalizeArray(value)

  return people
    .map((person) => {
      if (typeof person === 'string') {
        return person.trim()
      }

      if (person && typeof person === 'object') {
        const combinedName = [
          safeString(person.firstName),
          safeString(person.lastName),
        ]
          .filter(Boolean)
          .join(' ')

        return safeString(
          firstValue(
            person.name,
            person.fullName,
            combinedName,
          ),
        )
      }

      return ''
    })
    .filter(Boolean)
}

function normalizeType(value, fallbackType = 'source') {
  const rawType = safeString(value).toLowerCase()

  if (!rawType) {
    return TYPE_ALIASES[fallbackType] || fallbackType || 'source'
  }

  return TYPE_ALIASES[rawType] || rawType
}

function normalizeYear(value) {
  if (!hasValue(value)) {
    return ''
  }

  const rawValue = safeString(value)

  const yearMatch = rawValue.match(
    /\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/,
  )

  return yearMatch ? yearMatch[0] : rawValue
}

function normalizePages(record) {
  const directPages = firstValue(
    record.pages,
    record.pageRange,
    record.page_range,
    record.pagination,
  )

  if (hasValue(directPages)) {
    return safeString(directPages)
  }

  const startPage = firstValue(
    record.startPage,
    record.start_page,
  )

  const endPage = firstValue(
    record.endPage,
    record.end_page,
  )

  if (hasValue(startPage) && hasValue(endPage)) {
    return `${safeString(startPage)}–${safeString(endPage)}`
  }

  return safeString(firstValue(startPage, endPage))
}

function createRecordId(record, type, index = 0) {
  const directId = firstValue(
    record.id,
    record.uuid,
    record.sourceId,
    record.source_id,
    record.bookId,
    record.book_id,
    record.articleId,
    record.article_id,
    record.journalId,
    record.journal_id,
  )

  if (hasValue(directId)) {
    return safeString(directId)
  }

  const title = safeString(
    firstValue(
      record.title,
      record.name,
      record.sourceTitle,
      record.source_title,
    ),
  )

  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${type}-${titleSlug || 'untitled'}-${index}`
}

function inferPublicationContainer(record) {
  return safeString(
    firstValue(
      record.publisher,
      record.publisherName,
      record.publisher_name,
      record.journalTitle,
      record.journal_title,
      record.journal,
      record.publication,
      record.publicationTitle,
      record.publication_title,
      record.websiteTitle,
      record.website_title,
      record.siteName,
      record.site_name,
      record.institution,
      record.university,
      record.school,
    ),
  )
}

function inferNotes(record) {
  return firstValue(
    record.notes,
    record.researchNotes,
    record.research_notes,
    record.summary,
    record.abstract,
    record.annotation,
    record.annotations,
    record.chapterNotes,
    record.chapter_notes,
    record.sectionNotes,
    record.section_notes,
    record.content,
  )
}

function inferCitation(record) {
  return safeString(
    firstValue(
      record.citation,
      record.formattedCitation,
      record.formatted_citation,
      record.turabianCitation,
      record.turabian_citation,
      record.chicagoCitation,
      record.chicago_citation,
      record.mlaCitation,
      record.mla_citation,
      record.apaCitation,
      record.apa_citation,
      record.bibliography,
      record.bibliographyEntry,
      record.bibliography_entry,
    ),
  )
}

function inferRelationships(record) {
  return normalizeArray(
    firstValue(
      record.relationships,
      record.relatedSources,
      record.related_sources,
      record.connectedSources,
      record.connected_sources,
      record.sourceRelationships,
      record.source_relationships,
      record.links,
    ),
  )
}

function inferCourseLinks(record) {
  return normalizeArray(
    firstValue(
      record.courseIds,
      record.course_ids,
      record.courses,
      record.course,
      record.linkedCourses,
      record.linked_courses,
    ),
  )
}

function inferAssignmentLinks(record) {
  return normalizeArray(
    firstValue(
      record.assignmentIds,
      record.assignment_ids,
      record.assignments,
      record.assignment,
      record.linkedAssignments,
      record.linked_assignments,
    ),
  )
}

function inferTags(record) {
  return normalizeArray(
    firstValue(
      record.tags,
      record.keywords,
      record.topics,
      record.concepts,
      record.themes,
    ),
  )
}

function getDetailPath(record, normalizedType, id) {
  const existingPath = firstValue(
    record.detailPath,
    record.detail_path,
    record.route,
    record.path,
    record.href,
  )

  if (hasValue(existingPath)) {
    return safeString(existingPath)
  }

  const encodedId = encodeURIComponent(String(id))

  switch (normalizedType) {
    case 'book':
      return `/books/${encodedId}`

    case 'journal':
      return `/journals/${encodedId}`

    case 'article':
      return `/articles/${encodedId}`

    case 'website':
    case 'dissertation':
    case 'report':
    case 'chapter':
    case 'source':
    default:
      return `/sources/${encodedId}`
  }
}

export function getResearchTypeLabel(type) {
  return TYPE_LABELS[type] || 'Source'
}

export function normalizeResearchRecord(
  record,
  fallbackType = 'source',
  index = 0,
  storageKey = '',
) {
  const explicitType = firstValue(
    record.type,
    record.sourceType,
    record.source_type,
    record.recordType,
    record.record_type,
    record.category,
  )

  const normalizedType = normalizeType(
    explicitType,
    fallbackType,
  )

  const id = createRecordId(
    record,
    normalizedType,
    index,
  )

  const authors = normalizePersonList(
    firstValue(
      record.authors,
      record.author,
      record.creator,
      record.creators,
      record.editor,
      record.editors,
      record.organizationAuthor,
      record.organization_author,
    ),
  )

  const publicationYear = normalizeYear(
    firstValue(
      record.publicationYear,
      record.publication_year,
      record.year,
      record.datePublished,
      record.date_published,
      record.publishedDate,
      record.published_date,
      record.publicationDate,
      record.publication_date,
    ),
  )

  const courseLinks = inferCourseLinks(record)
  const assignmentLinks = inferAssignmentLinks(record)

  return {
    id,
    type: normalizedType,
    typeLabel: getResearchTypeLabel(normalizedType),
    hasExplicitType: hasValue(explicitType),

    title: safeString(
      firstValue(
        record.title,
        record.name,
        record.sourceTitle,
        record.source_title,
      ),
    ),

    subtitle: safeString(record.subtitle),

    authors,
    authorDisplay: authors.join(', '),

    publicationYear,

    publicationContainer:
      inferPublicationContainer(record),

    publisher: safeString(
      firstValue(
        record.publisher,
        record.publisherName,
        record.publisher_name,
      ),
    ),

    journalTitle: safeString(
      firstValue(
        record.journalTitle,
        record.journal_title,
        record.journal,
        record.publicationTitle,
        record.publication_title,
      ),
    ),

    websiteTitle: safeString(
      firstValue(
        record.websiteTitle,
        record.website_title,
        record.siteName,
        record.site_name,
      ),
    ),

    institution: safeString(
      firstValue(
        record.institution,
        record.university,
        record.school,
      ),
    ),

    volume: safeString(record.volume),
    issue: safeString(record.issue),
    pages: normalizePages(record),

    edition: safeString(record.edition),

    doi: safeString(
      firstValue(
        record.doi,
        record.DOI,
      ),
    ),

    isbn: safeString(
      firstValue(
        record.isbn,
        record.ISBN,
      ),
    ),

    url: safeString(
      firstValue(
        record.url,
        record.URL,
        record.link,
        record.websiteUrl,
        record.website_url,
      ),
    ),

    accessDate: safeString(
      firstValue(
        record.accessDate,
        record.access_date,
        record.dateAccessed,
        record.date_accessed,
        record.retrievalDate,
        record.retrieval_date,
      ),
    ),

    citation: inferCitation(record),

    citationStyle: safeString(
      firstValue(
        record.citationStyle,
        record.citation_style,
        record.style,
      ),
    ),

    notes: inferNotes(record),
    tags: inferTags(record),
    relationships: inferRelationships(record),

    courseLinks,
    assignmentLinks,

    connectionCount:
      courseLinks.length + assignmentLinks.length,

    detailPath: getDetailPath(
      record,
      normalizedType,
      id,
    ),

    createdAt: firstValue(
      record.createdAt,
      record.created_at,
      record.dateCreated,
      record.date_created,
    ),

    updatedAt: firstValue(
      record.updatedAt,
      record.updated_at,
      record.dateUpdated,
      record.date_updated,
    ),

    storageKey,
    originalRecord: record,
  }
}

function createIssue({
  id,
  field,
  label,
  message,
  severity = AUDIT_SEVERITIES.WARNING,
  citationBlocking = false,
}) {
  return {
    id,
    field,
    label,
    message,
    severity,
    citationBlocking,
  }
}

function auditCoreMetadata(record, issues) {
  if (!hasValue(record.title)) {
    issues.push(
      createIssue({
        id: 'missing-title',
        field: 'title',
        label: 'Missing title',
        message:
          'Add a title so this research record can be identified.',
        severity: AUDIT_SEVERITIES.CRITICAL,
        citationBlocking: true,
      }),
    )
  }

  if (!record.hasExplicitType) {
    issues.push(
      createIssue({
        id: 'missing-source-type',
        field: 'type',
        label: 'Source type inferred',
        message:
          'Confirm the source type so Scholarory can apply the correct citation rules.',
        severity: AUDIT_SEVERITIES.INFO,
        citationBlocking: false,
      }),
    )
  }

  if (record.authors.length === 0) {
    issues.push(
      createIssue({
        id: 'missing-author',
        field: 'authors',
        label: 'Missing author or creator',
        message:
          'Add an author, editor, organization, or other responsible creator.',
        severity: AUDIT_SEVERITIES.CRITICAL,
        citationBlocking: true,
      }),
    )
  }

  if (!hasValue(record.publicationYear)) {
    issues.push(
      createIssue({
        id: 'missing-publication-year',
        field: 'publicationYear',
        label: 'Missing publication year',
        message:
          'Add the publication year or publication date.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }
}

function auditBook(record, issues) {
  if (!hasValue(record.publisher)) {
    issues.push(
      createIssue({
        id: 'missing-publisher',
        field: 'publisher',
        label: 'Missing publisher',
        message: 'Add the publisher for this book.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }
}

function auditJournal(record, issues) {
  if (
    !hasValue(record.publisher) &&
    !hasValue(record.publicationContainer)
  ) {
    issues.push(
      createIssue({
        id: 'missing-journal-publisher',
        field: 'publisher',
        label: 'Missing journal publisher',
        message:
          'Add the organization or publisher responsible for this journal.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: false,
      }),
    )
  }
}

function auditArticle(record, issues) {
  if (!hasValue(record.journalTitle)) {
    issues.push(
      createIssue({
        id: 'missing-journal-title',
        field: 'journalTitle',
        label: 'Missing journal title',
        message:
          'Add the journal or publication containing this article.',
        severity: AUDIT_SEVERITIES.CRITICAL,
        citationBlocking: true,
      }),
    )
  }

  if (!hasValue(record.volume)) {
    issues.push(
      createIssue({
        id: 'missing-volume',
        field: 'volume',
        label: 'Missing volume',
        message:
          'Add the journal volume when one is available.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }

  if (!hasValue(record.issue)) {
    issues.push(
      createIssue({
        id: 'missing-issue',
        field: 'issue',
        label: 'Missing issue',
        message:
          'Add the journal issue when one is available.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }

  if (!hasValue(record.pages)) {
    issues.push(
      createIssue({
        id: 'missing-pages',
        field: 'pages',
        label: 'Missing page range',
        message:
          'Add the article page range.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }

  if (
    !hasValue(record.doi) &&
    !hasValue(record.url)
  ) {
    issues.push(
      createIssue({
        id: 'missing-doi-or-url',
        field: 'doi',
        label: 'Missing DOI or URL',
        message:
          'Add a DOI or stable URL when the article was accessed online.',
        severity: AUDIT_SEVERITIES.INFO,
        citationBlocking: false,
      }),
    )
  }
}

function auditWebsite(record, issues) {
  if (!hasValue(record.websiteTitle)) {
    issues.push(
      createIssue({
        id: 'missing-website-title',
        field: 'websiteTitle',
        label: 'Missing website name',
        message:
          'Add the website or organization name.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }

  if (!hasValue(record.url)) {
    issues.push(
      createIssue({
        id: 'missing-url',
        field: 'url',
        label: 'Missing URL',
        message: 'Add the webpage URL.',
        severity: AUDIT_SEVERITIES.CRITICAL,
        citationBlocking: true,
      }),
    )
  }

  if (!hasValue(record.accessDate)) {
    issues.push(
      createIssue({
        id: 'missing-access-date',
        field: 'accessDate',
        label: 'Missing access date',
        message:
          'Add the date this online source was accessed.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }
}

function auditDissertation(record, issues) {
  if (!hasValue(record.institution)) {
    issues.push(
      createIssue({
        id: 'missing-institution',
        field: 'institution',
        label: 'Missing institution',
        message:
          'Add the university or institution that awarded the degree.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: true,
      }),
    )
  }

  if (
    !hasValue(record.url) &&
    !hasValue(record.publicationContainer)
  ) {
    issues.push(
      createIssue({
        id: 'missing-database-or-url',
        field: 'url',
        label: 'Missing database or URL',
        message:
          'Add the database, repository, or stable URL.',
        severity: AUDIT_SEVERITIES.INFO,
        citationBlocking: false,
      }),
    )
  }
}

function auditResearchUse(record, issues) {
  if (!hasValue(record.citation)) {
    issues.push(
      createIssue({
        id: 'missing-generated-citation',
        field: 'citation',
        label: 'Citation not saved',
        message:
          'Generate or save a formatted citation for this source.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: false,
      }),
    )
  }

  if (!hasValue(record.notes)) {
    issues.push(
      createIssue({
        id: 'missing-notes',
        field: 'notes',
        label: 'No research notes',
        message:
          'Add notes, a summary, annotation, or source observations.',
        severity: AUDIT_SEVERITIES.WARNING,
        citationBlocking: false,
      }),
    )
  }

  if (record.tags.length === 0) {
    issues.push(
      createIssue({
        id: 'missing-tags',
        field: 'tags',
        label: 'No tags or concepts',
        message:
          'Add tags, keywords, themes, or concepts to improve retrieval.',
        severity: AUDIT_SEVERITIES.INFO,
        citationBlocking: false,
      }),
    )
  }

  if (record.connectionCount === 0) {
    issues.push(
      createIssue({
        id: 'missing-academic-connection',
        field: 'connections',
        label: 'Not connected to coursework',
        message:
          'Connect this source to a course or assignment.',
        severity: AUDIT_SEVERITIES.INFO,
        citationBlocking: false,
      }),
    )
  }

  if (record.relationships.length === 0) {
    issues.push(
      createIssue({
        id: 'missing-source-relationships',
        field: 'relationships',
        label: 'No related sources',
        message:
          'Connect this record to supporting, contrasting, or related research.',
        severity: AUDIT_SEVERITIES.INFO,
        citationBlocking: false,
      }),
    )
  }
}

function calculateRecordScore(issues) {
  const deduction = issues.reduce(
    (total, issue) => {
      switch (issue.severity) {
        case AUDIT_SEVERITIES.CRITICAL:
          return total + CRITICAL_DEDUCTION

        case AUDIT_SEVERITIES.WARNING:
          return total + WARNING_DEDUCTION

        case AUDIT_SEVERITIES.INFO:
          return total + INFO_DEDUCTION

        default:
          return total
      }
    },
    0,
  )

  return Math.max(
    0,
    Math.min(100, 100 - deduction),
  )
}

function determineStatus(issues) {
  const hasCriticalIssue = issues.some(
    (issue) =>
      issue.severity === AUDIT_SEVERITIES.CRITICAL,
  )

  if (hasCriticalIssue) {
    return AUDIT_STATUSES.CRITICAL
  }

  if (issues.length > 0) {
    return AUDIT_STATUSES.NEEDS_REVIEW
  }

  return AUDIT_STATUSES.READY
}

export function auditResearchRecord(record) {
  const issues = []

  auditCoreMetadata(record, issues)

  switch (record.type) {
    case 'book':
      auditBook(record, issues)
      break

    case 'journal':
      auditJournal(record, issues)
      break

    case 'article':
      auditArticle(record, issues)
      break

    case 'website':
      auditWebsite(record, issues)
      break

    case 'dissertation':
      auditDissertation(record, issues)
      break

    default:
      if (!hasValue(record.publicationContainer)) {
        issues.push(
          createIssue({
            id: 'missing-publication-container',
            field: 'publicationContainer',
            label: 'Missing publication information',
            message:
              'Add the publisher, journal, website, or institution.',
            severity: AUDIT_SEVERITIES.WARNING,
            citationBlocking: true,
          }),
        )
      }
      break
  }

  auditResearchUse(record, issues)

  const criticalIssues = issues.filter(
    (issue) =>
      issue.severity === AUDIT_SEVERITIES.CRITICAL,
  )

  const warningIssues = issues.filter(
    (issue) =>
      issue.severity === AUDIT_SEVERITIES.WARNING,
  )

  const infoIssues = issues.filter(
    (issue) =>
      issue.severity === AUDIT_SEVERITIES.INFO,
  )

  const citationBlockingIssues = issues.filter(
    (issue) => issue.citationBlocking,
  )

  const score = calculateRecordScore(issues)
  const status = determineStatus(issues)

  return {
    ...record,

    issues,
    criticalIssues,
    warningIssues,
    infoIssues,
    citationBlockingIssues,

    issueCount: issues.length,
    criticalCount: criticalIssues.length,
    warningCount: warningIssues.length,
    infoCount: infoIssues.length,

    score,
    status,

    citationReady:
      citationBlockingIssues.length === 0,
  }
}

function safeJsonParse(value, storageKey) {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn(
      `Scholarory Research Audit: Unable to parse "${storageKey}".`,
      error,
    )

    return null
  }
}

function extractRecords(parsedValue) {
  if (Array.isArray(parsedValue)) {
    return parsedValue
  }

  if (
    !parsedValue ||
    typeof parsedValue !== 'object'
  ) {
    return []
  }

  const possibleCollections = [
    parsedValue.records,
    parsedValue.items,
    parsedValue.data,
    parsedValue.sources,
    parsedValue.books,
    parsedValue.journals,
    parsedValue.articles,
    parsedValue.websites,
    parsedValue.dissertations,
  ]

  for (const collection of possibleCollections) {
    if (Array.isArray(collection)) {
      return collection
    }
  }

  return []
}

/**
 * Finds the first populated key in a storage group.
 *
 * Example:
 * If scholarory-books exists, the older "books" key is ignored.
 */
function loadFirstAvailableStorageGroup(group) {
  for (const key of group.keys) {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      continue
    }

    const parsedValue = safeJsonParse(
      storedValue,
      key,
    )

    const records = extractRecords(parsedValue)

    if (records.length === 0) {
      continue
    }

    return {
      storageKey: key,
      records,
    }
  }

  return {
    storageKey: '',
    records: [],
  }
}

export function loadResearchRecordsFromStorage() {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) {
    return []
  }

  const normalizedRecords = []

  RESEARCH_STORAGE_GROUPS.forEach((group) => {
    const result = loadFirstAvailableStorageGroup(group)

    result.records.forEach((record, index) => {
      if (
        !record ||
        typeof record !== 'object'
      ) {
        return
      }

      normalizedRecords.push(
        normalizeResearchRecord(
          record,
          group.type,
          index,
          result.storageKey,
        ),
      )
    })
  })

  const uniqueRecords = []
  const seenRecords = new Set()

  normalizedRecords.forEach((record) => {
    const uniqueKey = [
      record.type,
      safeString(record.id),
      record.title.toLowerCase(),
    ].join('|')

    if (seenRecords.has(uniqueKey)) {
      return
    }

    seenRecords.add(uniqueKey)
    uniqueRecords.push(record)
  })

  return uniqueRecords
}

export function createResearchAuditSummary(
  auditedRecords = [],
) {
  const totalRecords = auditedRecords.length

  const readyRecords = auditedRecords.filter(
    (record) =>
      record.status === AUDIT_STATUSES.READY,
  )

  const needsReviewRecords = auditedRecords.filter(
    (record) =>
      record.status ===
      AUDIT_STATUSES.NEEDS_REVIEW,
  )

  const criticalRecords = auditedRecords.filter(
    (record) =>
      record.status === AUDIT_STATUSES.CRITICAL,
  )

  const citationReadyRecords = auditedRecords.filter(
    (record) => record.citationReady,
  )

  const totalIssues = auditedRecords.reduce(
    (total, record) =>
      total + record.issueCount,
    0,
  )

  const criticalIssues = auditedRecords.reduce(
    (total, record) =>
      total + record.criticalCount,
    0,
  )

  const warningIssues = auditedRecords.reduce(
    (total, record) =>
      total + record.warningCount,
    0,
  )

  const infoIssues = auditedRecords.reduce(
    (total, record) =>
      total + record.infoCount,
    0,
  )

  const healthScore =
    totalRecords === 0
      ? 100
      : Math.round(
          auditedRecords.reduce(
            (total, record) =>
              total + record.score,
            0,
          ) / totalRecords,
        )

  const citationReadiness =
    totalRecords === 0
      ? 100
      : Math.round(
          (
            citationReadyRecords.length /
            totalRecords
          ) * 100,
        )

  return {
    totalRecords,

    readyCount: readyRecords.length,
    needsReviewCount:
      needsReviewRecords.length,
    criticalCount: criticalRecords.length,
    citationReadyCount:
      citationReadyRecords.length,

    totalIssues,
    criticalIssues,
    warningIssues,
    infoIssues,

    healthScore,
    citationReadiness,

    readyRecords,
    needsReviewRecords,
    criticalRecords,
    citationReadyRecords,
  }
}

export function runResearchAudit(records = null) {
  const normalizedRecords = Array.isArray(records)
    ? records.map((record, index) => {
        if (record.originalRecord) {
          return record
        }

        return normalizeResearchRecord(
          record,
          record.type || 'source',
          index,
        )
      })
    : loadResearchRecordsFromStorage()

  const auditedRecords = normalizedRecords.map(
    (record) => auditResearchRecord(record),
  )

  const summary =
    createResearchAuditSummary(auditedRecords)

  return {
    records: auditedRecords,
    summary,
    auditedAt: new Date().toISOString(),
  }
}

export function getAuditStatusLabel(status) {
  switch (status) {
    case AUDIT_STATUSES.READY:
      return 'Ready'

    case AUDIT_STATUSES.NEEDS_REVIEW:
      return 'Needs Review'

    case AUDIT_STATUSES.CRITICAL:
      return 'Critical'

    default:
      return 'Unknown'
  }
}

export function getAuditSeverityLabel(severity) {
  switch (severity) {
    case AUDIT_SEVERITIES.CRITICAL:
      return 'Critical'

    case AUDIT_SEVERITIES.WARNING:
      return 'Warning'

    case AUDIT_SEVERITIES.INFO:
      return 'Improvement'

    default:
      return 'Issue'
  }
}