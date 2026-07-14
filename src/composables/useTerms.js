import {
  computed,
  ref,
} from 'vue'

const STORAGE_KEY = 'scholarory-terms'

let storageListenerAttached = false

function createTermId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `term-${crypto.randomUUID()}`
  }

  return `term-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function normalizeStringList(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || '').split(/[,\n]/)

  return [
    ...new Set(
      items
        .map((item) =>
          String(item || '')
            .replace(/^#/, '')
            .trim(),
        )
        .filter(Boolean),
    ),
  ]
}

function normalizeIdList(value) {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map((id) =>
          String(id || '').trim(),
        )
        .filter(Boolean),
    ),
  ]
}

function normalizeExamples(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || '').split('\n')

  return items
    .map((item) =>
      String(item || '').trim(),
    )
    .filter(Boolean)
}

function normalizeTerm(term = {}) {
  const now = new Date().toISOString()

  return {
    id: String(
      term.id || createTermId(),
    ),

    term: String(
      term.term ||
        term.name ||
        'Untitled Term',
    ).trim(),

    definition: String(
      term.definition || '',
    ).trim(),

    extendedDefinition: String(
      term.extendedDefinition || '',
    ),

    pronunciation: String(
      term.pronunciation || '',
    ).trim(),

    originalLanguage: String(
      term.originalLanguage || '',
    ).trim(),

    originalSpelling: String(
      term.originalSpelling || '',
    ).trim(),

    transliteration: String(
      term.transliteration || '',
    ).trim(),

    partOfSpeech: String(
      term.partOfSpeech || 'Other',
    ).trim(),

    discipline: String(
      term.discipline || 'General',
    ).trim(),

    status: String(
      term.status || 'developing',
    )
      .trim()
      .toLowerCase(),

    aliases: normalizeStringList(
      term.aliases,
    ),

    tags: normalizeStringList(
      term.tags,
    ),

    examples: normalizeExamples(
      term.examples,
    ),

    relatedTermIds: normalizeIdList(
      term.relatedTermIds,
    ),

    linkedConceptIds: normalizeIdList(
      term.linkedConceptIds,
    ),

    linkedSourceIds: normalizeIdList(
      term.linkedSourceIds,
    ),

    linkedCourseIds: normalizeIdList(
      term.linkedCourseIds,
    ),

    linkedAssignmentIds: normalizeIdList(
      term.linkedAssignmentIds,
    ),

    linkedWritingProjectIds: normalizeIdList(
      term.linkedWritingProjectIds,
    ),

    notes: String(
      term.notes || '',
    ),

    pinned: term.pinned === true,
    archived: term.archived === true,

    createdAt:
      term.createdAt || now,

    updatedAt:
      term.updatedAt ||
      term.createdAt ||
      now,
  }
}

function readTerms() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        STORAGE_KEY,
      ) || '[]',
    )

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(normalizeTerm)
  } catch (error) {
    console.warn(
      'Scholarory could not load terms.',
      error,
    )

    return []
  }
}

function sortTerms(a, b) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1
  }

  return a.term.localeCompare(
    b.term,
    undefined,
    {
      sensitivity: 'base',
    },
  )
}

const terms = ref(readTerms())

const activeTerms = computed(() => {
  return terms.value
    .filter((term) => !term.archived)
    .slice()
    .sort(sortTerms)
})

const archivedTerms = computed(() => {
  return terms.value
    .filter((term) => term.archived)
    .slice()
    .sort(sortTerms)
})

const pinnedTerms = computed(() => {
  return terms.value
    .filter(
      (term) =>
        term.pinned &&
        !term.archived,
    )
    .slice()
    .sort(sortTerms)
})

const termCount = computed(() => {
  return activeTerms.value.length
})

const archivedCount = computed(() => {
  return archivedTerms.value.length
})

export function useTerms() {
  attachStorageListener()

  function saveTerms() {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(terms.value),
      )
    } catch (error) {
      console.error(
        'Scholarory could not save terms.',
        error,
      )
    }
  }

  function addTerm(input = {}) {
    const termName = String(
      input.term ||
        input.name ||
        '',
    ).trim()

    if (!termName) {
      return null
    }

    const now = new Date().toISOString()

    const newTerm = normalizeTerm({
      ...input,
      id:
        input.id ||
        createTermId(),

      term: termName,

      createdAt:
        input.createdAt || now,

      updatedAt: now,
    })

    terms.value = [
      newTerm,
      ...terms.value,
    ]

    saveTerms()

    return newTerm
  }

  function updateTerm(
    id,
    changes = {},
  ) {
    const normalizedId = String(id)
    let updatedTerm = null

    terms.value =
      terms.value.map((term) => {
        if (
          String(term.id) !==
          normalizedId
        ) {
          return term
        }

        updatedTerm = normalizeTerm({
          ...term,
          ...changes,
          id: term.id,
          createdAt: term.createdAt,
          updatedAt:
            new Date().toISOString(),
        })

        return updatedTerm
      })

    saveTerms()

    return updatedTerm
  }

  function deleteTerm(id) {
    const normalizedId = String(id)

    terms.value =
      terms.value
        .filter(
          (term) =>
            String(term.id) !==
            normalizedId,
        )
        .map((term) => {
          return normalizeTerm({
            ...term,

            relatedTermIds:
              term.relatedTermIds.filter(
                (relatedId) =>
                  relatedId !==
                  normalizedId,
              ),
          })
        })

    saveTerms()
  }

  function archiveTerm(id) {
    return updateTerm(id, {
      archived: true,
    })
  }

  function restoreTerm(id) {
    return updateTerm(id, {
      archived: false,
    })
  }

  function toggleTermPin(id) {
    const term = getTermById(id)

    if (!term) {
      return null
    }

    return updateTerm(id, {
      pinned: !term.pinned,
    })
  }

  function getTermById(id) {
    const normalizedId = String(id)

    return (
      terms.value.find(
        (term) =>
          String(term.id) ===
          normalizedId,
      ) || null
    )
  }

  function getRelatedTerms(id) {
    const term = getTermById(id)

    if (!term) {
      return []
    }

    return term.relatedTermIds
      .map(getTermById)
      .filter(Boolean)
      .sort(sortTerms)
  }

  function linkTerms(
    firstTermId,
    secondTermId,
  ) {
    const firstId =
      String(firstTermId)

    const secondId =
      String(secondTermId)

    if (
      !firstId ||
      !secondId ||
      firstId === secondId
    ) {
      return
    }

    const firstTerm =
      getTermById(firstId)

    const secondTerm =
      getTermById(secondId)

    if (
      !firstTerm ||
      !secondTerm
    ) {
      return
    }

    const firstRelatedIds = [
      ...new Set([
        ...firstTerm.relatedTermIds,
        secondId,
      ]),
    ]

    const secondRelatedIds = [
      ...new Set([
        ...secondTerm.relatedTermIds,
        firstId,
      ]),
    ]

    const now =
      new Date().toISOString()

    terms.value =
      terms.value.map((term) => {
        if (term.id === firstId) {
          return normalizeTerm({
            ...term,
            relatedTermIds:
              firstRelatedIds,
            updatedAt: now,
          })
        }

        if (term.id === secondId) {
          return normalizeTerm({
            ...term,
            relatedTermIds:
              secondRelatedIds,
            updatedAt: now,
          })
        }

        return term
      })

    saveTerms()
  }

  function unlinkTerms(
    firstTermId,
    secondTermId,
  ) {
    const firstId =
      String(firstTermId)

    const secondId =
      String(secondTermId)

    const now =
      new Date().toISOString()

    terms.value =
      terms.value.map((term) => {
        if (term.id === firstId) {
          return normalizeTerm({
            ...term,

            relatedTermIds:
              term.relatedTermIds.filter(
                (id) => id !== secondId,
              ),

            updatedAt: now,
          })
        }

        if (term.id === secondId) {
          return normalizeTerm({
            ...term,

            relatedTermIds:
              term.relatedTermIds.filter(
                (id) => id !== firstId,
              ),

            updatedAt: now,
          })
        }

        return term
      })

    saveTerms()
  }

  function addExample(
    id,
    example,
  ) {
    const term = getTermById(id)

    const normalizedExample =
      String(example || '').trim()

    if (
      !term ||
      !normalizedExample
    ) {
      return null
    }

    return updateTerm(id, {
      examples: [
        ...term.examples,
        normalizedExample,
      ],
    })
  }

  function removeExample(
    id,
    exampleIndex,
  ) {
    const term = getTermById(id)

    if (!term) {
      return null
    }

    return updateTerm(id, {
      examples:
        term.examples.filter(
          (_, index) =>
            index !== exampleIndex,
        ),
    })
  }

  function refreshTerms() {
    terms.value = readTerms()
  }

  return {
    terms,
    activeTerms,
    archivedTerms,
    pinnedTerms,
    termCount,
    archivedCount,

    addTerm,
    updateTerm,
    deleteTerm,
    archiveTerm,
    restoreTerm,
    toggleTermPin,

    getTermById,
    getRelatedTerms,
    linkTerms,
    unlinkTerms,

    addExample,
    removeExample,

    saveTerms,
    refreshTerms,
  }
}

function attachStorageListener() {
  if (
    storageListenerAttached ||
    typeof window === 'undefined'
  ) {
    return
  }

  window.addEventListener(
    'storage',
    (event) => {
      if (event.key === STORAGE_KEY) {
        terms.value = readTerms()
      }
    },
  )

  storageListenerAttached = true
}