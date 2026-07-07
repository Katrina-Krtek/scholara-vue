const RELATIONSHIP_STORAGE_KEY = 'scholarory_source_relationships'

const SOURCE_STORAGE_KEYS = [
  { key: 'scholarory_sources', type: 'Source' },
  { key: 'sources', type: 'Source' },
  { key: 'scholarory_books', type: 'Book' },
  { key: 'books', type: 'Book' },
  { key: 'scholarory_articles', type: 'Article' },
  { key: 'articles', type: 'Article' },
  { key: 'scholarory_journals', type: 'Journal' },
  { key: 'journals', type: 'Journal' },
  { key: 'scholarory_websites', type: 'Website' },
  { key: 'websites', type: 'Website' },
  { key: 'scholarory_dissertations', type: 'Dissertation' },
  { key: 'dissertations', type: 'Dissertation' },
]

export const RELATIONSHIP_TYPES = [
  {
    value: 'published_in',
    label: 'published in',
    reverseLabel: 'publishes',
    description: 'Best for connecting an article to its journal.',
  },
  {
    value: 'contains',
    label: 'contains',
    reverseLabel: 'is contained in',
    description: 'Best for journals, collections, edited volumes, or grouped sources.',
  },
  {
    value: 'cites',
    label: 'cites',
    reverseLabel: 'is cited by',
    description: 'Use when one source directly references another source.',
  },
  {
    value: 'supports',
    label: 'supports',
    reverseLabel: 'is supported by',
    description: 'Use when one source strengthens the argument of another.',
  },
  {
    value: 'disagrees_with',
    label: 'disagrees with',
    reverseLabel: 'is challenged by',
    description: 'Use when two sources have a meaningful tension or disagreement.',
  },
  {
    value: 'same_theme',
    label: 'shares theme with',
    reverseLabel: 'shares theme with',
    description: 'Use when sources are connected by topic, theme, or concept.',
  },
  {
    value: 'methodology_from',
    label: 'uses methodology from',
    reverseLabel: 'influences methodology of',
    description: 'Use when a source shapes research method, assessment, or design.',
  },
  {
    value: 'primary_for',
    label: 'is primary source for',
    reverseLabel: 'uses as primary source',
    description: 'Use for key texts that anchor an assignment, paper, or project.',
  },
  {
    value: 'background_for',
    label: 'provides background for',
    reverseLabel: 'uses as background',
    description: 'Use for context-building sources.',
  },
]

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`Scholarory could not read ${key} from localStorage`, error)
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Scholarory could not save ${key} to localStorage`, error)
  }
}

function firstValue(values, fallback = '') {
  const found = values.find((value) => {
    if (value === null || value === undefined) return false
    return String(value).trim().length > 0
  })

  return found === undefined ? fallback : found
}

function toRecordArray(value) {
  if (Array.isArray(value)) return value

  if (value && typeof value === 'object') {
    const knownArrayKeys = [
      'items',
      'sources',
      'books',
      'articles',
      'journals',
      'websites',
      'dissertations',
      'records',
      'data',
    ]

    for (const key of knownArrayKeys) {
      if (Array.isArray(value[key])) return value[key]
    }

    return Object.values(value).filter((item) => item && typeof item === 'object')
  }

  return []
}

function stableId(item, index, storageKey) {
  return String(
    firstValue(
      [
        item.id,
        item.sourceId,
        item.bookId,
        item.articleId,
        item.journalId,
        item.websiteId,
        item.dissertationId,
        item.slug,
      ],
      `${storageKey}-${index + 1}`,
    ),
  )
}

function normalizeSource(item, index, sourceConfig) {
  const sourceType = firstValue(
    [
      item.sourceType,
      item.type,
      item.category,
      item.kind,
      sourceConfig.type,
    ],
    'Source',
  )

  const title = firstValue(
    [
      item.title,
      item.name,
      item.sourceTitle,
      item.bookTitle,
      item.articleTitle,
      item.journalTitle,
      item.websiteTitle,
      item.dissertationTitle,
      item.workTitle,
    ],
    `${sourceType} ${index + 1}`,
  )

  const author = firstValue(
    [
      item.author,
      item.authors,
      item.primaryAuthor,
      item.creator,
      item.writer,
      item.editor,
    ],
    '',
  )

  const year = firstValue(
    [
      item.year,
      item.publicationYear,
      item.publishedYear,
      item.date,
      item.publishedDate,
    ],
    '',
  )

  const id = stableId(item, index, sourceConfig.key)

  return {
    uid: `${sourceConfig.key}:${id}`,
    id,
    storageKey: sourceConfig.key,
    sourceType,
    title: String(title),
    author: Array.isArray(author) ? author.join(', ') : String(author || ''),
    year: String(year || ''),
    raw: item,
  }
}

export function getAllSources() {
  const allSources = []

  SOURCE_STORAGE_KEYS.forEach((sourceConfig) => {
    const storedValue = readJson(sourceConfig.key, [])
    const records = toRecordArray(storedValue)

    records.forEach((item, index) => {
      if (item && typeof item === 'object') {
        allSources.push(normalizeSource(item, index, sourceConfig))
      }
    })
  })

  const seen = new Set()

  return allSources.filter((source) => {
    if (seen.has(source.uid)) return false
    seen.add(source.uid)
    return true
  })
}

export function readSourceRelationships() {
  const relationships = readJson(RELATIONSHIP_STORAGE_KEY, [])
  return Array.isArray(relationships) ? relationships : []
}

export function saveSourceRelationships(relationships) {
  writeJson(RELATIONSHIP_STORAGE_KEY, relationships)
}

export function relationshipTypeLabel(typeValue, reverse = false) {
  const relationshipType = RELATIONSHIP_TYPES.find((type) => type.value === typeValue)

  if (!relationshipType) return typeValue

  return reverse ? relationshipType.reverseLabel : relationshipType.label
}

export function relationshipExists(relationships, fromUid, relationshipType, toUid) {
  return relationships.some((relationship) => {
    return (
      relationship.fromUid === fromUid &&
      relationship.relationshipType === relationshipType &&
      relationship.toUid === toUid
    )
  })
}

export function createSourceRelationship(input, currentRelationships = readSourceRelationships()) {
  const fromUid = String(input.fromUid || '').trim()
  const toUid = String(input.toUid || '').trim()
  const relationshipType = String(input.relationshipType || '').trim()

  if (!fromUid || !toUid || !relationshipType) {
    return {
      error: 'Choose two sources and a relationship type.',
      relationships: currentRelationships,
    }
  }

  if (fromUid === toUid) {
    return {
      error: 'A source cannot be related to itself.',
      relationships: currentRelationships,
    }
  }

  if (relationshipExists(currentRelationships, fromUid, relationshipType, toUid)) {
    return {
      error: 'That relationship already exists.',
      relationships: currentRelationships,
    }
  }

  const relationship = {
    id: crypto.randomUUID ? crypto.randomUUID() : `relationship-${Date.now()}`,
    fromUid,
    toUid,
    relationshipType,
    note: String(input.note || '').trim(),
    tags: String(input.tags || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const nextRelationships = [relationship, ...currentRelationships]
  saveSourceRelationships(nextRelationships)

  return {
    relationship,
    relationships: nextRelationships,
  }
}

export function deleteSourceRelationship(relationshipId, currentRelationships = readSourceRelationships()) {
  const nextRelationships = currentRelationships.filter(
    (relationship) => relationship.id !== relationshipId,
  )

  saveSourceRelationships(nextRelationships)

  return nextRelationships
}

function cleanText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function sourceMatchesJournal(article, journal) {
  const articleRaw = article.raw || {}
  const journalRaw = journal.raw || {}

  const articleJournalId = cleanText(
    firstValue([
      articleRaw.journalId,
      articleRaw.parentJournalId,
      articleRaw.publicationId,
    ]),
  )

  const journalId = cleanText(
    firstValue([
      journal.id,
      journalRaw.id,
      journalRaw.journalId,
      journalRaw.sourceId,
    ]),
  )

  if (articleJournalId && journalId && articleJournalId === journalId) {
    return true
  }

  const articleJournalTitle = cleanText(
    firstValue([
      articleRaw.journalTitle,
      articleRaw.journal,
      articleRaw.publication,
      articleRaw.publicationTitle,
      articleRaw.containerTitle,
    ]),
  )

  const journalTitle = cleanText(journal.title)

  return articleJournalTitle && journalTitle && articleJournalTitle === journalTitle
}

export function buildSourceRelationshipSuggestions(sources, relationships) {
  const articles = sources.filter((source) => cleanText(source.sourceType) === 'article')
  const journals = sources.filter((source) => cleanText(source.sourceType) === 'journal')

  const suggestions = []

  articles.forEach((article) => {
    const matchedJournal = journals.find((journal) => sourceMatchesJournal(article, journal))

    if (!matchedJournal) return

    const alreadyLinked = relationshipExists(
      relationships,
      article.uid,
      'published_in',
      matchedJournal.uid,
    )

    if (alreadyLinked) return

    suggestions.push({
      id: `${article.uid}-published-in-${matchedJournal.uid}`,
      fromUid: article.uid,
      toUid: matchedJournal.uid,
      relationshipType: 'published_in',
      note: 'Suggested because this article appears to reference this journal as its publication container.',
    })
  })

  return suggestions.slice(0, 12)
}