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

function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false

  if (Array.isArray(value)) {
    return value.some(hasMeaningfulValue)
  }

  if (typeof value === 'object') {
    return Object.values(value).some(hasMeaningfulValue)
  }

  return clean(value) !== ''
}

function mergeMetadata(rawMetadata = {}, normalizedMetadata = {}) {
  const merged = {
    ...(rawMetadata || {}),
  }

  Object.entries(normalizedMetadata || {}).forEach(
    ([key, value]) => {
      if (hasMeaningfulValue(value)) {
        merged[key] = value
      }
    },
  )

  return merged
}

function getMetadataAlias(metadata = {}, keys = [], fallback = '') {
  for (const key of keys) {
    const value = metadata?.[key]

    if (hasMeaningfulValue(value)) {
      return value
    }
  }

  return fallback
}

function joinTitleAndSubtitle(titleValue, subtitleValue) {
  const title = clean(titleValue)
  const subtitle = clean(subtitleValue)

  if (!subtitle) {
    return title.replace(/:\s*$/, '')
  }

  if (
    title.toLowerCase().includes(
      subtitle.toLowerCase(),
    )
  ) {
    return title
  }

  const cleanTitle = title.replace(/[:;]\s*$/, '')
  return `${cleanTitle}: ${subtitle}`
}

function getTitle(item = {}) {
  const title = getField(
    item,
    ['title', 'articleTitle', 'name'],
    'Untitled',
  )

  const subtitle = getField(
    item,
    ['subtitle'],
    '',
  )

  return joinTitleAndSubtitle(
    title,
    subtitle,
  )
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
        middleName: '',
        initial: '',
        lastName: parts[0],
        suffix: '',
      }
    }

    return {
      firstName: parts.slice(0, -1).join(' '),
      middleName: '',
      initial: '',
      lastName: parts[parts.length - 1],
      suffix: '',
    }
  }

  const literal = clean(
    person.literal ||
      person.raw ||
      (
        person.creatorType === 'literal'
          ? person.name
          : ''
      ),
  )

  if (literal) {
    return { raw: literal }
  }

  let firstName = clean(
    person.firstName ||
      person.given,
  )

  const middleName = clean(
    person.middleName ||
      person.middle,
  )

  const initial = clean(
    person.initial,
  )

  let lastName = clean(
    person.lastName ||
      person.family,
  )

  const suffix = clean(
    person.suffix,
  )

  const placeholderLastNames = new Set([
    'unknown',
    'n/a',
    'na',
    'none',
  ])

  if (
    firstName &&
    placeholderLastNames.has(
      lastName.toLowerCase(),
    )
  ) {
    lastName = firstName
    firstName = ''
  }

  if (firstName && !lastName) {
    lastName = firstName
    firstName = ''
  }

  if (
    !firstName &&
    !middleName &&
    !initial &&
    !lastName
  ) {
    return null
  }

  return {
    firstName,
    middleName,
    initial,
    lastName,
    suffix,
    nameParticle: clean(
      person.nameParticle ||
        person.particle ||
        person['non-dropping-particle'],
    ),
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
    normalized.middleName,
    normalized.initial,
    normalized.lastName,
    normalized.suffix,
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
    normalized.middleName,
    normalized.initial,
  ].filter(Boolean)

  if (!firstParts.length) {
    return normalized.lastName
  }

  return `${normalized.lastName}, ${firstParts.join(' ')}${
    normalized.suffix
      ? `, ${normalized.suffix}`
      : ''
  }`
}

function formatBibliographyAuthors(authors = []) {
  const people = normalizePeople(authors)
  if (!people.length) return 'Author Unknown'

  if (people.length === 1) {
    return formatPersonLastFirst(people[0])
  }

  if (people.length === 2) {
    return `${formatPersonLastFirst(people[0])}, and ${formatPersonFullName(people[1])}`
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
    return `${formatPersonLastFirst(people[0])}, and ${formatPersonFullName(people[1])}`
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
    formatApaInitials(normalized.middleName),
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
  const type = clean(
    item.type ||
      metadata.type ||
      item.sourceType ||
      metadata.sourceType,
  ).toLowerCase()

  if (type.includes('dissertation')) return 'dissertation'
  if (type.includes('thesis')) return 'thesis'
  if (type.includes('article')) return 'article'
  if (type.includes('video')) return 'video'
  if (type.includes('podcast')) return 'podcast'
  if (type.includes('blog')) return 'blog'
  if (type.includes('website') || type.includes('web')) return 'website'
  if (type.includes('journal')) return 'journal'
  if (type.includes('book')) return 'book'

  const journalTitle = getField(item, [
    'publicationTitle',
    'journalTitle',
    'journalName',
    'journal',
    'publication',
  ])

  if (journalTitle) return 'article'

  const institution = getField(item, [
    'institution',
    'university',
  ])
  const degree = getField(item, ['degree'])

  if (institution || degree) return 'dissertation'

  const platform = getField(item, ['platform'])
  if (platform) return 'video'

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

function cleanUrl(value) {
  const text = clean(value)
  if (!text) return ''

  try {
    const url = new URL(text)
    const removableParameters = [
      'fbclid',
      'gclid',
      'mc_cid',
      'mc_eid',
      'ref',
      'source',
    ]

    for (const key of [...url.searchParams.keys()]) {
      if (
        key.toLowerCase().startsWith('utm_') ||
        removableParameters.includes(
          key.toLowerCase(),
        )
      ) {
        url.searchParams.delete(key)
      }
    }

    return url.toString()
  } catch {
    return text
  }
}

function getAccessText(item = {}) {
  const doi = getField(item, ['doi'])
  if (doi) return normalizeDoi(doi)

  return cleanUrl(
    getField(item, ['url', 'website', 'link']),
  )
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
    ], ''),
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
    ], ''),
  )
}

function getWebsiteDate(item = {}) {
  return clean(
    getField(item, [
      'publicationDate',
      'publishedDate',
      'date',
      'year',
    ]),
  )
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


function getCanonicalMetadata(item = {}) {
  const typeId = clean(
    item.type ||
      item.sourceType ||
      item.metadata?.type,
  )

  const rawMetadata =
    item.metadata || item

  return mergeMetadata(
    rawMetadata,
    normalizeResearchMetadata(
      typeId,
      rawMetadata,
    ),
  )
}

function getCanonicalField(
  item = {},
  keys = [],
  fallback = '',
) {
  const metadata =
    getCanonicalMetadata(item)

  return getMetadataAlias(
    metadata,
    keys,
    fallback,
  )
}

function sentenceCaseTitle(value) {
  const text = clean(value)
  if (!text) return ''

  const preservedWords = new Set([
    'Arizona',
    'Bible',
    'Biblical',
    'Christian',
    'Christianity',
    'Constitution',
    'Christ',
    'God',
    'Jesus',
    'Holy',
    'House',
    'Spirit',
    'YouTube',
    'ProQuest',
    'WestBow',
  ])

  const words = text.split(/(\s+)/)
  let capitalizeNext = true

  return words
    .map((word) => {
      if (/^\s+$/.test(word)) {
        return word
      }

      const coreMatch = word.match(
        /^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/,
      )

      const prefix = coreMatch?.[1] || ''
      const core = coreMatch?.[2] || word
      const suffix = coreMatch?.[3] || ''

      if (
        preservedWords.has(core) ||
        /^[A-Z0-9]{2,}$/.test(core) ||
        /^(https?:|doi:)/i.test(core)
      ) {
        capitalizeNext = /[:?!]$/.test(word)
        return word
      }

      const lower = core.toLowerCase()
      const transformed =
        capitalizeNext && lower
          ? `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`
          : lower

      capitalizeNext = /[:?!]$/.test(word)
      return `${prefix}${transformed}${suffix}`
    })
    .join('')
}

function formatApaDate(value) {
  const [year, month, day] =
    getDateParts(value)

  if (!year) return clean(value)
  if (!month) return String(year)
  if (!day) {
    return `${year}, ${LONG_MONTH_NAMES[month]}`
  }

  return `${year}, ${LONG_MONTH_NAMES[month]} ${day}`
}

function formatApaAuthorsForEntry(authors) {
  return stripFinalPeriod(
    formatApaAuthors(authors),
  )
}

function formatVancouverAuthors(authors = []) {
  return normalizePeople(authors)
    .map((person) => {
      const normalized = normalizePerson(person)

      if (!normalized) return ''
      if (normalized.raw) return normalized.raw

      const initials = formatApaInitials([
        normalized.firstName,
        normalized.middleName,
        normalized.initial,
      ].filter(Boolean).join(' '))
        .replace(/\./g, '')
        .replace(/\s+/g, '')

      return `${normalized.lastName || ''}${
        initials ? ` ${initials}` : ''
      }`.trim()
    })
    .filter(Boolean)
    .join(', ')
}

function titleWithSentencePunctuation(value) {
  const text = escapeHtml(
    sentenceCaseTitle(value),
  )

  return /[.!?]$/.test(text)
    ? text
    : `${text}.`
}

function quoteTitleForNote(value) {
  const title = clean(value)
  if (!title) return ''

  if (/[!?]$/.test(title)) {
    return `“${escapeHtml(title)}”`
  }

  return `“${escapeHtml(
    title.replace(/\.$/, ''),
  )},”`
}

function quoteTitleForCitation(
  value,
  terminal = '.',
) {
  const title = clean(value)
  if (!title) return ''

  const hasTerminal = /[.!?]$/.test(title)
  const finalTitle = hasTerminal
    ? title
    : `${title}${terminal}`

  return `“${escapeHtml(finalTitle)}”`
}

function getPublicationDateValue(item = {}) {
  return clean(
    getCanonicalField(item, [
      'publicationDate',
      'publishedDate',
      'date',
    ]),
  )
}

function getPublicationYearValue(item = {}) {
  const explicitYear = clean(
    getCanonicalField(item, [
      'publicationYear',
      'year',
    ]),
  )

  if (explicitYear) {
    return (
      explicitYear.match(/\b\d{4}\b/)?.[0] ||
      explicitYear
    )
  }

  return getYearFromDate(
    getPublicationDateValue(item),
  )
}

function getPublicationSeasonValue(item = {}) {
  const season = clean(
    getCanonicalField(item, [
      'publicationSeason',
      'season',
      'issueSeason',
    ]),
  )

  if (!season) {
    return ''
  }

  return (
    season.charAt(0).toUpperCase() +
    season.slice(1).toLowerCase()
  )
}

function getPublicationPeriodValue(item = {}) {
  const fullDate =
    getPublicationDateValue(item)

  if (fullDate) {
    return fullDate
  }

  return [
    getPublicationSeasonValue(item),
    getPublicationYearValue(item),
  ]
    .filter(Boolean)
    .join(' ')
}

function getAccessedDateValue(item = {}) {
  return clean(
    getCanonicalField(item, [
      'accessedDate',
      'accessDate',
      'dateAccessed',
    ]),
  )
}

function getDateParts(value) {
  return parseDateParts(value) || []
}

const LONG_MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const SHORT_MONTH_NAMES = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const MLA_MONTH_NAMES = [
  '',
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May',
  'June',
  'July',
  'Aug.',
  'Sept.',
  'Oct.',
  'Nov.',
  'Dec.',
]

function formatLongDate(value) {
  const [year, month, day] =
    getDateParts(value)

  if (!year) return clean(value)
  if (!month) return String(year)
  if (!day) {
    return `${LONG_MONTH_NAMES[month]} ${year}`
  }

  return `${LONG_MONTH_NAMES[month]} ${day}, ${year}`
}

function formatMlaDate(value) {
  const [year, month, day] =
    getDateParts(value)

  if (!year) return clean(value)
  if (!month) return String(year)
  if (!day) {
    return `${MLA_MONTH_NAMES[month]} ${year}`
  }

  return `${day} ${MLA_MONTH_NAMES[month]} ${year}`
}

function formatHarvardAccessDate(value) {
  const [year, month, day] =
    getDateParts(value)

  if (!year) return clean(value)
  if (!month) return String(year)
  if (!day) {
    return `${LONG_MONTH_NAMES[month]} ${year}`
  }

  return `${day} ${LONG_MONTH_NAMES[month]} ${year}`
}

function formatVancouverDate(value) {
  const [year, month, day] =
    getDateParts(value)

  if (!year) return clean(value)
  if (!month) return String(year)
  if (!day) {
    return `${year} ${SHORT_MONTH_NAMES[month]}`
  }

  return `${year} ${SHORT_MONTH_NAMES[month]} ${day}`
}

function getYear(item = {}) {
  return getPublicationYearValue(item)
}

function getJournalTitle(item = {}) {
  return clean(
    getCanonicalField(item, [
      'publicationTitle',
      'journalTitle',
      'journalName',
      'journal',
      'periodical',
      'publication',
      'containerTitle',
    ]),
  )
}

function getSiteName(item = {}) {
  return clean(
    getCanonicalField(item, [
      'siteName',
      'websiteName',
      'blogName',
      'publicationTitle',
      'containerTitle',
      'publication',
      'publisher',
    ]),
  )
}

function getVideoPlatform(item = {}) {
  return clean(
    getCanonicalField(item, [
      'platform',
      'channelName',
      'siteName',
      'websiteName',
      'publicationTitle',
      'containerTitle',
    ]),
  )
}

function getInstitution(item = {}) {
  return clean(
    getCanonicalField(item, [
      'institution',
      'university',
      'school',
      'publisher',
    ]),
  )
}

function getRepository(item = {}) {
  return clean(
    getCanonicalField(item, [
      'repository',
      'database',
      'libraryCatalog',
      'archive',
    ]),
  )
}

function getPublicationNumber(item = {}) {
  return clean(
    getCanonicalField(item, [
      'publicationNumber',
      'documentNumber',
      'number',
    ]),
  )
}

function getDegreeValue(item = {}) {
  return clean(
    getCanonicalField(item, [
      'degree',
      'genre',
      'type',
    ]),
  )
}

function getDegreeLabels(item = {}) {
  const value = getDegreeValue(item)
    .toLowerCase()

  if (
    value.includes('master') ||
    value.includes('m.a') ||
    value.includes('m.s')
  ) {
    return {
      turabian: "master's thesis",
      apa: "Master's thesis",
      mla: "master's thesis",
      harvard: "Master's thesis",
      vancouver: "master's thesis",
    }
  }

  return {
    turabian: 'PhD diss.',
    apa: 'Doctoral dissertation',
    mla: 'PhD dissertation',
    harvard: 'PhD thesis',
    vancouver: 'doctoral dissertation',
  }
}

function getLocatorText(
  item = {},
  options = {},
) {
  return clean(
    options.locator ||
      options.page ||
      options.pages ||
      item.locator ||
      getField(item, [
        'citedPages',
        'citationPage',
      ]),
  )
}

function formatDoiForVancouver(item = {}) {
  return clean(
    getCanonicalField(item, [
      'doi',
      'DOI',
    ]),
  )
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
}

function generateAuditedBook(
  item,
  style,
  outputType,
  options = {},
) {
  const authors = getAuthors(item)
  const title = getTitle(item)
  const shortTitle = getShortTitle(item)
  const place = clean(
    getCanonicalField(item, [
      'placeOfPublication',
      'publicationPlace',
      'place',
    ]),
  )
  const publisher = clean(
    getCanonicalField(item, ['publisher']),
  )
  const year = getYear(item)
  const edition = clean(
    getCanonicalField(item, ['edition']),
  )
  const locator = getLocatorText(
    item,
    options,
  )

  if (outputType === 'full-note') {
    const publication = [
      [place, publisher]
        .filter(Boolean)
        .join(': '),
      year,
    ]
      .filter(Boolean)
      .join(', ')

    return `${formatFootnoteAuthors(authors)}, ${italic(title)}${
      edition
        ? `, ${escapeHtml(edition)}`
        : ''
    }${
      publication
        ? ` (${escapeHtml(publication)})`
        : ''
    }${locator ? `, ${escapeHtml(locator)}` : ''}.`
  }

  if (outputType === 'short-note') {
    return `${formatShortFootnoteAuthor(authors)}, ${italic(shortTitle)}${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }.`
  }

  if (style === 'apa') {
    return `${formatApaAuthorsForEntry(authors)}. (${year || 'n.d.'}). ${italic(
      sentenceCaseTitle(title),
    )}.${publisher ? ` ${escapeHtml(publisher)}.` : ''}`
  }

  if (style === 'mla') {
    return [
      `${ensurePeriod(formatMlaAuthors(authors))}`,
      `${italic(title)}.`,
      edition ? `${escapeHtml(edition)}.` : '',
      [publisher, year]
        .filter(Boolean)
        .map(escapeHtml)
        .join(', ') +
        (publisher || year ? '.' : ''),
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (style === 'harvard') {
    const publication = [place, publisher]
      .filter(Boolean)
      .join(': ')

    return `${formatApaAuthors(authors)
      .replace(/, & /g, ' and ')
      .replace(/ & /g, ' and ')} (${year || 'no date'}) ${italic(title)}.${
      publication
        ? ` ${escapeHtml(publication)}.`
        : ''
    }`
  }

  if (style === 'vancouver') {
    const publication = [place, publisher]
      .filter(Boolean)
      .join(': ')

    return `1. ${formatVancouverAuthors(authors)}. ${escapeHtml(title)}.${
      publication
        ? ` ${escapeHtml(publication)}`
        : ''
    }${year ? `; ${year}` : ''}.`
  }

  const publicationText = [
    [place, publisher]
      .filter(Boolean)
      .join(': '),
    year,
  ]
    .filter(Boolean)
    .join(', ')

  return `${ensurePeriod(formatBibliographyAuthors(authors))} ${italic(title)}.${
    edition
      ? ` ${ensurePeriod(escapeHtml(edition))}`
      : ''
  }${publicationText ? ` ${escapeHtml(publicationText)}.` : ''}`
}

function generateAuditedArticle(
  item,
  style,
  outputType,
  options = {},
) {
  const authors = getAuthors(item)
  const title = getTitle(item)
  const shortTitle = getShortTitle(item)
  const journal = getJournalTitle(item)
  const volume = clean(
    getCanonicalField(item, ['volume']),
  )
  const issue = clean(
    getCanonicalField(item, ['issue', 'number']),
  )
  const pages = normalizePages(
    getCanonicalField(item, [
      'pages',
      'pageRange',
    ]),
  )
  const year = getYear(item)
  const publicationSeason =
    getPublicationSeasonValue(item)
  const publicationPeriod = [
    publicationSeason,
    year,
  ]
    .filter(Boolean)
    .join(' ')
  const doiUrl = getAccessText(item)
  const doi = formatDoiForVancouver(item)
  const locator = getLocatorText(
    item,
    options,
  )

  const journalDetails = `${journal ? ` ${italic(journal)}` : ''}${
    volume ? ` ${escapeHtml(volume)}` : ''
  }${issue ? `, no. ${escapeHtml(issue)}` : ''}${
    publicationPeriod
      ? ` (${escapeHtml(publicationPeriod)})`
      : ''
  }${pages ? `: ${escapeHtml(pages)}` : ''}`

  if (outputType === 'full-note') {
    return `${formatFootnoteAuthors(authors)}, ${quoteTitleForNote(
      title,
    )}${journalDetails}${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }${doiUrl ? `, ${escapeHtml(doiUrl)}` : ''}.`
  }

  if (outputType === 'short-note') {
    return `${formatShortFootnoteAuthor(authors)}, ${quoteTitleForCitation(
      shortTitle,
    )}${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }`
  }

  if (style === 'apa') {
    const volumeIssue = volume
      ? `${escapeHtml(volume)}${issue ? `(${escapeHtml(issue)})` : ''}`
      : issue
        ? `(${escapeHtml(issue)})`
        : ''

    return `${formatApaAuthorsForEntry(authors)}. (${year || 'n.d.'}). ${titleWithSentencePunctuation(
      title,
    )} ${journal ? `<em>${escapeHtml(journal)}${
      volume ? `, ${escapeHtml(volume)}` : ''
    }</em>` : ''}${issue ? `(${escapeHtml(issue)})` : ''}${
      pages ? `, ${escapeHtml(pages)}` : ''
    }.${doiUrl ? ` ${escapeHtml(doiUrl)}` : ''}`
  }

  if (style === 'mla') {
    const details = [
      journal ? italic(journal) : '',
      volume ? `vol. ${escapeHtml(volume)}` : '',
      issue ? `no. ${escapeHtml(issue)}` : '',
      publicationPeriod || year,
      pages ? formatMlaPages(pages) : '',
    ].filter(Boolean)

    return `${ensurePeriod(formatMlaAuthors(authors))} ${quoteTitleForCitation(title)} ${details.join(', ')}.${
      doiUrl ? ` ${escapeHtml(doiUrl)}.` : ''
    }`
  }

  if (style === 'harvard') {
    return `${formatApaAuthors(authors)
      .replace(/, & /g, ' and ')
      .replace(/ & /g, ' and ')} (${year || 'no date'}) ‘${escapeHtml(
      title,
    )}’, ${journal ? `${italic(journal)}, ` : ''}${
      volume ? escapeHtml(volume) : ''
    }${issue ? `(${escapeHtml(issue)})` : ''}${
      pages ? `, pp. ${escapeHtml(pages)}` : ''}.${
      doiUrl ? ` Available at: ${escapeHtml(doiUrl)}.` : ''
    }`
  }

  if (style === 'vancouver') {
    const authorText =
      formatVancouverAuthors(authors)

    return `1. ${authorText}. ${titleWithSentencePunctuation(title)}${
      journal ? ` ${escapeHtml(journal)}.` : ''
    }${year ? ` ${year}` : ''}${volume ? `;${escapeHtml(volume)}` : ''}${
      issue ? `(${escapeHtml(issue)})` : ''
    }${pages ? `:${escapeHtml(pages).replace(/(\d+)–(\d+)/g, '$1–$2')}` : ''}.${
      doi ? ` doi:${escapeHtml(doi)}.` : ''
    }`
  }

  return `${ensurePeriod(formatBibliographyAuthors(authors))} ${quoteTitleForCitation(
    title,
  )}${journalDetails}${doiUrl ? `. ${escapeHtml(doiUrl)}` : ''}.`
}

function generateAuditedDissertation(
  item,
  style,
  outputType,
  options = {},
) {
  const authors = getAuthors(item)
  const title = getTitle(item)
  const shortTitle = getShortTitle(item)
  const institution = getInstitution(item)
  const repository = getRepository(item)
  const publicationNumber =
    getPublicationNumber(item)
  const year = getYear(item)
  const degree = getDegreeLabels(item)
  const url = getAccessText(item)
  const locator = getLocatorText(
    item,
    options,
  )

  if (outputType === 'full-note') {
    return `${formatFootnoteAuthors(authors)}, ${quoteTitleForCitation(
      title,
      '',
    )} (${degree.turabian}${
      institution
        ? `, ${escapeHtml(institution)}`
        : ''
    }${year ? `, ${year}` : ''})${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }.`
  }

  if (outputType === 'short-note') {
    return `${formatShortFootnoteAuthor(authors)}, ${quoteTitleForCitation(
      shortTitle,
    )}${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }`
  }

  if (style === 'apa') {
    return `${formatApaAuthorsForEntry(authors)}. (${year || 'n.d.'}). ${italic(
      sentenceCaseTitle(title),
    )}${publicationNumber ? ` (Publication No. ${escapeHtml(publicationNumber)})` : ''} [${degree.apa}${
      institution
        ? `, ${escapeHtml(institution)}`
        : ''
    }].${repository ? ` ${escapeHtml(repository)}.` : ''}${
      url ? ` ${escapeHtml(url)}` : ''
    }`
  }

  if (style === 'mla') {
    return `${ensurePeriod(formatMlaAuthors(authors))} ${quoteTitleForCitation(title)} ${
      year ? `${year}. ` : ''
    }${institution ? `${escapeHtml(institution)}, ` : ''}${degree.mla}.${
      repository ? ` ${italic(repository)}.` : ''
    }${url ? ` ${escapeHtml(url)}.` : ''}`
  }

  if (style === 'harvard') {
    return `${formatApaAuthors(authors)
      .replace(/, & /g, ' and ')
      .replace(/ & /g, ' and ')} (${year || 'no date'}) ${italic(title)}. ${degree.harvard}.${
      institution ? ` ${escapeHtml(institution)}.` : ''
    }${url ? ` Available at: ${escapeHtml(url)}.` : ''}`
  }

  if (style === 'vancouver') {
    const authorText =
      formatVancouverAuthors(authors)

    return `1. ${authorText}. ${escapeHtml(title)} [${degree.vancouver}].${
      institution ? ` ${escapeHtml(institution)}` : ''
    }${year ? `; ${year}` : ''}.${
      publicationNumber
        ? ` Publication No.: ${escapeHtml(publicationNumber)}.`
        : ''
    }${repository ? ` Available from: ${escapeHtml(repository)}.` : ''}${
      url ? ` ${escapeHtml(url)}.` : ''
    }`
  }

  return `${ensurePeriod(formatBibliographyAuthors(authors))} ${quoteTitleForCitation(
    title,
  )} ${degree.turabian}${
    institution
      ? `, ${escapeHtml(institution)}`
      : ''
  }${year ? `, ${year}` : ''}.${
    repository ? ` ${escapeHtml(repository)}.` : ''
  }${url ? ` ${escapeHtml(url)}.` : ''}`
}

function generateAuditedWebsite(
  item,
  style,
  outputType,
  options = {},
) {
  const authors = getAuthors(item)
  const title = getTitle(item)
  const shortTitle = getShortTitle(item)
  const siteName = getSiteName(item)
  const publicationDate =
    getPublicationDateValue(item)
  const accessedDate =
    getAccessedDateValue(item)
  const year = getYear(item)
  const url = getAccessText(item)
  const locator = getLocatorText(
    item,
    options,
  )

  const noteDateText = publicationDate
    ? formatLongDate(publicationDate)
    : accessedDate
      ? `accessed ${formatLongDate(accessedDate)}`
      : ''

  if (outputType === 'full-note') {
    return `${formatFootnoteAuthors(authors)}, ${quoteTitleForNote(
      title,
    )}${siteName ? ` ${italic(siteName)}` : ''}${
      noteDateText
        ? `, ${escapeHtml(noteDateText)}`
        : ''
    }${locator ? `, ${escapeHtml(locator)}` : ''}${
      url ? `, ${escapeHtml(url)}` : ''
    }.`
  }

  if (outputType === 'short-note') {
    return `${formatShortFootnoteAuthor(authors)}, ${quoteTitleForCitation(
      shortTitle,
    )}${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }`
  }

  if (style === 'apa') {
    const apaDate = publicationDate
      ? formatApaDate(publicationDate)
      : 'n.d.'

    return `${formatApaAuthorsForEntry(authors)}. (${apaDate}). ${titleWithSentencePunctuation(
      title,
    )} ${siteName ? `${italic(siteName)}. ` : ''}${escapeHtml(url)}`
  }

  if (style === 'mla') {
    return `${ensurePeriod(formatMlaAuthors(authors))} ${quoteTitleForCitation(title)}${
      siteName ? ` ${italic(siteName)},` : ''
    }${publicationDate ? ` ${escapeHtml(formatMlaDate(publicationDate))},` : ''}${
      url ? ` ${escapeHtml(url)}.` : ''
    }${accessedDate ? ` Accessed ${escapeHtml(formatMlaDate(accessedDate))}.` : ''}`
  }

  if (style === 'harvard') {
    return `${formatApaAuthors(authors)
      .replace(/, & /g, ' and ')
      .replace(/ & /g, ' and ')} (${year || 'no date'}) ${italic(title)}.${
      siteName ? ` ${italic(siteName)}.` : ''
    }${url ? ` Available at: ${escapeHtml(url)}` : ''}${
      accessedDate
        ? ` (Accessed: ${escapeHtml(formatHarvardAccessDate(accessedDate))}).`
        : '.'
    }`
  }

  if (style === 'vancouver') {
    const authorText =
      formatVancouverAuthors(authors)

    return `1. ${authorText}. ${titleWithSentencePunctuation(title)}${
      siteName ? ` ${escapeHtml(siteName)}` : ''
    } [Internet].${publicationDate ? ` ${escapeHtml(formatVancouverDate(publicationDate))}` : ''}${
      accessedDate
        ? ` [cited ${escapeHtml(formatVancouverDate(accessedDate))}]`
        : ''
    }.${url ? ` Available from: ${escapeHtml(url)}.` : ''}`
  }

  return `${ensurePeriod(formatBibliographyAuthors(authors))} ${quoteTitleForCitation(
    title,
  )}${siteName ? ` ${italic(siteName)}` : ''}${
    noteDateText
      ? `, ${escapeHtml(noteDateText)}`
      : ''
  }.${url ? ` ${escapeHtml(url)}.` : ''}`
}

function generateAuditedVideo(
  item,
  style,
  outputType,
  options = {},
) {
  const authors = getAuthors(item)
  const title = getTitle(item)
  const shortTitle = getShortTitle(item)
  const platform = getVideoPlatform(item)
  const publicationDate =
    getPublicationDateValue(item)
  const accessedDate =
    getAccessedDateValue(item)
  const year = getYear(item)
  const url = getAccessText(item)
  const locator = getLocatorText(
    item,
    options,
  )

  if (outputType === 'full-note') {
    return `${formatFootnoteAuthors(authors)}, ${quoteTitleForCitation(
      title,
      '',
    )}${platform ? `, ${escapeHtml(platform)} video` : ', video'}${
      publicationDate
        ? `, ${escapeHtml(formatLongDate(publicationDate))}`
        : ''
    }${locator ? `, ${escapeHtml(locator)}` : ''}${
      url ? `, ${escapeHtml(url)}` : ''
    }.`
  }

  if (outputType === 'short-note') {
    return `${formatShortFootnoteAuthor(authors)}, ${quoteTitleForCitation(
      shortTitle,
    )}${
      locator
        ? `, ${escapeHtml(locator)}`
        : ''
    }`
  }

  if (style === 'apa') {
    return `${formatApaAuthorsForEntry(authors)}. (${publicationDate ? formatApaDate(publicationDate) : 'n.d.'}). ${italic(
      sentenceCaseTitle(title),
    )} [Video].${platform ? ` ${escapeHtml(platform)}.` : ''}${
      url ? ` ${escapeHtml(url)}` : ''
    }`
  }

  if (style === 'mla') {
    return `${ensurePeriod(formatMlaAuthors(authors))} ${quoteTitleForCitation(title)}${
      platform ? ` ${italic(platform)},` : ''
    }${publicationDate ? ` ${escapeHtml(formatMlaDate(publicationDate))},` : ''}${
      url ? ` ${escapeHtml(url)}.` : ''
    }`
  }

  if (style === 'harvard') {
    return `${formatApaAuthors(authors)
      .replace(/, & /g, ' and ')
      .replace(/ & /g, ' and ')} (${year || 'no date'}) ${italic(title)} [Video].${
      platform ? ` ${escapeHtml(platform)}.` : ''
    }${url ? ` Available at: ${escapeHtml(url)}` : ''}${
      accessedDate
        ? ` (Accessed: ${escapeHtml(formatHarvardAccessDate(accessedDate))}).`
        : '.'
    }`
  }

  if (style === 'vancouver') {
    const authorText =
      formatVancouverAuthors(authors)

    return `1. ${authorText}. ${escapeHtml(sentenceCaseTitle(title))} [video on the Internet].${
      platform ? ` ${escapeHtml(platform)}` : ''
    }${publicationDate ? `; ${escapeHtml(formatVancouverDate(publicationDate))}` : ''}${
      accessedDate
        ? ` [cited ${escapeHtml(formatVancouverDate(accessedDate))}]`
        : ''
    }.${url ? ` Available from: ${escapeHtml(url)}.` : ''}`
  }

  return `${ensurePeriod(formatBibliographyAuthors(authors))} ${quoteTitleForCitation(
    title,
  )}${platform ? ` ${escapeHtml(platform)} video.` : ' Video.'}${
    publicationDate
      ? ` ${escapeHtml(formatLongDate(publicationDate))}.`
      : ''
  }${url ? ` ${escapeHtml(url)}.` : ''}`
}

function generateAuditedCitation(
  item,
  style,
  outputType,
  options = {},
) {
  const sourceType = getSourceType(item)
  const normalizedStyle =
    getCitationStyleDefinition(style).id

  if (sourceType === 'book') {
    return generateAuditedBook(
      item,
      normalizedStyle,
      outputType,
      options,
    )
  }

  if (sourceType === 'article') {
    return generateAuditedArticle(
      item,
      normalizedStyle,
      outputType,
      options,
    )
  }

  if (
    sourceType === 'dissertation' ||
    sourceType === 'thesis'
  ) {
    return generateAuditedDissertation(
      item,
      normalizedStyle,
      outputType,
      options,
    )
  }

  if (
    sourceType === 'website' ||
    sourceType === 'blog'
  ) {
    return generateAuditedWebsite(
      item,
      normalizedStyle,
      outputType,
      options,
    )
  }

  if (sourceType === 'video') {
    return generateAuditedVideo(
      item,
      normalizedStyle,
      outputType,
      options,
    )
  }

  return ''
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

const MONTH_NUMBER_BY_NAME = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
}

function validDateParts(year, month, day) {
  const parts = [Number(year)]

  if (month) parts.push(Number(month))
  if (day) parts.push(Number(day))

  return parts
}

function parseDateParts(value) {
  const text = clean(value)
  if (!text) return null

  let match = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  )

  if (match) {
    return validDateParts(
      match[3],
      match[1],
      match[2],
    )
  }

  match = text.match(
    /^(\d{4})(?:[-/](\d{1,2}|[A-Za-z]{3,9}))?(?:[-/](\d{1,2}))?$/,
  )

  if (match) {
    const month = match[2]
      ? MONTH_NUMBER_BY_NAME[
          match[2].toLowerCase()
        ] || Number(match[2])
      : null

    return validDateParts(
      match[1],
      month,
      match[3],
    )
  }

  match = text.match(
    /^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/,
  )

  if (match) {
    return validDateParts(
      match[3],
      MONTH_NUMBER_BY_NAME[
        match[1].toLowerCase()
      ],
      match[2],
    )
  }

  match = text.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/,
  )

  if (match) {
    return validDateParts(
      match[3],
      MONTH_NUMBER_BY_NAME[
        match[2].toLowerCase()
      ],
      match[1],
    )
  }

  match = text.match(
    /^([A-Za-z]{3,9})\s+(\d{4})$/,
  )

  if (match) {
    return validDateParts(
      match[2],
      MONTH_NUMBER_BY_NAME[
        match[1].toLowerCase()
      ],
    )
  }

  return null
}

function buildCslDate(value) {
  const text = clean(value)
  if (!text) return undefined

  const dateParts = parseDateParts(text)

  if (!dateParts) {
    return { literal: text }
  }

  return {
    'date-parts': [dateParts],
  }
}

function getYearFromDate(value) {
  const parts = parseDateParts(value)
  return parts?.[0]
    ? String(parts[0])
    : clean(value).match(/\b(\d{4})\b/)?.[1] || ''
}

function normalizeCslItemType(typeId, suggestedType) {
  const raw = clean(
    suggestedType || typeId,
  ).toLowerCase()

  const aliases = {
    article: 'article-journal',
    'journal article': 'article-journal',
    journal_article: 'article-journal',
    article_journal: 'article-journal',
    journal: 'periodical',
    website: 'webpage',
    web: 'webpage',
    blog: 'post-weblog',
    weblog: 'post-weblog',
    dissertation: 'thesis',
    video: 'motion_picture',
    youtube: 'motion_picture',
    podcast: 'broadcast',
    communication: 'personal_communication',
    conference: 'paper-conference',
    sermon: 'speech',
  }

  return aliases[raw] || raw || 'document'
}

function creatorToCslName(creator) {
  if (!creator) return null

  const normalized =
    normalizePerson(creator)

  if (!normalized) return null

  if (normalized.raw) {
    return {
      literal: normalized.raw,
    }
  }

  const given = [
    normalized.firstName,
    normalized.middleName,
    normalized.initial,
  ]
    .map(clean)
    .filter(Boolean)
    .join(' ')

  const family = clean(
    normalized.lastName,
  )

  const name = {
    given,
    family,
    suffix: clean(
      normalized.suffix,
    ),
    'non-dropping-particle': clean(
      normalized.nameParticle,
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

  const rawMetadata =
    item.metadata || item

  const normalizedMetadata =
    normalizeResearchMetadata(
      typeId,
      rawMetadata,
    )

  const metadata = mergeMetadata(
    rawMetadata,
    normalizedMetadata,
  )

  const sourceType = getSourceType({
    ...item,
    metadata,
  })

  const suggestedCitationType =
    metadata.citationType ||
    getCitationTypeForResearchType(
      typeId,
    ) ||
    sourceType

  const citationType =
    normalizeCslItemType(
      typeId,
      suggestedCitationType,
    )

  const id = clean(item.id) ||
    `scholarory-${Math.random().toString(36).slice(2)}`

  const value = (...keys) => {
    return getMetadataAlias(
      metadata,
      keys,
      '',
    )
  }

  const publicationDate = value(
    'publicationDate',
    'publishedDate',
    'date',
    'publicationYear',
    'year',
  )

  const accessedDate = value(
    'accessedDate',
    'accessDate',
    'dateAccessed',
  )

  let containerTitle = value(
    'publicationTitle',
    'containerTitle',
  )

  if (sourceType === 'article') {
    containerTitle = value(
      'publicationTitle',
      'journalTitle',
      'journalName',
      'journal',
      'periodical',
      'publication',
      'containerTitle',
    )
  }

  if (
    sourceType === 'website' ||
    sourceType === 'blog'
  ) {
    containerTitle = value(
      'siteName',
      'websiteName',
      'blogName',
      'publicationTitle',
      'containerTitle',
    )
  }

  if (
    sourceType === 'video' ||
    sourceType === 'podcast'
  ) {
    containerTitle = value(
      'platform',
      'channelName',
      'siteName',
      'websiteName',
      'publicationTitle',
      'containerTitle',
    )
  }

  let publisher = value('publisher')

  if (
    sourceType === 'dissertation' ||
    sourceType === 'thesis'
  ) {
    publisher = value(
      'institution',
      'university',
      'school',
      'publisher',
    )
  }

  if (
    (sourceType === 'video' ||
      sourceType === 'podcast') &&
    !publisher
  ) {
    publisher = value(
      'platform',
      'siteName',
      'websiteName',
    )
  }

  let genre = value(
    'degree',
    'genre',
    'medium',
    'format',
  )

  if (sourceType === 'video' && !genre) {
    genre = 'Video'
  }

  if (sourceType === 'podcast' && !genre) {
    genre = 'Podcast episode'
  }

  const repository = value(
    'repository',
    'database',
    'libraryCatalog',
    'archive',
  )

  const cslItem = {
    id,
    type: citationType,
    title: getTitle({
      ...item,
      metadata,
    }),
    'title-short': value('shortTitle'),
    'container-title': containerTitle,
    publisher,
    'publisher-place': value(
      'placeOfPublication',
      'publicationPlace',
      'place',
    ),
    issued: buildCslDate(
      publicationDate,
    ),
    accessed: buildCslDate(
      accessedDate,
    ),
    'original-date': buildCslDate(
      value('originalPublicationDate'),
    ),
    edition: value('edition'),
    'collection-title': value(
      'seriesTitle',
      'series',
    ),
    'collection-number': value(
      'seriesNumber',
    ),
    volume: value('volume'),
    'number-of-volumes': value(
      'numberOfVolumes',
    ),
    issue: value('issue', 'number'),
    page: value(
      'pages',
      'pageRange',
    ),
    'number-of-pages': value(
      'pageCount',
      'numberOfPages',
    ),
    ISBN: value('isbn', 'ISBN'),
    ISSN: value('issn', 'ISSN'),
    DOI: clean(value('doi', 'DOI'))
      .replace(/^https?:\/\/doi\.org\//i, '')
      .replace(/^doi:\s*/i, ''),
    URL: cleanUrl(
      value('url', 'website', 'link'),
    ),
    abstract: value('abstract'),
    language: value('language'),
    archive: repository,
    'archive-place': value(
      'archiveLocation',
      'repositoryLocation',
    ),
    'call-number': value('callNumber'),
    source: repository,
    number: value(
      'publicationNumber',
      'documentNumber',
      'episodeNumber',
    ),
    genre,
    medium:
      sourceType === 'video'
        ? ''
        : value('medium'),
    dimensions: value(
      'runningTime',
      'duration',
    ),
    note: buildCslNote(metadata),
  }

  const primaryAuthors =
    getPrimaryAuthors(metadata)

  if (primaryAuthors.length) {
    cslItem.author = primaryAuthors
  }

  Object.entries(
    CSL_NAME_ROLE_MAP,
  ).forEach(
    ([metadataKey, cslRole]) => {
      addNameRole(
        cslItem,
        cslRole,
        metadata[metadataKey],
      )
    },
  )

  if (
    !cslItem.author?.length &&
    cslItem.editor?.length
  ) {
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

    const locatorLabel =
      clean(options.label)

    if (locatorLabel) {
      entry.label = locatorLabel
    } else if (!options.omitLabel) {
      entry.label = 'page'
    }
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

  const auditedOutput =
    generateAuditedCitation(
      item,
      style,
      'bibliography',
      options,
    )

  if (auditedOutput) {
    return auditedOutput
  }

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

function getCitationYear(item = {}) {
  return getYear(item)
}

function getInTextAuthorLabel(
  item,
  style,
) {
  const people = getAuthors(item)
  const normalizedStyle =
    clean(style).toLowerCase()

  if (!people.length) {
    const shortTitle = escapeHtml(
      getShortTitle(item),
    )

    return getSourceType(item) === 'book'
      ? `<em>${shortTitle}</em>`
      : `“${shortTitle}”`
  }

  const familyName = (person) => {
    const normalized = normalizePerson(
      person,
    )

    return clean(
      normalized?.lastName ||
        normalized?.raw ||
        formatPersonFullName(
          normalized,
        ),
    )
  }

  if (people.length === 1) {
    return escapeHtml(
      familyName(people[0]),
    )
  }

  if (people.length === 2) {
    const joiner =
      normalizedStyle === 'apa'
        ? ' & '
        : ' and '

    return people
      .map(familyName)
      .map(escapeHtml)
      .join(joiner)
  }

  return `${escapeHtml(
    familyName(people[0]),
  )} et al.`
}

function formatInTextLocator(
  options = {},
  style = 'apa',
) {
  const locator = clean(
    options.locator ||
      options.page ||
      options.pages,
  )

  if (!locator) return ''

  const label = clean(
    options.label,
  ).toLowerCase()

  if (
    options.omitLabel ||
    label === 'timestamp' ||
    label === 'other'
  ) {
    return locator
  }

  if (clean(style).toLowerCase() === 'mla') {
    const mlaLabels = {
      chapter: 'ch.',
      section: 'sec.',
      paragraph: 'par.',
      line: 'line',
      figure: 'fig.',
      table: 'table',
      verse: 'verse',
      volume: 'vol.',
      issue: 'no.',
    }

    return label === 'page'
      ? locator
      : `${mlaLabels[label] || label} ${locator}`
  }

  const range = /[-–,]/.test(locator)
  const labels = {
    page: range ? 'pp.' : 'p.',
    chapter: 'chap.',
    section: 'sec.',
    paragraph: 'para.',
    line: range ? 'lines' : 'line',
    figure: 'fig.',
    table: 'table',
    verse: range ? 'verses' : 'verse',
    volume: 'vol.',
    issue: 'no.',
  }

  return `${labels[label] || label} ${locator}`
}

function generateAuthorDateInText(
  item,
  style,
  options = {},
) {
  const author = getInTextAuthorLabel(
    item,
    style,
  )
  const year = getCitationYear(item) ||
    (clean(style).toLowerCase() === 'apa'
      ? 'n.d.'
      : 'no date')
  const locator = formatInTextLocator(
    options,
    style,
  )

  if (options.authorOnly) {
    return author
  }

  const parts = []

  if (!options.suppressAuthor) {
    parts.push(author)
  }

  parts.push(year)

  if (locator) {
    parts.push(locator)
  }

  const prefix = clean(options.prefix)
  const suffix = clean(options.suffix)
  const content = parts.join(', ')

  return `(${[
    prefix,
    content,
    suffix,
  ].filter(Boolean).join(' ')})`
}

function generateMlaInText(
  item,
  options = {},
) {
  const author = getInTextAuthorLabel(
    item,
    'mla',
  )
  const locator = formatInTextLocator(
    options,
    'mla',
  )

  if (options.authorOnly) {
    return author
  }

  const parts = []

  if (!options.suppressAuthor) {
    parts.push(author)
  }

  if (locator) {
    parts.push(locator)
  }

  const prefix = clean(options.prefix)
  const suffix = clean(options.suffix)
  const content = parts.join(' ')

  return `(${[
    prefix,
    content,
    suffix,
  ].filter(Boolean).join(' ')})`
}

export function getCitationMetadataWarnings(
  item = {},
) {
  const warnings = []
  const sourceType = getSourceType(item)
  const authors = getAuthors(item)

  if (!clean(getTitle(item))) {
    warnings.push('Add a title.')
  }

  if (!authors.length && !getEditors(item).length) {
    warnings.push('Add an author, creator, or editor.')
  }

  const publicationDate = getField(item, [
    'publicationDate',
    'publishedDate',
    'date',
    'publicationYear',
    'year',
  ])

  if (sourceType === 'book') {
    if (!getField(item, ['publisher'])) {
      warnings.push('Add the publisher.')
    }

    if (!publicationDate) {
      warnings.push('Add the publication year or date.')
    }

    if (
      clean(getField(item, ['title'])).endsWith(':') &&
      !getField(item, ['subtitle'])
    ) {
      warnings.push('The title ends with a colon; add the subtitle or remove the colon.')
    }
  }

  if (sourceType === 'article') {
    if (!getField(item, [
      'publicationTitle',
      'journalTitle',
      'journalName',
      'journal',
    ])) {
      warnings.push('Add the journal title.')
    }

    if (!publicationDate) {
      warnings.push('Add the article publication year or date.')
    }
  }

  if (
    sourceType === 'dissertation' ||
    sourceType === 'thesis'
  ) {
    if (!getField(item, [
      'institution',
      'university',
      'school',
    ])) {
      warnings.push('Add the university or institution.')
    }

    if (!getField(item, ['degree'])) {
      warnings.push('Add the degree or dissertation type.')
    }

    if (!publicationDate) {
      warnings.push('Add the dissertation or thesis year.')
    }
  }

  if (
    sourceType === 'website' ||
    sourceType === 'blog'
  ) {
    if (!getField(item, [
      'siteName',
      'websiteName',
      'blogName',
      'publicationTitle',
      'containerTitle',
      'publication',
      'publisher',
    ])) {
      warnings.push('Add the website or blog name.')
    }

    if (!getField(item, ['url', 'website'])) {
      warnings.push('Add the webpage URL.')
    }
  }

  if (sourceType === 'video') {
    if (!getField(item, [
      'platform',
      'channelName',
      'siteName',
      'websiteName',
      'publicationTitle',
      'containerTitle',
    ])) {
      warnings.push('Add the video platform, such as YouTube.')
    }

    if (!publicationDate) {
      warnings.push('Add the video publication date.')
    }

    if (!getField(item, ['url', 'website'])) {
      warnings.push('Add the video URL.')
    }
  }

  const accessedDate = getField(item, [
    'accessedDate',
    'accessDate',
    'dateAccessed',
  ])

  const accessedParts =
    parseDateParts(accessedDate)

  if (accessedParts?.length === 3) {
    const [year, month, day] =
      accessedParts

    const accessedValue = new Date(
      year,
      month - 1,
      day,
    )

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (accessedValue > today) {
      warnings.push(
        'The accessed date is in the future.',
      )
    }
  }

  return warnings
}

export function generateInTextCitation(
  item,
  style = 'apa',
  options = {},
) {
  if (!item) return ''

  const definition =
    getCitationStyleDefinition(style)
  const normalizedStyle =
    definition.id

  if (definition.mode === 'author-date') {
    return generateAuthorDateInText(
      item,
      normalizedStyle,
      options,
    )
  }

  if (definition.mode === 'author-page') {
    return generateMlaInText(
      item,
      options,
    )
  }

  const citationJsOutput = tryCitationJs(
    item,
    style,
    'citation',
    options,
  )

  if (citationJsOutput) {
    return citationJsOutput
  }

  const author = getInTextAuthorLabel(
    item,
    style,
  )
  const year = getCitationYear(item)
  const locator = formatInTextLocator(
    options,
    style,
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

  const auditedOutput =
    generateAuditedCitation(
      item,
      style,
      'full-note',
      options,
    )

  if (auditedOutput) {
    return auditedOutput
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

  const auditedOutput =
    generateAuditedCitation(
      item,
      style,
      'short-note',
      options,
    )

  if (auditedOutput) {
    return auditedOutput
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

