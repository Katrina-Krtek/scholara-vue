import {
  computed,
  ref,
  watch,
} from 'vue'

import { useBooks } from '@/composables/useBooks'
import { useSources } from '@/composables/useSources'
import { useJournals } from '@/composables/useJournals'
import { useResearch } from '@/composables/useResearch'
import { useConcepts } from '@/composables/useConcepts'
import { useTerms } from '@/composables/useTerms'
import { useKnowledgeTags } from '@/composables/useKnowledgeTags'
import {
  getAllSources as getRelationshipSources,
  readSourceRelationships,
  relationshipTypeLabel as getSourceRelationshipLabel,
} from '@/lib/sourceRelationshipsStore'

import {
  graphNodeTypes as baseGraphNodeTypes,
  mockGraphDiscoveryItems,
  mockKnowledgeGraphLinks,
  mockKnowledgeGraphNodes,
} from '@/data/mockKnowledgeGraph'

const SOURCE_GRAPH_TYPES = [
  'research-source',
  'source',
  'book',
  'book-chapter',
  'article',
  'journal-article',
  'journal',
  'dissertation',
  'thesis',
  'blog',
  'blog-post',
  'webpage',
  'website',
  'report',
  'conference-paper',
  'encyclopedia',
  'dictionary',
  'podcast',
  'video',
  'media',
]

const RESEARCH_ITEM_GRAPH_TYPES = [
  'note',
  'concept',
  'term',
  'knowledge-tag',
  'person',
  'assignment',
  'quote',
  'communication',
]

const SUPPORTED_GRAPH_NODE_TYPES = [
  ...new Set([
    ...baseGraphNodeTypes,
    ...SOURCE_GRAPH_TYPES,
    ...RESEARCH_ITEM_GRAPH_TYPES,
  ]),
]

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
}

function normalizeSearchText(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchVariants(value) {
  const normalized = normalizeSearchText(value)

  if (!normalized) {
    return []
  }

  const withoutAnd = normalized
    .replace(/\band\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return [
    ...new Set([
      normalized,
      normalized.replace(/\s+/g, ''),
      withoutAnd,
      withoutAnd.replace(/\s+/g, ''),
    ]),
  ].filter(Boolean)
}

function normalizeTag(value) {
  return normalizeText(value)
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
}

function normalizeSourceType(value) {
  const type = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')

  const aliases = {
    book: 'book',
    chapter: 'book-chapter',
    'book-chapter': 'book-chapter',

    article: 'article',
    'journal-article': 'article',
    'academic-article': 'article',
    'research-article': 'article',

    journal: 'journal',
    periodical: 'journal',

    dissertation: 'dissertation',
    'doctoral-dissertation': 'dissertation',
    'phd-dissertation': 'dissertation',

    thesis: 'thesis',
    'masters-thesis': 'thesis',
    'master-thesis': 'thesis',

    blog: 'blog',
    'blog-post': 'blog',
    'blog-entry': 'blog',

    webpage: 'webpage',
    'web-page': 'webpage',
    website: 'website',
    web: 'webpage',

    report: 'report',

    'conference-paper': 'conference-paper',
    conference: 'conference-paper',

    encyclopedia: 'encyclopedia',
    'encyclopedia-entry': 'encyclopedia',

    dictionary: 'dictionary',
    'dictionary-entry': 'dictionary',

    podcast: 'podcast',
    video: 'video',
    media: 'media',
    audiovisual: 'media',
  }

  return aliases[type] || 'research-source'
}

function firstValue(...values) {
  return (
    values.find((value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return false
      }

      if (Array.isArray(value)) {
        return value.length > 0
      }

      return String(value).trim() !== ''
    }) ?? ''
  )
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDateKey(value) {
  if (!value) {
    return ''
  }

  const text = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return text.slice(0, 10)
  }

  return getLocalDateKey(date)
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      values
        .flatMap((value) => {
          return Array.isArray(value)
            ? value
            : [value]
        })
        .map((value) => {
          return String(value || '').trim()
        })
        .filter(Boolean),
    ),
  ]
}

function getCourseIdVariants(values = []) {
  return uniqueStrings(values).flatMap((courseId) => {
    const cleanId = String(courseId)

    return uniqueStrings([
      cleanId,
      `course-${cleanId}`,
      `course:${cleanId}`,
    ])
  })
}

function getAssignmentIdVariants(values = []) {
  return uniqueStrings(values).flatMap((assignmentId) => {
    const cleanId = String(assignmentId)

    return uniqueStrings([
      cleanId,
      `assignment-${cleanId}`,
      `assignment:${cleanId}`,
    ])
  })
}

function getSourceNoteText(source) {
  if (!Array.isArray(source?.sourceNotes)) {
    return ''
  }

  return source.sourceNotes
    .map((note) => {
      if (typeof note === 'string') {
        return note
      }

      return (
        note?.content ||
        note?.text ||
        note?.title ||
        ''
      )
    })
    .filter(Boolean)
    .join(' ')
}

function buildBookDescription(
  book,
  matchingSource = null,
) {
  return uniqueStrings([
    book.subtitle,
    matchingSource?.subtitle,

    firstValue(
      book.author,
      matchingSource?.author,
    )
      ? `By ${firstValue(
          book.author,
          matchingSource?.author,
        )}`
      : '',

    book.summary,
    matchingSource?.summary,
    book.notes,
    matchingSource?.notes,
    getSourceNoteText(matchingSource),
  ]).join(' · ')
}

function buildSourceDescription(source) {
  return uniqueStrings([
    source.subtitle,

    source.author
      ? `By ${source.author}`
      : '',

    source.abstract,
    source.summary,
    source.notes,
    getSourceNoteText(source),
  ]).join(' · ')
}


function buildJournalDescription(
  journal,
  matchingSource = null,
) {
  return uniqueStrings([
    journal.subtitle,
    journal.publisher
      ? `Published by ${journal.publisher}`
      : '',
    journal.field,
    journal.notes,
    matchingSource?.summary,
    matchingSource?.notes,
    getSourceNoteText(matchingSource),
  ]).join(' · ')
}

function buildArticleDescription(
  article,
  matchingSource = null,
) {
  return uniqueStrings([
    article.subtitle,

    firstValue(
      article.author,
      matchingSource?.author,
    )
      ? `By ${firstValue(
          article.author,
          matchingSource?.author,
        )}`
      : '',

    article.abstract,
    matchingSource?.abstract,
    matchingSource?.summary,
    article.sectionNotes,
    article.keyQuotes,
    article.useForWriting,
    matchingSource?.notes,
    getSourceNoteText(matchingSource),
  ]).join(' · ')
}

function hasDirectSourceMatch(
  record,
  source,
) {
  const linkedSourceId = String(
    record?.sourceId ?? '',
  ).trim()

  const sourceId = String(
    source?.id ?? '',
  ).trim()

  return Boolean(
    linkedSourceId &&
    sourceId &&
    linkedSourceId === sourceId,
  )
}

function recordsRepresentSameJournal(
  journal,
  source,
) {
  if (
    !journal ||
    !source ||
    normalizeSourceType(source.type) !== 'journal'
  ) {
    return false
  }

  if (hasDirectSourceMatch(journal, source)) {
    return true
  }

  const journalName = normalizeSearchText(
    journal.name,
  )

  const sourceTitle = normalizeSearchText(
    firstValue(
      source.title,
      source.name,
      source.journal,
    ),
  )

  if (
    !journalName ||
    !sourceTitle ||
    journalName !== sourceTitle
  ) {
    return false
  }

  const journalPublisher =
    normalizeSearchText(journal.publisher)

  const sourcePublisher =
    normalizeSearchText(source.publisher)

  if (
    journalPublisher &&
    sourcePublisher &&
    journalPublisher !== sourcePublisher
  ) {
    return false
  }

  return true
}

function findMatchingSourceForJournal(
  journal,
  sources,
) {
  const directMatch = sources.find((source) => {
    return hasDirectSourceMatch(
      journal,
      source,
    )
  })

  if (directMatch) {
    return directMatch
  }

  return (
    sources.find((source) => {
      return recordsRepresentSameJournal(
        journal,
        source,
      )
    }) || null
  )
}

function recordsRepresentSameArticle(
  article,
  source,
) {
  if (
    !article ||
    !source ||
    normalizeSourceType(source.type) !== 'article'
  ) {
    return false
  }

  if (hasDirectSourceMatch(article, source)) {
    return true
  }

  const articleTitle = normalizeSearchText(
    article.title,
  )

  const sourceTitle = normalizeSearchText(
    source.title,
  )

  const articleAuthor = normalizeSearchText(
    article.author,
  )

  const sourceAuthor = normalizeSearchText(
    source.author,
  )

  if (
    !articleTitle ||
    !sourceTitle ||
    articleTitle !== sourceTitle
  ) {
    return false
  }

  if (
    articleAuthor &&
    sourceAuthor &&
    articleAuthor !== sourceAuthor
  ) {
    return false
  }

  const articleYear = normalizeText(
    firstValue(
      article.publicationYear,
      article.year,
    ),
  )

  const sourceYear = normalizeText(
    firstValue(
      source.publicationYear,
      source.year,
    ),
  )

  if (
    articleYear &&
    sourceYear &&
    articleYear !== sourceYear
  ) {
    return false
  }

  const articleJournal = normalizeSearchText(
    firstValue(
      article.journalName,
      article.journal,
    ),
  )

  const sourceJournal = normalizeSearchText(
    firstValue(
      source.journalName,
      source.journal,
    ),
  )

  if (
    articleJournal &&
    sourceJournal &&
    articleJournal !== sourceJournal
  ) {
    return false
  }

  return true
}

function findMatchingSourceForArticle(
  article,
  sources,
) {
  const directMatch = sources.find((source) => {
    return hasDirectSourceMatch(
      article,
      source,
    )
  })

  if (directMatch) {
    return directMatch
  }

  return (
    sources.find((source) => {
      return recordsRepresentSameArticle(
        article,
        source,
      )
    }) || null
  )
}

function recordsRepresentSameBook(
  book,
  source,
) {
  if (
    !book ||
    !source ||
    normalizeSourceType(source.type) !== 'book'
  ) {
    return false
  }

  const linkedSourceId = String(
    book.sourceId ?? '',
  ).trim()

  const sourceId = String(
    source.id ?? '',
  ).trim()

  if (
    linkedSourceId &&
    sourceId &&
    linkedSourceId === sourceId
  ) {
    return true
  }

  const bookTitle = normalizeSearchText(
    book.title,
  )

  const sourceTitle = normalizeSearchText(
    source.title,
  )

  const bookAuthor = normalizeSearchText(
    book.author,
  )

  const sourceAuthor = normalizeSearchText(
    source.author,
  )

  if (
    !bookTitle ||
    !sourceTitle ||
    bookTitle !== sourceTitle
  ) {
    return false
  }

  if (
    bookAuthor &&
    sourceAuthor &&
    bookAuthor !== sourceAuthor
  ) {
    return false
  }

  const bookYear = normalizeText(
    firstValue(
      book.publicationYear,
      book.year,
    ),
  )

  const sourceYear = normalizeText(
    firstValue(
      source.publicationYear,
      source.year,
    ),
  )

  if (
    bookYear &&
    sourceYear &&
    bookYear !== sourceYear
  ) {
    return false
  }

  return true
}

function findMatchingSourceForBook(
  book,
  sources,
) {
  const linkedSourceId = String(
    book?.sourceId ?? '',
  ).trim()

  if (linkedSourceId) {
    const directlyLinkedSource =
      sources.find((source) => {
        return (
          String(
            source?.id ?? '',
          ).trim() === linkedSourceId
        )
      })

    if (directlyLinkedSource) {
      return directlyLinkedSource
    }
  }

  return (
    sources.find((source) => {
      return recordsRepresentSameBook(
        book,
        source,
      )
    }) || null
  )
}

function createBookGraphNode(
  book,
  matchingSource = null,
) {
  const courseIds = getCourseIdVariants([
    ...(book.relatedCourseIds || []),
    matchingSource?.courseId,
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      ...(book.relatedAssignmentIds || []),
      matchingSource?.assignmentId,
    ])

  const publisher = firstValue(
    book.publisher,
    matchingSource?.publisher,
  )
  const publisherAliases = uniqueStrings([
    matchingSource?.publisher,
    book.publisher,
  ])

  const publicationYear = firstValue(
    book.publicationYear,
    book.year,
    matchingSource?.publicationYear,
    matchingSource?.year,
  )

  const updatedAt = firstValue(
    book.updatedAt,
    matchingSource?.updatedAt,
    book.createdAt,
    matchingSource?.createdAt,
  )

  return {
    id: `book:${book.id}`,
    entityId: String(book.id),

    sourceRecordId:
      matchingSource?.id !== undefined
        ? String(matchingSource.id)
        : null,

    title:
      firstValue(
        book.title,
        matchingSource?.title,
      ) ||
      'Untitled Book',

    type: 'book',
    sourceType: 'Book',
    recordType: 'Book',

    description:
      buildBookDescription(
        book,
        matchingSource,
      ) ||
      'Book record from the Scholarory Book Database.',

    tags: uniqueStrings([
      ...(book.tags || []),
      ...(matchingSource?.tags || []),
      book.genre,
      matchingSource?.genre,
    ]),

    status:
      firstValue(
        book.status,
        matchingSource?.status,
      ) ||
      'planned',

    priority:
      firstValue(
        book.priority,
        matchingSource?.priority,
      ),

    updatedAt,

    createdAt:
      firstValue(
        book.createdAt,
        matchingSource?.createdAt,
      ),

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      matchingSource?.course ||
      '',

    assignment:
      matchingSource?.assignment ||
      '',

    route: `/books/${book.id}`,

    author:
      firstValue(
        book.author,
        matchingSource?.author,
      ),

    authors:
      firstValue(
        book.authors,
        matchingSource?.authors,
      ),

    subtitle:
      firstValue(
        book.subtitle,
        matchingSource?.subtitle,
      ),

    publisher,
    publisherAliases,

    publicationYear,
    year: publicationYear,

    publicationPlace:
      firstValue(
        book.publicationPlace,
        book.publicationLocation,
        matchingSource?.publicationPlace,
        matchingSource?.publicationLocation,
      ),

    publicationLocation:
      firstValue(
        book.publicationLocation,
        matchingSource?.publicationLocation,
      ),

    edition:
      firstValue(
        book.edition,
        matchingSource?.edition,
      ),

    isbn:
      firstValue(
        book.isbn,
        matchingSource?.isbn,
      ),

    doi:
      firstValue(
        book.doi,
        matchingSource?.doi,
      ),

    url:
      firstValue(
        book.url,
        matchingSource?.url,
      ),

    accessDate:
      firstValue(
        book.accessDate,
        matchingSource?.accessDate,
      ),

    genre:
      firstValue(
        book.genre,
        matchingSource?.genre,
      ),

    pageCount:
      firstValue(
        book.pageCount,
        book.pages,
        matchingSource?.pageCount,
        matchingSource?.pages,
      ),

    pages:
      firstValue(
        book.pages,
        matchingSource?.pages,
      ),

    language:
      firstValue(
        book.language,
        matchingSource?.language,
      ),

    citation:
      firstValue(
        book.citation,
        matchingSource?.citation,
      ),

    notes:
      firstValue(
        book.notes,
        matchingSource?.notes,
      ),

    summary:
      firstValue(
        book.summary,
        matchingSource?.summary,
      ),

    sourceNotes:
      Array.isArray(
        matchingSource?.sourceNotes,
      )
        ? [...matchingSource.sourceNotes]
        : [],

    firstAuthorFirstName:
      matchingSource?.firstAuthorFirstName ||
      '',

    firstAuthorLastName:
      matchingSource?.firstAuthorLastName ||
      '',

    secondAuthorFirstName:
      matchingSource?.secondAuthorFirstName ||
      '',

    secondAuthorLastName:
      matchingSource?.secondAuthorLastName ||
      '',

    contributorsText:
      matchingSource?.contributorsText ||
      '',

    forewordBy:
      matchingSource?.forewordBy ||
      '',
  }
}


function createJournalGraphNode(
  journal,
  matchingSource = null,
) {
  const courseIds = getCourseIdVariants([
    ...(journal.relatedCourseIds || []),
    matchingSource?.courseId,
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      ...(journal.relatedAssignmentIds || []),
      matchingSource?.assignmentId,
    ])

  const publisher = firstValue(
    journal.publisher,
    matchingSource?.publisher,
  )

  const publisherAliases = uniqueStrings([
    journal.publisher,
    matchingSource?.publisher,
  ])

  const updatedAt = firstValue(
    journal.updatedAt,
    matchingSource?.updatedAt,
    journal.createdAt,
    matchingSource?.createdAt,
  )

  const website = firstValue(
    journal.website,
    matchingSource?.url,
  )

  return {
    id: `journal:${journal.id}`,
    entityId: String(journal.id),

    sourceRecordId:
      matchingSource?.id !== undefined
        ? String(matchingSource.id)
        : null,

    title:
      firstValue(
        journal.name,
        matchingSource?.title,
      ) ||
      'Untitled Journal',

    name:
      firstValue(
        journal.name,
        matchingSource?.title,
      ) ||
      'Untitled Journal',

    type: 'journal',
    sourceType: 'Journal',
    recordType: 'Journal',

    description:
      buildJournalDescription(
        journal,
        matchingSource,
      ) ||
      'Academic journal from the Scholarory Journals Database.',

    tags: uniqueStrings([
      ...(journal.tags || []),
      ...(matchingSource?.tags || []),
      journal.field,
    ]),

    status:
      firstValue(
        journal.status,
        matchingSource?.status,
        'active',
      ),

    priority:
      firstValue(
        journal.priority,
        matchingSource?.priority,
      ),

    updatedAt,

    createdAt:
      firstValue(
        journal.createdAt,
        matchingSource?.createdAt,
      ),

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      matchingSource?.course ||
      '',

    assignment:
      matchingSource?.assignment ||
      '',

    route: `/journals/${journal.id}`,

    subtitle:
      firstValue(
        journal.subtitle,
        matchingSource?.subtitle,
      ),

    publisher,
    publisherAliases,

    issn:
      firstValue(
        journal.issn,
        matchingSource?.issn,
      ),

    website,
    url: website,

    field:
      firstValue(
        journal.field,
        matchingSource?.field,
        matchingSource?.discipline,
      ),

    peerReviewed:
      journal.peerReviewed ??
      matchingSource?.peerReviewed ??
      false,

    favorite:
      journal.favorite ??
      false,

    notes:
      firstValue(
        journal.notes,
        matchingSource?.notes,
      ),

    citation:
      matchingSource?.citation ||
      '',

    sourceNotes:
      Array.isArray(
        matchingSource?.sourceNotes,
      )
        ? [...matchingSource.sourceNotes]
        : [],

    language:
      matchingSource?.language ||
      '',

    frequency:
      firstValue(
        journal.frequency,
        matchingSource?.frequency,
      ),
  }
}

function createArticleGraphNode(
  article,
  parentJournal = null,
  matchingSource = null,
) {
  const courseIds = getCourseIdVariants([
    ...(article.relatedCourseIds || []),
    matchingSource?.courseId,
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      ...(article.relatedAssignmentIds || []),
      matchingSource?.assignmentId,
    ])

  const publicationYear = firstValue(
    article.year,
    article.publicationYear,
    matchingSource?.year,
    matchingSource?.publicationYear,
  )

  const publisher = firstValue(
    matchingSource?.publisher,
    parentJournal?.publisher,
  )

  const publisherAliases = uniqueStrings([
    matchingSource?.publisher,
    parentJournal?.publisher,
  ])

  const journalName = firstValue(
    article.journalName,
    parentJournal?.name,
    matchingSource?.journal,
    matchingSource?.journalName,
  )

  const updatedAt = firstValue(
    article.updatedAt,
    matchingSource?.updatedAt,
    article.createdAt,
    matchingSource?.createdAt,
  )

  return {
    id: `article:${article.id}`,
    entityId: String(article.id),

    sourceRecordId:
      matchingSource?.id !== undefined
        ? String(matchingSource.id)
        : null,

    title:
      firstValue(
        article.title,
        matchingSource?.title,
      ) ||
      'Untitled Article',

    type: 'article',
    sourceType: 'Journal Article',
    recordType: 'Journal Article',

    description:
      buildArticleDescription(
        article,
        matchingSource,
      ) ||
      'Journal article from the Scholarory Articles Database.',

    tags: uniqueStrings([
      ...(article.tags || []),
      ...(matchingSource?.tags || []),
      parentJournal?.field,
    ]),

    status:
      firstValue(
        article.status,
        matchingSource?.status,
        'planned',
      ),

    priority:
      firstValue(
        article.priority,
        matchingSource?.priority,
      ),

    updatedAt,

    createdAt:
      firstValue(
        article.createdAt,
        matchingSource?.createdAt,
      ),

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      matchingSource?.course ||
      '',

    assignment:
      matchingSource?.assignment ||
      '',

    route: `/articles/${article.id}`,

    journalId:
      article.journalId ||
      parentJournal?.id ||
      '',

    journalNodeId:
      article.journalId || parentJournal?.id
        ? `journal:${
            article.journalId ||
            parentJournal?.id
          }`
        : '',

    journalName,
    journal: journalName,

    subtitle:
      firstValue(
        article.subtitle,
        matchingSource?.subtitle,
      ),

    author:
      firstValue(
        article.author,
        matchingSource?.author,
      ),

    authors:
      firstValue(
        article.authors,
        matchingSource?.authors,
      ),

    publisher,
    publisherAliases,

    publicationYear,
    year: publicationYear,

    volume:
      firstValue(
        article.volume,
        matchingSource?.volume,
      ),

    issue:
      firstValue(
        article.issue,
        matchingSource?.issue,
      ),

    pages:
      firstValue(
        article.pages,
        matchingSource?.pages,
      ),

    pageRange:
      firstValue(
        article.pages,
        article.pageRange,
        matchingSource?.pages,
        matchingSource?.pageRange,
      ),

    doi:
      firstValue(
        article.doi,
        matchingSource?.doi,
      ),

    url:
      firstValue(
        article.url,
        matchingSource?.url,
      ),

    issn:
      firstValue(
        matchingSource?.issn,
        parentJournal?.issn,
      ),

    abstract:
      firstValue(
        article.abstract,
        matchingSource?.abstract,
      ),

    sectionNotes:
      article.sectionNotes ||
      '',

    keyQuotes:
      article.keyQuotes ||
      '',

    useForWriting:
      article.useForWriting ||
      '',

    notes:
      firstValue(
        matchingSource?.notes,
        article.sectionNotes,
      ),

    citation:
      matchingSource?.citation ||
      '',

    sourceNotes:
      Array.isArray(
        matchingSource?.sourceNotes,
      )
        ? [...matchingSource.sourceNotes]
        : [],

    accessDate:
      matchingSource?.accessDate ||
      '',

    publicationDate:
      firstValue(
        article.publicationDate,
        matchingSource?.publicationDate,
      ),

    language:
      matchingSource?.language ||
      '',

    peerReviewed:
      parentJournal?.peerReviewed ??
      matchingSource?.peerReviewed ??
      false,
  }
}

function createSourceGraphNode(source) {
  const sourceType = normalizeSourceType(
    source.type,
  )

  const courseIds = getCourseIdVariants([
    source.courseId,
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      source.assignmentId,
    ])

  return {
    id: `source:${source.id}`,
    entityId: String(source.id),

    title:
      source.title ||
      'Untitled Source',

    type: sourceType,

    sourceType:
      source.type ||
      'Research Source',

    recordType:
      source.type ||
      'Research Source',

    description:
      buildSourceDescription(source) ||
      'Research source from the Scholarory Source Database.',

    tags: uniqueStrings(
      source.tags || [],
    ),

    status:
      source.status ||
      'planned',

    priority:
      source.priority ||
      '',

    updatedAt:
      source.updatedAt ||
      source.createdAt ||
      '',

    createdAt:
      source.createdAt ||
      '',

    date: getDateKey(
      source.updatedAt ||
      source.createdAt,
    ),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      source.course ||
      '',

    assignment:
      source.assignment ||
      '',

    route: `/sources/${source.id}`,

    author:
      source.author ||
      '',

    authors:
      source.authors ||
      '',

    subtitle:
      source.subtitle ||
      '',

    firstAuthorFirstName:
      source.firstAuthorFirstName ||
      '',

    firstAuthorLastName:
      source.firstAuthorLastName ||
      '',

    secondAuthorFirstName:
      source.secondAuthorFirstName ||
      '',

    secondAuthorLastName:
      source.secondAuthorLastName ||
      '',

    contributorsText:
      source.contributorsText ||
      '',

    forewordBy:
      source.forewordBy ||
      '',

    publisher:
      source.publisher ||
      '',

    publicationYear:
      source.year ||
      source.publicationYear ||
      '',

    year:
      source.year ||
      '',

    publicationPlace:
      source.publicationLocation ||
      source.publicationPlace ||
      '',

    publicationLocation:
      source.publicationLocation ||
      '',

    journalName:
      source.journal ||
      source.journalName ||
      '',

    journal:
      source.journal ||
      '',

    volume:
      source.volume ||
      '',

    issue:
      source.issue ||
      '',

    pages:
      source.pages ||
      '',

    pageRange:
      source.pageRange ||
      source.pages ||
      '',

    edition:
      source.edition ||
      '',

    isbn:
      source.isbn ||
      '',

    doi:
      source.doi ||
      '',

    url:
      source.url ||
      '',

    accessDate:
      source.accessDate ||
      '',

    institution:
      source.institution ||
      '',

    degree:
      source.degree ||
      '',

    department:
      source.department ||
      '',

    advisor:
      source.advisor ||
      '',

    database:
      source.database ||
      '',

    repository:
      source.repository ||
      '',

    publicationNumber:
      source.publicationNumber ||
      '',

    abstract:
      source.abstract ||
      '',

    language:
      source.language ||
      '',

    website:
      source.websiteName ||
      '',

    siteName:
      source.websiteName ||
      '',

    publishedDate:
      source.publishedDate ||
      '',

    citation:
      source.citation ||
      '',

    notes:
      source.notes ||
      '',

    sourceNotes:
      Array.isArray(source.sourceNotes)
        ? [...source.sourceNotes]
        : [],
  }
}


function normalizeResearchItemGraphType(value) {
  const type = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')

  if (
    RESEARCH_ITEM_GRAPH_TYPES.includes(type)
  ) {
    return type
  }

  return normalizeSourceType(type)
}

function formatResearchPeople(people = []) {
  if (!Array.isArray(people)) {
    return String(people || '').trim()
  }

  return people
    .map((person) => {
      if (typeof person === 'string') {
        return person.trim()
      }

      return [
        person?.firstName,
        person?.initial,
        person?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()
    })
    .filter(Boolean)
    .join(', ')
}

function getResearchItemAuthor(item) {
  const metadata = item?.metadata || {}

  return firstValue(
    metadata.author,
    formatResearchPeople(metadata.authors),
    metadata.creator,
    metadata.sender,
  )
}

function getResearchTypeLabel(value) {
  return String(value || 'Research Source')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}

function buildResearchItemDescription(item) {
  const metadata = item?.metadata || {}
  const author = getResearchItemAuthor(item)

  return uniqueStrings([
    author
      ? `By ${author}`
      : '',

    item?.summary,
    metadata.abstract,
    metadata.notes,
    metadata.body,
    metadata.definition,
    metadata.quoteText,
    metadata.requirements,
  ]).join(' · ')
}

function createResearchItemGraphNode(item) {
  const metadata = item?.metadata || {}
  const graphType =
    normalizeResearchItemGraphType(item?.type)

  const courseIds = getCourseIdVariants([
    item?.courseId,
    metadata.courseId,
    ...(metadata.relatedCourseIds || []),
    ...(metadata.courseIds || []),
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      item?.assignmentId,
      metadata.assignmentId,
      ...(metadata.relatedAssignmentIds || []),
      ...(metadata.assignmentIds || []),
    ])

  const updatedAt = firstValue(
    item?.updatedAt,
    item?.updated_at,
    item?.createdAt,
    item?.created_at,
  )

  const publicationYear = firstValue(
    metadata.year,
    metadata.publicationYear,
    metadata.publishedDate,
    metadata.date,
  )

  const author =
    getResearchItemAuthor(item)

  const sourceType =
    getResearchTypeLabel(item?.type)

  const publisher = firstValue(
    metadata.publisher,
    metadata.institution,
  )

  return {
    id: `research:${item.id}`,
    entityId: String(item.id),
    researchItemId: String(item.id),

    title:
      item.title ||
      'Untitled Research Item',

    type: graphType,
    sourceType,
    recordType: sourceType,

    description:
      buildResearchItemDescription(item) ||
      'Supabase research item from the Scholarory Research Workspace.',

    tags: uniqueStrings([
      ...(item.topicTags || []),
      ...(item.supertags || []),
      ...(metadata.tags || []),
      ...(metadata.topicTags || []),
    ]),

    topicTags: uniqueStrings(
      item.topicTags || [],
    ),

    supertags: uniqueStrings(
      item.supertags || [],
    ),

    status:
      metadata.status ||
      'inbox',

    priority:
      metadata.priority ||
      '',

    updatedAt,

    createdAt:
      firstValue(
        item.createdAt,
        item.created_at,
      ),

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      firstValue(
        metadata.course,
        metadata.courseName,
        metadata.courseCode,
      ),

    assignment:
      firstValue(
        metadata.assignment,
        metadata.assignmentName,
      ),

    route:
      `/research/items/${item.id}`,

    author,

    authors:
      Array.isArray(metadata.authors)
        ? metadata.authors.map((person) => ({
            ...person,
          }))
        : metadata.authors || '',

    editors:
      Array.isArray(metadata.editors)
        ? metadata.editors.map((person) => ({
            ...person,
          }))
        : metadata.editors || '',

    subtitle:
      metadata.subtitle ||
      '',

    shortTitle:
      metadata.shortTitle ||
      '',

    publisher,

    publisherAliases: uniqueStrings([
      metadata.publisher,
      metadata.institution,
      metadata.database,
      metadata.repository,
    ]),

    publicationYear,
    year: publicationYear,

    publicationPlace:
      firstValue(
        metadata.placeOfPublication,
        metadata.publicationLocation,
      ),

    publicationLocation:
      firstValue(
        metadata.publicationLocation,
        metadata.placeOfPublication,
      ),

    institution:
      metadata.institution ||
      '',

    degree:
      metadata.degree ||
      '',

    department:
      metadata.department ||
      '',

    advisor:
      metadata.advisor ||
      '',

    database:
      metadata.database ||
      '',

    repository:
      metadata.repository ||
      '',

    publicationNumber:
      metadata.publicationNumber ||
      '',

    journalName:
      firstValue(
        metadata.journalName,
        metadata.journal,
      ),

    journal:
      firstValue(
        metadata.journal,
        metadata.journalName,
      ),

    volume:
      metadata.volume ||
      '',

    issue:
      metadata.issue ||
      '',

    pages:
      firstValue(
        metadata.pages,
        metadata.pageRange,
      ),

    pageRange:
      firstValue(
        metadata.pageRange,
        metadata.pages,
      ),

    pageCount:
      metadata.pageCount ||
      '',

    edition:
      metadata.edition ||
      '',

    genre:
      metadata.genre ||
      '',

    field:
      firstValue(
        metadata.field,
        metadata.discipline,
      ),

    language:
      metadata.language ||
      '',

    isbn:
      metadata.isbn ||
      '',

    issn:
      metadata.issn ||
      '',

    doi:
      metadata.doi ||
      '',

    url:
      metadata.url ||
      '',

    website:
      firstValue(
        metadata.siteName,
        metadata.websiteName,
      ),

    siteName:
      firstValue(
        metadata.siteName,
        metadata.websiteName,
      ),

    blogName:
      metadata.blogName ||
      '',

    accessDate:
      firstValue(
        metadata.accessDate,
        metadata.accessedDate,
      ),

    publishedDate:
      metadata.publishedDate ||
      '',

    citation:
      metadata.citation ||
      '',

    summary:
      item.summary ||
      '',

    abstract:
      metadata.abstract ||
      '',

    notes:
      firstValue(
        metadata.notes,
        metadata.body,
      ),

    sourceNotes:
      Array.isArray(metadata.sourceNotes)
        ? [...metadata.sourceNotes]
        : [],

    creator:
      metadata.creator ||
      '',

    platform:
      metadata.platform ||
      '',

    sender:
      metadata.sender ||
      '',

    recipient:
      metadata.recipient ||
      '',

    format:
      metadata.format ||
      '',

    definition:
      metadata.definition ||
      '',

    relatedIdeas:
      metadata.relatedIdeas ||
      '',

    role:
      metadata.role ||
      '',

    requirements:
      metadata.requirements ||
      '',

    quoteText:
      metadata.quoteText ||
      '',

    pageNumber:
      metadata.pageNumber ||
      '',

    coverImageUrl:
      metadata.coverImageUrl ||
      '',

    bannerImageUrl:
      metadata.bannerImageUrl ||
      '',

    researchLinks: uniqueStrings(
      item.links || [],
    ),

    metadata: {
      ...metadata,
    },
  }
}


function createConceptGraphNode(concept) {
  const updatedAt = firstValue(
    concept.updatedAt,
    concept.createdAt,
  )

  const courseIds =
    getCourseIdVariants(
      concept.linkedCourseIds || [],
    )

  const assignmentIds =
    getAssignmentIdVariants(
      concept.linkedAssignmentIds || [],
    )

  return {
    id: `concept:${concept.id}`,
    entityId: String(concept.id),

    title:
      concept.name ||
      'Untitled Concept',

    type: 'concept',
    sourceType: 'Concept',
    recordType: 'Concept',

    description:
      uniqueStrings([
        concept.definition,
        concept.notes,
      ]).join(' · ') ||
      'Concept from the Scholarory Concepts Database.',

    tags: uniqueStrings([
      ...(concept.tags || []),
      ...(concept.aliases || []),
      concept.category,
    ]),

    aliases: uniqueStrings(
      concept.aliases || [],
    ),

    category:
      concept.category ||
      'General',

    definition:
      concept.definition ||
      '',

    notes:
      concept.notes ||
      '',

    summary:
      concept.definition ||
      '',

    status:
      concept.archived
        ? 'archived'
        : concept.status ||
          'developing',

    priority:
      concept.pinned
        ? 'pinned'
        : '',

    pinned:
      concept.pinned === true,

    archived:
      concept.archived === true,

    updatedAt,

    createdAt:
      concept.createdAt ||
      '',

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    route:
      `/concepts/${encodeURIComponent(
        concept.id,
      )}`,

    relatedConceptIds:
      uniqueStrings(
        concept.relatedConceptIds || [],
      ),

    linkedSourceIds:
      uniqueStrings(
        concept.linkedSourceIds || [],
      ),

    linkedCourseIds:
      uniqueStrings(
        concept.linkedCourseIds || [],
      ),

    linkedAssignmentIds:
      uniqueStrings(
        concept.linkedAssignmentIds || [],
      ),

    linkedWritingProjectIds:
      uniqueStrings(
        concept.linkedWritingProjectIds || [],
      ),

    metadata: {
      aliases: uniqueStrings(
        concept.aliases || [],
      ),

      category:
        concept.category ||
        'General',

      definition:
        concept.definition ||
        '',

      notes:
        concept.notes ||
        '',

      pinned:
        concept.pinned === true,

      archived:
        concept.archived === true,

      relatedConceptIds:
        uniqueStrings(
          concept.relatedConceptIds || [],
        ),

      linkedSourceIds:
        uniqueStrings(
          concept.linkedSourceIds || [],
        ),

      linkedCourseIds:
        uniqueStrings(
          concept.linkedCourseIds || [],
        ),

      linkedAssignmentIds:
        uniqueStrings(
          concept.linkedAssignmentIds || [],
        ),

      linkedWritingProjectIds:
        uniqueStrings(
          concept.linkedWritingProjectIds || [],
        ),
    },
  }
}


function createTermGraphNode(termRecord) {
  const updatedAt = firstValue(
    termRecord.updatedAt,
    termRecord.createdAt,
  )

  const courseIds =
    getCourseIdVariants(
      termRecord.linkedCourseIds || [],
    )

  const assignmentIds =
    getAssignmentIdVariants(
      termRecord.linkedAssignmentIds || [],
    )

  return {
    id: `term:${termRecord.id}`,
    entityId: String(termRecord.id),

    title:
      termRecord.term ||
      'Untitled Term',

    term:
      termRecord.term ||
      'Untitled Term',

    type: 'term',
    sourceType: 'Term',
    recordType: 'Term',

    description:
      uniqueStrings([
        termRecord.definition,
        termRecord.extendedDefinition,
        ...(termRecord.examples || []),
        termRecord.notes,
      ]).join(' · ') ||
      'Term from the Scholarory Terms Database.',

    tags: uniqueStrings([
      ...(termRecord.tags || []),
      ...(termRecord.aliases || []),
      termRecord.discipline,
      termRecord.partOfSpeech,
      termRecord.originalLanguage,
    ]),

    aliases: uniqueStrings(
      termRecord.aliases || [],
    ),

    definition:
      termRecord.definition ||
      '',

    extendedDefinition:
      termRecord.extendedDefinition ||
      '',

    pronunciation:
      termRecord.pronunciation ||
      '',

    originalLanguage:
      termRecord.originalLanguage ||
      '',

    originalSpelling:
      termRecord.originalSpelling ||
      '',

    transliteration:
      termRecord.transliteration ||
      '',

    partOfSpeech:
      termRecord.partOfSpeech ||
      'Other',

    discipline:
      termRecord.discipline ||
      'General',

    examples:
      uniqueStrings(
        termRecord.examples || [],
      ),

    notes:
      termRecord.notes ||
      '',

    summary:
      termRecord.definition ||
      '',

    status:
      termRecord.archived
        ? 'archived'
        : termRecord.status ||
          'developing',

    priority:
      termRecord.pinned
        ? 'pinned'
        : '',

    pinned:
      termRecord.pinned === true,

    archived:
      termRecord.archived === true,

    updatedAt,

    createdAt:
      termRecord.createdAt ||
      '',

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    route:
      `/terms/${encodeURIComponent(
        termRecord.id,
      )}`,

    relatedTermIds:
      uniqueStrings(
        termRecord.relatedTermIds || [],
      ),

    linkedConceptIds:
      uniqueStrings(
        termRecord.linkedConceptIds || [],
      ),

    linkedSourceIds:
      uniqueStrings(
        termRecord.linkedSourceIds || [],
      ),

    linkedCourseIds:
      uniqueStrings(
        termRecord.linkedCourseIds || [],
      ),

    linkedAssignmentIds:
      uniqueStrings(
        termRecord.linkedAssignmentIds || [],
      ),

    linkedWritingProjectIds:
      uniqueStrings(
        termRecord.linkedWritingProjectIds || [],
      ),

    metadata: {
      aliases: uniqueStrings(
        termRecord.aliases || [],
      ),

      definition:
        termRecord.definition ||
        '',

      extendedDefinition:
        termRecord.extendedDefinition ||
        '',

      pronunciation:
        termRecord.pronunciation ||
        '',

      originalLanguage:
        termRecord.originalLanguage ||
        '',

      originalSpelling:
        termRecord.originalSpelling ||
        '',

      transliteration:
        termRecord.transliteration ||
        '',

      partOfSpeech:
        termRecord.partOfSpeech ||
        'Other',

      discipline:
        termRecord.discipline ||
        'General',

      examples: uniqueStrings(
        termRecord.examples || [],
      ),

      notes:
        termRecord.notes ||
        '',

      pinned:
        termRecord.pinned === true,

      archived:
        termRecord.archived === true,

      relatedTermIds:
        uniqueStrings(
          termRecord.relatedTermIds || [],
        ),

      linkedConceptIds:
        uniqueStrings(
          termRecord.linkedConceptIds || [],
        ),

      linkedSourceIds:
        uniqueStrings(
          termRecord.linkedSourceIds || [],
        ),

      linkedCourseIds:
        uniqueStrings(
          termRecord.linkedCourseIds || [],
        ),

      linkedAssignmentIds:
        uniqueStrings(
          termRecord.linkedAssignmentIds || [],
        ),

      linkedWritingProjectIds:
        uniqueStrings(
          termRecord.linkedWritingProjectIds || [],
        ),
    },
  }
}

function createKnowledgeTagGraphNode(
  knowledgeTag,
) {
  const updatedAt = firstValue(
    knowledgeTag.updatedAt,
    knowledgeTag.createdAt,
  )

  const aliases = uniqueStrings(
    knowledgeTag.aliases || [],
  )

  const supertags = uniqueStrings(
    knowledgeTag.supertags || [],
  )

  return {
    id:
      `knowledge-tag:${knowledgeTag.id}`,

    entityId:
      String(knowledgeTag.id),

    knowledgeTagId:
      String(knowledgeTag.id),

    title:
      knowledgeTag.name ||
      'Untitled Knowledge Tag',

    name:
      knowledgeTag.name ||
      'Untitled Knowledge Tag',

    slug:
      knowledgeTag.slug ||
      '',

    type: 'knowledge-tag',
    sourceType: 'Knowledge Tag',
    recordType: 'Knowledge Tag',

    description:
      knowledgeTag.description ||
      'Formal Knowledge Tag from Scholarory.',

    tags: uniqueStrings([
      knowledgeTag.name,
      ...aliases,
      ...supertags,
      knowledgeTag.kind,
    ]),

    aliases,
    supertags,

    kind:
      knowledgeTag.kind ||
      'topic',

    parentId:
      knowledgeTag.parentId ||
      null,

    color:
      knowledgeTag.color ||
      '',

    icon:
      knowledgeTag.icon ||
      '🏷️',

    status: 'active',

    updatedAt,

    createdAt:
      knowledgeTag.createdAt ||
      '',

    date: getDateKey(updatedAt),

    route:
      `/knowledge-tags/${encodeURIComponent(
        knowledgeTag.id,
      )}`,

    metadata: {
      name:
        knowledgeTag.name ||
        '',

      slug:
        knowledgeTag.slug ||
        '',

      kind:
        knowledgeTag.kind ||
        'topic',

      parentId:
        knowledgeTag.parentId ||
        null,

      description:
        knowledgeTag.description ||
        '',

      aliases,
      supertags,

      color:
        knowledgeTag.color ||
        '',

      icon:
        knowledgeTag.icon ||
        '',
    },
  }
}

function findKnowledgeTagNodeByName(
  nodes,
  value,
) {
  const normalizedValue =
    normalizeSearchText(value)

  if (!normalizedValue) {
    return null
  }

  return (
    nodes.find((node) => {
      if (
        node.type !==
        'knowledge-tag'
      ) {
        return false
      }

      const names = [
        node.title,
        node.name,
        node.slug,
        ...(node.aliases || []),
      ]

      return names.some((name) => {
        return (
          normalizeSearchText(name) ===
          normalizedValue
        )
      })
    }) ||
    null
  )
}

function nodeUsesKnowledgeTag(
  node,
  knowledgeTagNode,
) {
  if (
    !node ||
    !knowledgeTagNode ||
    node.type === 'knowledge-tag'
  ) {
    return false
  }

  const tagTerms = new Set(
    uniqueStrings([
      knowledgeTagNode.title,
      knowledgeTagNode.name,
      ...(knowledgeTagNode.aliases || []),
    ]).map((value) => {
      return normalizeTag(value)
    }),
  )

  if (!tagTerms.size) {
    return false
  }

  return uniqueStrings(
    node.tags || [],
  ).some((tag) => {
    return tagTerms.has(
      normalizeTag(tag),
    )
  })
}

function findGraphNodeForSourceRecord(
  nodes,
  sourceId,
) {
  const cleanId = String(
    sourceId || '',
  ).trim()

  if (!cleanId) {
    return null
  }

  return (
    nodes.find((node) => {
      if (
        !SOURCE_GRAPH_TYPES.includes(
          node.type,
        )
      ) {
        return false
      }

      return [
        node.entityId,
        node.sourceRecordId,
      ].some((value) => {
        return (
          String(value || '').trim() ===
          cleanId
        )
      })
    }) ||
    null
  )
}

function findGraphNodeForRelationshipSource(
  nodes,
  relationshipSource,
) {
  if (!relationshipSource) {
    return null
  }

  const sourceId = String(
    relationshipSource.id || '',
  ).trim()

  const graphType =
    normalizeSourceType(
      relationshipSource.sourceType,
    )

  const directMatch =
    nodes.find((node) => {
      if (
        !SOURCE_GRAPH_TYPES.includes(
          node.type,
        )
      ) {
        return false
      }

      if (
        graphType &&
        node.type !== graphType
      ) {
        return false
      }

      return [
        node.entityId,
        node.sourceRecordId,
      ].some((value) => {
        return (
          sourceId &&
          String(value || '').trim() ===
            sourceId
        )
      })
    })

  if (directMatch) {
    return directMatch
  }

  const title =
    normalizeSearchText(
      relationshipSource.title,
    )

  const author =
    normalizeSearchText(
      relationshipSource.author,
    )

  return (
    nodes.find((node) => {
      if (
        !SOURCE_GRAPH_TYPES.includes(
          node.type,
        )
      ) {
        return false
      }

      if (
        graphType &&
        node.type !== graphType
      ) {
        return false
      }

      if (
        normalizeSearchText(
          node.title,
        ) !== title
      ) {
        return false
      }

      const nodeAuthor =
        normalizeSearchText(
          node.author,
        )

      return (
        !author ||
        !nodeAuthor ||
        author === nodeAuthor
      )
    }) ||
    null
  )
}

function findGraphNodeForWritingProject(
  nodes,
  projectId,
) {
  const cleanId = String(
    projectId || '',
  ).trim()

  if (!cleanId) {
    return null
  }

  return (
    nodes.find((node) => {
      const nodeType =
        String(node.type || '')
          .toLowerCase()

      const isWritingNode =
        nodeType.includes('writing') ||
        nodeType === 'project'

      if (!isWritingNode) {
        return false
      }

      return [
        node.id,
        node.entityId,
      ].some((value) => {
        return (
          String(value || '').trim() ===
            cleanId ||
          String(value || '').trim() ===
            `writing-project:${cleanId}` ||
          String(value || '').trim() ===
            `writing-project-${cleanId}`
        )
      })
    }) ||
    null
  )
}

function graphNodesRepresentSameEntity(
  firstNode,
  secondNode,
) {
  if (
    !firstNode ||
    !secondNode ||
    firstNode.type !== secondNode.type
  ) {
    return false
  }

  const firstTitle =
    normalizeSearchText(firstNode.title)

  const secondTitle =
    normalizeSearchText(secondNode.title)

  if (
    !firstTitle ||
    !secondTitle ||
    firstTitle !== secondTitle
  ) {
    return false
  }

  const firstAuthor =
    normalizeSearchText(firstNode.author)

  const secondAuthor =
    normalizeSearchText(secondNode.author)

  if (
    firstAuthor &&
    secondAuthor &&
    firstAuthor !== secondAuthor
  ) {
    return false
  }

  return true
}

function hasMeaningfulGraphValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.keys(value).length > 0
  }

  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ''
  )
}

function mergeResearchIntoGraphNode(
  existingNode,
  researchNode,
) {
  const mergedNode = {
    ...existingNode,
  }

  Object.entries(researchNode).forEach(
    ([key, value]) => {
      if (
        !hasMeaningfulGraphValue(
          mergedNode[key],
        ) &&
        hasMeaningfulGraphValue(value)
      ) {
        mergedNode[key] = value
      }
    },
  )

  mergedNode.tags = uniqueStrings([
    ...(existingNode.tags || []),
    ...(researchNode.tags || []),
  ])

  mergedNode.topicTags = uniqueStrings([
    ...(existingNode.topicTags || []),
    ...(researchNode.topicTags || []),
  ])

  mergedNode.supertags = uniqueStrings([
    ...(existingNode.supertags || []),
    ...(researchNode.supertags || []),
  ])

  mergedNode.publisherAliases =
    uniqueStrings([
      ...(existingNode.publisherAliases || []),
      ...(researchNode.publisherAliases || []),
      existingNode.publisher,
      researchNode.publisher,
    ])

  mergedNode.description =
    uniqueStrings([
      existingNode.description,
      researchNode.description,
    ]).join(' · ')

  mergedNode.researchItemId =
    researchNode.researchItemId

  mergedNode.researchRoute =
    researchNode.route

  mergedNode.researchLinks =
    uniqueStrings([
      ...(existingNode.researchLinks || []),
      ...(researchNode.researchLinks || []),
    ])

  mergedNode.metadata = {
    ...(researchNode.metadata || {}),
    ...(existingNode.metadata || {}),
  }

  return mergedNode
}

function findGraphNodeForEntity(
  nodes,
  type,
  entityId,
) {
  const cleanId = String(
    entityId || '',
  )

  if (!cleanId) {
    return null
  }

  const possibleIds = new Set([
    cleanId,
    `${type}-${cleanId}`,
    `${type}:${cleanId}`,
  ])

  return (
    nodes.find((node) => {
      return (
        node.type === type &&
        (
          possibleIds.has(
            String(node.id),
          ) ||
          possibleIds.has(
            String(node.entityId),
          )
        )
      )
    }) ||
    null
  )
}

function getSearchableStrings(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      return getSearchableStrings(item)
    })
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap(
      (item) => {
        return getSearchableStrings(item)
      },
    )
  }

  return [String(value)]
}

function nodeMatchesSearch(
  node,
  query,
) {
  const queryVariants =
    getSearchVariants(query)

  if (queryVariants.length === 0) {
    return true
  }

  const searchableValues = [
    node.title,
    node.label,
    node.subtitle,

    node.author,
    node.authors,

    node.description,

    node.type,
    node.sourceType,
    node.recordType,

    node.status,
    node.priority,

    node.publisher,
    node.publisherAliases,
    node.publicationYear,
    node.year,

    node.publicationPlace,
    node.publicationLocation,

    node.journalName,
    node.journal,
    node.journalId,

    node.website,
    node.issn,
    node.field,
    node.peerReviewed,
    node.favorite,

    node.volume,
    node.issue,
    node.pages,
    node.pageRange,
    node.pageCount,

    node.edition,
    node.genre,
    node.language,

    node.isbn,
    node.doi,
    node.url,
    node.accessDate,

    node.course,
    node.assignment,

    node.citation,
    node.summary,
    node.abstract,
    node.sectionNotes,
    node.keyQuotes,
    node.useForWriting,
    node.notes,
    node.sourceNotes,

    node.firstAuthorFirstName,
    node.firstAuthorLastName,
    node.secondAuthorFirstName,
    node.secondAuthorLastName,
    node.contributorsText,
    node.forewordBy,

    node.institution,
    node.degree,
    node.department,
    node.advisor,
    node.database,
    node.repository,
    node.publicationNumber,

    node.creator,
    node.platform,
    node.sender,
    node.recipient,
    node.format,
    node.definition,
    node.relatedIdeas,
    node.role,
    node.requirements,
    node.quoteText,
    node.pageNumber,

    node.aliases,
    node.category,
    node.term,
    node.name,
    node.slug,
    node.kind,
    node.parentId,
    node.color,
    node.icon,
    node.extendedDefinition,
    node.pronunciation,
    node.originalLanguage,
    node.originalSpelling,
    node.transliteration,
    node.partOfSpeech,
    node.discipline,
    node.examples,
    node.pinned,
    node.archived,
    node.relatedConceptIds,
    node.relatedTermIds,
    node.linkedConceptIds,
    node.linkedSourceIds,
    node.linkedCourseIds,
    node.linkedAssignmentIds,
    node.linkedWritingProjectIds,

    node.topicTags,
    node.supertags,
    node.metadata,

    ...(node.tags || []),
  ]

  return searchableValues
    .flatMap((value) => {
      return getSearchableStrings(value)
    })
    .some((value) => {
      const valueVariants =
        getSearchVariants(value)

      return queryVariants.some(
        (queryVariant) => {
          return valueVariants.some(
            (valueVariant) => {
              return valueVariant.includes(
                queryVariant,
              )
            },
          )
        },
      )
    })
}

export function useKnowledgeGraph() {
  const {
    allBooks,
  } = useBooks()

  const {
    allSources,
  } = useSources()

  const {
    allJournals,
    allArticles,
  } = useJournals()

  const {
    allResearchItems,
    loadResearchItems,
  } = useResearch()

  const {
    activeConcepts,
  } = useConcepts()

  const {
    activeTerms,
  } = useTerms()

  const {
    allKnowledgeTags,
    allResearchItemTags,
    isLoadingKnowledgeTags,
    loadKnowledgeTagSystem,
  } = useKnowledgeTags()

  if (
    !isLoadingKnowledgeTags.value &&
    !allKnowledgeTags.value.length &&
    !allResearchItemTags.value.length
  ) {
    Promise.resolve(
      loadKnowledgeTagSystem(),
    ).catch((error) => {
      console.error(
        'Could not load formal Knowledge Tags for the knowledge graph:',
        error,
      )
    })
  }

  if (!allResearchItems.value.length) {
    Promise.resolve(
      loadResearchItems(),
    ).catch((error) => {
      console.error(
        'Could not load Supabase research items for the knowledge graph:',
        error,
      )
    })
  }

  const baseNodes = ref(
    mockKnowledgeGraphNodes.map((node) => ({
      ...node,
      tags: [...(node.tags || [])],
    })),
  )

  const baseLinks = ref(
    mockKnowledgeGraphLinks.map((link) => ({
      ...link,
    })),
  )

  const discoveryItems = ref(
    mockGraphDiscoveryItems.map((item) => ({
      ...item,
    })),
  )

  const searchQuery = ref('')
  const selectedType = ref('all')
  const selectedTag = ref('all')
  const selectedCourse = ref('all')
  const graphDensity = ref(5)
  const todayOnly = ref(false)
  const showConnectedContext = ref(false)
  const graphViewMode = ref('card')
  const focusMode = ref(false)
  const selectedNode = ref(null)

  const graphNodeTypes = [
    ...SUPPORTED_GRAPH_NODE_TYPES,
  ]

  const activeTypes = ref([
    ...graphNodeTypes,
  ])

  const liveBookNodes = computed(() => {
    return allBooks.value.map((book) => {
      const matchingSource =
        findMatchingSourceForBook(
          book,
          allSources.value,
        )

      return createBookGraphNode(
        book,
        matchingSource,
      )
    })
  })

  const liveJournalNodes = computed(() => {
    return allJournals.value.map((journal) => {
      const matchingSource =
        findMatchingSourceForJournal(
          journal,
          allSources.value,
        )

      return createJournalGraphNode(
        journal,
        matchingSource,
      )
    })
  })

  const journalById = computed(() => {
    return new Map(
      allJournals.value.map((journal) => {
        return [
          String(journal.id),
          journal,
        ]
      }),
    )
  })

  const liveArticleNodes = computed(() => {
    return allArticles.value.map((article) => {
      const parentJournal =
        journalById.value.get(
          String(article.journalId),
        ) || null

      const matchingSource =
        findMatchingSourceForArticle(
          article,
          allSources.value,
        )

      return createArticleGraphNode(
        article,
        parentJournal,
        matchingSource,
      )
    })
  })

  const liveSourceNodes = computed(() => {
    return allSources.value
      .filter((source) => {
        const sourceType =
          normalizeSourceType(
            source.type,
          )

        if (sourceType === 'book') {
          return !allBooks.value.some((book) => {
            return recordsRepresentSameBook(
              book,
              source,
            )
          })
        }

        if (sourceType === 'journal') {
          return !allJournals.value.some(
            (journal) => {
              return recordsRepresentSameJournal(
                journal,
                source,
              )
            },
          )
        }

        if (sourceType === 'article') {
          return !allArticles.value.some(
            (article) => {
              return recordsRepresentSameArticle(
                article,
                source,
              )
            },
          )
        }

        return true
      })
      .map((source) => {
        return createSourceGraphNode(source)
      })
  })

  const liveConceptNodes = computed(() => {
    return activeConcepts.value.map((concept) => {
      return createConceptGraphNode(concept)
    })
  })

  const liveTermNodes = computed(() => {
    return activeTerms.value.map((termRecord) => {
      return createTermGraphNode(termRecord)
    })
  })

  const liveKnowledgeTagNodes = computed(() => {
    return allKnowledgeTags.value.map(
      (knowledgeTag) => {
        return createKnowledgeTagGraphNode(
          knowledgeTag,
        )
      },
    )
  })

  const liveResearchItemNodes = computed(() => {
    return allResearchItems.value.map((item) => {
      return createResearchItemGraphNode(item)
    })
  })

  const integratedLiveNodes = computed(() => {
    const canonicalNodes = [
      ...liveBookNodes.value,
      ...liveJournalNodes.value,
      ...liveArticleNodes.value,
      ...liveSourceNodes.value,
      ...liveConceptNodes.value,
      ...liveTermNodes.value,
      ...liveKnowledgeTagNodes.value,
    ].map((node) => ({
      ...node,
    }))

    const researchNodeIdByItemId =
      new Map()

    liveResearchItemNodes.value.forEach(
      (researchNode) => {
        const matchingIndex =
          canonicalNodes.findIndex((node) => {
            return graphNodesRepresentSameEntity(
              node,
              researchNode,
            )
          })

        if (matchingIndex >= 0) {
          canonicalNodes[matchingIndex] =
            mergeResearchIntoGraphNode(
              canonicalNodes[matchingIndex],
              researchNode,
            )

          researchNodeIdByItemId.set(
            String(researchNode.entityId),
            canonicalNodes[matchingIndex].id,
          )

          return
        }

        canonicalNodes.push(
          researchNode,
        )

        researchNodeIdByItemId.set(
          String(researchNode.entityId),
          researchNode.id,
        )
      },
    )

    return {
      nodes: canonicalNodes,
      researchNodeIdByItemId,
    }
  })

  const nodes = computed(() => {
    const hasLiveSources =
      liveBookNodes.value.length > 0 ||
      liveJournalNodes.value.length > 0 ||
      liveArticleNodes.value.length > 0 ||
      liveSourceNodes.value.length > 0 ||
      liveResearchItemNodes.value.some(
        (node) => {
          return SOURCE_GRAPH_TYPES.includes(
            node.type,
          )
        },
      )

    const hasLiveConcepts =
      liveConceptNodes.value.length > 0 ||
      liveResearchItemNodes.value.some(
        (node) => {
          return node.type === 'concept'
        },
      )

    const hasLiveTerms =
      liveTermNodes.value.length > 0 ||
      liveResearchItemNodes.value.some(
        (node) => {
          return node.type === 'term'
        },
      )

    const hasLiveKnowledgeTags =
      liveKnowledgeTagNodes.value.length > 0

    const retainedBaseNodes =
      baseNodes.value.filter((node) => {
        if (
          hasLiveSources &&
          SOURCE_GRAPH_TYPES.includes(
            node.type,
          )
        ) {
          return false
        }

        if (
          hasLiveConcepts &&
          node.type === 'concept'
        ) {
          return false
        }

        if (
          hasLiveTerms &&
          node.type === 'term'
        ) {
          return false
        }

        if (
          hasLiveKnowledgeTags &&
          node.type ===
            'knowledge-tag'
        ) {
          return false
        }

        return true
      })

    return [
      ...retainedBaseNodes,
      ...integratedLiveNodes.value.nodes,
    ]
  })

  const liveBookLinks = computed(() => {
    const relationships = []

    liveBookNodes.value.forEach((bookNode) => {
      uniqueStrings(
        bookNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `book-course:${bookNode.entityId}:${courseNode.id}`,

          source: bookNode.id,
          target: courseNode.id,
          label: 'Used in course',
          strength: 4,
        })
      })

      uniqueStrings(
        bookNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `book-assignment:${bookNode.entityId}:${assignmentNode.id}`,

          source: bookNode.id,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 4,
        })
      })
    })

    return relationships
  })

  const liveSourceLinks = computed(() => {
    const relationships = []

    liveSourceNodes.value.forEach((sourceNode) => {
      uniqueStrings(
        sourceNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `source-course:${sourceNode.entityId}:${courseNode.id}`,

          source: sourceNode.id,
          target: courseNode.id,
          label: 'Used in course',
          strength: 4,
        })
      })

      uniqueStrings(
        sourceNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `source-assignment:${sourceNode.entityId}:${assignmentNode.id}`,

          source: sourceNode.id,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 4,
        })
      })
    })

    return relationships
  })

  const liveJournalLinks = computed(() => {
    const relationships = []

    liveJournalNodes.value.forEach((journalNode) => {
      uniqueStrings(
        journalNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `journal-course:${journalNode.entityId}:${courseNode.id}`,

          source: journalNode.id,
          target: courseNode.id,
          label: 'Used in course',
          strength: 3,
        })
      })

      uniqueStrings(
        journalNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `journal-assignment:${journalNode.entityId}:${assignmentNode.id}`,

          source: journalNode.id,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 3,
        })
      })
    })

    return relationships
  })

  const liveArticleLinks = computed(() => {
    const relationships = []

    liveArticleNodes.value.forEach((articleNode) => {
      if (articleNode.journalNodeId) {
        const journalNode =
          nodes.value.find((node) => {
            return (
              node.id ===
              articleNode.journalNodeId
            )
          })

        if (journalNode) {
          relationships.push({
            id:
              `journal-article:${journalNode.entityId}:${articleNode.entityId}`,

            source: journalNode.id,
            target: articleNode.id,
            label: 'Contains article',
            strength: 5,
          })
        }
      }

      uniqueStrings(
        articleNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `article-course:${articleNode.entityId}:${courseNode.id}`,

          source: articleNode.id,
          target: courseNode.id,
          label: 'Used in course',
          strength: 4,
        })
      })

      uniqueStrings(
        articleNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `article-assignment:${articleNode.entityId}:${assignmentNode.id}`,

          source: articleNode.id,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 4,
        })
      })
    })

    return relationships
  })

  const liveResearchLinks = computed(() => {
    const relationships = []

    const researchNodeIdByItemId =
      integratedLiveNodes.value
        .researchNodeIdByItemId

    allResearchItems.value.forEach((item) => {
      const sourceNodeId =
        researchNodeIdByItemId.get(
          String(item.id),
        )

      if (!sourceNodeId) {
        return
      }

      uniqueStrings(
        item.links || [],
      ).forEach((linkedItemId) => {
        const targetNodeId =
          researchNodeIdByItemId.get(
            String(linkedItemId),
          )

        if (
          !targetNodeId ||
          targetNodeId === sourceNodeId
        ) {
          return
        }

        const relationshipPair = [
          sourceNodeId,
          targetNodeId,
        ].sort()

        relationships.push({
          id:
            `research-link:${relationshipPair[0]}:${relationshipPair[1]}`,

          source: sourceNodeId,
          target: targetNodeId,
          label: 'Connected research',
          strength: 4,
        })
      })

      const sourceNode =
        nodes.value.find((node) => {
          return node.id === sourceNodeId
        })

      if (!sourceNode) {
        return
      }

      uniqueStrings(
        sourceNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `research-course:${item.id}:${courseNode.id}`,

          source: sourceNodeId,
          target: courseNode.id,
          label: 'Used in course',
          strength: 4,
        })
      })

      uniqueStrings(
        sourceNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `research-assignment:${item.id}:${assignmentNode.id}`,

          source: sourceNodeId,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 4,
        })
      })
    })

    return relationships
  })


  const liveConceptLinks = computed(() => {
    const relationships = []
    const seenRelationshipIds = new Set()

    function addRelationship(
      relationship,
    ) {
      if (
        !relationship?.source ||
        !relationship?.target ||
        relationship.source ===
          relationship.target ||
        seenRelationshipIds.has(
          relationship.id,
        )
      ) {
        return
      }

      seenRelationshipIds.add(
        relationship.id,
      )

      relationships.push(
        relationship,
      )
    }

    liveConceptNodes.value.forEach(
      (conceptNode) => {
        uniqueStrings(
          conceptNode.relatedConceptIds || [],
        ).forEach((relatedConceptId) => {
          const relatedNode =
            findGraphNodeForEntity(
              nodes.value,
              'concept',
              relatedConceptId,
            )

          if (!relatedNode) {
            return
          }

          const pair = [
            conceptNode.id,
            relatedNode.id,
          ].sort()

          addRelationship({
            id:
              `concept-related:${pair[0]}:${pair[1]}`,

            source: pair[0],
            target: pair[1],
            label: 'Related concept',
            strength: 5,
          })
        })

        uniqueStrings(
          conceptNode.linkedSourceIds || [],
        ).forEach((sourceId) => {
          const sourceNode =
            findGraphNodeForSourceRecord(
              nodes.value,
              sourceId,
            )

          if (!sourceNode) {
            return
          }

          addRelationship({
            id:
              `concept-source:${conceptNode.entityId}:${sourceNode.id}`,

            source: conceptNode.id,
            target: sourceNode.id,
            label: 'Supported by source',
            strength: 4,
          })
        })

        uniqueStrings(
          conceptNode.courseIds || [],
        ).forEach((courseId) => {
          const courseNode =
            findGraphNodeForEntity(
              nodes.value,
              'course',
              courseId,
            )

          if (!courseNode) {
            return
          }

          addRelationship({
            id:
              `concept-course:${conceptNode.entityId}:${courseNode.id}`,

            source: conceptNode.id,
            target: courseNode.id,
            label: 'Used in course',
            strength: 4,
          })
        })

        uniqueStrings(
          conceptNode.assignmentIds || [],
        ).forEach((assignmentId) => {
          const assignmentNode =
            findGraphNodeForEntity(
              nodes.value,
              'assignment',
              assignmentId,
            )

          if (!assignmentNode) {
            return
          }

          addRelationship({
            id:
              `concept-assignment:${conceptNode.entityId}:${assignmentNode.id}`,

            source: conceptNode.id,
            target: assignmentNode.id,
            label: 'Supports assignment',
            strength: 4,
          })
        })

        uniqueStrings(
          conceptNode.linkedWritingProjectIds || [],
        ).forEach((projectId) => {
          const writingNode =
            findGraphNodeForWritingProject(
              nodes.value,
              projectId,
            )

          if (!writingNode) {
            return
          }

          addRelationship({
            id:
              `concept-writing:${conceptNode.entityId}:${writingNode.id}`,

            source: conceptNode.id,
            target: writingNode.id,
            label: 'Used in writing',
            strength: 4,
          })
        })
      },
    )

    return relationships
  })


  const liveTermLinks = computed(() => {
    const relationships = []
    const seenRelationshipIds = new Set()

    function addRelationship(
      relationship,
    ) {
      if (
        !relationship?.source ||
        !relationship?.target ||
        relationship.source ===
          relationship.target ||
        seenRelationshipIds.has(
          relationship.id,
        )
      ) {
        return
      }

      seenRelationshipIds.add(
        relationship.id,
      )

      relationships.push(
        relationship,
      )
    }

    liveTermNodes.value.forEach(
      (termNode) => {
        uniqueStrings(
          termNode.relatedTermIds || [],
        ).forEach((relatedTermId) => {
          const relatedNode =
            findGraphNodeForEntity(
              nodes.value,
              'term',
              relatedTermId,
            )

          if (!relatedNode) {
            return
          }

          const pair = [
            termNode.id,
            relatedNode.id,
          ].sort()

          addRelationship({
            id:
              `term-related:${pair[0]}:${pair[1]}`,

            source: pair[0],
            target: pair[1],
            label: 'Related term',
            strength: 5,
          })
        })

        uniqueStrings(
          termNode.linkedConceptIds || [],
        ).forEach((conceptId) => {
          const conceptNode =
            findGraphNodeForEntity(
              nodes.value,
              'concept',
              conceptId,
            )

          if (!conceptNode) {
            return
          }

          addRelationship({
            id:
              `term-concept:${termNode.entityId}:${conceptNode.id}`,

            source: termNode.id,
            target: conceptNode.id,
            label: 'Defines concept',
            strength: 5,
          })
        })

        uniqueStrings(
          termNode.linkedSourceIds || [],
        ).forEach((sourceId) => {
          const sourceNode =
            findGraphNodeForSourceRecord(
              nodes.value,
              sourceId,
            )

          if (!sourceNode) {
            return
          }

          addRelationship({
            id:
              `term-source:${termNode.entityId}:${sourceNode.id}`,

            source: termNode.id,
            target: sourceNode.id,
            label: 'Supported by source',
            strength: 4,
          })
        })

        uniqueStrings(
          termNode.courseIds || [],
        ).forEach((courseId) => {
          const courseNode =
            findGraphNodeForEntity(
              nodes.value,
              'course',
              courseId,
            )

          if (!courseNode) {
            return
          }

          addRelationship({
            id:
              `term-course:${termNode.entityId}:${courseNode.id}`,

            source: termNode.id,
            target: courseNode.id,
            label: 'Used in course',
            strength: 4,
          })
        })

        uniqueStrings(
          termNode.assignmentIds || [],
        ).forEach((assignmentId) => {
          const assignmentNode =
            findGraphNodeForEntity(
              nodes.value,
              'assignment',
              assignmentId,
            )

          if (!assignmentNode) {
            return
          }

          addRelationship({
            id:
              `term-assignment:${termNode.entityId}:${assignmentNode.id}`,

            source: termNode.id,
            target: assignmentNode.id,
            label: 'Supports assignment',
            strength: 4,
          })
        })

        uniqueStrings(
          termNode.linkedWritingProjectIds || [],
        ).forEach((projectId) => {
          const writingNode =
            findGraphNodeForWritingProject(
              nodes.value,
              projectId,
            )

          if (!writingNode) {
            return
          }

          addRelationship({
            id:
              `term-writing:${termNode.entityId}:${writingNode.id}`,

            source: termNode.id,
            target: writingNode.id,
            label: 'Used in writing',
            strength: 4,
          })
        })
      },
    )

    return relationships
  })

  const liveKnowledgeTagLinks =
    computed(() => {
      const relationships = []
      const seenPairs = new Set()

      function addRelationship(
        relationship,
      ) {
        if (
          !relationship?.source ||
          !relationship?.target ||
          relationship.source ===
            relationship.target
        ) {
          return
        }

        const pairKey = [
          relationship.source,
          relationship.target,
        ]
          .sort()
          .join('::')

        const relationshipKey =
          `${pairKey}::${relationship.label || 'related'}`

        if (
          seenPairs.has(
            relationshipKey,
          )
        ) {
          return
        }

        seenPairs.add(
          relationshipKey,
        )

        relationships.push(
          relationship,
        )
      }

      liveKnowledgeTagNodes.value.forEach(
        (tagNode) => {
          if (tagNode.parentId) {
            const parentNode =
              findGraphNodeForEntity(
                nodes.value,
                'knowledge-tag',
                tagNode.parentId,
              )

            if (parentNode) {
              addRelationship({
                id:
                  `knowledge-tag-parent:${parentNode.entityId}:${tagNode.entityId}`,

                source:
                  parentNode.id,

                target:
                  tagNode.id,

                label:
                  'Contains tag',

                strength: 5,
              })
            }
          }

          uniqueStrings(
            tagNode.supertags || [],
          ).forEach((supertagName) => {
            const supertagNode =
              findKnowledgeTagNodeByName(
                nodes.value,
                supertagName,
              )

            if (
              !supertagNode ||
              supertagNode.id ===
                tagNode.id
            ) {
              return
            }

            addRelationship({
              id:
                `knowledge-supertag:${supertagNode.entityId}:${tagNode.entityId}`,

              source:
                supertagNode.id,

              target:
                tagNode.id,

              label:
                'Supertag',

              strength: 4,
            })
          })

          nodes.value.forEach((node) => {
            if (
              nodeUsesKnowledgeTag(
                node,
                tagNode,
              )
            ) {
              addRelationship({
                id:
                  `knowledge-tag-inferred:${tagNode.entityId}:${node.id}`,

                source:
                  tagNode.id,

                target:
                  node.id,

                label:
                  'Tagged with',

                strength: 3,
              })
            }
          })
        },
      )

      const researchNodeIdByItemId =
        integratedLiveNodes.value
          .researchNodeIdByItemId

      allResearchItemTags.value.forEach(
        (link) => {
          const tagNode =
            findGraphNodeForEntity(
              nodes.value,
              'knowledge-tag',
              link.knowledgeTagId,
            )

          const researchNodeId =
            researchNodeIdByItemId.get(
              String(
                link.researchItemId,
              ),
            )

          if (
            !tagNode ||
            !researchNodeId
          ) {
            return
          }

          addRelationship({
            id:
              `knowledge-tag-formal:${tagNode.entityId}:${researchNodeId}`,

            source:
              tagNode.id,

            target:
              researchNodeId,

            label:
              'Formal tag',

            strength: 5,
          })
        },
      )

      return relationships
    })

  const liveSourceRelationshipLinks =
    computed(() => {
      const sourceRecords =
        getRelationshipSources()

      const sourceByUid =
        new Map(
          sourceRecords.map(
            (sourceRecord) => [
              sourceRecord.uid,
              sourceRecord,
            ],
          ),
        )

      return readSourceRelationships()
        .map((relationship) => {
          const fromRecord =
            sourceByUid.get(
              relationship.fromUid,
            )

          const toRecord =
            sourceByUid.get(
              relationship.toUid,
            )

          const fromNode =
            findGraphNodeForRelationshipSource(
              nodes.value,
              fromRecord,
            )

          const toNode =
            findGraphNodeForRelationshipSource(
              nodes.value,
              toRecord,
            )

          if (
            !fromNode ||
            !toNode ||
            fromNode.id === toNode.id
          ) {
            return null
          }

          return {
            id:
              `source-relationship:${relationship.id}`,

            source:
              fromNode.id,

            target:
              toNode.id,

            label:
              getSourceRelationshipLabel(
                relationship.relationshipType,
              ) ||
              'Related source',

            strength: 5,

            relationshipType:
              relationship.relationshipType,

            note:
              relationship.note ||
              '',

            tags:
              String(
                relationship.tags || '',
              )
                .split(',')
                .map((tag) =>
                  tag.trim(),
                )
                .filter(Boolean),
          }
        })
        .filter(Boolean)
    })

  const links = computed(() => {
    const existingNodeIds = new Set(
      nodes.value.map((node) => {
        return node.id
      }),
    )

    const seenRelationships = new Set()

    return [
      ...baseLinks.value,
      ...liveBookLinks.value,
      ...liveJournalLinks.value,
      ...liveArticleLinks.value,
      ...liveSourceLinks.value,
      ...liveResearchLinks.value,
      ...liveConceptLinks.value,
      ...liveTermLinks.value,
      ...liveKnowledgeTagLinks.value,
      ...liveSourceRelationshipLinks.value,
    ].filter((link) => {
      if (
        !existingNodeIds.has(link.source) ||
        !existingNodeIds.has(link.target)
      ) {
        return false
      }

      const key =
        link.id ||
        `${link.source}:${link.target}:${link.label || 'related'}`

      if (seenRelationships.has(key)) {
        return false
      }

      seenRelationships.add(key)
      return true
    })
  })

  const availableTags = computed(() => {
    const tags = new Map()

    nodes.value.forEach((node) => {
      ;(node.tags || []).forEach((tag) => {
        const cleanTag =
          String(tag || '').trim()

        const normalized =
          normalizeTag(cleanTag)

        if (
          !cleanTag ||
          !normalized ||
          tags.has(normalized)
        ) {
          return
        }

        tags.set(
          normalized,
          cleanTag,
        )
      })
    })

    return [...tags.values()].sort(
      (a, b) => {
        return a.localeCompare(b)
      },
    )
  })

  const courses = computed(() => {
    return nodes.value
      .filter((node) => {
        return node.type === 'course'
      })
      .sort((a, b) => {
        return String(
          a.title || '',
        ).localeCompare(
          String(b.title || ''),
        )
      })
  })

  const filteredNodes = computed(() => {
    let visibleNodes = [
      ...nodes.value,
    ]

    if (todayOnly.value) {
      const today =
        getLocalDateKey()

      visibleNodes =
        visibleNodes.filter((node) => {
          return node.date === today
        })
    }

    if (
      selectedType.value !== 'all'
    ) {
      visibleNodes =
        visibleNodes.filter((node) => {
          return (
            node.type ===
            selectedType.value
          )
        })
    }

    visibleNodes =
      visibleNodes.filter((node) => {
        return activeTypes.value.includes(
          node.type,
        )
      })

    if (
      selectedTag.value !== 'all'
    ) {
      const selectedTagValue =
        normalizeTag(
          selectedTag.value,
        )

      visibleNodes =
        visibleNodes.filter((node) => {
          return (
            node.tags || []
          ).some((tag) => {
            return (
              normalizeTag(tag) ===
              selectedTagValue
            )
          })
        })
    }

    if (
      selectedCourse.value !== 'all'
    ) {
      visibleNodes =
        visibleNodes.filter((node) => {
          const courseIds =
            uniqueStrings([
              node.courseId,
              ...(node.courseIds || []),
            ])

          return (
            node.id ===
              selectedCourse.value ||
            courseIds.includes(
              selectedCourse.value,
            )
          )
        })
    }

    const query =
      String(
        searchQuery.value || '',
      ).trim()

    if (query) {
      visibleNodes =
        visibleNodes.filter((node) => {
          return nodeMatchesSearch(
            node,
            query,
          )
        })
    }

    if (
      showConnectedContext.value &&
      visibleNodes.length > 0
    ) {
      const originalVisibleIds =
        new Set(
          visibleNodes.map((node) => {
            return node.id
          }),
        )

      const expandedIds =
        new Set(originalVisibleIds)

      links.value.forEach((link) => {
        if (
          originalVisibleIds.has(
            link.source,
          )
        ) {
          expandedIds.add(
            link.target,
          )
        }

        if (
          originalVisibleIds.has(
            link.target,
          )
        ) {
          expandedIds.add(
            link.source,
          )
        }
      })

      visibleNodes =
        nodes.value.filter((node) => {
          return expandedIds.has(
            node.id,
          )
        })
    }

    return visibleNodes
  })

  const filteredLinks = computed(() => {
    const visibleNodeIds =
      new Set(
        filteredNodes.value.map((node) => {
          return node.id
        }),
      )

    return links.value.filter((link) => {
      return (
        visibleNodeIds.has(
          link.source,
        ) &&
        visibleNodeIds.has(
          link.target,
        )
      )
    })
  })

  const selectedRelationships =
    computed(() => {
      if (!selectedNode.value) {
        return []
      }

      return links.value.filter((link) => {
        return (
          link.source ===
            selectedNode.value.id ||
          link.target ===
            selectedNode.value.id
        )
      })
    })

  const selectedRelatedNodes =
    computed(() => {
      if (!selectedNode.value) {
        return []
      }

      const relatedIds =
        new Set()

      selectedRelationships.value.forEach(
        (link) => {
          relatedIds.add(
            link.source ===
              selectedNode.value.id
              ? link.target
              : link.source,
          )
        },
      )

      return nodes.value.filter((node) => {
        return relatedIds.has(
          node.id,
        )
      })
    })

  const connectedNodes = computed(() => {
    return selectedRelatedNodes.value
  })

  const nodeStats = computed(() => {
    return buildStats(
      nodes.value,
      links.value,
    )
  })

  const visibleStats = computed(() => {
    return buildStats(
      filteredNodes.value,
      filteredLinks.value,
    )
  })

  const visibleRelationshipCount =
    computed(() => {
      return filteredLinks.value.length
    })

  const mostConnectedNode =
    computed(() => {
      const connectionCounts =
        new Map()

      links.value.forEach((link) => {
        connectionCounts.set(
          link.source,
          (
            connectionCounts.get(
              link.source,
            ) || 0
          ) + 1,
        )

        connectionCounts.set(
          link.target,
          (
            connectionCounts.get(
              link.target,
            ) || 0
          ) + 1,
        )
      })

      let winningNode = null
      let winningCount = -1

      nodes.value.forEach((node) => {
        const count =
          connectionCounts.get(
            node.id,
          ) || 0

        if (count > winningCount) {
          winningNode = node
          winningCount = count
        }
      })

      return winningNode
    })

  const orphanNodes = computed(() => {
    const connectedIds = new Set()

    links.value.forEach((link) => {
      connectedIds.add(link.source)
      connectedIds.add(link.target)
    })

    return nodes.value.filter((node) => {
      return !connectedIds.has(node.id)
    })
  })

  watch(
    nodes,
    (currentNodes) => {
      if (!selectedNode.value) {
        return
      }

      const refreshedNode =
        currentNodes.find((node) => {
          return (
            node.id ===
            selectedNode.value.id
          )
        })

      selectedNode.value =
        refreshedNode || null
    },
    {
      deep: true,
    },
  )

  watch(
    filteredNodes,
    (visibleNodes) => {
      if (!selectedNode.value) {
        return
      }

      const selectedIsVisible =
        visibleNodes.some((node) => {
          return (
            node.id ===
            selectedNode.value.id
          )
        })

      if (!selectedIsVisible) {
        selectedNode.value = null
      }
    },
    {
      deep: true,
    },
  )

  function toggleType(type) {
    if (
      activeTypes.value.includes(type)
    ) {
      activeTypes.value =
        activeTypes.value.filter((item) => {
          return item !== type
        })
    } else {
      activeTypes.value = [
        ...activeTypes.value,
        type,
      ]
    }
  }

  function selectNode(node) {
    selectedNode.value =
      node || null
  }

  function revealNode(node) {
    if (!node) {
      return
    }

    searchQuery.value = ''
    selectedType.value = 'all'
    selectedTag.value = 'all'
    selectedCourse.value = 'all'
    todayOnly.value = false

    activeTypes.value = [
      ...graphNodeTypes,
    ]

    selectedNode.value = node
  }

  function clearSelection() {
    selectedNode.value = null
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedType.value = 'all'
    selectedTag.value = 'all'
    selectedCourse.value = 'all'
    graphDensity.value = 5
    todayOnly.value = false
    showConnectedContext.value = false

    activeTypes.value = [
      ...graphNodeTypes,
    ]
  }

  function clearFilters() {
    resetFilters()
  }

  function searchNode(query) {
    searchQuery.value =
      String(query || '')
  }

  function getNodeById(id) {
    return (
      nodes.value.find((node) => {
        return (
          String(node.id) ===
          String(id)
        )
      }) ||
      null
    )
  }

  function getConnectionsForNode(id) {
    return links.value.filter((link) => {
      return (
        String(link.source) ===
          String(id) ||
        String(link.target) ===
          String(id)
      )
    })
  }

  return {
    graphNodeTypes,

    nodes,
    links,
    discoveryItems,

    searchQuery,
    selectedType,
    selectedTag,
    selectedCourse,
    graphDensity,
    todayOnly,
    showConnectedContext,
    graphViewMode,
    focusMode,
    selectedNode,

    activeTypes,

    availableTags,
    courses,
    filteredNodes,
    filteredLinks,
    selectedRelationships,
    selectedRelatedNodes,
    connectedNodes,

    nodeStats,
    visibleStats,
    visibleRelationshipCount,
    mostConnectedNode,
    orphanNodes,

    toggleType,
    selectNode,
    revealNode,
    clearSelection,
    resetFilters,
    clearFilters,
    searchNode,
    getNodeById,
    getConnectionsForNode,
  }
}

function buildStats(
  nodes,
  links,
) {
  const countsByType = {}

  SUPPORTED_GRAPH_NODE_TYPES.forEach((type) => {
    countsByType[type] =
      nodes.filter((node) => {
        return node.type === type
      }).length
  })

  return {
    nodeCount:
      nodes.length,

    relationshipCount:
      links.length,

    totalNodes:
      nodes.length,

    totalConnections:
      links.length,

    countsByType,
  }
}
