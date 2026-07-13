import { computed, ref } from 'vue'

const STORAGE_KEY = 'scholarory-jots'
const LEGACY_STORAGE_KEY = 'scholar-jots'

const validStatuses = new Set([
  'inbox',
  'processed',
  'archived',
])

const validTypes = new Set([
  'note',
  'idea',
  'task',
  'question',
  'quote',
  'reference',
  'reminder',
  'other',
])

let storageListenerAttached = false

function createJotId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `jot-${crypto.randomUUID()}`
  }

  return `jot-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map((tag) =>
            String(tag || '')
              .replace(/^#/, '')
              .trim(),
          )
          .filter(Boolean),
      ),
    ]
  }

  if (typeof value === 'string') {
    return [
      ...new Set(
        value
          .split(/[,\n]/)
          .map((tag) =>
            tag
              .replace(/^#/, '')
              .trim(),
          )
          .filter(Boolean),
      ),
    ]
  }

  return []
}

function normalizeStatus(jot = {}) {
  const suppliedStatus = String(
    jot.status || '',
  )
    .trim()
    .toLowerCase()

  if (validStatuses.has(suppliedStatus)) {
    return suppliedStatus
  }

  return jot.filed
    ? 'processed'
    : 'inbox'
}

function normalizeType(value) {
  const normalized = String(
    value || 'note',
  )
    .trim()
    .toLowerCase()

  return validTypes.has(normalized)
    ? normalized
    : 'other'
}

function normalizeJot(jot = {}) {
  const now = new Date().toISOString()

  const content = String(
    jot.content ??
      jot.text ??
      jot.body ??
      '',
  ).trim()

  const status = normalizeStatus(jot)

  return {
    id: String(
      jot.id || createJotId(),
    ),

    title: String(
      jot.title || '',
    ).trim(),

    content,

    /*
     * Keep the original text field so older Scholarory
     * components using jot.text continue to work.
     */
    text: content,

    type: normalizeType(jot.type),

    tags: normalizeTags(jot.tags),

    context: String(
      jot.context || '',
    ).trim(),

    status,

    /*
     * Keep the original filed property for compatibility
     * with existing components.
     */
    filed: status !== 'inbox',

    pinned: jot.pinned === true,

    createdAt:
      jot.createdAt || now,

    updatedAt:
      jot.updatedAt ||
      jot.createdAt ||
      now,

    processedAt:
      status === 'processed'
        ? jot.processedAt || now
        : null,

    archivedAt:
      status === 'archived'
        ? jot.archivedAt || now
        : null,

    sourceType:
      String(
        jot.sourceType || '',
      ).trim(),

    sourceId:
      jot.sourceId
        ? String(jot.sourceId)
        : '',

    convertedTo:
      jot.convertedTo &&
      typeof jot.convertedTo === 'object'
        ? jot.convertedTo
        : null,
  }
}

function sortJots(a, b) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1
  }

  return String(
    b.createdAt || '',
  ).localeCompare(
    String(a.createdAt || ''),
  )
}

function writeStorage(items) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    )
  } catch (error) {
    console.error(
      'Scholarory could not save jots.',
      error,
    )
  }
}

function loadFromStorage() {
  if (typeof window === 'undefined') {
    return []
  }

  const currentValue =
    window.localStorage.getItem(
      STORAGE_KEY,
    )

  const legacyValue =
    window.localStorage.getItem(
      LEGACY_STORAGE_KEY,
    )

  const sourceValue =
    currentValue ?? legacyValue ?? '[]'

  const parsed = safeParse(
    sourceValue,
    [],
  )

  const normalized =
    Array.isArray(parsed)
      ? parsed.map(normalizeJot)
      : []

  /*
   * Automatically migrate the old scholar-jots data into
   * the new storage key without deleting the old backup.
   */
  if (
    currentValue === null &&
    legacyValue !== null
  ) {
    writeStorage(normalized)
  }

  return normalized
}

const jots = ref(loadFromStorage())

const unfiledJots = computed(() => {
  return jots.value
    .filter(
      (jot) =>
        jot.status === 'inbox',
    )
    .slice()
    .sort(sortJots)
})

const filedJots = computed(() => {
  return jots.value
    .filter(
      (jot) =>
        jot.status === 'processed',
    )
    .slice()
    .sort(sortJots)
})

const processedJots = filedJots

const archivedJots = computed(() => {
  return jots.value
    .filter(
      (jot) =>
        jot.status === 'archived',
    )
    .slice()
    .sort(sortJots)
})

const pinnedJots = computed(() => {
  return jots.value
    .filter((jot) => jot.pinned)
    .slice()
    .sort(sortJots)
})

const inboxCount = computed(() => {
  return unfiledJots.value.length
})

export function useJots() {
  attachStorageListener()

  function saveToStorage() {
    writeStorage(jots.value)
  }

  function addJot(input, options = {}) {
    const supplied =
      typeof input === 'string'
        ? {
            content: input,
            ...options,
          }
        : {
            ...(input || {}),
            ...options,
          }

    const content = String(
      supplied.content ??
        supplied.text ??
        '',
    ).trim()

    const title = String(
      supplied.title || '',
    ).trim()

    if (!content && !title) {
      return null
    }

    const now =
      new Date().toISOString()

    const newJot = normalizeJot({
      ...supplied,
      id: supplied.id || createJotId(),
      title,
      content,
      status:
        supplied.status || 'inbox',
      pinned:
        supplied.pinned === true,
      createdAt:
        supplied.createdAt || now,
      updatedAt: now,
    })

    jots.value = [
      newJot,
      ...jots.value,
    ]

    saveToStorage()

    return newJot
  }

  function updateJot(id, changes = {}) {
    const normalizedId = String(id)

    let updatedJot = null

    jots.value = jots.value.map(
      (jot) => {
        if (
          String(jot.id) !==
          normalizedId
        ) {
          return jot
        }

        const now =
          new Date().toISOString()

        const nextContent =
          changes.content !== undefined
            ? changes.content
            : changes.text !== undefined
              ? changes.text
              : jot.content

        const merged = {
          ...jot,
          ...changes,
          id: jot.id,
          content: nextContent,
          text: nextContent,
          createdAt: jot.createdAt,
          updatedAt: now,
        }

        const nextStatus =
          normalizeStatus(merged)

        if (
          nextStatus === 'processed' &&
          jot.status !== 'processed'
        ) {
          merged.processedAt = now
        }

        if (
          nextStatus !== 'processed'
        ) {
          merged.processedAt = null
        }

        if (
          nextStatus === 'archived' &&
          jot.status !== 'archived'
        ) {
          merged.archivedAt = now
        }

        if (
          nextStatus !== 'archived'
        ) {
          merged.archivedAt = null
        }

        updatedJot =
          normalizeJot(merged)

        return updatedJot
      },
    )

    saveToStorage()

    return updatedJot
  }

  function deleteJot(id) {
    const normalizedId = String(id)

    jots.value =
      jots.value.filter(
        (jot) =>
          String(jot.id) !==
          normalizedId,
      )

    saveToStorage()
  }

  function setJotStatus(id, status) {
    const normalizedStatus =
      validStatuses.has(status)
        ? status
        : 'inbox'

    return updateJot(id, {
      status: normalizedStatus,
      filed:
        normalizedStatus !== 'inbox',
    })
  }

  function fileJot(id) {
    return setJotStatus(
      id,
      'processed',
    )
  }

  function markProcessed(id) {
    return fileJot(id)
  }

  function unfileJot(id) {
    return setJotStatus(
      id,
      'inbox',
    )
  }

  function archiveJot(id) {
    return setJotStatus(
      id,
      'archived',
    )
  }

  function restoreJot(id) {
    return setJotStatus(
      id,
      'inbox',
    )
  }

  function togglePin(id) {
    const jot = getJotById(id)

    if (!jot) {
      return null
    }

    return updateJot(id, {
      pinned: !jot.pinned,
    })
  }

  function getJotById(id) {
    const normalizedId = String(id)

    return (
      jots.value.find(
        (jot) =>
          String(jot.id) ===
          normalizedId,
      ) || null
    )
  }

  function refreshJots() {
    jots.value =
      loadFromStorage()
  }

  function clearArchivedJots() {
    jots.value =
      jots.value.filter(
        (jot) =>
          jot.status !== 'archived',
      )

    saveToStorage()
  }

  return {
    jots,
    unfiledJots,
    filedJots,
    processedJots,
    archivedJots,
    pinnedJots,
    inboxCount,

    addJot,
    updateJot,
    deleteJot,

    fileJot,
    markProcessed,
    unfileJot,
    archiveJot,
    restoreJot,
    togglePin,

    getJotById,
    refreshJots,
    clearArchivedJots,
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
      if (
        event.key === STORAGE_KEY ||
        event.key ===
          LEGACY_STORAGE_KEY
      ) {
        jots.value =
          loadFromStorage()
      }
    },
  )

  storageListenerAttached = true
}