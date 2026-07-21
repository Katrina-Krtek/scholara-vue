export const RESEARCH_METADATA_SCHEMA_VERSION = 1

export const CREATOR_ROLE_DEFINITIONS = {
  authors: {
    key: 'authors',
    label: 'Authors',
    singularLabel: 'Author',
    citationRole: 'author',
  },

  editors: {
    key: 'editors',
    label: 'Editors',
    singularLabel: 'Editor',
    citationRole: 'editor',
  },

  translators: {
    key: 'translators',
    label: 'Translators',
    singularLabel: 'Translator',
    citationRole: 'translator',
  },

  contributors: {
    key: 'contributors',
    label: 'Contributors',
    singularLabel: 'Contributor',
    citationRole: 'contributor',
  },

  directors: {
    key: 'directors',
    label: 'Directors',
    singularLabel: 'Director',
    citationRole: 'director',
  },

  producers: {
    key: 'producers',
    label: 'Producers',
    singularLabel: 'Producer',
    citationRole: 'producer',
  },

  presenters: {
    key: 'presenters',
    label: 'Presenters',
    singularLabel: 'Presenter',
    citationRole: 'presenter',
  },

  interviewers: {
    key: 'interviewers',
    label: 'Interviewers',
    singularLabel: 'Interviewer',
    citationRole: 'interviewer',
  },

  interviewees: {
    key: 'interviewees',
    label: 'Interviewees',
    singularLabel: 'Interviewee',
    citationRole: 'interviewee',
  },

  advisors: {
    key: 'advisors',
    label: 'Advisors',
    singularLabel: 'Advisor',
    citationRole: 'advisor',
  },

  senders: {
    key: 'senders',
    label: 'Senders',
    singularLabel: 'Sender',
    citationRole: 'author',
  },

  recipients: {
    key: 'recipients',
    label: 'Recipients',
    singularLabel: 'Recipient',
    citationRole: 'recipient',
  },
}

export const FIELD_DEFINITIONS = {
  shortTitle: {
    key: 'shortTitle',
    label: 'Short Title',
    icon: '⌁',
    placeholder: 'Shortened title for notes and citations',
  },

  publicationTitle: {
    key: 'publicationTitle',
    label: 'Publication / Container Title',
    icon: '📰',
    placeholder: 'Journal, website, blog, book, or collection title',
  },

  publisher: {
    key: 'publisher',
    label: 'Publisher',
    icon: '⌂',
    placeholder: 'Publisher',
  },

  placeOfPublication: {
    key: 'placeOfPublication',
    label: 'Place of Publication',
    icon: '⌖',
    placeholder: 'City, state, province, or country',
  },

  publicationDate: {
    key: 'publicationDate',
    label: 'Publication Date',
    icon: '📅',
    placeholder: 'YYYY, YYYY-MM, or YYYY-MM-DD',
  },

  originalPublicationDate: {
    key: 'originalPublicationDate',
    label: 'Original Publication Date',
    icon: '📅',
    placeholder: 'Original publication date',
  },

  accessedDate: {
    key: 'accessedDate',
    label: 'Accessed Date',
    icon: '📅',
    control: 'date',
  },

  edition: {
    key: 'edition',
    label: 'Edition',
    icon: '▤',
    placeholder: '2nd edition',
  },

  seriesTitle: {
    key: 'seriesTitle',
    label: 'Series Title',
    icon: '▥',
    placeholder: 'Series title',
  },

  seriesNumber: {
    key: 'seriesNumber',
    label: 'Series Number',
    icon: '№',
    placeholder: 'Series number',
  },

  volume: {
    key: 'volume',
    label: 'Volume',
    icon: 'V',
    placeholder: 'Volume',
  },

  numberOfVolumes: {
    key: 'numberOfVolumes',
    label: 'Number of Volumes',
    icon: '▤',
    placeholder: 'Total number of volumes',
  },

  issue: {
    key: 'issue',
    label: 'Issue',
    icon: '№',
    placeholder: 'Issue',
  },

  pages: {
    key: 'pages',
    label: 'Pages',
    icon: '☰',
    placeholder: '45–68',
  },

  pageCount: {
    key: 'pageCount',
    label: 'Page Count',
    icon: '☰',
    placeholder: '250',
  },

  isbn: {
    key: 'isbn',
    label: 'ISBN',
    icon: '#',
    placeholder: 'ISBN',
  },

  issn: {
    key: 'issn',
    label: 'ISSN',
    icon: '#',
    placeholder: 'ISSN',
  },

  doi: {
    key: 'doi',
    label: 'DOI',
    icon: '🔗',
    placeholder: '10.xxxx/xxxxx',
  },

  url: {
    key: 'url',
    label: 'URL',
    icon: '🌐',
    control: 'url',
    placeholder: 'https://...',
  },

  abstract: {
    key: 'abstract',
    label: 'Abstract',
    icon: '¶',
    control: 'textarea',
    rows: 7,
    wide: true,
    placeholder: 'Paste or summarize the abstract.',
  },

  language: {
    key: 'language',
    label: 'Language',
    icon: '🗣️',
    placeholder: 'English',
  },

  archive: {
    key: 'archive',
    label: 'Archive',
    icon: '🏦',
    placeholder: 'Archive or special collection',
  },

  archiveLocation: {
    key: 'archiveLocation',
    label: 'Archive Location',
    icon: '⌖',
    placeholder: 'Box, folder, collection, or physical location',
  },

  libraryCatalog: {
    key: 'libraryCatalog',
    label: 'Library Catalog',
    icon: '🗄️',
    placeholder: 'WorldCat, university catalog, or other catalog',
  },

  callNumber: {
    key: 'callNumber',
    label: 'Call Number',
    icon: '#',
    placeholder: 'Library call number',
  },

  rights: {
    key: 'rights',
    label: 'Rights',
    icon: '©',
    placeholder: 'Copyright or usage rights',
  },

  extra: {
    key: 'extra',
    label: 'Extra Citation Metadata',
    icon: '+',
    control: 'textarea',
    rows: 5,
    wide: true,
    placeholder: 'Additional identifiers, citation fields, or notes',
  },

  institution: {
    key: 'institution',
    label: 'University / Institution',
    icon: '🏛️',
    placeholder: 'Liberty University',
  },

  degree: {
    key: 'degree',
    label: 'Degree',
    icon: '🎓',
    placeholder: 'Doctor of Ministry, PhD, ThM, MA, etc.',
  },

  department: {
    key: 'department',
    label: 'Department / Program',
    icon: '🏫',
    placeholder: 'School, department, or program',
  },

  database: {
    key: 'database',
    label: 'Database',
    icon: '🗄️',
    placeholder: 'ProQuest Dissertations & Theses Global',
  },

  repository: {
    key: 'repository',
    label: 'Repository',
    icon: '🏦',
    placeholder: 'Institutional repository',
  },

  publicationNumber: {
    key: 'publicationNumber',
    label: 'Publication / Document Number',
    icon: '#',
    placeholder: 'Publication or document number',
  },

  platform: {
    key: 'platform',
    label: 'Platform',
    icon: '▶️',
    placeholder: 'YouTube, Vimeo, Spotify, Apple Podcasts, etc.',
  },

  medium: {
    key: 'medium',
    label: 'Medium',
    icon: '▣',
    placeholder: 'Video, audio, film, streaming media, etc.',
  },

  runningTime: {
    key: 'runningTime',
    label: 'Running Time',
    icon: '◷',
    placeholder: '1:24:30',
  },

  episodeNumber: {
    key: 'episodeNumber',
    label: 'Episode Number',
    icon: '№',
    placeholder: 'Episode number',
  },

  seasonNumber: {
    key: 'seasonNumber',
    label: 'Season Number',
    icon: '№',
    placeholder: 'Season number',
  },

  format: {
    key: 'format',
    label: 'Format',
    icon: '▣',
    placeholder: 'Email, letter, interview, text message, etc.',
  },

  body: {
    key: 'body',
    label: 'Body',
    icon: '¶',
    control: 'textarea',
    rows: 8,
    wide: true,
    placeholder: 'Write the note.',
  },

  definition: {
    key: 'definition',
    label: 'Definition',
    icon: '💡',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Define the concept.',
  },

  relatedIdeas: {
    key: 'relatedIdeas',
    label: 'Related Ideas',
    icon: '🔗',
    control: 'textarea',
    rows: 5,
    wide: true,
    placeholder: 'List related ideas or concepts.',
  },

  role: {
    key: 'role',
    label: 'Role',
    icon: '👤',
    placeholder: 'Role or relationship',
  },

  notes: {
    key: 'notes',
    label: 'Notes',
    icon: '📝',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Add notes.',
  },

  course: {
    key: 'course',
    label: 'Course',
    icon: '📘',
    placeholder: 'Course',
  },

  dueDate: {
    key: 'dueDate',
    label: 'Due Date',
    icon: '📅',
    control: 'date',
  },

  requirements: {
    key: 'requirements',
    label: 'Requirements',
    icon: '📋',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Assignment requirements.',
  },

  quoteText: {
    key: 'quoteText',
    label: 'Quote',
    icon: '❝',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Quote text',
  },

  sourceId: {
    key: 'sourceId',
    label: 'Source ID',
    icon: '🔗',
    placeholder: 'Linked source ID',
  },

  pageNumber: {
    key: 'pageNumber',
    label: 'Page Number',
    icon: '☰',
    placeholder: 'Page number',
  },
}

export const RESEARCH_TYPE_METADATA = {
  book: {
    isCitable: true,
    citationType: 'book',

    creatorRoles: [
      'authors',
      'editors',
      'translators',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'publisher',
      'placeOfPublication',
      'publicationDate',
      'edition',
      'isbn',
      'pages',
      'language',
    ],

    advancedFields: [
      'originalPublicationDate',
      'seriesTitle',
      'seriesNumber',
      'volume',
      'numberOfVolumes',
      'pageCount',
      'doi',
      'url',
      'accessedDate',
      'abstract',
      'archive',
      'archiveLocation',
      'libraryCatalog',
      'callNumber',
      'rights',
      'extra',
    ],
  },

  article: {
    isCitable: true,
    citationType: 'article-journal',

    creatorRoles: [
      'authors',
      'editors',
      'translators',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'publicationTitle',
      'publicationDate',
      'volume',
      'issue',
      'pages',
      'doi',
      'url',
      'abstract',
      'language',
    ],

    advancedFields: [
      'issn',
      'accessedDate',
      'archive',
      'archiveLocation',
      'libraryCatalog',
      'callNumber',
      'rights',
      'extra',
    ],
  },

  dissertation: {
    isCitable: true,
    citationType: 'thesis',

    creatorRoles: [
      'authors',
      'advisors',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'institution',
      'degree',
      'department',
      'publicationDate',
      'database',
      'repository',
      'publicationNumber',
      'doi',
      'url',
      'abstract',
      'language',
    ],

    advancedFields: [
      'accessedDate',
      'archive',
      'archiveLocation',
      'libraryCatalog',
      'callNumber',
      'rights',
      'extra',
    ],
  },

  thesis: {
    isCitable: true,
    citationType: 'thesis',

    creatorRoles: [
      'authors',
      'advisors',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'institution',
      'degree',
      'department',
      'publicationDate',
      'database',
      'repository',
      'publicationNumber',
      'doi',
      'url',
      'abstract',
      'language',
    ],

    advancedFields: [
      'accessedDate',
      'archive',
      'archiveLocation',
      'libraryCatalog',
      'callNumber',
      'rights',
      'extra',
    ],
  },

  website: {
    isCitable: true,
    citationType: 'webpage',

    creatorRoles: [
      'authors',
      'editors',
      'translators',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'publicationTitle',
      'publicationDate',
      'accessedDate',
      'url',
      'language',
    ],

    advancedFields: [
      'publisher',
      'abstract',
      'rights',
      'extra',
    ],
  },

  blog: {
    isCitable: true,
    citationType: 'post-weblog',

    creatorRoles: [
      'authors',
      'editors',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'publicationTitle',
      'publicationDate',
      'accessedDate',
      'url',
      'language',
    ],

    advancedFields: [
      'abstract',
      'rights',
      'extra',
    ],
  },

  video: {
    isCitable: true,
    citationType: 'motion_picture',

    creatorRoles: [
      'authors',
      'directors',
      'producers',
      'presenters',
      'contributors',
    ],

    fields: [
      'shortTitle',
      'publicationTitle',
      'platform',
      'publicationDate',
      'accessedDate',
      'url',
      'language',
    ],

    advancedFields: [
      'medium',
      'runningTime',
      'episodeNumber',
      'seasonNumber',
      'publisher',
      'abstract',
      'rights',
      'extra',
    ],
  },

  communication: {
    isCitable: true,
    citationType: 'personal_communication',

    creatorRoles: [
      'senders',
      'recipients',
      'interviewers',
      'interviewees',
    ],

    fields: [
      'publicationDate',
      'format',
    ],

    advancedFields: [
      'archive',
      'archiveLocation',
      'rights',
      'extra',
    ],
  },

  note: {
    isCitable: false,
    citationType: null,
    creatorRoles: [],
    fields: ['body'],
    advancedFields: [],
  },

  concept: {
    isCitable: false,
    citationType: null,
    creatorRoles: [],
    fields: [
      'definition',
      'relatedIdeas',
    ],
    advancedFields: [],
  },

  person: {
    isCitable: false,
    citationType: null,
    creatorRoles: [],
    fields: [
      'role',
      'notes',
    ],
    advancedFields: [],
  },

  assignment: {
    isCitable: false,
    citationType: null,
    creatorRoles: [],
    fields: [
      'course',
      'dueDate',
      'requirements',
    ],
    advancedFields: [],
  },

  quote: {
    isCitable: false,
    citationType: null,
    creatorRoles: [],
    fields: [
      'quoteText',
      'sourceId',
      'pageNumber',
    ],
    advancedFields: [],
  },
}

const EMPTY_TYPE_METADATA = {
  isCitable: false,
  citationType: null,
  creatorRoles: [],
  fields: [],
  advancedFields: [],
}

export function getResearchMetadataConfig(
  typeId,
) {
  return (
    RESEARCH_TYPE_METADATA[
      String(typeId || '')
    ] ||
    EMPTY_TYPE_METADATA
  )
}

export function getFieldDefinition(
  fieldKey,
) {
  return (
    FIELD_DEFINITIONS[fieldKey] ||
    {
      key: fieldKey,
      label:
        formatFieldLabel(
          fieldKey,
        ),
      icon: '•',
      placeholder: '',
    }
  )
}

export function getFieldDefinitionsForType(
  typeId,
  {
    includeAdvanced = false,
  } = {},
) {
  const config =
    getResearchMetadataConfig(
      typeId,
    )

  const fieldKeys =
    includeAdvanced
      ? [
          ...config.fields,
          ...config.advancedFields,
        ]
      : config.fields

  return fieldKeys.map(
    getFieldDefinition,
  )
}

export function getCreatorRoleDefinitionsForType(
  typeId,
) {
  const config =
    getResearchMetadataConfig(
      typeId,
    )

  return config.creatorRoles
    .map((roleKey) => {
      return (
        CREATOR_ROLE_DEFINITIONS[
          roleKey
        ] ||
        null
      )
    })
    .filter(Boolean)
}

export function isCitableResearchType(
  typeId,
) {
  return Boolean(
    getResearchMetadataConfig(
      typeId,
    ).isCitable,
  )
}

export function getCitationTypeForResearchType(
  typeId,
) {
  return (
    getResearchMetadataConfig(
      typeId,
    ).citationType ||
    null
  )
}

export function createEmptyCreator() {
  return {
    creatorType: 'person',
    firstName: '',
    middleName: '',
    initial: '',
    lastName: '',
    nameParticle: '',
    suffix: '',
    literal: '',
  }
}

export function normalizeCreator(
  creator,
) {
  if (!creator) {
    return null
  }

  if (
    typeof creator ===
    'string'
  ) {
    const literal =
      creator.trim()

    if (!literal) {
      return null
    }

    return {
      ...createEmptyCreator(),
      creatorType: 'literal',
      literal,
    }
  }

  const literal =
    String(
      creator.literal ||
      creator.raw ||
      creator.name ||
      '',
    ).trim()

  const normalized = {
    ...createEmptyCreator(),

    creatorType:
      creator.creatorType ||
      (
        literal
          ? 'literal'
          : 'person'
      ),

    firstName:
      String(
        creator.firstName ||
        creator.given ||
        '',
      ).trim(),

    middleName:
      String(
        creator.middleName ||
        creator.middle ||
        '',
      ).trim(),

    initial:
      String(
        creator.initial ||
        '',
      ).trim(),

    lastName:
      String(
        creator.lastName ||
        creator.family ||
        '',
      ).trim(),

    nameParticle:
      String(
        creator.nameParticle ||
        creator.particle ||
        creator[
          'non-dropping-particle'
        ] ||
        '',
      ).trim(),

    suffix:
      String(
        creator.suffix ||
        '',
      ).trim(),

    literal,
  }

  const hasValue =
    normalized.literal ||
    normalized.firstName ||
    normalized.middleName ||
    normalized.initial ||
    normalized.lastName ||
    normalized.nameParticle ||
    normalized.suffix

  return hasValue
    ? normalized
    : null
}

export function normalizeCreatorList(
  value,
) {
  if (!value) {
    return []
  }

  if (
    typeof value ===
    'string'
  ) {
    return value
      .split(';')
      .map((entry) => {
        return normalizeCreator(
          entry,
        )
      })
      .filter(Boolean)
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(normalizeCreator)
      .filter(Boolean)
  }

  const normalized =
    normalizeCreator(value)

  return normalized
    ? [normalized]
    : []
}

export function cleanCreatorList(
  creators = [],
) {
  return normalizeCreatorList(
    creators,
  )
}

export function cloneCreatorList(
  creators = [],
  {
    ensureOne = false,
  } = {},
) {
  const cloned =
    normalizeCreatorList(
      creators,
    ).map((creator) => {
      return {
        ...creator,
      }
    })

  if (
    ensureOne &&
    cloned.length === 0
  ) {
    return [
      createEmptyCreator(),
    ]
  }

  return cloned
}

export function normalizeResearchMetadata(
  typeId,
  metadata = {},
) {
  const source =
    metadata &&
    typeof metadata ===
      'object'
      ? metadata
      : {}

  const normalized = {
    ...source,

    schemaVersion:
      RESEARCH_METADATA_SCHEMA_VERSION,

    citationType:
      getCitationTypeForResearchType(
        typeId,
      ),
  }

  if (
    !normalized.publicationTitle
  ) {
    normalized.publicationTitle =
      source.journal ||
      source.journalTitle ||
      source.siteName ||
      source.blogName ||
      source.containerTitle ||
      ''
  }

  if (
    !normalized.publicationDate
  ) {
    normalized.publicationDate =
      source.publishedDate ||
      source.year ||
      source.date ||
      ''
  }

  if (
    !normalized.accessedDate
  ) {
    normalized.accessedDate =
      source.accessDate ||
      ''
  }

  if (!normalized.pages) {
    normalized.pages =
      source.pageRange ||
      ''
  }

  if (
    !normalized.placeOfPublication
  ) {
    normalized.placeOfPublication =
      source.place ||
      ''
  }

  if (
    !Array.isArray(
      normalized.authors,
    )
  ) {
    normalized.authors =
      normalizeCreatorList(
        source.author ||
        source.creator,
      )
  } else {
    normalized.authors =
      normalizeCreatorList(
        normalized.authors,
      )
  }

  normalized.editors =
    normalizeCreatorList(
      source.editors ||
      source.editor,
    )

  normalized.translators =
    normalizeCreatorList(
      source.translators ||
      source.translator,
    )

  normalized.contributors =
    normalizeCreatorList(
      source.contributors ||
      source.contributor,
    )

  normalized.advisors =
    normalizeCreatorList(
      source.advisors ||
      source.advisor,
    )

  normalized.senders =
    normalizeCreatorList(
      source.senders ||
      source.sender,
    )

  normalized.recipients =
    normalizeCreatorList(
      source.recipients ||
      source.recipient,
    )

  return normalized
}

export function createMetadataForType(
  typeId,
  existingMetadata = {},
  {
    includeAdvanced = true,
  } = {},
) {
  const normalized =
    normalizeResearchMetadata(
      typeId,
      existingMetadata,
    )

  const fieldDefinitions =
    getFieldDefinitionsForType(
      typeId,
      {
        includeAdvanced,
      },
    )

  fieldDefinitions.forEach(
    (field) => {
      if (
        normalized[field.key] ===
          undefined ||
        normalized[field.key] ===
          null
      ) {
        normalized[field.key] =
          ''
      }
    },
  )

  getCreatorRoleDefinitionsForType(
    typeId,
  ).forEach((role) => {
    normalized[role.key] =
      normalizeCreatorList(
        normalized[role.key],
      )
  })

  return normalized
}

function formatFieldLabel(
  value,
) {
  return String(value || '')
    .replace(
      /([a-z])([A-Z])/g,
      '$1 $2',
    )
    .replace(/[_-]+/g, ' ')
    .replace(
      /\b\w/g,
      (character) => {
        return character
          .toUpperCase()
      },
    )
}