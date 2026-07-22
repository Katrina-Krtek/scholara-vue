const USERNAME_KEY = 'scholarory_username'
const FULL_WIDTH_KEY = 'scholarory-full-width'
const CITATION_STYLE_KEY = 'scholarory_citation_style'

export const CITATION_STYLE_OPTIONS = Object.freeze([
  {
    id: 'turabian',
    label: 'Turabian Notes & Bibliography',
    mode: 'note',
  },
  {
    id: 'chicago',
    label: 'Chicago Notes & Bibliography',
    mode: 'note',
  },
  {
    id: 'apa',
    label: 'APA 7th Edition',
    mode: 'author-date',
  },
  {
    id: 'mla',
    label: 'MLA 9th Edition',
    mode: 'author-page',
  },
  {
    id: 'harvard',
    label: 'Harvard',
    mode: 'author-date',
  },
  {
    id: 'vancouver',
    label: 'Vancouver',
    mode: 'numeric',
  },
])

const VALID_CITATION_STYLE_IDS =
  new Set(
    CITATION_STYLE_OPTIONS.map(
      (style) => style.id,
    ),
  )

export function getStoredUsername() {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(
    USERNAME_KEY,
  )
}

export function saveUsername(name) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(
    USERNAME_KEY,
    name,
  )
}

export function getFullWidth() {
  if (typeof window === 'undefined') {
    return true
  }

  const value =
    localStorage.getItem(
      FULL_WIDTH_KEY,
    )

  if (value === null) {
    return true
  }

  return value === 'true'
}

export function setFullWidth(value) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(
    FULL_WIDTH_KEY,
    String(value),
  )
}

export function normalizeCitationStyle(
  styleId,
) {
  const normalized =
    String(styleId || '')
      .trim()
      .toLowerCase()

  const aliases = {
    'turabian-bibliography': 'turabian',
    'turabian-footnote': 'turabian',
    'turabian-short-note': 'turabian',
    'chicago-bibliography': 'chicago',
    'chicago-footnote': 'chicago',
    'chicago-short-note': 'chicago',
    harvard1: 'harvard',
  }

  const canonical =
    aliases[normalized] ||
    normalized

  return VALID_CITATION_STYLE_IDS.has(
    canonical,
  )
    ? canonical
    : 'turabian'
}

export function getCitationStyle() {
  if (typeof window === 'undefined') {
    return 'turabian'
  }

  return normalizeCitationStyle(
    localStorage.getItem(
      CITATION_STYLE_KEY,
    ),
  )
}

export function setCitationStyle(
  styleId,
) {
  const normalized =
    normalizeCitationStyle(styleId)

  if (typeof window === 'undefined') {
    return normalized
  }

  localStorage.setItem(
    CITATION_STYLE_KEY,
    normalized,
  )

  window.dispatchEvent(
    new CustomEvent(
      'scholarory:citation-style-change',
      {
        detail: {
          styleId: normalized,
        },
      },
    ),
  )

  return normalized
}