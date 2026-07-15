<template>
  <div
    v-if="node"
    class="node-preview"
  >
    <div class="preview-header">
      <div class="preview-heading">
        <h2>{{ displayTitle }}</h2>

        <span class="node-type">
          {{ recordTypeLabel }}
        </span>
      </div>

      <button
        class="close-btn"
        type="button"
        aria-label="Close node preview"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>

    <div
      v-if="displayDescription"
      class="preview-section"
    >
      <h4>Description</h4>

      <p>
        {{ displayDescription }}
      </p>
    </div>

    <div
      v-if="metadataRows.length"
      class="preview-section"
    >
      <h4>{{ metadataHeading }}</h4>

      <div class="metadata-list">
        <div
          v-for="row in metadataRows"
          :key="row.label"
          class="metadata-row"
        >
          <span>{{ row.label }}</span>

          <a
            v-if="row.url"
            :href="row.url"
            target="_blank"
            rel="noopener noreferrer"
            class="metadata-link"
          >
            {{ row.value }}
          </a>

          <strong v-else>
            {{ row.value }}
          </strong>
        </div>
      </div>
    </div>

    <div
      v-if="normalizedTags.length"
      class="preview-section"
    >
      <h4>Tags</h4>

      <div class="tag-list">
        <span
          v-for="tag in normalizedTags"
          :key="tag.key"
          class="tag-pill"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>

    <div class="preview-section">
      <h4>Relationships</h4>

      <div
        v-if="relationships.length"
        class="relationship-list"
      >
        <button
          v-for="relationship in relationships"
          :key="getRelationshipKey(relationship)"
          class="relationship-item"
          type="button"
          @click="selectRelationshipNode(relationship)"
        >
          <span class="relationship-label">
            {{ relationship.label || 'Related to' }}
          </span>

          <strong class="relationship-target">
            {{ getRelatedTitle(relationship) }}
          </strong>
        </button>
      </div>

      <p
        v-else
        class="muted-text"
      >
        No connected relationships.
      </p>
    </div>

    <div
      v-if="relatedNodes.length"
      class="preview-section"
    >
      <h4>Connected Items</h4>

      <div class="related-list">
        <button
          v-for="related in relatedNodes"
          :key="related.id"
          class="related-item"
          type="button"
          @click="$emit('select-node', related)"
        >
          <div class="related-title">
            {{ getNodeTitle(related) }}
          </div>

          <div class="related-type">
            {{ getRecordTypeLabel(related) }}
          </div>
        </button>
      </div>
    </div>

    <div
      v-if="overviewRows.length"
      class="preview-section"
    >
      <h4>Record Details</h4>

      <div class="detail-grid">
        <div
          v-for="row in overviewRows"
          :key="row.label"
          class="detail-item"
        >
          <span>{{ row.label }}</span>

          <strong>{{ row.value }}</strong>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button
        class="primary-btn"
        type="button"
        @click="$emit('open-node', node)"
      >
        Open Full Page
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="$emit('attach-node', node)"
      >
        Attach to Daily Page
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="$emit('link-note', node)"
      >
        Create Linked Note
      </button>
    </div>

    <div class="rory-insights">
      <h4>🐾 Rory Notices...</h4>

      <ul>
        <li>
          This record has
          <strong>{{ relationships.length }}</strong>
          relationship{{ relationships.length === 1 ? '' : 's' }}.
        </li>

        <li v-if="normalizedTags.length">
          It uses
          <strong>{{ normalizedTags.length }}</strong>
          unique tag{{ normalizedTags.length === 1 ? '' : 's' }}.
        </li>

        <li v-if="relatedNodes.length">
          It connects to
          <strong>{{ relatedNodes.length }}</strong>
          other record{{ relatedNodes.length === 1 ? '' : 's' }}.
        </li>

        <li v-if="relationships.length === 0">
          This record may need additional connections.
        </li>
      </ul>
    </div>
  </div>

  <div
    v-else
    class="empty-preview"
  >
    <div class="empty-icon">🕸️</div>

    <h3>Select a node</h3>

    <p>
      Click a node in the graph to explore its relationships and record
      details.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    default: null,
  },

  relationships: {
    type: Array,
    default: () => [],
  },

  allNodes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'close',
  'open-node',
  'attach-node',
  'link-note',
  'select-node',
])

const typeLabels = {
  book: 'Book',
  'book-chapter': 'Book Chapter',
  article: 'Journal Article',
  'journal-article': 'Journal Article',
  journal: 'Academic Journal',
  dissertation: 'Dissertation',
  thesis: 'Thesis',
  blog: 'Blog Post',
  'blog-post': 'Blog Post',
  webpage: 'Webpage',
  website: 'Website',
  report: 'Report',
  'conference-paper': 'Conference Paper',
  encyclopedia: 'Encyclopedia Entry',
  dictionary: 'Dictionary Entry',
  podcast: 'Podcast',
  video: 'Video',
  media: 'Media',
  'research-source': 'Research Source',
  source: 'Research Source',
  course: 'Course',
  assignment: 'Assignment',
  note: 'Note',
  concept: 'Concept',
  term: 'Term',
  tag: 'Knowledge Tag',
  person: 'Person',
  flashcard: 'Flashcard',
  'writing-project': 'Writing Project',
  'daily-page': 'Daily Page',
  'planner-block': 'Planner Block',
  canvas: 'Canvas',
  jot: 'Jot',
}

const metadataHeadings = {
  book: 'Book Details',
  'book-chapter': 'Chapter Details',
  article: 'Article Details',
  'journal-article': 'Article Details',
  journal: 'Journal Details',
  dissertation: 'Dissertation Details',
  thesis: 'Thesis Details',
  blog: 'Blog Post Details',
  'blog-post': 'Blog Post Details',
  webpage: 'Webpage Details',
  website: 'Website Details',
  report: 'Report Details',
  'conference-paper': 'Conference Paper Details',
  encyclopedia: 'Entry Details',
  dictionary: 'Entry Details',
  podcast: 'Podcast Details',
  video: 'Video Details',
  media: 'Media Details',
  'research-source': 'Source Details',
  source: 'Source Details',
}

const displayTitle = computed(() => {
  return getNodeTitle(props.node)
})

const displayDescription = computed(() => {
  return String(
    getFirstValue([
      'description',
      'abstract',
      'summary',
      'notes',
      'annotation',
      'excerpt',
    ]) || '',
  ).trim()
})

const resolvedRecordType = computed(() => {
  const explicitSourceType = getFirstValue([
    'sourceType',
    'source_type',
    'recordType',
    'record_type',
    'resourceType',
    'resource_type',
    'itemType',
    'item_type',
    'category',
  ])

  const candidate =
    explicitSourceType ||
    props.node?.type ||
    'record'

  return normalizeRecordType(candidate)
})

const recordTypeLabel = computed(() => {
  return (
    typeLabels[resolvedRecordType.value] ||
    formatLabel(resolvedRecordType.value)
  )
})

const metadataHeading = computed(() => {
  return (
    metadataHeadings[resolvedRecordType.value] ||
    `${recordTypeLabel.value} Details`
  )
})

const normalizedTags = computed(() => {
  const tags = new Map()
  const sourceTags = Array.isArray(props.node?.tags)
    ? props.node.tags
    : []

  sourceTags.forEach((tag) => {
    const name = String(tag || '').trim()
    const key = normalizeTag(name)

    if (!name || !key || tags.has(key)) {
      return
    }

    tags.set(key, {
      key,
      name,
    })
  })

  return [...tags.values()]
})

const metadataRows = computed(() => {
  if (!props.node) {
    return []
  }

  const rows = []
  const usedLabels = new Set()

  const addRow = (
    label,
    paths,
    options = {},
  ) => {
    if (usedLabels.has(label)) {
      return
    }

    const rawValue = getFirstValue(paths)

    if (!hasValue(rawValue)) {
      return
    }

    const value = options.date
      ? formatDate(rawValue)
      : formatMetadataValue(rawValue)

    if (!value) {
      return
    }

    usedLabels.add(label)

    rows.push({
      label,
      value,
      url: options.url
        ? normalizeExternalUrl(rawValue)
        : '',
    })
  }

  const addCreatorFields = () => {
    addRow('Author', [
      'author',
      'authors',
      'creator',
      'creators',
      'primaryAuthor',
      'primary_author',
    ])

    addRow('Editor', [
      'editor',
      'editors',
    ])

    addRow('Translator', [
      'translator',
      'translators',
    ])
  }

  switch (resolvedRecordType.value) {
    case 'book':
      addRow('Subtitle', ['subtitle'])
      addCreatorFields()
      addRow('Edition', ['edition'])
      addRow('Series', ['series', 'seriesTitle', 'series_title'])
      addRow('Publisher', ['publisher'])
      addRow('Publication Place', [
        'publicationPlace',
        'publication_place',
        'placeOfPublication',
        'place_of_publication',
        'location',
      ])
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('ISBN', ['isbn', 'ISBN'])
      addRow('Pages', [
        'pageCount',
        'page_count',
        'pages',
      ])
      addRow('Genre', ['genre'])
      break

    case 'book-chapter':
      addRow('Chapter Title', [
        'chapterTitle',
        'chapter_title',
      ])
      addCreatorFields()
      addRow('Book Title', [
        'bookTitle',
        'book_title',
        'containerTitle',
        'container_title',
      ])
      addRow('Chapter Number', [
        'chapterNumber',
        'chapter_number',
      ])
      addRow('Pages', [
        'pageRange',
        'page_range',
        'pages',
      ])
      addRow('Publisher', ['publisher'])
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('ISBN', ['isbn', 'ISBN'])
      break

    case 'article':
    case 'journal-article':
      addCreatorFields()
      addRow('Journal', [
        'journalName',
        'journal_name',
        'journalTitle',
        'journal_title',
        'publicationTitle',
        'publication_title',
        'containerTitle',
        'container_title',
        'journal',
      ])
      addRow('Volume', ['volume'])
      addRow('Issue', ['issue', 'number'])
      addRow('Pages', [
        'pageRange',
        'page_range',
        'pages',
      ])
      addRow('Publication Date', [
        'publicationDate',
        'publication_date',
        'publishedAt',
        'published_at',
        'date',
      ], {
        date: true,
      })
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('DOI', ['doi', 'DOI'])
      addRow('ISSN', ['issn', 'ISSN'])
      addRow('Publisher', ['publisher'])
      addRow('URL', [
        'url',
        'link',
        'sourceUrl',
        'source_url',
      ], {
        url: true,
      })
      break

    case 'journal':
      addRow('Journal Title', [
        'journalName',
        'journal_name',
        'journalTitle',
        'journal_title',
        'name',
      ])
      addRow('Publisher', ['publisher'])
      addRow('Field', [
        'field',
        'discipline',
        'subject',
      ])
      addRow('ISSN', ['issn', 'ISSN'])
      addRow('Peer Reviewed', [
        'peerReviewed',
        'peer_reviewed',
      ])
      addRow('Frequency', [
        'frequency',
        'publicationFrequency',
        'publication_frequency',
      ])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'dissertation':
    case 'thesis':
      addCreatorFields()
      addRow('Institution', [
        'institution',
        'university',
        'school',
      ])
      addRow('Degree', [
        'degree',
        'degreeType',
        'degree_type',
      ])
      addRow('Department', ['department'])
      addRow('Advisor', [
        'advisor',
        'adviser',
        'supervisor',
        'committeeChair',
        'committee_chair',
      ])
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('Database', [
        'database',
        'repository',
        'archive',
      ])
      addRow('Publication Number', [
        'publicationNumber',
        'publication_number',
        'documentNumber',
        'document_number',
      ])
      addRow('DOI', ['doi', 'DOI'])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'blog':
    case 'blog-post':
      addCreatorFields()
      addRow('Blog', [
        'blogName',
        'blog_name',
        'siteName',
        'site_name',
        'websiteTitle',
        'website_title',
        'containerTitle',
        'container_title',
      ])
      addRow('Publisher', [
        'publisher',
        'organization',
      ])
      addRow('Published', [
        'publicationDate',
        'publication_date',
        'publishedAt',
        'published_at',
        'date',
      ], {
        date: true,
      })
      addRow('Updated', [
        'modifiedAt',
        'modified_at',
        'lastUpdated',
        'last_updated',
      ], {
        date: true,
      })
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'webpage':
    case 'website':
      addCreatorFields()
      addRow('Website', [
        'websiteTitle',
        'website_title',
        'siteName',
        'site_name',
        'containerTitle',
        'container_title',
      ])
      addRow('Publisher', [
        'publisher',
        'organization',
        'corporateAuthor',
        'corporate_author',
      ])
      addRow('Published', [
        'publicationDate',
        'publication_date',
        'publishedAt',
        'published_at',
        'date',
      ], {
        date: true,
      })
      addRow('Last Updated', [
        'modifiedAt',
        'modified_at',
        'lastUpdated',
        'last_updated',
      ], {
        date: true,
      })
      addRow('Accessed', [
        'accessedDate',
        'accessed_date',
        'accessDate',
        'access_date',
      ], {
        date: true,
      })
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'report':
      addCreatorFields()
      addRow('Organization', [
        'organization',
        'institution',
        'corporateAuthor',
        'corporate_author',
      ])
      addRow('Report Number', [
        'reportNumber',
        'report_number',
        'documentNumber',
        'document_number',
      ])
      addRow('Publisher', ['publisher'])
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('DOI', ['doi', 'DOI'])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'conference-paper':
      addCreatorFields()
      addRow('Conference', [
        'conferenceName',
        'conference_name',
        'conference',
        'eventTitle',
        'event_title',
      ])
      addRow('Location', [
        'conferenceLocation',
        'conference_location',
        'location',
      ])
      addRow('Presented', [
        'presentationDate',
        'presentation_date',
        'date',
      ], {
        date: true,
      })
      addRow('Proceedings', [
        'proceedingsTitle',
        'proceedings_title',
        'containerTitle',
        'container_title',
      ])
      addRow('Pages', [
        'pageRange',
        'page_range',
        'pages',
      ])
      addRow('DOI', ['doi', 'DOI'])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'podcast':
      addRow('Host', [
        'host',
        'hosts',
        'author',
        'creator',
      ])
      addRow('Podcast', [
        'podcastName',
        'podcast_name',
        'seriesTitle',
        'series_title',
        'containerTitle',
        'container_title',
      ])
      addRow('Episode', [
        'episodeNumber',
        'episode_number',
      ])
      addRow('Platform', ['platform'])
      addRow('Published', [
        'publicationDate',
        'publication_date',
        'publishedAt',
        'published_at',
        'date',
      ], {
        date: true,
      })
      addRow('Duration', ['duration', 'runtime'])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'video':
    case 'media':
      addRow('Creator', [
        'creator',
        'creators',
        'author',
        'director',
        'producer',
      ])
      addRow('Platform', [
        'platform',
        'websiteTitle',
        'website_title',
      ])
      addRow('Publisher', [
        'publisher',
        'studio',
        'network',
      ])
      addRow('Published', [
        'publicationDate',
        'publication_date',
        'publishedAt',
        'published_at',
        'date',
      ], {
        date: true,
      })
      addRow('Duration', ['duration', 'runtime'])
      addRow('Format', [
        'format',
        'mediaType',
        'media_type',
      ])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    case 'encyclopedia':
    case 'dictionary':
      addCreatorFields()
      addRow('Reference Work', [
        'referenceTitle',
        'reference_title',
        'dictionaryTitle',
        'dictionary_title',
        'encyclopediaTitle',
        'encyclopedia_title',
        'containerTitle',
        'container_title',
      ])
      addRow('Edition', ['edition'])
      addRow('Publisher', ['publisher'])
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('Pages', [
        'pageRange',
        'page_range',
        'pages',
      ])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break

    default:
      addRow('Source Type', [
        'sourceType',
        'source_type',
        'recordType',
        'record_type',
        'resourceType',
        'resource_type',
      ])
      addCreatorFields()
      addRow('Container', [
        'containerTitle',
        'container_title',
        'journalName',
        'journal_name',
        'websiteTitle',
        'website_title',
      ])
      addRow('Publisher', ['publisher'])
      addRow('Publication Year', [
        'publicationYear',
        'publication_year',
        'year',
      ])
      addRow('DOI', ['doi', 'DOI'])
      addRow('URL', ['url', 'link'], {
        url: true,
      })
      break
  }

  addRow('Language', ['language'])
  addRow('Citation Key', [
    'citationKey',
    'citation_key',
  ])

  return rows
})

const overviewRows = computed(() => {
  if (!props.node) {
    return []
  }

  const rows = []

  const add = (label, value, formatter = null) => {
    if (!hasValue(value)) {
      return
    }

    const formattedValue = formatter
      ? formatter(value)
      : formatMetadataValue(value)

    if (!formattedValue) {
      return
    }

    rows.push({
      label,
      value: formattedValue,
    })
  }

  add(
    'Status',
    props.node.status || 'unknown',
    formatLabel,
  )

  add(
    'Updated',
    getFirstValue([
      'updatedAt',
      'updated_at',
      'modifiedAt',
      'modified_at',
    ]),
    formatDate,
  )

  add(
    'Created',
    getFirstValue([
      'createdAt',
      'created_at',
    ]),
    formatDate,
  )

  add(
    'Rating',
    getFirstValue([
      'rating',
      'score',
    ]),
  )

  const progress = getFirstValue([
    'progress',
    'readingProgress',
    'reading_progress',
  ])

  if (hasValue(progress)) {
    const numericProgress = Number(progress)

    add(
      'Progress',
      Number.isFinite(numericProgress)
        ? `${numericProgress}%`
        : progress,
    )
  }

  return rows
})

const relatedNodes = computed(() => {
  if (!props.node) {
    return []
  }

  const relatedMap = new Map()

  props.relationships.forEach((relationship) => {
    const relatedId = getRelatedId(relationship)

    const relatedNode = props.allNodes.find((item) => {
      return String(item.id) === String(relatedId)
    })

    if (
      relatedNode &&
      !relatedMap.has(String(relatedNode.id))
    ) {
      relatedMap.set(
        String(relatedNode.id),
        relatedNode,
      )
    }
  })

  return [...relatedMap.values()]
})

function getNodeTitle(targetNode) {
  return String(
    targetNode?.title ||
    targetNode?.label ||
    targetNode?.name ||
    'Untitled Record',
  )
}

function getRecordTypeLabel(targetNode) {
  const sourceType =
    targetNode?.sourceType ||
    targetNode?.source_type ||
    targetNode?.recordType ||
    targetNode?.record_type ||
    targetNode?.type ||
    'record'

  const normalizedType =
    normalizeRecordType(sourceType)

  return (
    typeLabels[normalizedType] ||
    formatLabel(normalizedType)
  )
}

function getRelatedId(relationship) {
  return relationship.source === props.node?.id
    ? relationship.target
    : relationship.source
}

function getRelatedNode(relationship) {
  const relatedId = getRelatedId(relationship)

  return (
    props.allNodes.find((item) => {
      return String(item.id) === String(relatedId)
    }) || null
  )
}

function getRelatedTitle(relationship) {
  return getNodeTitle(
    getRelatedNode(relationship),
  )
}

function selectRelationshipNode(relationship) {
  const relatedNode =
    getRelatedNode(relationship)

  if (relatedNode) {
    emit('select-node', relatedNode)
  }
}

function getRelationshipKey(relationship) {
  return (
    relationship.id ||
    `${relationship.source}-${relationship.target}-${relationship.label || 'related'}`
  )
}

function getFirstValue(paths = []) {
  const containers = [
    props.node,
    props.node?.metadata,
    props.node?.details,
    props.node?.source,
    props.node?.record,
  ].filter(Boolean)

  for (const path of paths) {
    for (const container of containers) {
      const value = getValueByPath(
        container,
        path,
      )

      if (hasValue(value)) {
        return value
      }
    }
  }

  return null
}

function getValueByPath(object, path) {
  if (!object || !path) {
    return null
  }

  return String(path)
    .split('.')
    .reduce((value, key) => {
      if (
        value === null ||
        value === undefined
      ) {
        return null
      }

      return value[key]
    }, object)
}

function hasValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return false
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'string') {
    return value.trim() !== ''
  }

  return true
}

function formatMetadataValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        return formatMetadataValue(item)
      })
      .filter(Boolean)
      .join(', ')
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return String(
      value.name ||
      value.title ||
      value.label ||
      value.value ||
      '',
    ).trim()
  }

  return String(value ?? '').trim()
}

function normalizeRecordType(value) {
  const type = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')

  const aliases = {
    'journal-article': 'article',
    'academic-article': 'article',
    'research-article': 'article',
    'doctoral-dissertation': 'dissertation',
    'phd-dissertation': 'dissertation',
    'masters-thesis': 'thesis',
    'master-thesis': 'thesis',
    'blog-entry': 'blog',
    'blog-post': 'blog',
    web: 'webpage',
    'web-page': 'webpage',
    'video-media': 'video',
    audiovisual: 'media',
  }

  return aliases[type] || type || 'record'
}

function normalizeTag(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
}

function formatLabel(value) {
  return String(value || 'Unknown')
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}

function formatDate(value) {
  if (!hasValue(value)) {
    return '—'
  }

  const text = String(value).trim()

  if (/^\d{4}$/.test(text)) {
    return text
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return text
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function normalizeExternalUrl(value) {
  const text = String(value || '').trim()

  if (
    text.startsWith('https://') ||
    text.startsWith('http://')
  ) {
    return text
  }

  return ''
}
</script>

<style scoped>
.node-preview,
.empty-preview {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-secondary);
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.preview-heading {
  min-width: 0;
}

.preview-header h2 {
  overflow-wrap: anywhere;
  margin: 0;
  font-size: 1.2rem;
}

.node-type {
  display: inline-block;
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.close-btn {
  flex: 0 0 auto;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  padding: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--btn-bg);
}

.preview-section {
  margin-top: 1rem;
}

.preview-section h4 {
  margin: 0 0 0.5rem;
}

.preview-section p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.metadata-list {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
}

.metadata-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.7rem;
}

.metadata-row:last-child {
  border-bottom: 0;
}

.metadata-row > span {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.metadata-row strong,
.metadata-link {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 0.82rem;
  font-weight: 650;
}

.metadata-link {
  color: var(--accent-text);
  text-decoration: none;
}

.metadata-link:hover {
  text-decoration: underline;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-primary);
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
}

.relationship-list,
.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.relationship-item,
.related-item {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.7rem;
  text-align: left;
  cursor: pointer;
}

.relationship-item:hover,
.related-item:hover {
  border-color: var(--accent);
}

.relationship-label {
  display: block;
  color: var(--text-secondary);
  font-size: 0.72rem;
}

.relationship-target {
  display: block;
  margin-top: 0.2rem;
}

.related-title {
  font-weight: 600;
}

.related-type {
  margin-top: 0.2rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(
    2,
    minmax(0, 1fr)
  );
  gap: 0.75rem;
}

.detail-item {
  min-width: 0;
  border-radius: 10px;
  background: var(--bg-primary);
  padding: 0.75rem;
}

.detail-item span {
  display: block;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.detail-item strong {
  display: block;
  overflow-wrap: anywhere;
  margin-top: 0.25rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
}

.primary-btn,
.secondary-btn {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.8rem 1rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:hover,
.secondary-btn:hover {
  border-color: var(--accent);
  background: var(--btn-bg);
}

.rory-insights {
  margin-top: 1.25rem;
  border-radius: 12px;
  background: var(--bg-primary);
  padding: 1rem;
}

.rory-insights h4 {
  margin: 0;
}

.rory-insights ul {
  margin: 0.65rem 0 0;
  padding-left: 1.25rem;
}

.rory-insights li + li {
  margin-top: 0.35rem;
}

.empty-preview {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-preview h3,
.empty-preview p {
  margin: 0;
}

.empty-preview p,
.muted-text {
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 1.8rem;
}

@media (max-width: 420px) {
  .metadata-row,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .metadata-row {
    gap: 0.2rem;
  }
}
</style>