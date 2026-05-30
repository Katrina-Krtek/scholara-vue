function formatPersonFullName(person) {
  const parts = [
    person.firstName,
    person.initial,
    person.lastName
  ].filter(Boolean)

  return parts.join(' ')
}

function formatPersonLastFirst(person) {
  if (!person?.lastName) {
    return formatPersonFullName(person)
  }

  const firstParts = [
    person.firstName,
    person.initial
  ].filter(Boolean)

  return `${person.lastName}, ${firstParts.join(' ')}`
}

function formatBibliographyAuthors(authors = []) {
  if (!authors.length) return 'Author Unknown'

  if (authors.length === 1) {
    return formatPersonLastFirst(authors[0])
  }

  if (authors.length === 2) {
    return `${formatPersonLastFirst(authors[0])} and ${formatPersonFullName(authors[1])}`
  }

  const [firstAuthor, ...rest] = authors

  return `${formatPersonLastFirst(firstAuthor)}, ${rest
    .map(formatPersonFullName)
    .join(', ')}`
}

function formatFootnoteAuthors(authors = []) {
  if (!authors.length) return 'Author Unknown'

  if (authors.length === 1) {
    return formatPersonFullName(authors[0])
  }

  if (authors.length === 2) {
    return `${formatPersonFullName(authors[0])} and ${formatPersonFullName(authors[1])}`
  }

  return authors.map(formatPersonFullName).join(', ')
}

function formatShortFootnoteAuthor(authors = []) {
  if (!authors.length) return 'Author Unknown'

  if (authors.length === 1) {
    return authors[0].lastName || formatPersonFullName(authors[0])
  }

  if (authors.length === 2) {
    const first = authors[0].lastName || formatPersonFullName(authors[0])
    const second = authors[1].lastName || formatPersonFullName(authors[1])

    return `${first} and ${second}`
  }

  const first = authors[0].lastName || formatPersonFullName(authors[0])

  return `${first} et al.`
}

function getAuthors(item) {
  if (Array.isArray(item.metadata?.authors)) {
    return item.metadata.authors
  }

  if (item.metadata?.author) {
    return [
      {
        firstName: item.metadata.author,
        initial: '',
        lastName: ''
      }
    ]
  }

  return []
}

function generateBookBibliography(item) {
  const metadata = item.metadata || {}
  const authors = getAuthors(item)
  const authorText = formatBibliographyAuthors(authors)

  const title = `<em>${item.title || 'Untitled'}</em>`

  const place = metadata.placeOfPublication || ''
  const publisher = metadata.publisher || ''
  const year = metadata.year || ''

  const publicationParts = [
    place,
    publisher
  ].filter(Boolean)

  const publicationText =
    publicationParts.length || year
      ? `${publicationParts.join(': ')}${publicationParts.length && year ? ', ' : ''}${year}.`
      : ''

  return `${authorText}. ${title}. ${publicationText}`.trim()
}

function generateBookFullFootnote(item) {
  const metadata = item.metadata || {}
  const authors = getAuthors(item)
  const authorText = formatFootnoteAuthors(authors)

  const title = `<em>${item.title || 'Untitled'}</em>`

  const place = metadata.placeOfPublication || ''
  const publisher = metadata.publisher || ''
  const year = metadata.year || ''

  const publicationParts = [
    place,
    publisher
  ].filter(Boolean)

  const publicationText =
    publicationParts.length || year
      ? `(${publicationParts.join(': ')}${publicationParts.length && year ? ', ' : ''}${year})`
      : ''

  return `${authorText}, ${title}${publicationText ? ` ${publicationText}` : ''}.`.trim()
}

function generateBookShortFootnote(item) {
  const authors = getAuthors(item)
  const authorText = formatShortFootnoteAuthor(authors)

  const shortTitle = `<em>${
    item.metadata?.shortTitle ||
    item.title ||
    'Untitled'
  }</em>`

  return `${authorText}, ${shortTitle}.`
}

export function generateCitation(item, style = 'turabian') {
  if (!item) return ''

  if (item.type === 'book') {
    return generateBookBibliography(item)
  }

  const author = item.metadata?.author || 'Author Unknown'
  const title = item.title || 'Untitled'
  const year = item.metadata?.year || ''

  if (year) {
    return `${author}. ${title}. ${year}.`
  }

  return `${author}. ${title}.`
}

export function generateFullFootnote(item, style = 'turabian') {
  if (!item) return ''

  if (item.type === 'book') {
    return generateBookFullFootnote(item)
  }

  const author = item.metadata?.author || 'Author Unknown'
  const title = item.title || 'Untitled'

  return `${author}, ${title}.`
}

export function generateShortFootnote(item, style = 'turabian') {
  if (!item) return ''

  if (item.type === 'book') {
    return generateBookShortFootnote(item)
  }

  const author = item.metadata?.author || 'Author Unknown'
  const title = item.title || 'Untitled'

  return `${author}, ${title}.`
}