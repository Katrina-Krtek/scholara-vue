<template>
  <AppLayout
    :title="article.title || 'Article Detail'"
    subtitle="Article metadata, notes, journal connection, and citation drafts."
    banner-key="article-detail"
    default-icon="📰"
  >
    <section v-if="notFound" class="empty-card">
      <h2>Article not found</h2>
      <p>
        Scholarory could not find this article in the research database or article storage.
      </p>

      <div class="empty-actions">
        <RouterLink to="/articles" class="primary-button">Go to Articles</RouterLink>
        <RouterLink to="/research/type/article" class="ghost-button dark">
          Go to Research Articles
        </RouterLink>
      </div>
    </section>

    <section v-else class="article-detail-page">
      <div class="page-header">
        <div>
          <p class="eyebrow">Research Hub / Articles</p>
          <h1>{{ article.title || 'Untitled Article' }}</h1>
          <p class="subtitle">
            {{ article.authors || 'No author listed' }}
            <span v-if="article.year"> · {{ article.year }}</span>
          </p>
        </div>

        <div class="header-actions">
          <RouterLink to="/articles" class="ghost-button">← Articles Hub</RouterLink>
          <RouterLink to="/research/type/article" class="ghost-button">
            Research Articles
          </RouterLink>
          <button class="primary-button" type="button" @click="saveArticle">
            Save Article
          </button>
        </div>
      </div>

      <div class="detail-grid">
        <section class="panel main-panel">
          <div class="section-heading">
            <h2>Article Information</h2>
            <p>Core bibliographic details for citation and research tracking.</p>
          </div>

          <div class="form-grid">
            <label>
              Article Title
              <input v-model="article.title" type="text" placeholder="Article title" />
            </label>

            <label>
              Author(s)
              <input v-model="article.authors" type="text" placeholder="First Last; First Last" />
            </label>

            <label>
              Journal
              <input v-model="article.journalTitle" type="text" placeholder="Journal title" />
            </label>

            <label>
              Year
              <input v-model="article.year" type="text" placeholder="2026" />
            </label>

            <label>
              Volume
              <input v-model="article.volume" type="text" placeholder="12" />
            </label>

            <label>
              Issue
              <input v-model="article.issue" type="text" placeholder="2" />
            </label>

            <label>
              Page Range
              <input v-model="article.pages" type="text" placeholder="45–67" />
            </label>

            <label>
              DOI
              <input v-model="article.doi" type="text" placeholder="10.xxxx/xxxxx" />
            </label>

            <label class="full-width">
              URL
              <input v-model="article.url" type="text" placeholder="https://..." />
            </label>

            <label>
              Database / Source
              <input v-model="article.database" type="text" placeholder="ATLA, JSTOR, EBSCO, etc." />
            </label>

            <label>
              Status
              <select v-model="article.status">
                <option value="inbox">Inbox</option>
                <option value="planned">Planned</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="cited">Cited</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
        </section>

        <aside class="panel side-panel">
          <div class="section-heading">
            <h2>Journal Connection</h2>
            <p>Connect this article to a real journal record.</p>
          </div>

          <label>
            Parent Journal
            <select v-model="article.journalId" @change="handleJournalChange">
              <option value="">No linked journal</option>
              <option
                v-for="journal in availableJournals"
                :key="journal.id"
                :value="journal.id"
              >
                {{ journal.title || journal.name }}
              </option>
            </select>
          </label>

          <div v-if="!availableJournals.length" class="helper-note">
            No journal records found yet. Create a journal first, then return here to connect it.
          </div>

          <div v-if="linkedJournal" class="linked-card">
            <p class="label">Connected Journal</p>
            <h3>{{ linkedJournal.title || linkedJournal.name }}</h3>
            <RouterLink :to="`/journals/${linkedJournal.id}`" class="mini-link">
              Open Journal →
            </RouterLink>
          </div>

          <div v-else class="linked-card muted">
            <p class="label">No journal record linked</p>
            <p>
              This article still works independently. Select a parent journal above to connect it.
            </p>
          </div>

          <div class="quick-meta">
            <div>
              <span>Type</span>
              <strong>Journal Article</strong>
            </div>

            <div>
              <span>Storage</span>
              <strong>{{ sourceLabel }}</strong>
            </div>

            <div>
              <span>Journal Records</span>
              <strong>{{ availableJournals.length }}</strong>
            </div>

            <div>
              <span>Updated</span>
              <strong>{{ article.updatedAt || 'Not saved yet' }}</strong>
            </div>

            <div>
              <span>Tags</span>
              <strong>{{ tagList.length }}</strong>
            </div>
          </div>
        </aside>

        <section class="panel main-panel">
          <div class="section-heading">
            <h2>Article Notes Template</h2>
            <p>Designed for journal articles, essays, and academic research.</p>
          </div>

          <label>
            Abstract / Summary
            <textarea
              v-model="article.abstract"
              rows="5"
              placeholder="Briefly summarize the article’s purpose, scope, and major claims."
            ></textarea>
          </label>

          <label>
            Thesis / Main Argument
            <textarea
              v-model="article.thesis"
              rows="4"
              placeholder="What is the article arguing?"
            ></textarea>
          </label>

          <label>
            Methodology / Approach
            <textarea
              v-model="article.methodology"
              rows="4"
              placeholder="Historical, theological, qualitative, exegetical, literature review, etc."
            ></textarea>
          </label>

          <label>
            Key Sections / Outline
            <textarea
              v-model="article.sections"
              rows="6"
              placeholder="List the article’s major sections or logical movements."
            ></textarea>
          </label>

          <label>
            Important Quotes
            <textarea
              v-model="article.quotes"
              rows="6"
              placeholder="Paste key quotes with page numbers."
            ></textarea>
          </label>

          <label>
            Research Usefulness
            <textarea
              v-model="article.researchUsefulness"
              rows="5"
              placeholder="How could this article support a paper, project, sermon, lecture, or literature review?"
            ></textarea>
          </label>
        </section>

        <aside class="panel side-panel">
          <div class="section-heading">
            <h2>Tags & Links</h2>
            <p>Connect this article to your academic workflow.</p>
          </div>

          <label>
            Tags
            <input
              v-model="article.tags"
              type="text"
              placeholder="spiritual formation, discipleship, small groups"
            />
          </label>

          <div v-if="tagList.length" class="tag-row">
            <span v-for="tag in tagList" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>

          <label>
            Linked Course
            <input v-model="article.linkedCourse" type="text" placeholder="DMIN 851" />
          </label>

          <label>
            Linked Assignment
            <input v-model="article.linkedAssignment" type="text" placeholder="Micro-Project Paper" />
          </label>

          <label>
            Personal Rating
            <select v-model="article.rating">
              <option value="">Not rated</option>
              <option value="5">★★★★★ Essential</option>
              <option value="4">★★★★ Very useful</option>
              <option value="3">★★★ Useful</option>
              <option value="2">★★ Limited use</option>
              <option value="1">★ Not useful</option>
            </select>
          </label>
        </aside>

        <section class="panel citation-panel">
          <div class="section-heading">
            <h2>Citation Drafts</h2>
            <p>
              These are starter citations. Later we can connect this to the full Scholarory citation engine.
            </p>
          </div>

          <div class="citation-tabs">
            <button
  v-for="style in citationStyles"
  :key="style.value"
  type="button"
  :class="{ active: selectedCitationStyle === style.value }"
  @click="selectedCitationStyle = style.value"
>
  {{ style.label }}
</button>
          </div>

          <div class="citation-box">
            <p>{{ activeCitation }}</p>
          </div>

          <button class="ghost-button dark" type="button" @click="copyCitation">
            Copy Citation
          </button>
        </section>
      </div>

      <div v-if="saveMessage" class="save-toast">
        {{ saveMessage }}
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useResearch } from '@/composables/useResearch'
import { useJournals } from '@/composables/useJournals'
import {generateCitationSet } from '@/utils/citations'

const route = useRoute()

const {
  allResearchItems,
  loadResearchItems,
  updateResearchItem,
} = useResearch()

const {
  allJournals: journalHubJournals,
  getArticleById,
  updateArticle,
  updateJournal,
} = useJournals()

const standaloneArticleStorageKeys = [
  'scholarory_articles',
  'articles',
  'articleItems',
]

const standaloneJournalStorageKeys = [
  'scholarory-journals',
  'scholarory_journals',
  'journals',
  'journalItems',
]

const article = ref(createBlankArticle())
const notFound = ref(false)
const saveMessage = ref('')
const selectedCitationStyle = ref('turabianBibliography')
const sourceMode = ref('')
const sourceStorageKey = ref('')
const originalResearchItem = ref(null)
const originalJournalId = ref('')

const citationStyles = [
  { label: 'Turabian Bibliography', value: 'turabianBibliography' },
  { label: 'Turabian Footnote', value: 'turabianFootnote' },
  { label: 'Turabian Short Note', value: 'turabianShortNote' },
  { label: 'APA', value: 'apa' },
  { label: 'MLA', value: 'mla' },
  { label: 'Chicago Bibliography', value: 'chicagoBibliography' },
  { label: 'Chicago Footnote', value: 'chicagoFootnote' },
  { label: 'Chicago Short Note', value: 'chicagoShortNote' },
]

function createBlankArticle() {
  return {
    id: '',
    title: '',
    authors: '',
    journalId: '',
    journalTitle: '',
    year: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: '',
    database: '',
    status: 'inbox',
    abstract: '',
    thesis: '',
    methodology: '',
    sections: '',
    quotes: '',
    researchUsefulness: '',
    tags: '',
    linkedCourse: '',
    linkedAssignment: '',
    rating: '',
    createdAt: '',
    updatedAt: '',
  }
}

async function loadData() {
  await loadResearchItems()

  const articleId = String(route.params.id)

  const foundResearchItem = allResearchItems.value.find((item) => {
    return String(item.id) === articleId && item.type === 'article'
  })

  if (foundResearchItem) {
    originalResearchItem.value = foundResearchItem
    article.value = normalizeResearchArticle(foundResearchItem)
    sourceMode.value = 'research'
    sourceStorageKey.value = ''
    originalJournalId.value = article.value.journalId
    notFound.value = false
    return
  }

  const foundJournalHubArticle = getArticleById(articleId)

  if (foundJournalHubArticle) {
    article.value = normalizeJournalHubArticle(foundJournalHubArticle)
    sourceMode.value = 'journalHub'
    sourceStorageKey.value = 'scholarory-journals'
    originalJournalId.value = article.value.journalId
    notFound.value = false
    return
  }

  const foundStandaloneArticle = findStandaloneArticle(articleId)

  if (foundStandaloneArticle) {
    article.value = normalizeStandaloneArticle(foundStandaloneArticle.item)
    sourceMode.value = 'standalone'
    sourceStorageKey.value = foundStandaloneArticle.key
    originalJournalId.value = article.value.journalId
    notFound.value = false
    return
  }

  const foundScannedArticle = scanLocalStorageForArticle(articleId)

  if (foundScannedArticle) {
    article.value = normalizeStandaloneArticle(foundScannedArticle.item)
    sourceMode.value = 'localStorage'
    sourceStorageKey.value = foundScannedArticle.key
    originalJournalId.value = article.value.journalId
    notFound.value = false
    return
  }

  notFound.value = true
}

function normalizeResearchArticle(item) {
  const metadata = item.metadata || {}

  return {
    ...createBlankArticle(),
    id: String(item.id),
    title: item.title || '',
    authors: formatAuthorsFromMetadata(metadata),
    journalId: metadata.journalId || metadata.journal_id || '',
    journalTitle:
      metadata.journalTitle ||
      metadata.journalName ||
      metadata.journal ||
      metadata.publication ||
      '',
    year: metadata.year || metadata.date || '',
    volume: metadata.volume || '',
    issue: metadata.issue || '',
    pages: metadata.pages || metadata.pageRange || '',
    doi: metadata.doi || '',
    url: metadata.url || metadata.link || '',
    database: metadata.database || metadata.sourceDatabase || '',
    status: metadata.status || 'inbox',
    abstract: metadata.abstract || item.summary || '',
    thesis: metadata.thesis || metadata.argument || '',
    methodology: metadata.methodology || metadata.method || '',
    sections: metadata.sections || metadata.sectionNotes || '',
    quotes: metadata.quotes || metadata.keyQuotes || '',
    researchUsefulness: metadata.researchUsefulness || metadata.useForWriting || '',
    tags: Array.isArray(item.topicTags) ? item.topicTags.join(', ') : '',
    linkedCourse: metadata.linkedCourse || '',
    linkedAssignment: metadata.linkedAssignment || '',
    rating: metadata.rating || '',
    createdAt: item.createdAt || '',
    updatedAt: metadata.updatedAt || item.updatedAt || '',
  }
}

function normalizeJournalHubArticle(item) {
  return {
    ...createBlankArticle(),
    id: String(item.id),
    title: item.title || '',
    authors: normalizeAuthorText(item.authors || item.author || ''),
    journalId: item.journalId || '',
    journalTitle: item.journalName || item.journalTitle || '',
    year: item.year || '',
    volume: item.volume || '',
    issue: item.issue || '',
    pages: item.pages || '',
    doi: item.doi || '',
    url: item.url || '',
    database: item.database || '',
    status: item.status || 'planned',
    abstract: item.abstract || '',
    thesis: item.thesis || '',
    methodology: item.methodology || '',
    sections: item.sections || item.sectionNotes || '',
    quotes: item.quotes || item.keyQuotes || '',
    researchUsefulness: item.researchUsefulness || item.useForWriting || '',
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
    linkedCourse: item.linkedCourse || '',
    linkedAssignment: item.linkedAssignment || '',
    rating: item.rating || '',
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
  }
}

function normalizeStandaloneArticle(item) {
  return {
    ...createBlankArticle(),
    ...item,
    id: String(item.id),
    title: item.title || item.articleTitle || item.name || '',
    authors: normalizeAuthorText(item.authors || item.author || ''),
    journalId: item.journalId || '',
    journalTitle: item.journalTitle || item.journalName || item.journal || item.publication || '',
    year: item.year || item.date || '',
    pages: item.pages || item.pageRange || '',
    status: item.status || 'inbox',
    abstract: item.abstract || item.summary || '',
    sections: item.sections || item.sectionNotes || '',
    quotes: item.quotes || item.keyQuotes || '',
    researchUsefulness: item.researchUsefulness || item.useForWriting || '',
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
  }
}

function findStandaloneArticle(articleId) {
  for (const key of standaloneArticleStorageKeys) {
    const items = getStoredArray(key)
    const item = items.find((storedItem) => String(storedItem.id) === articleId)

    if (item) {
      return { key, item }
    }
  }

  return null
}

function scanLocalStorageForArticle(articleId) {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)

    if (!key) continue

    const items = getStoredArray(key)

    if (!items.length) continue

    const item = items.find((storedItem) => {
      return String(storedItem?.id) === articleId && isArticleLike(storedItem)
    })

    if (item) {
      return { key, item }
    }
  }

  return null
}

function isArticleLike(item) {
  return (
    item?.type === 'article' ||
    item?.journalId ||
    item?.journalTitle ||
    item?.journalName ||
    item?.doi ||
    item?.metadata?.journalTitle ||
    item?.metadata?.journalName
  )
}

function getStoredArray(key) {
  const raw = localStorage.getItem(key)

  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn(`Could not parse ${key}`, error)
    return []
  }
}

function getStoredJournals() {
  const journals = []

  for (const journal of journalHubJournals.value) {
    journals.push({
      ...journal,
      id: String(journal.id),
      title: journal.title || journal.name || journal.journalTitle || '',
      name: journal.name || journal.title || journal.journalTitle || '',
      source: 'useJournals',
    })
  }

  for (const item of allResearchItems.value) {
    if (item.type === 'journal') {
      journals.push({
        id: String(item.id),
        title: item.title,
        name: item.title,
        source: 'research',
      })
    }
  }

  for (const key of standaloneJournalStorageKeys) {
    const storedJournals = getStoredArray(key)

    for (const journal of storedJournals) {
      journals.push({
        ...journal,
        id: String(journal.id),
        title: journal.title || journal.name || journal.journalTitle || '',
        name: journal.name || journal.title || journal.journalTitle || '',
        source: key,
      })
    }
  }

  const seen = new Set()

  return journals.filter((journal) => {
    const id = String(journal.id || '')
    const name = String(journal.title || journal.name || '').toLowerCase()
    const signature = id || name

    if (!signature || seen.has(signature)) {
      return false
    }

    seen.add(signature)
    return true
  })
}

function handleJournalChange() {
  const selectedJournal = availableJournals.value.find((journal) => {
    return String(journal.id) === String(article.value.journalId)
  })

  if (!selectedJournal) {
    article.value.journalTitle = ''
    return
  }

  article.value.journalTitle = selectedJournal.title || selectedJournal.name || ''
}

function formatAuthorsFromMetadata(metadata) {
  if (Array.isArray(metadata.authors) && metadata.authors.length) {
    return metadata.authors
      .map((person) => {
        if (typeof person === 'string') return person

        return [
          person.firstName,
          person.initial,
          person.lastName,
        ]
          .filter(Boolean)
          .join(' ')
      })
      .filter(Boolean)
      .join('; ')
  }

  return normalizeAuthorText(metadata.authors || metadata.author || '')
}

function normalizeAuthorText(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item

        return [
          item.firstName,
          item.initial,
          item.lastName,
        ]
          .filter(Boolean)
          .join(' ')
      })
      .filter(Boolean)
      .join('; ')
  }

  return String(value || '')
}

function parseAuthors(authorText) {
  const cleanText = String(authorText || '').trim()

  if (!cleanText) return []

  return cleanText
    .split(';')
    .map((author) => author.trim())
    .filter(Boolean)
    .map((author) => {
      const parts = author.split(' ').filter(Boolean)

      if (parts.length === 1) {
        return {
          firstName: '',
          initial: '',
          lastName: parts[0],
        }
      }

      return {
        firstName: parts.slice(0, -1).join(' '),
        initial: '',
        lastName: parts[parts.length - 1],
      }
    })
}

async function saveArticle() {
  const now = new Date().toLocaleString()
  article.value.updatedAt = now

  if (sourceMode.value === 'research') {
    await saveResearchArticle(now)
    showMessage('Article saved.')
    return
  }

  if (sourceMode.value === 'journalHub') {
    saveJournalHubArticle(now)
    showMessage('Article saved.')
    return
  }

  if (sourceStorageKey.value) {
    saveStandaloneArticle(now)
    showMessage('Article saved.')
    return
  }

  showMessage('Could not save article.')
}

async function saveResearchArticle(now) {
  const existingItem =
    originalResearchItem.value ||
    allResearchItems.value.find((item) => String(item.id) === String(article.value.id))

  if (!existingItem) return

  const updatedItem = {
    ...existingItem,
    title: article.value.title,
    summary: article.value.abstract,
    topicTags: tagList.value,
    metadata: {
      ...(existingItem.metadata || {}),
      status: article.value.status,
      authors: parseAuthors(article.value.authors),
      author: article.value.authors,
      journalId: article.value.journalId,
      journalTitle: article.value.journalTitle,
      journalName: article.value.journalTitle,
      year: article.value.year,
      volume: article.value.volume,
      issue: article.value.issue,
      pages: article.value.pages,
      pageRange: article.value.pages,
      doi: article.value.doi,
      url: article.value.url,
      database: article.value.database,
      abstract: article.value.abstract,
      thesis: article.value.thesis,
      methodology: article.value.methodology,
      sections: article.value.sections,
      sectionNotes: article.value.sections,
      quotes: article.value.quotes,
      keyQuotes: article.value.quotes,
      researchUsefulness: article.value.researchUsefulness,
      useForWriting: article.value.researchUsefulness,
      linkedCourse: article.value.linkedCourse,
      linkedAssignment: article.value.linkedAssignment,
      rating: article.value.rating,
      updatedAt: now,
    },
    updatedAt: now,
  }

  await updateResearchItem(updatedItem.id, updatedItem)
  originalResearchItem.value = updatedItem
  originalJournalId.value = article.value.journalId
}

function saveJournalHubArticle(now) {
  const updates = {
    id: article.value.id,
    title: article.value.title,
    subtitle: '',
    author: article.value.authors,
    year: article.value.year,
    volume: article.value.volume,
    issue: article.value.issue,
    pages: article.value.pages,
    doi: article.value.doi,
    url: article.value.url,
    abstract: article.value.abstract,
    thesis: article.value.thesis,
    methodology: article.value.methodology,
    sections: article.value.sections,
    sectionNotes: article.value.sections,
    quotes: article.value.quotes,
    keyQuotes: article.value.quotes,
    researchUsefulness: article.value.researchUsefulness,
    useForWriting: article.value.researchUsefulness,
    linkedCourse: article.value.linkedCourse,
    linkedAssignment: article.value.linkedAssignment,
    rating: article.value.rating,
    tags: tagList.value,
    status: article.value.status,
    updatedAt: now,
  }

  const oldJournalId = originalJournalId.value
  const newJournalId = article.value.journalId

  if (!newJournalId) return

  if (oldJournalId && oldJournalId !== newJournalId) {
    const oldJournal = journalHubJournals.value.find((journal) => journal.id === oldJournalId)
    const newJournal = journalHubJournals.value.find((journal) => journal.id === newJournalId)

    if (!newJournal) return

    if (oldJournal) {
      updateJournal(oldJournalId, {
        articles: (oldJournal.articles || []).filter((item) => item.id !== article.value.id),
      })
    }

    updateJournal(newJournalId, {
      articles: [
        ...(newJournal.articles || []),
        updates,
      ],
    })

    originalJournalId.value = newJournalId
    return
  }

  updateArticle(newJournalId, article.value.id, updates)
  originalJournalId.value = newJournalId
}

function saveStandaloneArticle(now) {
  const stored = getStoredArray(sourceStorageKey.value)

  const cleanArticle = {
    ...article.value,
    tags: tagList.value,
    updatedAt: now,
  }

  const existingIndex = stored.findIndex((item) => {
    return String(item.id) === String(cleanArticle.id)
  })

  if (existingIndex >= 0) {
    stored.splice(existingIndex, 1, cleanArticle)
  } else {
    stored.push({
      ...cleanArticle,
      createdAt: now,
    })
  }

  localStorage.setItem(sourceStorageKey.value, JSON.stringify(stored))
}

async function copyCitation() {
  try {
    await navigator.clipboard.writeText(activeCitation.value)
    showMessage('Citation copied.')
  } catch {
    showMessage('Could not copy citation.')
  }
}

function showMessage(message) {
  saveMessage.value = message

  setTimeout(() => {
    saveMessage.value = ''
  }, 2200)
}

const availableJournals = computed(() => {
  return getStoredJournals()
})

const linkedJournal = computed(() => {
  if (article.value.journalId) {
    const journalById = availableJournals.value.find((journal) => {
      return String(journal.id) === String(article.value.journalId)
    })

    if (journalById) return journalById
  }

  if (article.value.journalTitle) {
    return availableJournals.value.find((journal) => {
      const journalName = String(journal.title || journal.name || '').toLowerCase()
      return journalName === article.value.journalTitle.toLowerCase()
    })
  }

  return null
})

const sourceLabel = computed(() => {
  if (sourceMode.value === 'research') return 'Research DB'
  if (sourceMode.value === 'journalHub') return 'Journal DB'
  if (sourceMode.value === 'standalone') return sourceStorageKey.value
  if (sourceMode.value === 'localStorage') return sourceStorageKey.value

  return 'Unknown'
})

const tagList = computed(() => {
  if (!article.value.tags) return []

  if (Array.isArray(article.value.tags)) {
    return article.value.tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  return String(article.value.tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
})

const citationItem = computed(() => {
  return {
    id: article.value.id,
    type: 'article',
    title: article.value.title,
    author: article.value.authors,
    authors: article.value.authors,
    metadata: {
      authors: parseAuthors(article.value.authors),
      author: article.value.authors,
      journalId: article.value.journalId,
      journalTitle:
        article.value.journalTitle ||
        linkedJournal.value?.title ||
        linkedJournal.value?.name ||
        '',
      journalName:
        article.value.journalTitle ||
        linkedJournal.value?.title ||
        linkedJournal.value?.name ||
        '',
      year: article.value.year,
      volume: article.value.volume,
      issue: article.value.issue,
      pages: article.value.pages,
      pageRange: article.value.pages,
      doi: article.value.doi,
      url: article.value.url,
      database: article.value.database,
      shortTitle: article.value.title,
    },
  }
})

const citationSet = computed(() => {
  return generateCitationSet(citationItem.value)
})

const activeCitation = computed(() => {
  return citationSet.value[selectedCitationStyle.value] || ''
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.article-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(245, 158, 11, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.94));
  color: white;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #fbbf24;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.1;
}

.subtitle {
  margin: 0.65rem 0 0;
  color: rgba(255, 255, 255, 0.78);
}

.header-actions,
.empty-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 1rem;
  align-items: start;
}

.panel,
.empty-card {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 22px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.panel {
  padding: 1.25rem;
}

.main-panel {
  min-width: 0;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.citation-panel {
  grid-column: 1 / -1;
}

.empty-card {
  padding: 2rem;
}

.empty-card h2 {
  margin-top: 0;
}

.empty-card p {
  color: var(--text-muted);
}

.section-heading {
  margin-bottom: 1rem;
}

.section-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.15rem;
}

.section-heading p {
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.92rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 750;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.75rem 0.85rem;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

textarea {
  resize: vertical;
  line-height: 1.55;
}

input:focus,
select:focus,
textarea:focus {
  border-color: rgba(245, 158, 11, 0.85);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
  background: var(--bg-card);
}

.primary-button,
.ghost-button,
.mini-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.primary-button {
  background: #f59e0b;
  color: #111827;
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.28);
}

.ghost-button {
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.ghost-button.dark {
  background: var(--btn-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.primary-button:hover,
.ghost-button:hover,
.mini-link:hover {
  transform: translateY(-1px);
}

.helper-note {
  border-radius: 14px;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.22);
  color: #92400e;
  font-size: 0.85rem;
  line-height: 1.45;
}

.linked-card {
  border-radius: 18px;
  padding: 1rem;
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
}

.linked-card.muted {
  color: var(--text-muted);
}

.linked-card h3 {
  margin: 0.35rem 0 0.7rem;
  color: var(--text-primary);
}

.label {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mini-link {
  padding: 0.5rem 0.75rem;
  background: rgba(245, 158, 11, 0.15);
  color: #92400e;
}

.quick-meta {
  display: grid;
  gap: 0.75rem;
}

.quick-meta div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color);
}

.quick-meta span {
  color: var(--text-muted);
  font-size: 0.88rem;
}

.quick-meta strong {
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: right;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tag {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  background: rgba(245, 158, 11, 0.14);
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 800;
}

.citation-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.citation-tabs button {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  background: var(--btn-bg);
  color: var(--text-secondary);
  font-weight: 800;
  cursor: pointer;
}

.citation-tabs button.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.citation-box {
  padding: 1rem;
  border-radius: 18px;
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  line-height: 1.65;
  margin-bottom: 1rem;
}

.citation-box p {
  margin: 0;
}

.save-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 20;
  border-radius: 999px;
  padding: 0.8rem 1rem;
  background: #0f172a;
  color: white;
  font-weight: 850;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.28);
}

@media (max-width: 980px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
}
</style>