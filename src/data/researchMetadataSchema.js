export const RESEARCH_METADATA_SCHEMA_VERSION = 1

const TYPE_ALIASES = {
  'journal-article': 'article',
  'academic-article': 'article',
  'research-article': 'article',
  webpage: 'website',
  'web-page': 'website',
  web: 'website',
  'blog-post': 'blog',
  'blog-entry': 'blog',
  'doctoral-dissertation': 'dissertation',
  'phd-dissertation': 'dissertation',
  'masters-thesis': 'thesis',
  'master-thesis': 'thesis',
  'conference-paper': 'conference',
  presentation: 'conference',
  'personal-communication': 'communication',
  email: 'communication',
  letter: 'communication',
  'book-chapter': 'bookChapter',
  chapter: 'bookChapter',
}

export const CREATOR_ROLE_DEFINITIONS = {
  authors: {
    key: 'authors',
    label: 'Authors',
    singularLabel: 'Author',
  },

  editors: {
    key: 'editors',
    label: 'Editors',
    singularLabel: 'Editor',
  },

  translators: {
    key: 'translators',
    label: 'Translators',
    singularLabel: 'Translator',
  },

  contributors: {
    key: 'contributors',
    label: 'Contributors',
    singularLabel: 'Contributor',
  },

  directors: {
    key: 'directors',
    label: 'Directors',
    singularLabel: 'Director',
  },

  producers: {
    key: 'producers',
    label: 'Producers',
    singularLabel: 'Producer',
  },

  presenters: {
    key: 'presenters',
    label: 'Presenters',
    singularLabel: 'Presenter',
  },

  interviewers: {
    key: 'interviewers',
    label: 'Interviewers',
    singularLabel: 'Interviewer',
  },

  interviewees: {
    key: 'interviewees',
    label: 'Interviewees',
    singularLabel: 'Interviewee',
  },

  senders: {
    key: 'senders',
    label: 'Senders',
    singularLabel: 'Sender',
  },

  recipients: {
    key: 'recipients',
    label: 'Recipients',
    singularLabel: 'Recipient',
  },

  advisors: {
    key: 'advisors',
    label: 'Advisors / Committee Members',
    singularLabel: 'Advisor',
  },
}

export const FIELD_DEFINITIONS = {
  subtitle: {
    key: 'subtitle',
    label: 'Subtitle',
    icon: '⌁',
    placeholder: 'Subtitle',
  },

  shortTitle: {
    key: 'shortTitle',
    label: 'Short Title',
    icon: '⌁',
    placeholder: 'Shortened title for notes and citations',
  },

  publicationTitle: {
    key: 'publicationTitle',
    label: 'Publication / Container Title',
    icon: '▤',
    placeholder: 'Journal, website, blog, platform, or container title',
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
    placeholder: 'City, State or Country',
  },

  publicationDate: {
    key: 'publicationDate',
    label: 'Publication Date',
    icon: '📅',
    placeholder: 'MM-DD-YYYY',
  },

  publicationYear: {
    key: 'publicationYear',
    label: 'Publication Year',
    icon: '◷',
    placeholder: '2025',
  },

  publicationSeason: {
    key: 'publicationSeason',
    label: 'Publication Season',
    icon: '🍂',
    placeholder: 'Spring, Summer, Fall, or Winter',
  },

  accessedDate: {
    key: 'accessedDate',
    label: 'Accessed Date',
    icon: '📅',
    placeholder: 'MM-DD-YYYY',
  },

  originalPublicationDate: {
    key: 'originalPublicationDate',
    label: 'Original Publication Date',
    icon: '📅',
    placeholder: 'MM-DD-YYYY',
  },

  originalTitle: {
    key: 'originalTitle',
    label: 'Original Title',
    icon: '⌁',
    placeholder: 'Original-language or earlier title',
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
    icon: '#',
    placeholder: '2',
  },

  volume: {
    key: 'volume',
    label: 'Volume',
    icon: 'V',
    placeholder: '22',
  },

  numberOfVolumes: {
    key: 'numberOfVolumes',
    label: 'Number of Volumes',
    icon: '#',
    placeholder: '3',
  },

  issue: {
    key: 'issue',
    label: 'Issue',
    icon: 'No.',
    placeholder: '2',
  },

  pages: {
    key: 'pages',
    label: 'Pages',
    icon: '☰',
    placeholder: '171–183',
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
    placeholder: '978-0-000000-00-0',
  },

  issn: {
    key: 'issn',
    label: 'ISSN',
    icon: '#',
    placeholder: '0000-0000',
  },

  doi: {
    key: 'doi',
    label: 'DOI',
    icon: '↗',
    placeholder: '10.xxxx/xxxxx',
  },

  url: {
    key: 'url',
    label: 'URL',
    icon: '🔗',
    control: 'url',
    placeholder: 'https://',
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
    icon: '🌐',
    placeholder: 'English',
  },

  institution: {
    key: 'institution',
    label: 'University / Institution',
    icon: '🏛️',
    placeholder: 'Southeastern University',
  },

  degree: {
    key: 'degree',
    label: 'Degree',
    icon: '🎓',
    placeholder: 'PhD, DMin, ThM, MA, etc.',
  },

  department: {
    key: 'department',
    label: 'Department / Program',
    icon: '▦',
    placeholder: 'School, department, or program',
  },

  database: {
    key: 'database',
    label: 'Database',
    icon: '▤',
    placeholder: 'ProQuest Dissertations & Theses Global',
  },

  repository: {
    key: 'repository',
    label: 'Repository',
    icon: '⌂',
    placeholder: 'Institutional repository or archive',
  },

  publicationNumber: {
    key: 'publicationNumber',
    label: 'Publication / Document Number',
    icon: '#',
    placeholder: '31635562',
  },

  archive: {
    key: 'archive',
    label: 'Archive',
    icon: '⌂',
    placeholder: 'Archive or special collection',
  },

  archiveLocation: {
    key: 'archiveLocation',
    label: 'Archive Location',
    icon: '⌖',
    placeholder: 'Box, folder, collection, or location',
  },

  callNumber: {
    key: 'callNumber',
    label: 'Call Number',
    icon: '#',
    placeholder: 'Library call number',
  },

  libraryCatalog: {
    key: 'libraryCatalog',
    label: 'Library Catalog',
    icon: '▤',
    placeholder: 'WorldCat, university catalog, etc.',
  },

  rights: {
    key: 'rights',
    label: 'Rights',
    icon: '©',
    placeholder: 'Copyright or license information',
  },

  extra: {
    key: 'extra',
    label: 'Extra Citation Information',
    icon: '+',
    control: 'textarea',
    rows: 5,
    wide: true,
    placeholder: 'Additional metadata that does not fit another field.',
  },

  platform: {
    key: 'platform',
    label: 'Platform',
    icon: '▶️',
    placeholder: 'YouTube, Vimeo, Spotify, Apple Podcasts, etc.',
  },

  channelName: {
    key: 'channelName',
    label: 'Channel / Account Name',
    icon: '▶️',
    placeholder: 'Channel or account name',
  },

  runningTime: {
    key: 'runningTime',
    label: 'Running Time',
    icon: '◷',
    placeholder: '12:34',
  },

  episodeNumber: {
    key: 'episodeNumber',
    label: 'Episode Number',
    icon: '#',
    placeholder: '42',
  },

  podcastTitle: {
    key: 'podcastTitle',
    label: 'Podcast Title',
    icon: '🎙️',
    placeholder: 'Podcast or show title',
  },

  conferenceName: {
    key: 'conferenceName',
    label: 'Conference Name',
    icon: '🎤',
    placeholder: 'Conference or event name',
  },

  eventPlace: {
    key: 'eventPlace',
    label: 'Event Location',
    icon: '⌖',
    placeholder: 'City, venue, or online',
  },

  meetingName: {
    key: 'meetingName',
    label: 'Meeting / Session Name',
    icon: '🎤',
    placeholder: 'Panel, session, or meeting name',
  },

  churchName: {
    key: 'churchName',
    label: 'Church / Ministry',
    icon: '⛪',
    placeholder: 'Church or ministry name',
  },

  scripturePassage: {
    key: 'scripturePassage',
    label: 'Scripture Passage',
    icon: '📖',
    placeholder: 'John 15:1–17',
  },

  medium: {
    key: 'medium',
    label: 'Medium',
    icon: '▣',
    placeholder: 'Video, audio, transcript, streaming media, etc.',
  },

  format: {
    key: 'format',
    label: 'Format',
    icon: '▣',
    placeholder: 'Email, letter, interview, memo, etc.',
  },

  date: {
    key: 'date',
    label: 'Date',
    icon: '📅',
    placeholder: 'MM-DD-YYYY',
  },

  subject: {
    key: 'subject',
    label: 'Subject',
    icon: '⌁',
    placeholder: 'Email or communication subject',
  },

  body: {
    key: 'body',
    label: 'Body',
    icon: '¶',
    control: 'textarea',
    rows: 8,
    wide: true,
    placeholder: 'Write or paste the communication.',
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
    placeholder: 'MM-DD-YYYY',
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

  status: {
    key: 'status',
    label: 'Status',
    icon: '◷',
    placeholder: 'inbox',
  },

  coverImageUrl: {
    key: 'coverImageUrl',
    label: 'Cover Image URL',
    icon: '🖼️',
    control: 'url',
    placeholder: 'https://',
  },

  bannerImageUrl: {
    key: 'bannerImageUrl',
    label: 'Banner Image URL',
    icon: '🖼️',
    control: 'url',
    placeholder: 'https://',
  },

  bannerObjectPositionY: {
    key: 'bannerObjectPositionY',
    label: 'Banner Position',
    icon: '↕',
    placeholder: '50',
  },
}

const COMMON_CITATION_ADVANCED_FIELDS = [
  'abstract',
  'language',
  'archive',
  'archiveLocation',
  'callNumber',
  'libraryCatalog',
  'rights',
  'extra',
]

export const RESEARCH_TYPE_METADATA = {
  book: {
    citable: true,
    citationType: 'book',
    creatorRoles: [
      'authors',
      'editors',
      'translators',
      'contributors',
    ],
    fields: [
      'subtitle',
      'shortTitle',
      'publisher',
      'placeOfPublication',
      'publicationDate',
      'publicationYear',
      'edition',
      'seriesTitle',
      'seriesNumber',
      'volume',
      'numberOfVolumes',
      'pages',
      'pageCount',
      'isbn',
      'url',
    ],
    advancedFields: [
      'originalPublicationDate',
      'originalTitle',
      'doi',
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  bookChapter: {
    citable: true,
    citationType: 'chapter',
    creatorRoles: [
      'authors',
      'editors',
      'translators',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'publicationTitle',
      'publisher',
      'placeOfPublication',
      'publicationDate',
      'publicationYear',
      'edition',
      'seriesTitle',
      'seriesNumber',
      'volume',
      'pages',
      'isbn',
      'doi',
      'url',
      'accessedDate',
    ],
    advancedFields: [
      'originalPublicationDate',
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  article: {
    citable: true,
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
      'publicationYear',
      'publicationSeason',
      'volume',
      'issue',
      'pages',
      'doi',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      'issn',
      'database',
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  journal: {
    citable: true,
    citationType: 'article-journal',
    creatorRoles: [
      'editors',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'publisher',
      'publicationDate',
      'publicationYear',
      'publicationSeason',
      'volume',
      'issue',
      'issn',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      'placeOfPublication',
      'database',
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  dissertation: {
    citable: true,
    citationType: 'thesis',
    creatorRoles: [
      'authors',
      'advisors',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'degree',
      'institution',
      'department',
      'publicationDate',
      'publicationYear',
      'publicationNumber',
      'database',
      'repository',
      'pages',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  thesis: {
    citable: true,
    citationType: 'thesis',
    creatorRoles: [
      'authors',
      'advisors',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'degree',
      'institution',
      'department',
      'publicationDate',
      'publicationYear',
      'publicationNumber',
      'database',
      'repository',
      'pages',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  website: {
    citable: true,
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
      'publicationYear',
      'accessedDate',
      'url',
      'language',
    ],
    advancedFields: [
      'publisher',
      'rights',
      'extra',
    ],
  },

  blog: {
    citable: true,
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
      'publicationYear',
      'accessedDate',
      'url',
      'language',
    ],
    advancedFields: [
      'publisher',
      'rights',
      'extra',
    ],
  },

  video: {
    citable: true,
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
      'platform',
      'channelName',
      'publicationDate',
      'publicationYear',
      'accessedDate',
      'runningTime',
      'url',
      'language',
    ],
    advancedFields: [
      'medium',
      'rights',
      'extra',
    ],
  },

  podcast: {
    citable: true,
    citationType: 'broadcast',
    creatorRoles: [
      'authors',
      'presenters',
      'producers',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'podcastTitle',
      'platform',
      'episodeNumber',
      'publicationDate',
      'publicationYear',
      'accessedDate',
      'runningTime',
      'url',
      'language',
    ],
    advancedFields: [
      'medium',
      'rights',
      'extra',
    ],
  },

  sermon: {
    citable: true,
    citationType: 'speech',
    creatorRoles: [
      'authors',
      'presenters',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'churchName',
      'scripturePassage',
      'eventPlace',
      'publicationDate',
      'publicationYear',
      'platform',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      'medium',
      'rights',
      'extra',
    ],
  },

  conference: {
    citable: true,
    citationType: 'paper-conference',
    creatorRoles: [
      'authors',
      'presenters',
      'editors',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'conferenceName',
      'meetingName',
      'eventPlace',
      'publicationDate',
      'publicationYear',
      'publisher',
      'pages',
      'doi',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  report: {
    citable: true,
    citationType: 'report',
    creatorRoles: [
      'authors',
      'editors',
      'contributors',
    ],
    fields: [
      'shortTitle',
      'publisher',
      'placeOfPublication',
      'publicationDate',
      'publicationYear',
      'publicationNumber',
      'seriesTitle',
      'seriesNumber',
      'pages',
      'doi',
      'url',
      'accessedDate',
      'language',
    ],
    advancedFields: [
      ...COMMON_CITATION_ADVANCED_FIELDS,
    ],
  },

  communication: {
    citable: true,
    citationType: 'personal_communication',
    creatorRoles: [
      'senders',
      'recipients',
      'interviewers',
      'interviewees',
    ],
    fields: [
      'subject',
      'date',
      'format',
      'body',
      'language',
    ],
    advancedFields: [
      'archive',
      'archiveLocation',
      'rights',
      'extra',
    ],
  },

  note: {
    citable: false,
    citationType: 'document',
    creatorRoles: [],
    fields: [
      'body',
    ],
    advancedFields: [
      'sourceId',
      'pageNumber',
      'notes',
    ],
  },

  concept: {
    citable: false,
    citationType: 'document',
    creatorRoles: [],
    fields: [
      'definition',
      'relatedIdeas',
      'notes',
    ],
    advancedFields: [],
  },

  person: {
    citable: false,
    citationType: 'document',
    creatorRoles: [],
    fields: [
      'role',
      'notes',
    ],
    advancedFields: [],
  },

  assignment: {
    citable: false,
    citationType: 'document',
    creatorRoles: [],
    fields: [
      'course',
      'dueDate',
      'requirements',
      'notes',
    ],
    advancedFields: [],
  },

  quote: {
    citable: false,
    citationType: 'document',
    creatorRoles: [],
    fields: [
      'quoteText',
      'sourceId',
      'pageNumber',
      'notes',
    ],
    advancedFields: [],
  },
}

const DEFAULT_METADATA_CONFIG = {
  citable: false,
  citationType: 'document',
  creatorRoles: [],
  fields: [],
  advancedFields: [],
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTypeId(typeId) {
  const cleaned = cleanText(typeId)
    .toLowerCase()
    .replace(/[_\s]+/g, '-')

  return TYPE_ALIASES[cleaned] || cleaned
}

function splitCreatorText(value) {
  return cleanText(value)
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function hasCreatorValue(creator) {
  if (!creator) {
    return false
  }

  if (typeof creator === 'string') {
    return Boolean(cleanText(creator))
  }

  return Boolean(
    cleanText(
      creator.literal ||
      creator.raw ||
      creator.name ||
      creator.firstName ||
      creator.given ||
      creator.middleName ||
      creator.middle ||
      creator.initial ||
      creator.lastName ||
      creator.family,
    ),
  )
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneValue)
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, entry]) => [
          key,
          cloneValue(entry),
        ],
      ),
    )
  }

  return value
}

export function getResearchMetadataConfig(typeId) {
  const normalizedTypeId =
    normalizeTypeId(typeId)

  const config =
    RESEARCH_TYPE_METADATA[
      normalizedTypeId
    ] ||
    DEFAULT_METADATA_CONFIG

  return {
    ...DEFAULT_METADATA_CONFIG,
    ...config,
    creatorRoles: [
      ...(config.creatorRoles || []),
    ],
    fields: [
      ...(config.fields || []),
    ],
    advancedFields: [
      ...(config.advancedFields || []),
    ],
  }
}

export function getFieldDefinition(fieldKey) {
  return (
    FIELD_DEFINITIONS[fieldKey] ||
    {
      key: fieldKey,
      label: cleanText(fieldKey)
        .replace(
          /([a-z])([A-Z])/g,
          '$1 $2',
        )
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => {
          return character.toUpperCase()
        }),
      icon: '•',
      placeholder: '',
    }
  )
}

export function getFieldDefinitionsForType(
  typeId,
  options = {},
) {
  const {
    includeAdvanced = false,
  } = options

  const config =
    getResearchMetadataConfig(typeId)

  const keys = [
    ...config.fields,
    ...(
      includeAdvanced
        ? config.advancedFields
        : []
    ),
  ]

  return [
    ...new Set(keys),
  ].map(getFieldDefinition)
}

export function getCreatorRoleDefinitionsForType(
  typeId,
) {
  const config =
    getResearchMetadataConfig(typeId)

  return config.creatorRoles
    .map((roleKey) => {
      return (
        CREATOR_ROLE_DEFINITIONS[
          roleKey
        ] ||
        {
          key: roleKey,
          label: getFieldDefinition(
            roleKey,
          ).label,
          singularLabel:
            getFieldDefinition(
              roleKey,
            ).label.replace(
              /s$/,
              '',
            ),
        }
      )
    })
}

export function isCitableResearchType(
  typeId,
) {
  return Boolean(
    getResearchMetadataConfig(
      typeId,
    ).citable,
  )
}

export function getCitationTypeForResearchType(
  typeId,
) {
  return (
    getResearchMetadataConfig(
      typeId,
    ).citationType ||
    'document'
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
    linkedPersonId: null,
    linkedOrganizationId: null,
  }
}

export function normalizeCreator(
  creator,
) {
  if (!creator) {
    return createEmptyCreator()
  }

  if (typeof creator === 'string') {
    const text = cleanText(creator)

    if (!text) {
      return createEmptyCreator()
    }

    return {
      ...createEmptyCreator(),
      literal: text,
      creatorType: 'literal',
    }
  }

  const literal = cleanText(
    creator.literal ||
    creator.raw ||
    (
      creator.creatorType ===
        'literal'
        ? creator.name
        : ''
    ),
  )

  const normalized = {
    ...createEmptyCreator(),

    creatorType:
      literal ||
      creator.creatorType ===
        'literal'
        ? 'literal'
        : 'person',

    firstName: cleanText(
      creator.firstName ||
      creator.given,
    ),

    middleName: cleanText(
      creator.middleName ||
      creator.middle,
    ),

    initial: cleanText(
      creator.initial,
    ),

    lastName: cleanText(
      creator.lastName ||
      creator.family,
    ),

    nameParticle: cleanText(
      creator.nameParticle ||
      creator.particle ||
      creator[
        'non-dropping-particle'
      ],
    ),

    suffix: cleanText(
      creator.suffix,
    ),

    literal,

    linkedPersonId:
      creator.linkedPersonId ||
      creator.personId ||
      null,

    linkedOrganizationId:
      creator.linkedOrganizationId ||
      creator.organizationId ||
      null,
  }

  return normalized
}

export function normalizeCreatorList(
  creators,
) {
  if (!creators) {
    return []
  }

  const list =
    typeof creators === 'string'
      ? splitCreatorText(creators)
      : Array.isArray(creators)
        ? creators
        : [creators]

  return list.map(normalizeCreator)
}

export function cleanCreatorList(
  creators,
) {
  return normalizeCreatorList(
    creators,
  ).filter(hasCreatorValue)
}

export function cloneCreatorList(
  creators,
) {
  return cleanCreatorList(
    creators,
  ).map((creator) => {
    return {
      ...creator,
    }
  })
}

function applyLegacyAliases(
  metadata,
) {
  const next = {
    ...metadata,
  }

  if (
    !next.publicationTitle
  ) {
    next.publicationTitle =
      next.journalTitle ||
      next.journalName ||
      next.journal ||
      next.websiteName ||
      next.siteName ||
      next.blogName ||
      next.containerTitle ||
      next.publication ||
      ''
  }

  if (
    !next.publicationYear
  ) {
    const legacyYear =
      next.year ||
      ''

    if (
      /^\d{4}$/.test(
        cleanText(legacyYear),
      )
    ) {
      next.publicationYear =
        cleanText(legacyYear)
    }
  }

  if (
    !next.publicationDate
  ) {
    const legacyDate =
      next.publishedDate ||
      next.datePublished ||
      ''

    if (legacyDate) {
      next.publicationDate =
        legacyDate
    }
  }

  if (
    !next.accessedDate &&
    next.accessDate
  ) {
    next.accessedDate =
      next.accessDate
  }

  if (
    !next.placeOfPublication
  ) {
    next.placeOfPublication =
      next.publicationPlace ||
      next.place ||
      ''
  }

  if (
    !next.pages
  ) {
    next.pages =
      next.pageRange ||
      ''
  }

  if (
    !next.pageCount
  ) {
    next.pageCount =
      next.numberOfPages ||
      ''
  }

  if (
    !next.repository
  ) {
    next.repository =
      next.archive ||
      ''
  }

  return next
}

export function normalizeResearchMetadata(
  typeId,
  rawMetadata = {},
  options = {},
) {
  const {
    includeAdvanced = true,
  } = options

  const normalizedTypeId =
    normalizeTypeId(typeId)

  const config =
    getResearchMetadataConfig(
      normalizedTypeId,
    )

  const metadata =
    applyLegacyAliases({
      ...(rawMetadata || {}),
    })

  metadata.schemaVersion =
    RESEARCH_METADATA_SCHEMA_VERSION

  metadata.citationType =
    metadata.citationType ||
    config.citationType

  config.creatorRoles.forEach(
    (roleKey) => {
      const legacySingular =
        roleKey.endsWith('s')
          ? roleKey.slice(0, -1)
          : roleKey

      const source =
        metadata[roleKey] ??
        metadata[legacySingular] ??
        []

      metadata[roleKey] =
        cleanCreatorList(source)
    },
  )

  const fieldKeys = [
    ...config.fields,
    ...(
      includeAdvanced
        ? config.advancedFields
        : []
    ),
  ]

  fieldKeys.forEach((fieldKey) => {
    if (
      metadata[fieldKey] ===
        undefined ||
      metadata[fieldKey] ===
        null
    ) {
      metadata[fieldKey] = ''
    }
  })

  return metadata
}

export function createMetadataForType(
  typeId,
  existingMetadata = {},
  options = {},
) {
  return normalizeResearchMetadata(
    typeId,
    cloneValue(
      existingMetadata || {},
    ),
    options,
  )
}

