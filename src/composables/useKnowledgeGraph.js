import {
  computed,
  ref,
  watch,
} from 'vue'

import { useBooks } from '@/composables/useBooks'
import { useSources } from '@/composables/useSources'

import {
  graphNodeTypes as baseGraphNodeTypes,
  mockGraphDiscoveryItems,
  mockKnowledgeGraphLinks,
  mockKnowledgeGraphNodes,
} from '@/data/mockKnowledgeGraph'

const SOURCE_GRAPH_TYPES = [
  'research-source',
  'source',
  'book',
  'book-chapter',
  'article',
  'journal-article',
  'journal',
  'dissertation',
  'thesis',
  'blog',
  'blog-post',
  'webpage',
  'website',
  'report',
  'conference-paper',
  'encyclopedia',
  'dictionary',
  'podcast',
  'video',
  'media',
]

const SUPPORTED_GRAPH_NODE_TYPES = [
  ...new Set([
    ...baseGraphNodeTypes,
    ...SOURCE_GRAPH_TYPES,
  ]),
]

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
}

function normalizeSearchText(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchVariants(value) {
  const normalized = normalizeSearchText(value)

  if (!normalized) {
    return []
  }

  const withoutAnd = normalized
    .replace(/\band\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return [
    ...new Set([
      normalized,
      normalized.replace(/\s+/g, ''),
      withoutAnd,
      withoutAnd.replace(/\s+/g, ''),
    ]),
  ].filter(Boolean)
}

function normalizeTag(value) {
  return normalizeText(value)
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
}

function normalizeSourceType(value) {
  const type = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')

  const aliases = {
    book: 'book',
    chapter: 'book-chapter',
    'book-chapter': 'book-chapter',

    article: 'article',
    'journal-article': 'article',
    'academic-article': 'article',
    'research-article': 'article',

    journal: 'journal',
    periodical: 'journal',

    dissertation: 'dissertation',
    'doctoral-dissertation': 'dissertation',
    'phd-dissertation': 'dissertation',

    thesis: 'thesis',
    'masters-thesis': 'thesis',
    'master-thesis': 'thesis',

    blog: 'blog',
    'blog-post': 'blog',
    'blog-entry': 'blog',

    webpage: 'webpage',
    'web-page': 'webpage',
    website: 'website',
    web: 'webpage',

    report: 'report',

    'conference-paper': 'conference-paper',
    conference: 'conference-paper',

    encyclopedia: 'encyclopedia',
    'encyclopedia-entry': 'encyclopedia',

    dictionary: 'dictionary',
    'dictionary-entry': 'dictionary',

    podcast: 'podcast',
    video: 'video',
    media: 'media',
    audiovisual: 'media',
  }

  return aliases[type] || 'research-source'
}

function firstValue(...values) {
  return (
    values.find((value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return false
      }

      if (Array.isArray(value)) {
        return value.length > 0
      }

      return String(value).trim() !== ''
    }) ?? ''
  )
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDateKey(value) {
  if (!value) {
    return ''
  }

  const text = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return text.slice(0, 10)
  }

  return getLocalDateKey(date)
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      values
        .flatMap((value) => {
          return Array.isArray(value)
            ? value
            : [value]
        })
        .map((value) => {
          return String(value || '').trim()
        })
        .filter(Boolean),
    ),
  ]
}

function getCourseIdVariants(values = []) {
  return uniqueStrings(values).flatMap((courseId) => {
    const cleanId = String(courseId)

    return uniqueStrings([
      cleanId,
      `course-${cleanId}`,
      `course:${cleanId}`,
    ])
  })
}

function getAssignmentIdVariants(values = []) {
  return uniqueStrings(values).flatMap((assignmentId) => {
    const cleanId = String(assignmentId)

    return uniqueStrings([
      cleanId,
      `assignment-${cleanId}`,
      `assignment:${cleanId}`,
    ])
  })
}

function getSourceNoteText(source) {
  if (!Array.isArray(source?.sourceNotes)) {
    return ''
  }

  return source.sourceNotes
    .map((note) => {
      if (typeof note === 'string') {
        return note
      }

      return (
        note?.content ||
        note?.text ||
        note?.title ||
        ''
      )
    })
    .filter(Boolean)
    .join(' ')
}

function buildBookDescription(
  book,
  matchingSource = null,
) {
  return uniqueStrings([
    book.subtitle,
    matchingSource?.subtitle,

    firstValue(
      book.author,
      matchingSource?.author,
    )
      ? `By ${firstValue(
          book.author,
          matchingSource?.author,
        )}`
      : '',

    book.summary,
    matchingSource?.summary,
    book.notes,
    matchingSource?.notes,
    getSourceNoteText(matchingSource),
  ]).join(' · ')
}

function buildSourceDescription(source) {
  return uniqueStrings([
    source.subtitle,

    source.author
      ? `By ${source.author}`
      : '',

    source.abstract,
    source.summary,
    source.notes,
    getSourceNoteText(source),
  ]).join(' · ')
}

function recordsRepresentSameBook(
  book,
  source,
) {
  if (
    !book ||
    !source ||
    normalizeSourceType(source.type) !== 'book'
  ) {
    return false
  }

  const linkedSourceId = String(
    book.sourceId ?? '',
  ).trim()

  const sourceId = String(
    source.id ?? '',
  ).trim()

  if (
    linkedSourceId &&
    sourceId &&
    linkedSourceId === sourceId
  ) {
    return true
  }

  const bookTitle = normalizeSearchText(
    book.title,
  )

  const sourceTitle = normalizeSearchText(
    source.title,
  )

  const bookAuthor = normalizeSearchText(
    book.author,
  )

  const sourceAuthor = normalizeSearchText(
    source.author,
  )

  if (
    !bookTitle ||
    !sourceTitle ||
    bookTitle !== sourceTitle
  ) {
    return false
  }

  if (
    bookAuthor &&
    sourceAuthor &&
    bookAuthor !== sourceAuthor
  ) {
    return false
  }

  const bookYear = normalizeText(
    firstValue(
      book.publicationYear,
      book.year,
    ),
  )

  const sourceYear = normalizeText(
    firstValue(
      source.publicationYear,
      source.year,
    ),
  )

  if (
    bookYear &&
    sourceYear &&
    bookYear !== sourceYear
  ) {
    return false
  }

  return true
}

function findMatchingSourceForBook(
  book,
  sources,
) {
  const linkedSourceId = String(
    book?.sourceId ?? '',
  ).trim()

  if (linkedSourceId) {
    const directlyLinkedSource =
      sources.find((source) => {
        return (
          String(
            source?.id ?? '',
          ).trim() === linkedSourceId
        )
      })

    if (directlyLinkedSource) {
      return directlyLinkedSource
    }
  }

  return (
    sources.find((source) => {
      return recordsRepresentSameBook(
        book,
        source,
      )
    }) || null
  )
}

function createBookGraphNode(
  book,
  matchingSource = null,
) {
  const courseIds = getCourseIdVariants([
    ...(book.relatedCourseIds || []),
    matchingSource?.courseId,
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      ...(book.relatedAssignmentIds || []),
      matchingSource?.assignmentId,
    ])

  const publisher = firstValue(
    book.publisher,
    matchingSource?.publisher,
  )
  const publisherAliases = uniqueStrings([
    matchingSource?.publisher,
    book.publisher,
  ])

  const publicationYear = firstValue(
    book.publicationYear,
    book.year,
    matchingSource?.publicationYear,
    matchingSource?.year,
  )

  const updatedAt = firstValue(
    book.updatedAt,
    matchingSource?.updatedAt,
    book.createdAt,
    matchingSource?.createdAt,
  )

  return {
    id: `book:${book.id}`,
    entityId: String(book.id),

    sourceRecordId:
      matchingSource?.id !== undefined
        ? String(matchingSource.id)
        : null,

    title:
      firstValue(
        book.title,
        matchingSource?.title,
      ) ||
      'Untitled Book',

    type: 'book',
    sourceType: 'Book',
    recordType: 'Book',

    description:
      buildBookDescription(
        book,
        matchingSource,
      ) ||
      'Book record from the Scholarory Book Database.',

    tags: uniqueStrings([
      ...(book.tags || []),
      ...(matchingSource?.tags || []),
      book.genre,
      matchingSource?.genre,
    ]),

    status:
      firstValue(
        book.status,
        matchingSource?.status,
      ) ||
      'planned',

    priority:
      firstValue(
        book.priority,
        matchingSource?.priority,
      ),

    updatedAt,

    createdAt:
      firstValue(
        book.createdAt,
        matchingSource?.createdAt,
      ),

    date: getDateKey(updatedAt),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      matchingSource?.course ||
      '',

    assignment:
      matchingSource?.assignment ||
      '',

    route: `/books/${book.id}`,

    author:
      firstValue(
        book.author,
        matchingSource?.author,
      ),

    authors:
      firstValue(
        book.authors,
        matchingSource?.authors,
      ),

    subtitle:
      firstValue(
        book.subtitle,
        matchingSource?.subtitle,
      ),

    publisher,
publisherAliases,
    publicationYear,
    year: publicationYear,

    publicationPlace:
      firstValue(
        book.publicationPlace,
        book.publicationLocation,
        matchingSource?.publicationPlace,
        matchingSource?.publicationLocation,
      ),

    publicationLocation:
      firstValue(
        book.publicationLocation,
        matchingSource?.publicationLocation,
      ),

    edition:
      firstValue(
        book.edition,
        matchingSource?.edition,
      ),

    isbn:
      firstValue(
        book.isbn,
        matchingSource?.isbn,
      ),

    doi:
      firstValue(
        book.doi,
        matchingSource?.doi,
      ),

    url:
      firstValue(
        book.url,
        matchingSource?.url,
      ),

    accessDate:
      firstValue(
        book.accessDate,
        matchingSource?.accessDate,
      ),

    genre:
      firstValue(
        book.genre,
        matchingSource?.genre,
      ),

    pageCount:
      firstValue(
        book.pageCount,
        book.pages,
        matchingSource?.pageCount,
        matchingSource?.pages,
      ),

    pages:
      firstValue(
        book.pages,
        matchingSource?.pages,
      ),

    language:
      firstValue(
        book.language,
        matchingSource?.language,
      ),

    citation:
      firstValue(
        book.citation,
        matchingSource?.citation,
      ),

    notes:
      firstValue(
        book.notes,
        matchingSource?.notes,
      ),

    summary:
      firstValue(
        book.summary,
        matchingSource?.summary,
      ),

    sourceNotes:
      Array.isArray(
        matchingSource?.sourceNotes,
      )
        ? [...matchingSource.sourceNotes]
        : [],

    firstAuthorFirstName:
      matchingSource?.firstAuthorFirstName ||
      '',

    firstAuthorLastName:
      matchingSource?.firstAuthorLastName ||
      '',

    secondAuthorFirstName:
      matchingSource?.secondAuthorFirstName ||
      '',

    secondAuthorLastName:
      matchingSource?.secondAuthorLastName ||
      '',

    contributorsText:
      matchingSource?.contributorsText ||
      '',

    forewordBy:
      matchingSource?.forewordBy ||
      '',
  }
}

function createSourceGraphNode(source) {
  const sourceType = normalizeSourceType(
    source.type,
  )

  const courseIds = getCourseIdVariants([
    source.courseId,
  ])

  const assignmentIds =
    getAssignmentIdVariants([
      source.assignmentId,
    ])

  return {
    id: `source:${source.id}`,
    entityId: String(source.id),

    title:
      source.title ||
      'Untitled Source',

    type: sourceType,

    sourceType:
      source.type ||
      'Research Source',

    recordType:
      source.type ||
      'Research Source',

    description:
      buildSourceDescription(source) ||
      'Research source from the Scholarory Source Database.',

    tags: uniqueStrings(
      source.tags || [],
    ),

    status:
      source.status ||
      'planned',

    priority:
      source.priority ||
      '',

    updatedAt:
      source.updatedAt ||
      source.createdAt ||
      '',

    createdAt:
      source.createdAt ||
      '',

    date: getDateKey(
      source.updatedAt ||
      source.createdAt,
    ),

    courseId:
      courseIds[0] ||
      null,

    courseIds,
    assignmentIds,

    course:
      source.course ||
      '',

    assignment:
      source.assignment ||
      '',

    route: `/sources/${source.id}`,

    author:
      source.author ||
      '',

    authors:
      source.authors ||
      '',

    subtitle:
      source.subtitle ||
      '',

    firstAuthorFirstName:
      source.firstAuthorFirstName ||
      '',

    firstAuthorLastName:
      source.firstAuthorLastName ||
      '',

    secondAuthorFirstName:
      source.secondAuthorFirstName ||
      '',

    secondAuthorLastName:
      source.secondAuthorLastName ||
      '',

    contributorsText:
      source.contributorsText ||
      '',

    forewordBy:
      source.forewordBy ||
      '',

    publisher:
      source.publisher ||
      '',

    publicationYear:
      source.year ||
      source.publicationYear ||
      '',

    year:
      source.year ||
      '',

    publicationPlace:
      source.publicationLocation ||
      source.publicationPlace ||
      '',

    publicationLocation:
      source.publicationLocation ||
      '',

    journalName:
      source.journal ||
      source.journalName ||
      '',

    journal:
      source.journal ||
      '',

    volume:
      source.volume ||
      '',

    issue:
      source.issue ||
      '',

    pages:
      source.pages ||
      '',

    pageRange:
      source.pageRange ||
      source.pages ||
      '',

    edition:
      source.edition ||
      '',

    isbn:
      source.isbn ||
      '',

    doi:
      source.doi ||
      '',

    url:
      source.url ||
      '',

    accessDate:
      source.accessDate ||
      '',

    citation:
      source.citation ||
      '',

    notes:
      source.notes ||
      '',

    sourceNotes:
      Array.isArray(source.sourceNotes)
        ? [...source.sourceNotes]
        : [],
  }
}

function findGraphNodeForEntity(
  nodes,
  type,
  entityId,
) {
  const cleanId = String(
    entityId || '',
  )

  if (!cleanId) {
    return null
  }

  const possibleIds = new Set([
    cleanId,
    `${type}-${cleanId}`,
    `${type}:${cleanId}`,
  ])

  return (
    nodes.find((node) => {
      return (
        node.type === type &&
        (
          possibleIds.has(
            String(node.id),
          ) ||
          possibleIds.has(
            String(node.entityId),
          )
        )
      )
    }) ||
    null
  )
}

function getSearchableStrings(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      return getSearchableStrings(item)
    })
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap(
      (item) => {
        return getSearchableStrings(item)
      },
    )
  }

  return [String(value)]
}

function nodeMatchesSearch(
  node,
  query,
) {
  const queryVariants =
    getSearchVariants(query)

  if (queryVariants.length === 0) {
    return true
  }

  const searchableValues = [
    node.title,
    node.label,
    node.subtitle,

    node.author,
    node.authors,

    node.description,

    node.type,
    node.sourceType,
    node.recordType,

    node.status,
    node.priority,

    node.publisher,
    node.publisherAliases,
    node.publicationYear,
    node.year,

    node.publicationPlace,
    node.publicationLocation,

    node.journalName,
    node.journal,

    node.volume,
    node.issue,
    node.pages,
    node.pageRange,
    node.pageCount,

    node.edition,
    node.genre,
    node.language,

    node.isbn,
    node.doi,
    node.url,
    node.accessDate,

    node.course,
    node.assignment,

    node.citation,
    node.summary,
    node.notes,
    node.sourceNotes,

    node.firstAuthorFirstName,
    node.firstAuthorLastName,
    node.secondAuthorFirstName,
    node.secondAuthorLastName,
    node.contributorsText,
    node.forewordBy,

    ...(node.tags || []),
  ]

  return searchableValues
    .flatMap((value) => {
      return getSearchableStrings(value)
    })
    .some((value) => {
      const valueVariants =
        getSearchVariants(value)

      return queryVariants.some(
        (queryVariant) => {
          return valueVariants.some(
            (valueVariant) => {
              return valueVariant.includes(
                queryVariant,
              )
            },
          )
        },
      )
    })
}

export function useKnowledgeGraph() {
  const {
    allBooks,
  } = useBooks()

  const {
    allSources,
  } = useSources()

  const baseNodes = ref(
    mockKnowledgeGraphNodes.map((node) => ({
      ...node,
      tags: [...(node.tags || [])],
    })),
  )

  const baseLinks = ref(
    mockKnowledgeGraphLinks.map((link) => ({
      ...link,
    })),
  )

  const discoveryItems = ref(
    mockGraphDiscoveryItems.map((item) => ({
      ...item,
    })),
  )

  const searchQuery = ref('')
  const selectedType = ref('all')
  const selectedTag = ref('all')
  const selectedCourse = ref('all')
  const graphDensity = ref(5)
  const todayOnly = ref(false)
  const showConnectedContext = ref(false)
  const graphViewMode = ref('card')
  const focusMode = ref(false)
  const selectedNode = ref(null)

  const graphNodeTypes = [
    ...SUPPORTED_GRAPH_NODE_TYPES,
  ]

  const activeTypes = ref([
    ...graphNodeTypes,
  ])

  const liveBookNodes = computed(() => {
    return allBooks.value.map((book) => {
      const matchingSource =
        findMatchingSourceForBook(
          book,
          allSources.value,
        )

      return createBookGraphNode(
        book,
        matchingSource,
      )
    })
  })

  const liveSourceNodes = computed(() => {
    return allSources.value
      .filter((source) => {
        if (
          normalizeSourceType(
            source.type,
          ) !== 'book'
        ) {
          return true
        }

        return !allBooks.value.some((book) => {
          return recordsRepresentSameBook(
            book,
            source,
          )
        })
      })
      .map((source) => {
        return createSourceGraphNode(source)
      })
  })

  const nodes = computed(() => {
    const hasLiveSources =
      liveBookNodes.value.length > 0 ||
      liveSourceNodes.value.length > 0

    const retainedBaseNodes =
      baseNodes.value.filter((node) => {
        if (!hasLiveSources) {
          return true
        }

        return !SOURCE_GRAPH_TYPES.includes(
          node.type,
        )
      })

    return [
      ...retainedBaseNodes,
      ...liveBookNodes.value,
      ...liveSourceNodes.value,
    ]
  })

  const liveBookLinks = computed(() => {
    const relationships = []

    liveBookNodes.value.forEach((bookNode) => {
      uniqueStrings(
        bookNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `book-course:${bookNode.entityId}:${courseNode.id}`,

          source: bookNode.id,
          target: courseNode.id,
          label: 'Used in course',
          strength: 4,
        })
      })

      uniqueStrings(
        bookNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `book-assignment:${bookNode.entityId}:${assignmentNode.id}`,

          source: bookNode.id,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 4,
        })
      })
    })

    return relationships
  })

  const liveSourceLinks = computed(() => {
    const relationships = []

    liveSourceNodes.value.forEach((sourceNode) => {
      uniqueStrings(
        sourceNode.courseIds || [],
      ).forEach((courseId) => {
        const courseNode =
          findGraphNodeForEntity(
            nodes.value,
            'course',
            courseId,
          )

        if (!courseNode) {
          return
        }

        relationships.push({
          id:
            `source-course:${sourceNode.entityId}:${courseNode.id}`,

          source: sourceNode.id,
          target: courseNode.id,
          label: 'Used in course',
          strength: 4,
        })
      })

      uniqueStrings(
        sourceNode.assignmentIds || [],
      ).forEach((assignmentId) => {
        const assignmentNode =
          findGraphNodeForEntity(
            nodes.value,
            'assignment',
            assignmentId,
          )

        if (!assignmentNode) {
          return
        }

        relationships.push({
          id:
            `source-assignment:${sourceNode.entityId}:${assignmentNode.id}`,

          source: sourceNode.id,
          target: assignmentNode.id,
          label: 'Supports assignment',
          strength: 4,
        })
      })
    })

    return relationships
  })

  const links = computed(() => {
    const existingNodeIds = new Set(
      nodes.value.map((node) => {
        return node.id
      }),
    )

    const seenRelationships = new Set()

    return [
      ...baseLinks.value,
      ...liveBookLinks.value,
      ...liveSourceLinks.value,
    ].filter((link) => {
      if (
        !existingNodeIds.has(link.source) ||
        !existingNodeIds.has(link.target)
      ) {
        return false
      }

      const key =
        link.id ||
        `${link.source}:${link.target}:${link.label || 'related'}`

      if (seenRelationships.has(key)) {
        return false
      }

      seenRelationships.add(key)
      return true
    })
  })

  const availableTags = computed(() => {
    const tags = new Map()

    nodes.value.forEach((node) => {
      ;(node.tags || []).forEach((tag) => {
        const cleanTag =
          String(tag || '').trim()

        const normalized =
          normalizeTag(cleanTag)

        if (
          !cleanTag ||
          !normalized ||
          tags.has(normalized)
        ) {
          return
        }

        tags.set(
          normalized,
          cleanTag,
        )
      })
    })

    return [...tags.values()].sort(
      (a, b) => {
        return a.localeCompare(b)
      },
    )
  })

  const courses = computed(() => {
    return nodes.value
      .filter((node) => {
        return node.type === 'course'
      })
      .sort((a, b) => {
        return String(
          a.title || '',
        ).localeCompare(
          String(b.title || ''),
        )
      })
  })

  const filteredNodes = computed(() => {
    let visibleNodes = [
      ...nodes.value,
    ]

    if (todayOnly.value) {
      const today =
        getLocalDateKey()

      visibleNodes =
        visibleNodes.filter((node) => {
          return node.date === today
        })
    }

    if (
      selectedType.value !== 'all'
    ) {
      visibleNodes =
        visibleNodes.filter((node) => {
          return (
            node.type ===
            selectedType.value
          )
        })
    }

    visibleNodes =
      visibleNodes.filter((node) => {
        return activeTypes.value.includes(
          node.type,
        )
      })

    if (
      selectedTag.value !== 'all'
    ) {
      const selectedTagValue =
        normalizeTag(
          selectedTag.value,
        )

      visibleNodes =
        visibleNodes.filter((node) => {
          return (
            node.tags || []
          ).some((tag) => {
            return (
              normalizeTag(tag) ===
              selectedTagValue
            )
          })
        })
    }

    if (
      selectedCourse.value !== 'all'
    ) {
      visibleNodes =
        visibleNodes.filter((node) => {
          const courseIds =
            uniqueStrings([
              node.courseId,
              ...(node.courseIds || []),
            ])

          return (
            node.id ===
              selectedCourse.value ||
            courseIds.includes(
              selectedCourse.value,
            )
          )
        })
    }

    const query =
      String(
        searchQuery.value || '',
      ).trim()

    if (query) {
      visibleNodes =
        visibleNodes.filter((node) => {
          return nodeMatchesSearch(
            node,
            query,
          )
        })
    }

    if (
      showConnectedContext.value &&
      visibleNodes.length > 0
    ) {
      const originalVisibleIds =
        new Set(
          visibleNodes.map((node) => {
            return node.id
          }),
        )

      const expandedIds =
        new Set(originalVisibleIds)

      links.value.forEach((link) => {
        if (
          originalVisibleIds.has(
            link.source,
          )
        ) {
          expandedIds.add(
            link.target,
          )
        }

        if (
          originalVisibleIds.has(
            link.target,
          )
        ) {
          expandedIds.add(
            link.source,
          )
        }
      })

      visibleNodes =
        nodes.value.filter((node) => {
          return expandedIds.has(
            node.id,
          )
        })
    }

    return visibleNodes
  })

  const filteredLinks = computed(() => {
    const visibleNodeIds =
      new Set(
        filteredNodes.value.map((node) => {
          return node.id
        }),
      )

    return links.value.filter((link) => {
      return (
        visibleNodeIds.has(
          link.source,
        ) &&
        visibleNodeIds.has(
          link.target,
        )
      )
    })
  })

  const selectedRelationships =
    computed(() => {
      if (!selectedNode.value) {
        return []
      }

      return links.value.filter((link) => {
        return (
          link.source ===
            selectedNode.value.id ||
          link.target ===
            selectedNode.value.id
        )
      })
    })

  const selectedRelatedNodes =
    computed(() => {
      if (!selectedNode.value) {
        return []
      }

      const relatedIds =
        new Set()

      selectedRelationships.value.forEach(
        (link) => {
          relatedIds.add(
            link.source ===
              selectedNode.value.id
              ? link.target
              : link.source,
          )
        },
      )

      return nodes.value.filter((node) => {
        return relatedIds.has(
          node.id,
        )
      })
    })

  const connectedNodes = computed(() => {
    return selectedRelatedNodes.value
  })

  const nodeStats = computed(() => {
    return buildStats(
      nodes.value,
      links.value,
    )
  })

  const visibleStats = computed(() => {
    return buildStats(
      filteredNodes.value,
      filteredLinks.value,
    )
  })

  const visibleRelationshipCount =
    computed(() => {
      return filteredLinks.value.length
    })

  const mostConnectedNode =
    computed(() => {
      const connectionCounts =
        new Map()

      links.value.forEach((link) => {
        connectionCounts.set(
          link.source,
          (
            connectionCounts.get(
              link.source,
            ) || 0
          ) + 1,
        )

        connectionCounts.set(
          link.target,
          (
            connectionCounts.get(
              link.target,
            ) || 0
          ) + 1,
        )
      })

      let winningNode = null
      let winningCount = -1

      nodes.value.forEach((node) => {
        const count =
          connectionCounts.get(
            node.id,
          ) || 0

        if (count > winningCount) {
          winningNode = node
          winningCount = count
        }
      })

      return winningNode
    })

  const orphanNodes = computed(() => {
    const connectedIds = new Set()

    links.value.forEach((link) => {
      connectedIds.add(link.source)
      connectedIds.add(link.target)
    })

    return nodes.value.filter((node) => {
      return !connectedIds.has(node.id)
    })
  })

  watch(
    nodes,
    (currentNodes) => {
      if (!selectedNode.value) {
        return
      }

      const refreshedNode =
        currentNodes.find((node) => {
          return (
            node.id ===
            selectedNode.value.id
          )
        })

      selectedNode.value =
        refreshedNode || null
    },
    {
      deep: true,
    },
  )

  watch(
    filteredNodes,
    (visibleNodes) => {
      if (!selectedNode.value) {
        return
      }

      const selectedIsVisible =
        visibleNodes.some((node) => {
          return (
            node.id ===
            selectedNode.value.id
          )
        })

      if (!selectedIsVisible) {
        selectedNode.value = null
      }
    },
    {
      deep: true,
    },
  )

  function toggleType(type) {
    if (
      activeTypes.value.includes(type)
    ) {
      activeTypes.value =
        activeTypes.value.filter((item) => {
          return item !== type
        })
    } else {
      activeTypes.value = [
        ...activeTypes.value,
        type,
      ]
    }
  }

  function selectNode(node) {
    selectedNode.value =
      node || null
  }

  function revealNode(node) {
    if (!node) {
      return
    }

    searchQuery.value = ''
    selectedType.value = 'all'
    selectedTag.value = 'all'
    selectedCourse.value = 'all'
    todayOnly.value = false

    activeTypes.value = [
      ...graphNodeTypes,
    ]

    selectedNode.value = node
  }

  function clearSelection() {
    selectedNode.value = null
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedType.value = 'all'
    selectedTag.value = 'all'
    selectedCourse.value = 'all'
    graphDensity.value = 5
    todayOnly.value = false
    showConnectedContext.value = false

    activeTypes.value = [
      ...graphNodeTypes,
    ]
  }

  function clearFilters() {
    resetFilters()
  }

  function searchNode(query) {
    searchQuery.value =
      String(query || '')
  }

  function getNodeById(id) {
    return (
      nodes.value.find((node) => {
        return (
          String(node.id) ===
          String(id)
        )
      }) ||
      null
    )
  }

  function getConnectionsForNode(id) {
    return links.value.filter((link) => {
      return (
        String(link.source) ===
          String(id) ||
        String(link.target) ===
          String(id)
      )
    })
  }

  return {
    graphNodeTypes,

    nodes,
    links,
    discoveryItems,

    searchQuery,
    selectedType,
    selectedTag,
    selectedCourse,
    graphDensity,
    todayOnly,
    showConnectedContext,
    graphViewMode,
    focusMode,
    selectedNode,

    activeTypes,

    availableTags,
    courses,
    filteredNodes,
    filteredLinks,
    selectedRelationships,
    selectedRelatedNodes,
    connectedNodes,

    nodeStats,
    visibleStats,
    visibleRelationshipCount,
    mostConnectedNode,
    orphanNodes,

    toggleType,
    selectNode,
    revealNode,
    clearSelection,
    resetFilters,
    clearFilters,
    searchNode,
    getNodeById,
    getConnectionsForNode,
  }
}

function buildStats(
  nodes,
  links,
) {
  const countsByType = {}

  SUPPORTED_GRAPH_NODE_TYPES.forEach((type) => {
    countsByType[type] =
      nodes.filter((node) => {
        return node.type === type
      }).length
  })

  return {
    nodeCount:
      nodes.length,

    relationshipCount:
      links.length,

    totalNodes:
      nodes.length,

    totalConnections:
      links.length,

    countsByType,
  }
}