import {
  computed,
  ref,
  watch,
} from 'vue'

const STORAGE_KEY = 'scholarory_sources'

const sourceMetadataDefaults = {
  subtitle: '',
  shortTitle: '',
  isbn: '',
  doi: '',
  url: '',
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  edition: '',
  accessDate: '',
  publicationLocation: '',
  websiteName: '',

  institution: '',
  degree: '',
  department: '',
  advisor: '',
  database: '',
  repository: '',
  publicationNumber: '',
  abstract: '',
  language: '',

  firstAuthorFirstName: '',
  firstAuthorLastName: '',
  secondAuthorFirstName: '',
  secondAuthorLastName: '',
  contributorsText: '',
  forewordBy: '',

  sourceNotes: [],
  templateNotes: {},
}

const defaultSources = [
  {
    id: 1,
    title: 'A Short Guide to Spiritual Formation',
    author: 'Alex Sosler',
    type: 'Book',
    year: '2024',
    publisher: 'B&H Academic',
    ...sourceMetadataDefaults,
    courseId: 1,
    course: 'DMIN 851',
    assignmentId: null,
    assignment: '',
    status: 'reading',
    priority: 'high',
    tags: [
      'spiritual formation',
      'truth',
      'goodness',
      'beauty',
    ],
    notes: 'Used for DMIN 851 book review.',
    citation: '',
    createdAt: '2026-06-12',
  },
  {
    id: 2,
    title: 'Belong',
    author: 'Melanie Dobson',
    type: 'Book',
    year: '2022',
    publisher: '',
    ...sourceMetadataDefaults,
    courseId: 1,
    course: 'DMIN 851',
    assignmentId: null,
    assignment: '',
    status: 'reading',
    priority: 'high',
    tags: [
      'discernment',
      'friendship',
      'spiritual direction',
    ],
    notes: 'Used for DMIN 851 book review.',
    citation: '',
    createdAt: '2026-06-12',
  },
]

const fallbackStringFields = [
  'title',
  'subtitle',
  'shortTitle',
  'author',
  'type',
  'year',
  'publisher',
  'isbn',
  'doi',
  'url',
  'journal',
  'volume',
  'issue',
  'pages',
  'edition',
  'accessDate',
  'publicationLocation',
  'websiteName',

  'institution',
  'degree',
  'department',
  'advisor',
  'database',
  'repository',
  'publicationNumber',
  'abstract',
  'language',

  'firstAuthorFirstName',
  'firstAuthorLastName',
  'secondAuthorFirstName',
  'secondAuthorLastName',
  'contributorsText',
  'forewordBy',

  'course',
  'assignment',
  'status',
  'priority',
  'citation',
  'createdAt',
]

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function firstNonBlank(...values) {
  const match = values.find((value) => {
    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    )
  })

  return match ?? ''
}

function copyArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => {
    if (
      item &&
      typeof item === 'object'
    ) {
      return {
        ...item,
      }
    }

    return item
  })
}

function copyObject(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return {}
  }

  return {
    ...value,
  }
}

function findMatchingDefaultSource(source = {}) {
  const directMatch = defaultSources.find((starterSource) => {
    return String(starterSource.id) === String(source.id)
  })

  if (directMatch) {
    return directMatch
  }

  const sourceTitle = normalizeText(source.title)
  const sourceAuthor = normalizeText(source.author)

  if (!sourceTitle) {
    return null
  }

  return (
    defaultSources.find((starterSource) => {
      const sameTitle =
        normalizeText(starterSource.title) === sourceTitle

      const starterAuthor = normalizeText(starterSource.author)

      const sameAuthor =
        !sourceAuthor ||
        !starterAuthor ||
        sourceAuthor === starterAuthor

      return sameTitle && sameAuthor
    }) || null
  )
}

function normalizeSource(
  source = {},
  options = {},
) {
  const {
    useStarterFallback = true,
  } = options

  const starterSource =
    useStarterFallback
      ? findMatchingDefaultSource(source)
      : null

  const normalized = {
    ...sourceMetadataDefaults,
    ...(starterSource || {}),
    ...source,
  }

  fallbackStringFields.forEach((field) => {
    normalized[field] = firstNonBlank(
      source[field],
      starterSource?.[field],
      sourceMetadataDefaults[field],
    )
  })

  normalized.id =
    source.id ??
    starterSource?.id ??
    Date.now()

  normalized.courseId =
    source.courseId ??
    starterSource?.courseId ??
    null

  normalized.assignmentId =
    source.assignmentId ??
    starterSource?.assignmentId ??
    null

  normalized.title =
    normalized.title ||
    'Untitled Source'

  normalized.type =
    normalized.type ||
    'Book'

  normalized.status =
    normalized.status ||
    'planned'

  normalized.priority =
    normalized.priority ||
    'medium'

  normalized.tags =
    Object.prototype.hasOwnProperty.call(
      source,
      'tags',
    )
      ? copyArray(source.tags)
      : copyArray(starterSource?.tags)

  normalized.sourceNotes =
    Object.prototype.hasOwnProperty.call(
      source,
      'sourceNotes',
    )
      ? copyArray(source.sourceNotes)
      : copyArray(starterSource?.sourceNotes)

  normalized.templateNotes =
    Object.prototype.hasOwnProperty.call(
      source,
      'templateNotes',
    )
      ? copyObject(source.templateNotes)
      : copyObject(starterSource?.templateNotes)

  normalized.notes =
    Object.prototype.hasOwnProperty.call(
      source,
      'notes',
    )
      ? String(source.notes || '')
      : String(starterSource?.notes || '')

  const normalizedType = normalizeText(normalized.type)

  if (
    (
      normalizedType === 'dissertation' ||
      normalizedType === 'thesis'
    ) &&
    !normalized.institution &&
    normalized.publisher
  ) {
    // Older Scholarory records stored the university in publisher.
    // Copy it into institution without deleting the original value.
    normalized.institution = normalized.publisher
  }

  normalized.updatedAt =
    source.updatedAt ||
    starterSource?.updatedAt ||
    normalized.createdAt ||
    ''

  return normalized
}

function loadSources() {
  try {
    const storedSources =
      localStorage.getItem(STORAGE_KEY)

    if (!storedSources) {
      return defaultSources.map((source) => {
        return normalizeSource(source)
      })
    }

    const parsedSources =
      JSON.parse(storedSources)

    if (!Array.isArray(parsedSources)) {
      return defaultSources.map((source) => {
        return normalizeSource(source)
      })
    }

    return parsedSources.map((source) => {
      return normalizeSource(source)
    })
  } catch (error) {
    console.error(
      'Failed to load sources:',
      error,
    )

    return defaultSources.map((source) => {
      return normalizeSource(source)
    })
  }
}

const sources = ref(loadSources())

localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify(sources.value),
)

watch(
  sources,
  (newSources) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newSources),
    )
  },
  {
    deep: true,
  },
)

export function useSources() {
  const allSources = computed(() => {
    return sources.value
  })

  const activeSources = computed(() => {
    return sources.value.filter((source) => {
      return source.status !== 'archived'
    })
  })

  function getSourceById(id) {
    return sources.value.find((source) => {
      return String(source.id) === String(id)
    })
  }

  function addSource(source = {}) {
    const now = new Date().toISOString()

    const newSource = normalizeSource(
      {
        id: Date.now(),
        title:
          source.title ||
          'Untitled Source',

        author:
          source.author ||
          '',

        type:
          source.type ||
          'Book',

        year:
          source.year ||
          '',

        publisher:
          source.publisher ||
          '',

        courseId:
          source.courseId ??
          null,

        course:
          source.course ||
          '',

        assignmentId:
          source.assignmentId ??
          null,

        assignment:
          source.assignment ||
          '',

        status:
          source.status ||
          'planned',

        priority:
          source.priority ||
          'medium',

        tags:
          source.tags ||
          [],

        notes:
          source.notes ||
          '',

        citation:
          source.citation ||
          '',

        sourceNotes:
          source.sourceNotes ||
          [],

        templateNotes:
          source.templateNotes ||
          {},

        createdAt:
          source.createdAt ||
          now,

        updatedAt: now,

        ...source,
      },
      {
        useStarterFallback: false,
      },
    )

    sources.value.unshift(newSource)

    return newSource
  }

  function updateSource(
    id,
    updates,
  ) {
    const index = sources.value.findIndex((source) => {
      return String(source.id) === String(id)
    })

    if (index === -1) {
      return null
    }

    sources.value[index] = normalizeSource(
      {
        ...sources.value[index],
        ...updates,
        updatedAt:
          new Date().toISOString(),
      },
      {
        useStarterFallback: false,
      },
    )

    return sources.value[index]
  }

  function deleteSource(id) {
    sources.value = sources.value.filter((source) => {
      return String(source.id) !== String(id)
    })
  }

  return {
    sources,
    allSources,
    activeSources,
    getSourceById,
    addSource,
    updateSource,
    deleteSource,
  }
}

