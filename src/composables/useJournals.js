import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory-journals'

const articleDefaults = {
  sourceId: null,
  title: 'Untitled Article',
  subtitle: '',
  author: '',
  year: '',
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  url: '',
  abstract: '',
  sectionNotes: '',
  keyQuotes: '',
  useForWriting: '',
  tags: [],
  status: 'planned',
  priority: '',
  relatedCourseIds: [],
  relatedAssignmentIds: [],
  createdAt: '',
  updatedAt: '',
}

const journalDefaults = {
  sourceId: null,
  name: 'Untitled Journal',
  subtitle: '',
  publisher: '',
  issn: '',
  website: '',
  field: '',
  peerReviewed: false,
  favorite: false,
  notes: '',
  tags: [],
  status: '',
  priority: '',
  relatedCourseIds: [],
  relatedAssignmentIds: [],
  articles: [],
  createdAt: '',
  updatedAt: '',
}

const starterJournals = [
  {
    id: 'journal-1',
    sourceId: null,
    name: 'Spiritus',
    subtitle: 'ORU Journal of Theology',
    publisher: 'Oral Roberts University',
    issn: '',
    website: '',
    field: 'Theology',
    peerReviewed: true,
    favorite: true,
    notes: '',
    tags: ['theology', 'spiritual formation'],
    status: '',
    priority: '',
    relatedCourseIds: [],
    relatedAssignmentIds: [],
    createdAt: '2026-06-13',
    updatedAt: '2026-06-13',
    articles: [
      {
        id: 'article-1',
        sourceId: null,
        title: 'Sample Article',
        subtitle: '',
        author: '',
        year: '',
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        url: '',
        abstract: '',
        sectionNotes: '',
        keyQuotes: '',
        useForWriting: '',
        tags: [],
        status: 'planned',
        priority: '',
        relatedCourseIds: [],
        relatedAssignmentIds: [],
        createdAt: '2026-06-13',
        updatedAt: '2026-06-13',
      },
    ],
  },
  {
    id: 'journal-2',
    sourceId: null,
    name: 'Christian Education Journal',
    subtitle: '',
    publisher: '',
    issn: '',
    website: '',
    field: 'Christian Education',
    peerReviewed: true,
    favorite: false,
    notes: '',
    tags: ['christian education', 'discipleship'],
    status: '',
    priority: '',
    relatedCourseIds: [],
    relatedAssignmentIds: [],
    createdAt: '2026-06-13',
    updatedAt: '2026-06-13',
    articles: [],
  },
]

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function copyArray(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback

  return source.map((item) => {
    if (item && typeof item === 'object') {
      return { ...item }
    }

    return item
  })
}

function chooseArray(record, starterRecord, field, fallback = []) {
  if (Object.prototype.hasOwnProperty.call(record, field)) {
    return copyArray(record[field], fallback)
  }

  if (
    starterRecord &&
    Object.prototype.hasOwnProperty.call(starterRecord, field)
  ) {
    return copyArray(starterRecord[field], fallback)
  }

  return copyArray(fallback)
}

function findMatchingStarterJournal(journal = {}) {
  const idMatch = starterJournals.find(
    (starterJournal) =>
      String(starterJournal.id) === String(journal.id),
  )

  if (idMatch) {
    return idMatch
  }

  const normalizedName = normalizeText(journal.name)

  if (!normalizedName) {
    return null
  }

  return (
    starterJournals.find(
      (starterJournal) =>
        normalizeText(starterJournal.name) === normalizedName,
    ) || null
  )
}

function findMatchingStarterArticle(article = {}, starterJournal = null) {
  if (!starterJournal) {
    return null
  }

  const starterArticles = starterJournal.articles || []

  const idMatch = starterArticles.find(
    (starterArticle) =>
      String(starterArticle.id) === String(article.id),
  )

  if (idMatch) {
    return idMatch
  }

  const normalizedTitle = normalizeText(article.title)
  const normalizedAuthor = normalizeText(article.author)

  if (!normalizedTitle) {
    return null
  }

  return (
    starterArticles.find((starterArticle) => {
      const sameTitle =
        normalizeText(starterArticle.title) === normalizedTitle

      const starterAuthor = normalizeText(starterArticle.author)
      const sameAuthor =
        !normalizedAuthor ||
        !starterAuthor ||
        starterAuthor === normalizedAuthor

      return sameTitle && sameAuthor
    }) || null
  )
}

function normalizeArticle(
  article = {},
  starterArticle = null,
  options = {},
) {
  const { useStarterFallback = true } = options

  const fallbackArticle = useStarterFallback
    ? starterArticle
    : null

  const normalized = {
    ...articleDefaults,
    ...(fallbackArticle || {}),
    ...article,
  }

  const now = new Date().toISOString()

  return {
    ...normalized,
    id: normalized.id || `article-${Date.now()}`,
    sourceId:
      normalized.sourceId === undefined
        ? fallbackArticle?.sourceId ?? null
        : normalized.sourceId,
    title: normalized.title || 'Untitled Article',
    subtitle: normalized.subtitle || '',
    author: normalized.author || '',
    year: normalized.year || '',
    volume: normalized.volume || '',
    issue: normalized.issue || '',
    pages: normalized.pages || '',
    doi: normalized.doi || '',
    url: normalized.url || '',
    abstract: normalized.abstract || '',
    sectionNotes: normalized.sectionNotes || '',
    keyQuotes: normalized.keyQuotes || '',
    useForWriting: normalized.useForWriting || '',
    status: normalized.status || 'planned',
    priority: normalized.priority || '',
    tags: chooseArray(
      article,
      fallbackArticle,
      'tags',
      articleDefaults.tags,
    )
      .map((tag) => String(tag || '').trim())
      .filter(Boolean),
    relatedCourseIds: chooseArray(
      article,
      fallbackArticle,
      'relatedCourseIds',
      articleDefaults.relatedCourseIds,
    ).map((id) => String(id)),
    relatedAssignmentIds: chooseArray(
      article,
      fallbackArticle,
      'relatedAssignmentIds',
      articleDefaults.relatedAssignmentIds,
    ).map((id) => String(id)),
    createdAt: normalized.createdAt || now,
    updatedAt:
      normalized.updatedAt ||
      normalized.createdAt ||
      now,
  }
}

function normalizeJournal(journal = {}, options = {}) {
  const { useStarterFallback = true } = options

  const starterJournal = useStarterFallback
    ? findMatchingStarterJournal(journal)
    : null

  const normalized = {
    ...journalDefaults,
    ...(starterJournal || {}),
    ...journal,
  }

  const now = new Date().toISOString()

  const rawArticles = chooseArray(
    journal,
    starterJournal,
    'articles',
    journalDefaults.articles,
  )

  return {
    ...normalized,
    id: normalized.id || `journal-${Date.now()}`,
    sourceId:
      normalized.sourceId === undefined
        ? starterJournal?.sourceId ?? null
        : normalized.sourceId,
    name: normalized.name || 'Untitled Journal',
    subtitle: normalized.subtitle || '',
    publisher: normalized.publisher || '',
    issn: normalized.issn || '',
    website: normalized.website || '',
    field: normalized.field || '',
    peerReviewed: normalized.peerReviewed ?? false,
    favorite: normalized.favorite ?? false,
    notes: normalized.notes || '',
    status: normalized.status || '',
    priority: normalized.priority || '',
    tags: chooseArray(
      journal,
      starterJournal,
      'tags',
      journalDefaults.tags,
    )
      .map((tag) => String(tag || '').trim())
      .filter(Boolean),
    relatedCourseIds: chooseArray(
      journal,
      starterJournal,
      'relatedCourseIds',
      journalDefaults.relatedCourseIds,
    ).map((id) => String(id)),
    relatedAssignmentIds: chooseArray(
      journal,
      starterJournal,
      'relatedAssignmentIds',
      journalDefaults.relatedAssignmentIds,
    ).map((id) => String(id)),
    articles: rawArticles.map((article) => {
      const starterArticle = findMatchingStarterArticle(
        article,
        starterJournal,
      )

      return normalizeArticle(
        article,
        starterArticle,
        { useStarterFallback },
      )
    }),
    createdAt: normalized.createdAt || now,
    updatedAt:
      normalized.updatedAt ||
      normalized.createdAt ||
      now,
  }
}

function loadJournals() {
  try {
    const savedJournals = localStorage.getItem(STORAGE_KEY)

    if (!savedJournals) {
      return starterJournals.map((journal) =>
        normalizeJournal(journal),
      )
    }

    const parsedJournals = JSON.parse(savedJournals)

    if (!Array.isArray(parsedJournals)) {
      return starterJournals.map((journal) =>
        normalizeJournal(journal),
      )
    }

    return parsedJournals.map((journal) =>
      normalizeJournal(journal),
    )
  } catch (error) {
    console.error('Failed to load journals:', error)

    return starterJournals.map((journal) =>
      normalizeJournal(journal),
    )
  }
}

const journals = ref(loadJournals())

// Save normalized records immediately so older localStorage records
// receive fields added after they were originally created.
localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify(journals.value),
)

watch(
  journals,
  (newJournals) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newJournals),
    )
  },
  { deep: true },
)

export function useJournals() {
  const allJournals = computed(() => journals.value)

  const favoriteJournals = computed(() =>
    journals.value.filter((journal) => journal.favorite),
  )

  const allArticles = computed(() =>
    journals.value.flatMap((journal) =>
      (journal.articles || []).map((article) => ({
        ...article,
        journalId: journal.id,
        journalName: journal.name,
      })),
    ),
  )

  function getJournalById(id) {
    return journals.value.find(
      (journal) => String(journal.id) === String(id),
    )
  }

  function getArticleById(articleId) {
    for (const journal of journals.value) {
      const article = journal.articles?.find(
        (item) =>
          String(item.id) === String(articleId),
      )

      if (article) {
        return {
          ...article,
          journalId: journal.id,
          journalName: journal.name,
        }
      }
    }

    return null
  }

  function addJournal(journal = {}) {
    const now = new Date().toISOString()

    const newJournal = normalizeJournal(
      {
        id: `journal-${Date.now()}`,
        sourceId: journal.sourceId ?? null,
        name: journal.name || 'Untitled Journal',
        subtitle: journal.subtitle || '',
        publisher: journal.publisher || '',
        issn: journal.issn || '',
        website: journal.website || '',
        field: journal.field || '',
        peerReviewed: journal.peerReviewed ?? false,
        favorite: journal.favorite ?? false,
        notes: journal.notes || '',
        tags: journal.tags || [],
        status: journal.status || '',
        priority: journal.priority || '',
        relatedCourseIds:
          journal.relatedCourseIds || [],
        relatedAssignmentIds:
          journal.relatedAssignmentIds || [],
        articles: journal.articles || [],
        createdAt: journal.createdAt || now,
        updatedAt: now,
      },
      { useStarterFallback: false },
    )

    journals.value.unshift(newJournal)

    return newJournal
  }

  function updateJournal(id, updates) {
    const index = journals.value.findIndex(
      (journal) => String(journal.id) === String(id),
    )

    if (index === -1) {
      return null
    }

    journals.value[index] = normalizeJournal(
      {
        ...journals.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { useStarterFallback: false },
    )

    return journals.value[index]
  }

  function deleteJournal(id) {
    journals.value = journals.value.filter(
      (journal) => String(journal.id) !== String(id),
    )
  }

  function addArticle(journalId, article = {}) {
    const journal = getJournalById(journalId)

    if (!journal) {
      return null
    }

    journal.articles ??= []

    const now = new Date().toISOString()

    const newArticle = normalizeArticle(
      {
        id: `article-${Date.now()}`,
        sourceId: article.sourceId ?? null,
        title: article.title || 'Untitled Article',
        subtitle: article.subtitle || '',
        author: article.author || '',
        year: article.year || '',
        volume: article.volume || '',
        issue: article.issue || '',
        pages: article.pages || '',
        doi: article.doi || '',
        url: article.url || '',
        abstract: article.abstract || '',
        sectionNotes: article.sectionNotes || '',
        keyQuotes: article.keyQuotes || '',
        useForWriting: article.useForWriting || '',
        tags: article.tags || [],
        status: article.status || 'planned',
        priority: article.priority || '',
        relatedCourseIds:
          article.relatedCourseIds || [],
        relatedAssignmentIds:
          article.relatedAssignmentIds || [],
        createdAt: article.createdAt || now,
        updatedAt: now,
      },
      null,
      { useStarterFallback: false },
    )

    journal.articles.push(newArticle)
    journal.updatedAt = now

    return newArticle
  }

  function updateArticle(journalId, articleId, updates) {
    const journal = getJournalById(journalId)

    if (!journal) {
      return null
    }

    const index = journal.articles.findIndex(
      (article) =>
        String(article.id) === String(articleId),
    )

    if (index === -1) {
      return null
    }

    journal.articles[index] = normalizeArticle(
      {
        ...journal.articles[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      null,
      { useStarterFallback: false },
    )

    journal.updatedAt = new Date().toISOString()

    return journal.articles[index]
  }

  function deleteArticle(journalId, articleId) {
    const journal = getJournalById(journalId)

    if (!journal) {
      return
    }

    journal.articles = journal.articles.filter(
      (article) =>
        String(article.id) !== String(articleId),
    )

    journal.updatedAt = new Date().toISOString()
  }

  return {
    allJournals,
    favoriteJournals,
    allArticles,
    getJournalById,
    getArticleById,
    addJournal,
    updateJournal,
    deleteJournal,
    addArticle,
    updateArticle,
    deleteArticle,
  }
}

