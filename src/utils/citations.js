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

export function generateCitation(item, style = 'turabian') {
  if (!item) return ''

  const normalizedStyle = normalizeStyle(style)

  if (normalizedStyle.includes('footnote') && !normalizedStyle.includes('short')) {
    return generateFullFootnote(item, normalizedStyle)
  }

  if (normalizedStyle.includes('short')) {
    return generateShortFootnote(item, normalizedStyle)
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

export function generateFullFootnote(item, style = 'turabian') {
  if (!item) return ''

  const sourceType = getSourceType(item)

  if (sourceType === 'book') return generateBookFullFootnote(item)
  if (sourceType === 'article') return generateArticleFullFootnote(item)
  if (sourceType === 'website') return generateWebsiteFullFootnote(item)

  return generateGenericFullFootnote(item)
}

export function generateShortFootnote(item, style = 'turabian') {
  if (!item) return ''

  const sourceType = getSourceType(item)

  if (sourceType === 'book') return generateBookShortFootnote(item)
  if (sourceType === 'article') return generateArticleShortFootnote(item)
  if (sourceType === 'website') return generateWebsiteShortFootnote(item)

  return generateGenericShortFootnote(item)
}

export function generateCitationSet(item) {
  return {
    turabianBibliography: generateCitation(item, 'turabian-bibliography'),
    turabianFootnote: generateFullFootnote(item, 'turabian-footnote'),
    turabianShortNote: generateShortFootnote(item, 'turabian-short-note'),
    chicagoBibliography: generateCitation(item, 'chicago-bibliography'),
    chicagoFootnote: generateFullFootnote(item, 'chicago-footnote'),
    chicagoShortNote: generateShortFootnote(item, 'chicago-short-note'),
    apa: generateCitation(item, 'apa'),
    mla: generateCitation(item, 'mla'),
  }
}