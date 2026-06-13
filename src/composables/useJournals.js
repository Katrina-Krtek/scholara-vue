import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory-journals'

const starterJournals = [
  {
    id: 'journal-1',
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
    articles: [
      {
        id: 'article-1',
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
      },
    ],
  },
  {
    id: 'journal-2',
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
    articles: [],
  },
]

const savedJournals = localStorage.getItem(STORAGE_KEY)

const journals = ref(
  savedJournals ? JSON.parse(savedJournals) : starterJournals,
)

watch(
  journals,
  (newJournals) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newJournals))
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
    return journals.value.find((journal) => journal.id === id)
  }

  function getArticleById(articleId) {
    for (const journal of journals.value) {
      const article = journal.articles?.find((item) => item.id === articleId)

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
    const newJournal = {
      id: `journal-${Date.now()}`,
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
      articles: journal.articles || [],
    }

    journals.value.unshift(newJournal)
    return newJournal
  }

  function updateJournal(id, updates) {
    const index = journals.value.findIndex((journal) => journal.id === id)
    if (index === -1) return null

    journals.value[index] = {
      ...journals.value[index],
      ...updates,
    }

    return journals.value[index]
  }

  function deleteJournal(id) {
    journals.value = journals.value.filter((journal) => journal.id !== id)
  }

  function addArticle(journalId, article = {}) {
    const journal = getJournalById(journalId)
    if (!journal) return null

    journal.articles ??= []

    const newArticle = {
      id: `article-${Date.now()}`,
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
    }

    journal.articles.push(newArticle)
    return newArticle
  }

  function updateArticle(journalId, articleId, updates) {
    const journal = getJournalById(journalId)
    if (!journal) return null

    const index = journal.articles.findIndex(
      (article) => article.id === articleId,
    )

    if (index === -1) return null

    journal.articles[index] = {
      ...journal.articles[index],
      ...updates,
    }

    return journal.articles[index]
  }

  function deleteArticle(journalId, articleId) {
    const journal = getJournalById(journalId)
    if (!journal) return

    journal.articles = journal.articles.filter(
      (article) => article.id !== articleId,
    )
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