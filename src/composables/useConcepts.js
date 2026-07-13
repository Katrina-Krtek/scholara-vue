import { computed, ref } from 'vue'

const STORAGE_KEY = 'scholarory-concepts'

let storageListenerAttached = false

function createConceptId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `concept-${crypto.randomUUID()}`
  }

  return `concept-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function normalizeStringList(value) {
  const values = Array.isArray(value)
    ? value
    : String(value || '').split(/[,\n]/)

  return [
    ...new Set(
      values
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
        .map((id) => String(id || '').trim())
        .filter(Boolean),
    ),
  ]
}

function normalizeConcept(concept = {}) {
  const now = new Date().toISOString()

  return {
    id: String(
      concept.id || createConceptId(),
    ),

    name: String(
      concept.name || 'Untitled Concept',
    ).trim(),

    definition: String(
      concept.definition || '',
    ).trim(),

    category: String(
      concept.category || 'General',
    ).trim(),

    status: String(
      concept.status || 'developing',
    )
      .trim()
      .toLowerCase(),

    aliases: normalizeStringList(
      concept.aliases,
    ),

    tags: normalizeStringList(
      concept.tags,
    ),

    relatedConceptIds: normalizeIdList(
      concept.relatedConceptIds,
    ),

    linkedSourceIds: normalizeIdList(
      concept.linkedSourceIds,
    ),

    linkedCourseIds: normalizeIdList(
      concept.linkedCourseIds,
    ),

    linkedAssignmentIds: normalizeIdList(
      concept.linkedAssignmentIds,
    ),

    linkedWritingProjectIds: normalizeIdList(
      concept.linkedWritingProjectIds,
    ),

    notes: String(
      concept.notes || '',
    ),

    pinned: concept.pinned === true,
    archived: concept.archived === true,

    createdAt:
      concept.createdAt || now,

    updatedAt:
      concept.updatedAt ||
      concept.createdAt ||
      now,
  }
}

function readConcepts() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        STORAGE_KEY,
      ) || '[]',
    )

    return Array.isArray(parsed)
      ? parsed.map(normalizeConcept)
      : []
  } catch (error) {
    console.warn(
      'Scholarory could not load concepts.',
      error,
    )

    return []
  }
}

function sortConcepts(a, b) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1
  }

  return a.name.localeCompare(
    b.name,
    undefined,
    {
      sensitivity: 'base',
    },
  )
}

const concepts = ref(readConcepts())

const activeConcepts = computed(() => {
  return concepts.value
    .filter((concept) => !concept.archived)
    .slice()
    .sort(sortConcepts)
})

const archivedConcepts = computed(() => {
  return concepts.value
    .filter((concept) => concept.archived)
    .slice()
    .sort(sortConcepts)
})

const pinnedConcepts = computed(() => {
  return concepts.value
    .filter(
      (concept) =>
        concept.pinned &&
        !concept.archived,
    )
    .slice()
    .sort(sortConcepts)
})

const conceptCount = computed(() => {
  return activeConcepts.value.length
})

const archivedCount = computed(() => {
  return archivedConcepts.value.length
})

export function useConcepts() {
  attachStorageListener()

  function saveConcepts() {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(concepts.value),
      )
    } catch (error) {
      console.error(
        'Scholarory could not save concepts.',
        error,
      )
    }
  }

  function addConcept(input = {}) {
    const name = String(
      input.name || '',
    ).trim()

    if (!name) {
      return null
    }

    const now = new Date().toISOString()

    const concept = normalizeConcept({
      ...input,
      id: input.id || createConceptId(),
      name,
      createdAt:
        input.createdAt || now,
      updatedAt: now,
    })

    concepts.value = [
      concept,
      ...concepts.value,
    ]

    saveConcepts()

    return concept
  }

  function updateConcept(id, changes = {}) {
    const normalizedId = String(id)
    let updatedConcept = null

    concepts.value =
      concepts.value.map((concept) => {
        if (
          String(concept.id) !==
          normalizedId
        ) {
          return concept
        }

        updatedConcept = normalizeConcept({
          ...concept,
          ...changes,
          id: concept.id,
          createdAt: concept.createdAt,
          updatedAt:
            new Date().toISOString(),
        })

        return updatedConcept
      })

    saveConcepts()

    return updatedConcept
  }

  function deleteConcept(id) {
    const normalizedId = String(id)

    concepts.value =
      concepts.value
        .filter(
          (concept) =>
            String(concept.id) !==
            normalizedId,
        )
        .map((concept) => ({
          ...concept,

          relatedConceptIds:
            concept.relatedConceptIds.filter(
              (relatedId) =>
                relatedId !== normalizedId,
            ),
        }))

    saveConcepts()
  }

  function archiveConcept(id) {
    return updateConcept(id, {
      archived: true,
    })
  }

  function restoreConcept(id) {
    return updateConcept(id, {
      archived: false,
    })
  }

  function toggleConceptPin(id) {
    const concept = getConceptById(id)

    if (!concept) {
      return null
    }

    return updateConcept(id, {
      pinned: !concept.pinned,
    })
  }

  function getConceptById(id) {
    const normalizedId = String(id)

    return (
      concepts.value.find(
        (concept) =>
          String(concept.id) ===
          normalizedId,
      ) || null
    )
  }

  function getRelatedConcepts(id) {
    const concept = getConceptById(id)

    if (!concept) {
      return []
    }

    return concept.relatedConceptIds
      .map(getConceptById)
      .filter(Boolean)
      .sort(sortConcepts)
  }

  function linkConcepts(
    firstConceptId,
    secondConceptId,
  ) {
    const firstId = String(firstConceptId)
    const secondId = String(secondConceptId)

    if (
      !firstId ||
      !secondId ||
      firstId === secondId
    ) {
      return
    }

    const firstConcept =
      getConceptById(firstId)

    const secondConcept =
      getConceptById(secondId)

    if (
      !firstConcept ||
      !secondConcept
    ) {
      return
    }

    const firstRelatedIds = [
      ...new Set([
        ...firstConcept.relatedConceptIds,
        secondId,
      ]),
    ]

    const secondRelatedIds = [
      ...new Set([
        ...secondConcept.relatedConceptIds,
        firstId,
      ]),
    ]

    concepts.value =
      concepts.value.map((concept) => {
        if (concept.id === firstId) {
          return normalizeConcept({
            ...concept,
            relatedConceptIds:
              firstRelatedIds,

            updatedAt:
              new Date().toISOString(),
          })
        }

        if (concept.id === secondId) {
          return normalizeConcept({
            ...concept,
            relatedConceptIds:
              secondRelatedIds,

            updatedAt:
              new Date().toISOString(),
          })
        }

        return concept
      })

    saveConcepts()
  }

  function unlinkConcepts(
    firstConceptId,
    secondConceptId,
  ) {
    const firstId = String(firstConceptId)
    const secondId = String(secondConceptId)

    concepts.value =
      concepts.value.map((concept) => {
        if (concept.id === firstId) {
          return normalizeConcept({
            ...concept,

            relatedConceptIds:
              concept.relatedConceptIds.filter(
                (id) => id !== secondId,
              ),

            updatedAt:
              new Date().toISOString(),
          })
        }

        if (concept.id === secondId) {
          return normalizeConcept({
            ...concept,

            relatedConceptIds:
              concept.relatedConceptIds.filter(
                (id) => id !== firstId,
              ),

            updatedAt:
              new Date().toISOString(),
          })
        }

        return concept
      })

    saveConcepts()
  }

  function refreshConcepts() {
    concepts.value = readConcepts()
  }

  return {
    concepts,
    activeConcepts,
    archivedConcepts,
    pinnedConcepts,
    conceptCount,
    archivedCount,

    addConcept,
    updateConcept,
    deleteConcept,
    archiveConcept,
    restoreConcept,
    toggleConceptPin,

    getConceptById,
    getRelatedConcepts,
    linkConcepts,
    unlinkConcepts,

    saveConcepts,
    refreshConcepts,
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
        concepts.value = readConcepts()
      }
    },
  )

  storageListenerAttached = true
}