import CSL from 'citeproc'
import cslStyles from '@citation-js/plugin-csl/lib-mjs/styles.json'
import cslLocales from '@citation-js/plugin-csl/lib-mjs/locales.json'

import {
  getCitationTypeForResearchType,
  normalizeResearchMetadata,
} from '../data/researchMetadataSchema'

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function stripFinalPeriod(value) {
  return clean(value).replace(/\.$/, '')
}

function ensurePeriod(value) {
  const text = clean(value)
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function italic(value) {
  const text = escapeHtml(value)
  return text ? `<em>${text}</em>` : ''
}

function quoteTitle(value) {
  const text = escapeHtml(value)
  return text ? `“${text}”` : ''
}

function getMetadata(item = {}) {
  return item.metadata || {}
}

function getField(item = {}, keys = [], fallback = '') {
  const metadata = getMetadata(item)

  for (const key of keys) {
    const directValue = item[key]
    if (directValue !== undefined && directValue !== null && clean(directValue)) {
      return directValue
    }

    const metadataValue = metadata[key]
    if (metadataValue !== undefined && metadataValue !== null && clean(metadataValue)) {
      return metadataValue
    }
  }

  return fallback
}

function getTitle(item = {}) {
  return clean(getField(item, ['title', 'articleTitle', 'name'], 'Untitled'))
}

function getShortTitle(item = {}) {
  return clean(
    getField(item, ['shortTitle'], '') ||
      getMetadata(item).shortTitle ||
      getTitle(item),
  )
}

function isCorporateAuthor(value) {
  const text = clean(value).toLowerCase()

  return [
    'university',
    'college',
    'seminary',
    'church',
    'press',
    'journal',
    'association',
    'society',
    'committee',
    'council',
    'department',
    'ministry',
    'institute',
    'center',
    'centre',
  ].some((word) => text.includes(word))
}

function normalizePerson(person) {
  if (!person) return null

  if (typeof person === 'string') {
    const text = clean(person)
    if (!text) return null

    if (isCorporateAuthor(text)) {
      return { raw: text }
    }

    if (text.includes(',')) {
      return { raw: text }
    }

    const parts = text.split(' ').filter(Boolean)

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
  }

  if (person.raw) {
    return { raw: clean(person.raw) }
  }

  return {
    firstName: clean(person.firstName),
    initial: clean(person.initial),
    lastName: clean(person.lastName),
  }
}

function splitPeopleText(value) {
  const text = clean(value)
  if (!text) return []

  return text
    .split(';')
    .map((name) => name.trim())
    .filter(Boolean)
}

function normalizePeople(value) {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map(normalizePerson).filter(Boolean)
  }

  if (typeof value === 'string') {
    return splitPeopleText(value).map(normalizePerson).filter(Boolean)
  }

  return [normalizePerson(value)].filter(Boolean)
}

function formatPersonFullName(person) {
  const normalized = normalizePerson(person)
  if (!normalized) return ''
  if (normalized.raw) return normalized.raw

  return [
    normalized.firstName,
    normalized.initial,
    normalized.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

function formatPersonLastFirst(person) {
  const normalized = normalizePerson(person)
  if (!normalized) return ''
  if (normalized.raw) return normalized.raw

  if (!normalized.lastName) {
    return formatPersonFullName(normalized)
  }

  const firstParts = [
    normalized.firstName,
    normalized.initial,
  ].filter(Boolean)

  if (!firstParts.length) {
    return normalized.lastName
  }

  return `${normalized.lastName}, ${firstParts.join(' ')}`
}

function formatBibliographyAuthors(authors = []) {
  const people = normalizePeople(authors)
  if (!people.length) return 'Author Unknown'

  if (people.length === 1) {
    return formatPersonLastFirst(people[0])
  }

  if (people.length === 2) {
    return `${formatPersonLastFirst(people[0])} and ${formatPersonFullName(people[1])}`
  }

  const firstAuthor = formatPersonLastFirst(people[0])
  const remainingAuthors = people.slice(1).map(formatPersonFullName)
  const lastAuthor = remainingAuthors.pop()

  return `${firstAuthor}, ${remainingAuthors.join(', ')}${
    remainingAuthors.length ? ', ' : ''
  }and ${lastAuthor}`
}

function formatFootnoteAuthors(authors = []) {
  const people = normalizePeople(authors)
  if (!people.length) return 'Author Unknown'

  if (people.length === 1) {
    return formatPersonFullName(people[0])
  }

  if (people.length === 2) {
    return `${formatPersonFullName(people[0])} and ${formatPersonFullName(people[1])}`
  }

  const allButLast = people.slice(0, -1).map(formatPersonFullName)
  const last = formatPersonFullName(people[people.length - 1])

  return `${allButLast.join(', ')}, and ${last}`
}

function formatShortFootnoteAuthor(authors = []) {
  const people = normalizePeople(authors)
  if (!people.length) return 'Author Unknown'

  if (people.length === 1) {
    const person = normalizePerson(people[0])
    return person?.lastName || formatPersonFullName(person)
  }

  if (people.length === 2) {
    const first = normalizePerson(people[0])
    const second = normalizePerson(people[1])

    return `${first?.lastName || formatPersonFullName(first)} and ${
      second?.lastName || formatPersonFullName(second)
    }`
  }

  const first = normalizePerson(people[0])
  return `${first?.lastName || formatPersonFullName(first)} et al.`
}

function formatMlaAuthors(authors = []) {
  const people = normalizePeople(authors)
  if (!people.length) return 'Author Unknown'

  if (people.length === 1) {
    return formatPersonLastFirst(people[0])
  }

  if (people.length === 2) {
    return `${formatPersonLastFirst(people[0])} and ${formatPersonFullName(people[1])}`
  }

  return `${formatPersonLastFirst(people[0])}, et al.`
}

function formatApaInitials(value) {
  return clean(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => {
      if (part.endsWith('.')) return part
      return `${part.charAt(0).toUpperCase()}.`
    })
    .join(' ')
}

function formatApaAuthor(person) {
  const normalized = normalizePerson(person)
  if (!normalized) return ''
  if (normalized.raw) return normalized.raw

  if (!normalized.lastName) {
    return formatPersonFullName(normalized)
  }

  const initials = [
    formatApaInitials(normalized.firstName),
    formatApaInitials(normalized.initial),
  ]
    .filter(Boolean)
    .join(' ')

  return initials ? `${normalized.lastName}, ${initials}` : normalized.lastName
}

function formatApaAuthors(authors = []) {
  const people = normalizePeople(authors)
  if (!people.length) return 'Author Unknown'

  const formatted = people.map(formatApaAuthor).filter(Boolean)

  if (formatted.length === 1) return formatted[0]
  if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`

  const last = formatted.pop()
  return `${formatted.join(', ')}, & ${last}`
}

function getAuthors(item = {}) {
  const metadata = getMetadata(item)

  return normalizePeople(
    item.authors ||
      item.author ||
      metadata.authors ||
      metadata.author ||
      metadata.creator ||
      metadata.contributor ||
      [],
  )
}

function getEditors(item = {}) {
  const metadata = getMetadata(item)

  return normalizePeople(
    item.editors ||
      item.editor ||
      metadata.editors ||
      metadata.editor ||
      [],
  )
}

function getSourceType(item = {}) {
  const metadata = getMetadata(item)
  const type = clean(item.type || metadata.type || item.sourceType || metadata.sourceType).toLowerCase()

  if (type.includes('book')) return 'book'
  if (type.includes('article')) return 'article'
  if (type.includes('website') || type.includes('web')) return 'website'
  if (type.includes('journal')) return 'journal'

  const journalTitle = getField(item, [
    'journalTitle',
    'journalName',
    'journal',
    'publication',
  ])

  if (journalTitle) return 'article'

  const publisher = getField(item, ['publisher'])
  const place = getField(item, ['placeOfPublication'])

  if (publisher || place) return 'book'

  const url = getField(item, ['url', 'website'])
  if (url) return 'website'

  return 'generic'
}

function normalizeDoi(value) {
  const doi = clean(value)
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')

  return doi ? `https://doi.org/${doi}` : ''
}

function getAccessText(item = {}) {
  const doi = getField(item, ['doi'])
  if (doi) return normalizeDoi(doi)

  return clean(getField(item, ['url', 'website', 'link']))
}

function normalizePages(value) {
  return clean(value)
    .replace(/^pp\.\s*/i, '')
    .replace(/^p\.\s*/i, '')
}

function formatMlaPages(value) {
  const pages = normalizePages(value)
  if (!pages) return ''

  return pages.includes('–') || pages.includes('-')
    ? `pp. ${pages}`
    : `p. ${pages}`
}

function buildPublicationText(place, publisher, year) {
  const cleanPlace = clean(place)
  const cleanPublisher = clean(publisher)
  const cleanYear = clean(year)

  const placePublisher = [cleanPlace, cleanPublisher].filter(Boolean).join(': ')

  if (placePublisher && cleanYear) return `${placePublisher}, ${cleanYear}.`
  if (placePublisher) return `${placePublisher}.`
  if (cleanYear) return `${cleanYear}.`

  return ''
}

function buildPublicationParenthetical(place, publisher, year) {
  const cleanPlace = clean(place)
  const cleanPublisher = clean(publisher)
  const cleanYear = clean(year)

  const placePublisher = [cleanPlace, cleanPublisher].filter(Boolean).join(': ')

  if (placePublisher && cleanYear) return `${placePublisher}, ${cleanYear}`
  if (placePublisher) return placePublisher
  if (cleanYear) return cleanYear

  return ''
}

function getBookResponsibleParty(item = {}, format = 'bibliography') {
  const authors = getAuthors(item)
  const editors = getEditors(item)

  if (authors.length) {
    return format === 'footnote'
      ? formatFootnoteAuthors(authors)
      : format === 'short'
        ? formatShortFootnoteAuthor(authors)
        : formatBibliographyAuthors(authors)
  }

  if (editors.length) {
    const editorText =
      format === 'footnote'
        ? formatFootnoteAuthors(editors)
        : format === 'short'
          ? formatShortFootnoteAuthor(editors)
          : formatBibliographyAuthors(editors)

    return `${editorText}, ${editors.length === 1 ? 'ed.' : 'eds.'}`
  }

  return 'Author Unknown'
}

function generateBookBibliography(item = {}) {
  const metadata = getMetadata(item)
  const authorText = getBookResponsibleParty(item, 'bibliography')
  const title = italic(getTitle(item))
  const edition = clean(metadata.edition || item.edition)
  const place = getField(item, ['placeOfPublication', 'place'])
  const publisher = getField(item, ['publisher'])
  const year = getField(item, ['year', 'date'])
  const publicationText = buildPublicationText(place, publisher, year)

  return [
    `${authorText}.`,
    `${title}.`,
    edition ? ensurePeriod(edition) : '',
    publicationText,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function generateBookFullFootnote(item = {}) {
  const metadata = getMetadata(item)
  const authorText = getBookResponsibleParty(item, 'footnote')
  const title = italic(getTitle(item))
  const edition = clean(metadata.edition || item.edition)
  const place = getField(item, ['placeOfPublication', 'place'])
  const publisher = getField(item, ['publisher'])
  const year = getField(item, ['year', 'date'])
  const publicationText = buildPublicationParenthetical(place, publisher, year)
  const locator = clean(getField(item, ['locator', 'citedPages', 'citationPage', 'page']))

  return `${authorText}, ${title}${edition ? `, ${edition}` : ''}${
    publicationText ? ` (${publicationText})` : ''
  }${locator ? `, ${locator}` : ''}.`.trim()
}

function generateBookShortFootnote(item = {}) {
  const authorText = getBookResponsibleParty(item, 'short')
  const title = italic(getShortTitle(item))
  const locator = clean(getField(item, ['locator', 'citedPages', 'citationPage', 'page']))

  return `${authorText}, ${title}${locator ? `, ${locator}` : ''}.`.trim()
}

function generateBookApa(item = {}) {
  const authors = formatApaAuthors(getAuthors(item))
  const title = italic(getTitle(item))
  const year = clean(getField(item, ['year', 'date'])) || 'n.d.'
  const publisher = clean(getField(item, ['publisher']))

  return `${authors}. (${year}). ${title}.${publisher ? ` ${publisher}.` : ''}`.trim()
}

function generateBookMla(item = {}) {
  const authors = formatMlaAuthors(getAuthors(item))
  const title = italic(getTitle(item))
  const publisher = clean(getField(item, ['publisher']))
  const year = clean(getField(item, ['year', 'date']))

  return [
    `${authors}.`,
    `${title}.`,
    publisher || year ? `${[publisher, year].filter(Boolean).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function getArticleJournalTitle(item = {}) {
  return clean(
    getField(item, [
      'journalTitle',
      'journalName',
      'journal',
      'publication',
      'periodical',
      'containerTitle',
    ], 'Journal Title'),
  )
}

function buildArticleTurabianDetails(item = {}) {
  const volume = clean(getField(item, ['volume']))
  const issue = clean(getField(item, ['issue', 'number']))
  const year = clean(getField(item, ['year', 'date']))
  const pages = normalizePages(getField(item, ['pages', 'pageRange']))

  let details = ''

  if (volume) details += ` ${volume}`
  if (issue) details += volume ? `, no. ${issue}` : ` no. ${issue}`
  if (year) details += ` (${year})`
  if (pages) details += `: ${pages}`

  return details
}

function generateArticleBibliography(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatBibliographyAuthors(authors)
  const title = quoteTitle(getTitle(item))
  const journalTitle = italic(getArticleJournalTitle(item))
  const details = buildArticleTurabianDetails(item)
  const access = getAccessText(item)

  return `${authorText}. ${title}. ${journalTitle}${details}${access ? `. ${access}` : ''}.`.trim()
}

function generateArticleFullFootnote(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatFootnoteAuthors(authors)
  const title = quoteTitle(getTitle(item))
  const journalTitle = italic(getArticleJournalTitle(item))
  const details = buildArticleTurabianDetails(item)
  const access = getAccessText(item)
  const locator = clean(getField(item, ['locator', 'citedPages', 'citationPage', 'page']))

  return `${authorText}, ${title}, ${journalTitle}${details}${
    locator ? `, ${locator}` : ''
  }${access ? `, ${access}` : ''}.`.trim()
}

function generateArticleShortFootnote(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatShortFootnoteAuthor(authors)
  const title = quoteTitle(getShortTitle(item))
  const locator = clean(getField(item, ['locator', 'citedPages', 'citationPage', 'page']))

  return `${authorText}, ${title}${locator ? `, ${locator}` : ''}.`.trim()
}

function generateArticleApa(item = {}) {
  const authors = formatApaAuthors(getAuthors(item))
  const title = escapeHtml(getTitle(item))
  const journalTitle = italic(getArticleJournalTitle(item))
  const year = clean(getField(item, ['year', 'date'])) || 'n.d.'
  const volume = clean(getField(item, ['volume']))
  const issue = clean(getField(item, ['issue', 'number']))
  const pages = normalizePages(getField(item, ['pages', 'pageRange']))
  const access = getAccessText(item)

  const volumeIssue = volume
    ? `${italic(volume)}${issue ? `(${issue})` : ''}`
    : issue
      ? `(${issue})`
      : ''

  const journalParts = [
    journalTitle,
    volumeIssue,
    pages,
  ].filter(Boolean)

  return `${authors}. (${year}). ${title}. ${journalParts.join(', ')}.${
    access ? ` ${access}` : ''
  }`.trim()
}

function generateArticleMla(item = {}) {
  const authors = formatMlaAuthors(getAuthors(item))
  const title = quoteTitle(getTitle(item))
  const journalTitle = italic(getArticleJournalTitle(item))
  const volume = clean(getField(item, ['volume']))
  const issue = clean(getField(item, ['issue', 'number']))
  const year = clean(getField(item, ['year', 'date']))
  const pages = formatMlaPages(getField(item, ['pages', 'pageRange']))
  const access = getAccessText(item)

  const containerParts = [
    journalTitle,
    volume ? `vol. ${volume}` : '',
    issue ? `no. ${issue}` : '',
    year,
    pages,
  ].filter(Boolean)

  return `${authors}. ${title}. ${containerParts.join(', ')}.${
    access ? ` ${access}.` : ''
  }`.trim()
}

function getWebsiteName(item = {}) {
  return clean(
    getField(item, [
      'websiteName',
      'siteName',
      'containerTitle',
      'publication',
      'publisher',
    ], 'Website'),
  )
}

function getWebsiteDate(item = {}) {
  return clean(getField(item, ['date', 'publishedDate', 'accessDate', 'year']))
}

function generateWebsiteBibliography(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatBibliographyAuthors(authors)
  const title = quoteTitle(getTitle(item))
  const website = italic(getWebsiteName(item))
  const date = getWebsiteDate(item)
  const url = getAccessText(item)

  return [
    `${authorText}.`,
    `${title}.`,
    `${website}.`,
    date ? ensurePeriod(date) : '',
    url ? ensurePeriod(url) : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function generateWebsiteFullFootnote(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatFootnoteAuthors(authors)
  const title = quoteTitle(getTitle(item))
  const website = italic(getWebsiteName(item))
  const date = getWebsiteDate(item)
  const url = getAccessText(item)

  return `${authorText}, ${title}, ${website}${date ? `, ${date}` : ''}${
    url ? `, ${url}` : ''
  }.`.trim()
}

function generateWebsiteShortFootnote(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatShortFootnoteAuthor(authors)
  const title = quoteTitle(getShortTitle(item))

  return `${authorText}, ${title}.`.trim()
}

function generateWebsiteApa(item = {}) {
  const authors = formatApaAuthors(getAuthors(item))
  const title = escapeHtml(getTitle(item))
  const website = italic(getWebsiteName(item))
  const date = getWebsiteDate(item) || 'n.d.'
  const url = getAccessText(item)

  return `${authors}. (${date}). ${title}. ${website}.${url ? ` ${url}` : ''}`.trim()
}

function generateWebsiteMla(item = {}) {
  const authors = formatMlaAuthors(getAuthors(item))
  const title = quoteTitle(getTitle(item))
  const website = italic(getWebsiteName(item))
  const date = getWebsiteDate(item)
  const url = getAccessText(item)

  return `${authors}. ${title}. ${website}${date ? `, ${date}` : ''}${
    url ? `, ${url}` : ''
  }.`.trim()
}

function generateGenericBibliography(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatBibliographyAuthors(authors)
  const title = getTitle(item)
  const year = clean(getField(item, ['year', 'date']))

  return `${authorText}. ${title}.${year ? ` ${year}.` : ''}`.trim()
}

function generateGenericFullFootnote(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatFootnoteAuthors(authors)
  const title = getTitle(item)

  return `${authorText}, ${title}.`.trim()
}

function generateGenericShortFootnote(item = {}) {
  const authors = getAuthors(item)
  const authorText = formatShortFootnoteAuthor(authors)
  const title = getShortTitle(item)

  return `${authorText}, ${title}.`.trim()
}

function normalizeStyle(style = 'turabian') {
  const value = clean(style).toLowerCase()

  const aliases = {
    turabian: 'turabian-bibliography',
    'turabian bibliography': 'turabian-bibliography',
    'turabian-bibliography': 'turabian-bibliography',
    'turabian footnote': 'turabian-footnote',
    'turabian-footnote': 'turabian-footnote',
    'turabian full footnote': 'turabian-footnote',
    'turabian short note': 'turabian-short-note',
    'turabian-short-note': 'turabian-short-note',
    chicago: 'chicago-bibliography',
    'chicago bibliography': 'chicago-bibliography',
    'chicago-bibliography': 'chicago-bibliography',
    'chicago footnote': 'chicago-footnote',
    'chicago-footnote': 'chicago-footnote',
    'chicago short note': 'chicago-short-note',
    'chicago-short-note': 'chicago-short-note',
    apa: 'apa',
    mla: 'mla',
  }

  return aliases[value] || value || 'turabian-bibliography'
}

function generateManualCitation(item, style = 'turabian') {
  if (!item) return ''

  const normalizedStyle = normalizeStyle(style)

  if (normalizedStyle.includes('footnote') && !normalizedStyle.includes('short')) {
    return generateManualFullFootnote(item, normalizedStyle)
  }

  if (normalizedStyle.includes('short')) {
    return generateManualShortFootnote(item, normalizedStyle)
  }

  const sourceType = getSourceType(item)

  if (normalizedStyle === 'apa') {
    if (sourceType === 'book') return generateBookApa(item)
    if (sourceType === 'article') return generateArticleApa(item)
    if (sourceType === 'website') return generateWebsiteApa(item)
    return generateGenericBibliography(item)
  }

  if (normalizedStyle === 'mla') {
    if (sourceType === 'book') return generateBookMla(item)
    if (sourceType === 'article') return generateArticleMla(item)
    if (sourceType === 'website') return generateWebsiteMla(item)
    return generateGenericBibliography(item)
  }

  if (sourceType === 'book') return generateBookBibliography(item)
  if (sourceType === 'article') return generateArticleBibliography(item)
  if (sourceType === 'website') return generateWebsiteBibliography(item)

  return generateGenericBibliography(item)
}

function generateManualFullFootnote(item, style = 'turabian') {
  if (!item) return ''

  const sourceType = getSourceType(item)

  if (sourceType === 'book') return generateBookFullFootnote(item)
  if (sourceType === 'article') return generateArticleFullFootnote(item)
  if (sourceType === 'website') return generateWebsiteFullFootnote(item)

  return generateGenericFullFootnote(item)
}

function generateManualShortFootnote(item, style = 'turabian') {
  if (!item) return ''

  const sourceType = getSourceType(item)

  if (sourceType === 'book') return generateBookShortFootnote(item)
  if (sourceType === 'article') return generateArticleShortFootnote(item)
  if (sourceType === 'website') return generateWebsiteShortFootnote(item)

  return generateGenericShortFootnote(item)
}

function generateManualCitationSet(item) {
  return {
    turabianBibliography: generateManualCitation(item, 'turabian-bibliography'),
    turabianFootnote: generateManualFullFootnote(item, 'turabian-footnote'),
    turabianShortNote: generateManualShortFootnote(item, 'turabian-short-note'),
    chicagoBibliography: generateManualCitation(item, 'chicago-bibliography'),
    chicagoFootnote: generateManualFullFootnote(item, 'chicago-footnote'),
    chicagoShortNote: generateManualShortFootnote(item, 'chicago-short-note'),
    apa: generateManualCitation(item, 'apa'),
    mla: generateManualCitation(item, 'mla'),
  }
}

const CITATION_STYLE_DEFINITIONS = {
  turabian: {
    id: 'turabian',
    template: 'turabian-fullnote-bibliography',
    mode: 'note',
  },
  'turabian-bibliography': {
    id: 'turabian',
    template: 'turabian-fullnote-bibliography',
    mode: 'note',
  },
  'turabian-footnote': {
    id: 'turabian',
    template: 'turabian-fullnote-bibliography',
    mode: 'note',
  },
  'turabian-short-note': {
    id: 'turabian',
    template: 'turabian-fullnote-bibliography',
    mode: 'note',
  },
  chicago: {
    id: 'chicago',
    template: 'chicago-fullnote-bibliography',
    mode: 'note',
  },
  'chicago-bibliography': {
    id: 'chicago',
    template: 'chicago-fullnote-bibliography',
    mode: 'note',
  },
  'chicago-footnote': {
    id: 'chicago',
    template: 'chicago-fullnote-bibliography',
    mode: 'note',
  },
  'chicago-short-note': {
    id: 'chicago',
    template: 'chicago-fullnote-bibliography',
    mode: 'note',
  },
  apa: {
    id: 'apa',
    template: 'apa',
    mode: 'author-date',
  },
  mla: {
    id: 'mla',
    template: 'modern-language-association',
    mode: 'author-page',
  },
  harvard: {
    id: 'harvard',
    template: 'harvard1',
    mode: 'author-date',
  },
  harvard1: {
    id: 'harvard',
    template: 'harvard1',
    mode: 'author-date',
  },
  vancouver: {
    id: 'vancouver',
    template: 'vancouver',
    mode: 'numeric',
  },
}

const CSL_NAME_ROLE_MAP = {
  authors: 'author',
  editors: 'editor',
  translators: 'translator',
  directors: 'director',
  producers: 'producer',
  interviewers: 'interviewer',
  recipients: 'recipient',
}

function getCitationStyleDefinition(style = 'turabian') {
  const normalized = clean(style).toLowerCase()

  return (
    CITATION_STYLE_DEFINITIONS[normalized] ||
    CITATION_STYLE_DEFINITIONS.turabian
  )
}

export function getCitationStyleMode(style = 'turabian') {
  return getCitationStyleDefinition(style).mode
}

const customCslStyles = new Map()
const customCslLocales = new Map()

export function registerCslStyle(styleId, cslXml) {
  const cleanStyleId = clean(styleId)
  const xml = String(cslXml || '').trim()

  if (!cleanStyleId || !xml) {
    throw new Error('A CSL style ID and CSL XML are required.')
  }

  customCslStyles.set(cleanStyleId, xml)
  return cleanStyleId
}

export function registerCslLocale(localeId, localeXml) {
  const cleanLocaleId = clean(localeId)
  const xml = String(localeXml || '').trim()

  if (!cleanLocaleId || !xml) {
    throw new Error('A CSL locale ID and CSL XML are required.')
  }

  customCslLocales.set(cleanLocaleId, xml)
  return cleanLocaleId
}

function buildCslDate(value) {
  const text = clean(value)
  if (!text) return undefined

  const match = text.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/)

  if (!match) {
    return { literal: text }
  }

  const dateParts = [Number(match[1])]

  if (match[2]) dateParts.push(Number(match[2]))
  if (match[3]) dateParts.push(Number(match[3]))

  return {
    'date-parts': [dateParts],
  }
}

function creatorToCslName(creator) {
  if (!creator) return null

  if (typeof creator === 'string') {
    const literal = clean(creator)
    return literal ? { literal } : null
  }

  const literal = clean(
    creator.literal ||
      creator.raw ||
      (
        creator.creatorType === 'literal'
          ? creator.name
          : ''
      ),
  )

  if (literal) {
    return { literal }
  }

  const given = [
    creator.firstName || creator.given,
    creator.middleName || creator.middle,
    creator.initial,
  ]
    .map(clean)
    .filter(Boolean)
    .join(' ')

  const family = clean(
    creator.lastName ||
      creator.family,
  )

  const name = {
    given,
    family,
    suffix: clean(creator.suffix),
    'non-dropping-particle': clean(
      creator.nameParticle ||
        creator.particle ||
        creator['non-dropping-particle'],
    ),
  }

  Object.keys(name).forEach((key) => {
    if (!name[key]) delete name[key]
  })

  return Object.keys(name).length
    ? name
    : null
}

function creatorListToCslNames(value) {
  if (!value) return []

  const list = Array.isArray(value)
    ? value
    : [value]

  return list
    .map(creatorToCslName)
    .filter(Boolean)
}

function addNameRole(cslItem, role, creators) {
  const names = creatorListToCslNames(creators)
  if (names.length) cslItem[role] = names
}

function getPrimaryAuthors(metadata = {}) {
  const candidates = [
    metadata.authors,
    metadata.presenters,
    metadata.interviewees,
    metadata.senders,
    metadata.directors,
    metadata.contributors,
    metadata.author,
    metadata.creator,
    metadata.sender,
  ]

  for (const value of candidates) {
    const names = creatorListToCslNames(value)
    if (names.length) return names
  }

  return []
}

function pruneCslValue(value) {
  if (Array.isArray(value)) {
    const entries = value
      .map(pruneCslValue)
      .filter((entry) => entry !== undefined)

    return entries.length
      ? entries
      : undefined
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    const entries = Object.entries(value)
      .map(([key, entry]) => [
        key,
        pruneCslValue(entry),
      ])
      .filter(([, entry]) => entry !== undefined)

    return entries.length
      ? Object.fromEntries(entries)
      : undefined
  }

  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'string') {
    const text = clean(value)
    return text || undefined
  }

  return value
}

function buildCslNote(metadata = {}) {
  return [
    metadata.extra,
    metadata.rights
      ? `Rights: ${metadata.rights}`
      : '',
  ]
    .map(clean)
    .filter(Boolean)
    .join('\n')
}

export function toCslJson(item = {}) {
  const typeId = clean(
    item.type ||
      item.sourceType ||
      item.metadata?.type,
  )

  const metadata = normalizeResearchMetadata(
    typeId,
    item.metadata || item,
  )

  const citationType =
    metadata.citationType ||
    getCitationTypeForResearchType(typeId) ||
    getSourceType(item) ||
    'document'

  const id = clean(item.id) ||
    `scholarory-${Math.random().toString(36).slice(2)}`

  const cslItem = {
    id,
    type: citationType,
    title: getTitle(item),
    'title-short': metadata.shortTitle,
    'container-title': metadata.publicationTitle,
    publisher: metadata.publisher,
    'publisher-place': metadata.placeOfPublication,
    issued: buildCslDate(metadata.publicationDate),
    accessed: buildCslDate(metadata.accessedDate),
    'original-date': buildCslDate(metadata.originalPublicationDate),
    edition: metadata.edition,
    'collection-title': metadata.seriesTitle,
    'collection-number': metadata.seriesNumber,
    volume: metadata.volume,
    'number-of-volumes': metadata.numberOfVolumes,
    issue: metadata.issue,
    page: metadata.pages,
    'number-of-pages': metadata.pageCount,
    ISBN: metadata.isbn,
    ISSN: metadata.issn,
    DOI: clean(metadata.doi)
      .replace(/^https?:\/\/doi\.org\//i, '')
      .replace(/^doi:\s*/i, ''),
    URL: metadata.url,
    abstract: metadata.abstract,
    language: metadata.language,
    archive: metadata.archive,
    'archive-place': metadata.archiveLocation,
    'call-number': metadata.callNumber,
    source: metadata.libraryCatalog || metadata.database || metadata.repository,
    number: metadata.publicationNumber || metadata.episodeNumber,
    genre: metadata.degree || metadata.medium || metadata.format,
    medium: metadata.medium,
    dimensions: metadata.runningTime,
    note: buildCslNote(metadata),
  }

  const primaryAuthors = getPrimaryAuthors(metadata)
  if (primaryAuthors.length) cslItem.author = primaryAuthors

  Object.entries(CSL_NAME_ROLE_MAP).forEach(
    ([metadataKey, cslRole]) => {
      addNameRole(
        cslItem,
        cslRole,
        metadata[metadataKey],
      )
    },
  )

  if (!cslItem.author?.length && cslItem.editor?.length) {
    delete cslItem.author
  }

  return pruneCslValue(cslItem) || {
    id,
    type: 'document',
    title: getTitle(item),
  }
}

function buildCitationEntry(cslItem, options = {}) {
  const entry = {
    id: cslItem.id,
  }

  const locator = clean(
    options.locator ||
      options.page ||
      options.pages,
  )

  if (locator) {
    entry.locator = locator
    entry.label = clean(options.label) || 'page'
  }

  if (options.prefix) entry.prefix = clean(options.prefix)
  if (options.suffix) entry.suffix = clean(options.suffix)
  if (options.suppressAuthor) entry['suppress-author'] = true
  if (options.authorOnly) entry['author-only'] = true

  return entry
}

function unwrapSingleBibliography(html) {
  const value = String(html || '').trim()
  if (!value) return ''

  if (
    typeof document !== 'undefined' &&
    typeof DOMParser !== 'undefined'
  ) {
    const parsed = new DOMParser().parseFromString(
      value,
      'text/html',
    )

    const entry = parsed.querySelector('.csl-entry')
    if (entry) return entry.innerHTML.trim()
  }

  const match = value.match(
    /<div[^>]*class=["'][^"']*csl-entry[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*$/i,
  )

  return match
    ? match[1].trim()
    : value
}

function getCslStyleXml(templateId) {
  return (
    customCslStyles.get(templateId) ||
    cslStyles[templateId] ||
    ''
  )
}

function getCslLocaleXml(localeId = 'en-US') {
  return (
    customCslLocales.get(localeId) ||
    cslLocales[localeId] ||
    cslLocales['en-US'] ||
    ''
  )
}

function createCslEngine(cslItems, templateId, localeId = 'en-US') {
  const styleXml = getCslStyleXml(templateId)

  if (!styleXml) {
    throw new Error(`CSL style "${templateId}" is not registered.`)
  }

  const itemMap = new Map(
    cslItems.map((entry) => [String(entry.id), entry]),
  )

  const sys = {
    retrieveLocale(requestedLocale) {
      return getCslLocaleXml(requestedLocale || localeId)
    },

    retrieveItem(id) {
      return itemMap.get(String(id)) || null
    },
  }

  const engine = new CSL.Engine(
    sys,
    styleXml,
    localeId,
    true,
  )

  engine.setOutputFormat('html')
  return engine
}

function makeCitationCluster(engine, entry, noteIndex) {
  return {
    citationID: `scholarory-citation-${noteIndex}`,
    citationItems: [entry],
    properties: {
      noteIndex,
    },
  }
}

function renderCitationCluster(engine, entry, noteIndex, priorCitations = []) {
  const cluster = makeCitationCluster(
    engine,
    entry,
    noteIndex,
  )

  const result = engine.processCitationCluster(
    cluster,
    priorCitations,
    [],
  )

  return result?.[1]?.[0]?.[1] || ''
}

function formatWithCiteproc(
  item,
  style,
  outputType,
  options = {},
) {
  const definition = getCitationStyleDefinition(style)
  const cslItem = toCslJson(item)
  const locale = options.locale || 'en-US'
  const engine = createCslEngine(
    [cslItem],
    definition.template,
    locale,
  )

  engine.updateItems([String(cslItem.id)])

  if (outputType === 'bibliography') {
    const bibliography = engine.makeBibliography()
    const entries = bibliography?.[1] || []
    return unwrapSingleBibliography(entries[0] || '')
  }

  const entry = buildCitationEntry(
    cslItem,
    options,
  )

  if (outputType === 'short-note') {
    const firstCluster = makeCitationCluster(
      engine,
      { id: cslItem.id },
      1,
    )

    engine.processCitationCluster(
      firstCluster,
      [],
      [],
    )

    return renderCitationCluster(
      engine,
      entry,
      2,
      [[firstCluster.citationID, 1]],
    )
  }

  return renderCitationCluster(
    engine,
    entry,
    1,
  )
}

function tryCitationJs(
  item,
  style,
  outputType,
  options = {},
) {
  try {
    return formatWithCiteproc(
      item,
      style,
      outputType,
      options,
    )
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn(
        `CSL could not format ${style} (${outputType}); using Scholarory's compatibility formatter.`,
        error,
      )
    }

    return ''
  }
}

export function generateCitation(
  item,
  style = 'turabian',
  options = {},
) {
  if (!item) return ''

  const citationJsOutput = tryCitationJs(
    item,
    style,
    'bibliography',
    options,
  )

  return (
    citationJsOutput ||
    generateManualCitation(
      item,
      style,
    )
  )
}

export function generateInTextCitation(
  item,
  style = 'apa',
  options = {},
) {
  if (!item) return ''

  const citationJsOutput = tryCitationJs(
    item,
    style,
    'citation',
    options,
  )

  if (citationJsOutput) {
    return citationJsOutput
  }

  const author = formatShortFootnoteAuthor(
    getAuthors(item),
  )
  const year = clean(
    getField(item, [
      'publicationDate',
      'year',
      'date',
    ]),
  )
  const locator = clean(
    options.locator ||
      options.page ||
      options.pages,
  )

  return `(${[
    author,
    year,
    locator,
  ].filter(Boolean).join(', ')})`
}

export function generateFullFootnote(
  item,
  style = 'turabian',
  options = {},
) {
  if (!item) return ''

  const definition = getCitationStyleDefinition(style)

  if (definition.mode !== 'note') {
    return generateInTextCitation(
      item,
      style,
      options,
    )
  }

  const citationJsOutput = tryCitationJs(
    item,
    style,
    'citation',
    options,
  )

  return (
    citationJsOutput ||
    generateManualFullFootnote({
      ...item,
      locator:
        options.locator ||
        options.page ||
        options.pages ||
        item.locator,
    }, style)
  )
}

export function generateShortFootnote(
  item,
  style = 'turabian',
  options = {},
) {
  if (!item) return ''

  const definition = getCitationStyleDefinition(style)

  if (definition.mode !== 'note') {
    return generateInTextCitation(
      item,
      style,
      options,
    )
  }

  const citationJsOutput = tryCitationJs(
    item,
    style,
    'short-note',
    options,
  )

  return (
    citationJsOutput ||
    generateManualShortFootnote({
      ...item,
      locator:
        options.locator ||
        options.page ||
        options.pages ||
        item.locator,
    }, style)
  )
}

export function generateCitationSet(
  item,
  options = {},
) {
  return {
    turabianBibliography:
      generateCitation(
        item,
        'turabian',
        options,
      ),
    turabianFootnote:
      generateFullFootnote(
        item,
        'turabian',
        options,
      ),
    turabianShortNote:
      generateShortFootnote(
        item,
        'turabian',
        options,
      ),
    chicagoBibliography:
      generateCitation(
        item,
        'chicago',
        options,
      ),
    chicagoFootnote:
      generateFullFootnote(
        item,
        'chicago',
        options,
      ),
    chicagoShortNote:
      generateShortFootnote(
        item,
        'chicago',
        options,
      ),
    apa:
      generateCitation(
        item,
        'apa',
        options,
      ),
    apaInText:
      generateInTextCitation(
        item,
        'apa',
        options,
      ),
    mla:
      generateCitation(
        item,
        'mla',
        options,
      ),
    mlaInText:
      generateInTextCitation(
        item,
        'mla',
        options,
      ),
    harvard:
      generateCitation(
        item,
        'harvard',
        options,
      ),
    harvardInText:
      generateInTextCitation(
        item,
        'harvard',
        options,
      ),
    vancouver:
      generateCitation(
        item,
        'vancouver',
        options,
      ),
    vancouverInText:
      generateInTextCitation(
        item,
        'vancouver',
        options,
      ),
  }
}

export { generateManualCitationSet }