<template>
  <AppLayout
    :title="pageTitle"
    subtitle="Filtered research items"
    banner-key="research"
    :default-icon="pageIcon"
  >
    <section class="toolbar-card">
      <div>
        <h2>{{ pageIcon }} {{ pageTitle }}</h2>
        <p>
          {{ visibleItems.length }}
          item{{ visibleItems.length === 1 ? '' : 's' }}
        </p>
      </div>

      <div class="toolbar-actions">
        <RouterLink
          to="/research"
          class="back-link"
        >
          ← Research Hub
        </RouterLink>

        <button
          class="new-source-btn"
          type="button"
          @click="toggleCreateForm"
        >
          {{
            showCreateForm
              ? 'Close'
              : `+ New ${pageTitle}`
          }}
        </button>
      </div>
    </section>

    <section
      v-if="showCreateForm"
      class="create-card"
    >
      <div class="create-header">
        <div>
          <p class="create-eyebrow">
            {{ pageIcon }} {{ pageTitle }}
          </p>

          <h2>Create {{ pageTitle }}</h2>

          <p>
            This record will be saved to the Supabase Research Workspace
            and will open in the unified academic source editor.
          </p>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group wide">
          <label>Title</label>

          <input
            v-model="newTitle"
            type="text"
            placeholder="Enter a title..."
          />
        </div>

        <div class="form-group wide">
          <label>Summary</label>

          <textarea
            v-model="newSummary"
            rows="4"
            placeholder="Add a quick summary..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Status</label>

          <select v-model="newStatus">
            <option
              v-for="status in researchStatuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.icon }} {{ status.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Topic Tags</label>

          <input
            v-model="topicTagsInput"
            type="text"
            placeholder="Theology, formation, methodology"
          />
        </div>
      </div>

      <section class="source-details">
        <div class="section-heading">
          <div>
            <p class="create-eyebrow">
              Type-specific metadata
            </p>

            <h3>{{ pageTitle }} Details</h3>
          </div>

          <span>
            {{ activeFieldDefinitions.length }}
            field{{ activeFieldDefinitions.length === 1 ? '' : 's' }}
          </span>
        </div>

        <div class="form-grid media-grid">
          <div class="form-group">
            <label>Cover Image URL</label>

            <input
              v-model="mediaFields.coverImageUrl"
              type="url"
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label>Banner Image URL</label>

            <input
              v-model="mediaFields.bannerImageUrl"
              type="url"
              placeholder="https://..."
            />
          </div>
        </div>

        <div
          v-if="usesAuthors"
          class="people-section"
        >
          <label>Authors</label>

          <div
            v-for="(author, index) in authors"
            :key="`author-${index}`"
            class="person-row"
          >
            <input
              v-model="author.firstName"
              placeholder="First name"
            />

            <input
              v-model="author.initial"
              placeholder="Initial"
            />

            <input
              v-model="author.lastName"
              placeholder="Last name"
            />

            <button
              type="button"
              class="remove-btn"
              @click="removeAuthor(index)"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            class="small-btn"
            @click="addAuthor"
          >
            + Add Author
          </button>
        </div>

        <div
          v-if="usesEditors"
          class="people-section"
        >
          <label>Editors</label>

          <div
            v-for="(editor, index) in editors"
            :key="`editor-${index}`"
            class="person-row"
          >
            <input
              v-model="editor.firstName"
              placeholder="First name"
            />

            <input
              v-model="editor.initial"
              placeholder="Initial"
            />

            <input
              v-model="editor.lastName"
              placeholder="Last name"
            />

            <button
              type="button"
              class="remove-btn"
              @click="removeEditor(index)"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            class="small-btn"
            @click="addEditor"
          >
            + Add Editor
          </button>
        </div>

        <div class="form-grid">
          <div
            v-for="field in editableFieldDefinitions"
            :key="field.key"
            class="form-group"
            :class="{ wide: field.wide }"
          >
            <label :for="`create-${field.key}`">
              {{ field.label }}
            </label>

            <textarea
              v-if="field.control === 'textarea'"
              :id="`create-${field.key}`"
              v-model="metadata[field.key]"
              :rows="field.rows || 5"
              :placeholder="field.placeholder"
            ></textarea>

            <input
              v-else
              :id="`create-${field.key}`"
              v-model="metadata[field.key]"
              :type="field.control || 'text'"
              :placeholder="field.placeholder"
            />
          </div>
        </div>
      </section>

      <div
        v-if="createError"
        class="error-box"
      >
        {{ createError }}
      </div>

      <div class="create-actions">
        <button
          class="secondary-btn"
          type="button"
          @click="cancelCreate"
        >
          Cancel
        </button>

        <button
          class="create-btn"
          type="button"
          :disabled="isCreating"
          @click="createItem"
        >
          {{
            isCreating
              ? 'Creating...'
              : `Create ${pageTitle}`
          }}
        </button>
      </div>
    </section>

    <section class="content-card">
      <div class="browse-toolbar">
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          :placeholder="`Search ${pageTitle.toLowerCase()}...`"
        />

        <select
          v-model="sortMode"
          class="sort-select"
        >
          <option value="recent">
            Recently Added
          </option>

          <option value="title">
            Title A–Z
          </option>

          <option value="yearDesc">
            Year Newest
          </option>

          <option value="yearAsc">
            Year Oldest
          </option>
        </select>
      </div>

      <ViewSwitcher v-model="selectedView" />

      <div
        v-if="visibleItems.length === 0"
        class="empty"
      >
        No matching {{ pageTitle.toLowerCase() }} found.
      </div>

      <div
        v-else-if="selectedView === 'board'"
        class="board-view"
      >
        <section
          v-for="status in researchStatuses"
          :key="status.id"
          class="board-column"
          :class="{ 'drop-target': draggedItemId }"
          @dragover.prevent
          @drop.prevent="handleDrop(status.id)"
        >
          <div class="board-column-header">
            <span>
              {{ status.icon }} {{ status.name }}
            </span>

            <span>
              {{ getItemsByStatus(status.id).length }}
            </span>
          </div>

          <div class="board-cards">
            <RouterLink
              v-for="item in getItemsByStatus(status.id)"
              :key="item.id"
              :to="getDetailRoute(item)"
              class="board-card"
              draggable="true"
              @dragstart="handleDragStart(item.id)"
              @dragend="handleDragEnd"
            >
              <div class="board-card-title">
                {{ getItemIcon(item) }} {{ item.title }}
              </div>

              <div class="board-card-meta">
                {{ formatCreators(item) }}

                <span v-if="getItemYear(item)">
                  · {{ getItemYear(item) }}
                </span>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>

      <div
        v-else-if="selectedView === 'gallery'"
        class="gallery-grid"
      >
        <RouterLink
          v-for="item in visibleItems"
          :key="item.id"
          :to="getDetailRoute(item)"
          class="gallery-link"
        >
          <article class="gallery-card">
            <div
              class="gallery-banner"
              :style="getGalleryBannerStyle(item)"
            >
              <img
                v-if="item.metadata?.coverImageUrl"
                :src="item.metadata.coverImageUrl"
                alt=""
                class="book-cover"
              />

              <span
                v-else
                class="gallery-icon"
              >
                {{ getItemIcon(item) }}
              </span>
            </div>

            <div class="gallery-body">
              <div class="gallery-title">
                {{ item.title }}
              </div>

              <div class="gallery-meta">
                {{ formatCreators(item) }}

                <span v-if="getItemYear(item)">
                  · {{ getItemYear(item) }}
                </span>
              </div>

              <div class="gallery-summary">
                {{ item.summary || 'No summary added.' }}
              </div>

              <div
                v-if="item.topicTags?.length"
                class="topic-row"
              >
                <span
                  v-for="tag in item.topicTags"
                  :key="tag"
                  class="topic-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </RouterLink>
      </div>

      <div
        v-else-if="selectedView === 'list'"
        class="list-view"
      >
        <RouterLink
          v-for="item in visibleItems"
          :key="item.id"
          :to="getDetailRoute(item)"
          class="list-row"
        >
          <span>
            {{ getItemIcon(item) }} {{ item.title }}
          </span>

          <span class="list-summary">
            {{ formatCreators(item) }}
          </span>
        </RouterLink>
      </div>

      <div
        v-else-if="selectedView === 'table'"
        class="table-wrapper"
      >
        <table class="items-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author / Creator</th>
              <th>Status</th>
              <th>Year</th>
              <th>Topics</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in visibleItems"
              :key="item.id"
            >
              <td>
                <RouterLink :to="getDetailRoute(item)">
                  {{ getItemIcon(item) }} {{ item.title }}
                </RouterLink>
              </td>

              <td>
                {{ formatCreators(item) }}
              </td>

              <td>
                {{ getStatusLabel(item.metadata?.status) }}
              </td>

              <td>
                {{ getItemYear(item) || '—' }}
              </td>

              <td>
                {{ item.topicTags?.join(', ') || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="placeholder-view"
      >
        {{ selectedView }} view coming next.
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  RouterLink,
  useRoute,
  useRouter,
} from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import ViewSwitcher from '../components/ViewSwitcher.vue'

import {
  useResearch,
} from '../composables/useResearch'

import {
  useBoardDrag,
} from '../composables/useBoardDrag'

import {
  useViewPreferences,
} from '../composables/useViewPreferences'

import {
  getResearchTypeById,
} from '../data/researchTypes'

import {
  getResearchStatusById,
  researchStatuses,
} from '../data/researchStatuses'

const route = useRoute()
const router = useRouter()

const {
  allResearchItems,
  loadResearchItems,
  addResearchItem,
  updateResearchItem,
  researchError,
} = useResearch()

const {
  draggedItemId,
  handleDragStart,
  handleDragEnd,
  handleDrop,
} = useBoardDrag(
  updateResearchItem,
)

const typeId = computed(() => {
  return String(
    route.params.type ||
    '',
  )
})

const {
  selectedView,
} = useViewPreferences(
  `research-type-${typeId.value}`,
  'gallery',
)

const showCreateForm = ref(false)
const searchQuery = ref('')
const sortMode = ref('recent')
const isCreating = ref(false)
const createError = ref('')

const newTitle = ref('')
const newSummary = ref('')
const newStatus = ref('inbox')
const topicTagsInput = ref('')
const metadata = ref({})

const mediaFields = ref({
  coverImageUrl: '',
  bannerImageUrl: '',
})

const authors = ref([
  {
    firstName: '',
    initial: '',
    lastName: '',
  },
])

const editors = ref([])

const FIELD_DEFINITIONS = {
  author: {
    key: 'author',
    label: 'Author',
    placeholder: 'Author name',
  },
  shortTitle: {
    key: 'shortTitle',
    label: 'Short Title',
    placeholder: 'Shortened title for notes',
  },
  publisher: {
    key: 'publisher',
    label: 'Publisher',
    placeholder: 'Publisher',
  },
  placeOfPublication: {
    key: 'placeOfPublication',
    label: 'Place of Publication',
    placeholder: 'City, State or Country',
  },
  year: {
    key: 'year',
    label: 'Publication Year',
    placeholder: '2026',
  },
  edition: {
    key: 'edition',
    label: 'Edition',
    placeholder: '2nd edition',
  },
  isbn: {
    key: 'isbn',
    label: 'ISBN',
    placeholder: 'ISBN',
  },
  pageRange: {
    key: 'pageRange',
    label: 'Page Range / Count',
    placeholder: '1–250',
  },
  libraryLocation: {
    key: 'libraryLocation',
    label: 'Library Location',
    placeholder: 'Shelf, library, or collection',
  },
  journal: {
    key: 'journal',
    label: 'Journal',
    placeholder: 'Journal title',
  },
  volume: {
    key: 'volume',
    label: 'Volume',
    placeholder: 'Volume',
  },
  issue: {
    key: 'issue',
    label: 'Issue',
    placeholder: 'Issue',
  },
  pages: {
    key: 'pages',
    label: 'Pages',
    placeholder: '45–68',
  },
  doi: {
    key: 'doi',
    label: 'DOI',
    placeholder: '10.xxxx/xxxxx',
  },
  url: {
    key: 'url',
    label: 'URL',
    control: 'url',
    placeholder: 'https://...',
  },
  abstract: {
    key: 'abstract',
    label: 'Abstract',
    control: 'textarea',
    rows: 7,
    wide: true,
    placeholder: 'Paste or summarize the abstract.',
  },
  language: {
    key: 'language',
    label: 'Language',
    placeholder: 'English',
  },
  institution: {
    key: 'institution',
    label: 'University / Institution',
    placeholder: 'Liberty University',
  },
  degree: {
    key: 'degree',
    label: 'Degree',
    placeholder: 'Doctor of Ministry, PhD, ThM, MA, etc.',
  },
  department: {
    key: 'department',
    label: 'Department / Program',
    placeholder: 'School, department, or program',
  },
  advisor: {
    key: 'advisor',
    label: 'Advisor / Committee Chair',
    placeholder: 'Advisor or committee chair',
  },
  database: {
    key: 'database',
    label: 'Database',
    placeholder: 'ProQuest Dissertations & Theses Global',
  },
  repository: {
    key: 'repository',
    label: 'Repository',
    placeholder: 'Institutional repository or archive',
  },
  publicationNumber: {
    key: 'publicationNumber',
    label: 'Publication / Document Number',
    placeholder: 'Publication or document number',
  },
  siteName: {
    key: 'siteName',
    label: 'Website Name',
    placeholder: 'Website or organization',
  },
  publishedDate: {
    key: 'publishedDate',
    label: 'Published Date',
    control: 'date',
  },
  accessedDate: {
    key: 'accessedDate',
    label: 'Accessed Date',
    control: 'date',
  },
  blogName: {
    key: 'blogName',
    label: 'Blog Name',
    placeholder: 'Blog title',
  },
  creator: {
    key: 'creator',
    label: 'Creator',
    placeholder: 'Creator, director, or presenter',
  },
  platform: {
    key: 'platform',
    label: 'Platform',
    placeholder: 'YouTube, Vimeo, podcast platform, etc.',
  },
  sender: {
    key: 'sender',
    label: 'Sender',
    placeholder: 'Sender',
  },
  recipient: {
    key: 'recipient',
    label: 'Recipient',
    placeholder: 'Recipient',
  },
  date: {
    key: 'date',
    label: 'Date',
    control: 'date',
  },
  format: {
    key: 'format',
    label: 'Format',
    placeholder: 'Email, letter, interview, etc.',
  },
  body: {
    key: 'body',
    label: 'Body',
    control: 'textarea',
    rows: 8,
    wide: true,
    placeholder: 'Write the note.',
  },
  definition: {
    key: 'definition',
    label: 'Definition',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Define the concept.',
  },
  relatedIdeas: {
    key: 'relatedIdeas',
    label: 'Related Ideas',
    control: 'textarea',
    rows: 5,
    wide: true,
    placeholder: 'List related ideas or concepts.',
  },
  role: {
    key: 'role',
    label: 'Role',
    placeholder: 'Role or relationship',
  },
  notes: {
    key: 'notes',
    label: 'Notes',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Add notes.',
  },
  course: {
    key: 'course',
    label: 'Course',
    placeholder: 'Course',
  },
  dueDate: {
    key: 'dueDate',
    label: 'Due Date',
    control: 'date',
  },
  requirements: {
    key: 'requirements',
    label: 'Requirements',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Assignment requirements.',
  },
  quoteText: {
    key: 'quoteText',
    label: 'Quote',
    control: 'textarea',
    rows: 6,
    wide: true,
    placeholder: 'Quote text',
  },
  sourceId: {
    key: 'sourceId',
    label: 'Source ID',
    placeholder: 'Linked source ID',
  },
  pageNumber: {
    key: 'pageNumber',
    label: 'Page Number',
    placeholder: 'Page number',
  },
}

const researchType = computed(() => {
  return getResearchTypeById(
    typeId.value,
  )
})

const pageTitle = computed(() => {
  return (
    researchType.value?.name ||
    'Research Items'
  )
})

const pageIcon = computed(() => {
  return (
    researchType.value?.icon ||
    '🔎'
  )
})

const activeFieldDefinitions =
  computed(() => {
    const fieldKeys =
      researchType.value?.fields ||
      []

    return fieldKeys.map((key) => {
      return (
        FIELD_DEFINITIONS[key] ||
        {
          key,
          label:
            formatFieldName(key),
          placeholder:
            '',
        }
      )
    })
  })

const usesAuthors = computed(() => {
  return researchType.value
    ?.fields
    ?.includes('authors')
})

const usesEditors = computed(() => {
  return researchType.value
    ?.fields
    ?.includes('editors')
})

const editableFieldDefinitions =
  computed(() => {
    return activeFieldDefinitions.value.filter(
      (field) => {
        return (
          field.key !== 'authors' &&
          field.key !== 'editors'
        )
      },
    )
  })

const filteredItems = computed(() => {
  return allResearchItems.value.filter(
    (item) => {
      return (
        item.type ===
        typeId.value
      )
    },
  )
})

const visibleItems = computed(() => {
  const query =
    searchQuery.value
      .toLowerCase()
      .trim()

  let items =
    filteredItems.value.filter(
      (item) => {
        if (!query) {
          return true
        }

        return buildItemSearchText(
          item,
        ).includes(query)
      },
    )

  items = [...items]

  if (sortMode.value === 'title') {
    items.sort((a, b) => {
      return String(
        a.title || '',
      ).localeCompare(
        String(
          b.title || '',
        ),
      )
    })
  }

  if (sortMode.value === 'yearDesc') {
    items.sort((a, b) => {
      return String(
        getItemYear(b),
      ).localeCompare(
        String(
          getItemYear(a),
        ),
      )
    })
  }

  if (sortMode.value === 'yearAsc') {
    items.sort((a, b) => {
      return String(
        getItemYear(a),
      ).localeCompare(
        String(
          getItemYear(b),
        ),
      )
    })
  }

  if (sortMode.value === 'recent') {
    items.sort((a, b) => {
      return String(
        b.createdAt || '',
      ).localeCompare(
        String(
          a.createdAt || '',
        ),
      )
    })
  }

  return items
})

onMounted(async () => {
  await loadResearchItems()
  initializeMetadataFields()
})

watch(
  typeId,
  () => {
    resetForm()
    showCreateForm.value = false
    searchQuery.value = ''
  },
)

function toggleCreateForm() {
  showCreateForm.value =
    !showCreateForm.value

  if (showCreateForm.value) {
    initializeMetadataFields()
  }
}

function initializeMetadataFields() {
  const nextMetadata = {
    ...metadata.value,
  }

  editableFieldDefinitions.value.forEach(
    (field) => {
      if (
        nextMetadata[field.key] ===
          undefined ||
        nextMetadata[field.key] ===
          null
      ) {
        nextMetadata[field.key] = ''
      }
    },
  )

  metadata.value = nextMetadata
}

function getDetailRoute(item) {
  return `/research/items/${item.id}`
}

function getItemsByStatus(statusId) {
  return visibleItems.value.filter(
    (item) => {
      return (
        (
          item.metadata?.status ||
          'inbox'
        ) === statusId
      )
    },
  )
}

function getStatusLabel(
  statusId = 'inbox',
) {
  const status =
    getResearchStatusById(
      statusId ||
      'inbox',
    )

  return status
    ? `${status.icon} ${status.name}`
    : '📥 Inbox'
}

function parseTopicTags(text) {
  return String(text || '')
    .split(',')
    .map((tag) => {
      return tag.trim()
    })
    .filter(Boolean)
}

function addAuthor() {
  authors.value.push({
    firstName: '',
    initial: '',
    lastName: '',
  })
}

function removeAuthor(index) {
  authors.value.splice(index, 1)

  if (
    authors.value.length === 0
  ) {
    addAuthor()
  }
}

function addEditor() {
  editors.value.push({
    firstName: '',
    initial: '',
    lastName: '',
  })
}

function removeEditor(index) {
  editors.value.splice(index, 1)
}

function cleanPeopleList(people) {
  return people
    .map((person) => {
      return {
        firstName:
          String(
            person.firstName ||
            '',
          ).trim(),

        initial:
          String(
            person.initial ||
            '',
          ).trim(),

        lastName:
          String(
            person.lastName ||
            '',
          ).trim(),
      }
    })
    .filter((person) => {
      return (
        person.firstName ||
        person.initial ||
        person.lastName
      )
    })
}

function buildMetadata() {
  const finalMetadata = {
    ...metadata.value,

    status:
      newStatus.value,

    coverImageUrl:
      mediaFields.value
        .coverImageUrl,

    bannerImageUrl:
      mediaFields.value
        .bannerImageUrl,

    bannerObjectPositionY:
      50,
  }

  if (usesAuthors.value) {
    finalMetadata.authors =
      cleanPeopleList(
        authors.value,
      )
  }

  if (usesEditors.value) {
    finalMetadata.editors =
      cleanPeopleList(
        editors.value,
      )
  }

  return finalMetadata
}

async function createItem() {
  createError.value = ''

  if (!newTitle.value.trim()) {
    createError.value =
      'Add a title before creating the record.'

    return
  }

  if (!researchType.value) {
    createError.value =
      'Scholarory could not identify this research type.'

    return
  }

  isCreating.value = true

  try {
    await addResearchItem({
      title:
        newTitle.value.trim(),

      summary:
        newSummary.value.trim(),

      type:
        typeId.value,

      supertags:
        researchType.value
          .defaultSupertags ||
        ['source'],

      topicTags:
        parseTopicTags(
          topicTagsInput.value,
        ),

      links:
        [],

      metadata:
        buildMetadata(),
    })

    if (researchError.value) {
      createError.value =
        researchError.value

      return
    }

    const createdItem =
      allResearchItems.value[0]

    resetForm()
    showCreateForm.value = false

    if (
      createdItem?.id &&
      createdItem.type ===
        typeId.value
    ) {
      await router.push(
        getDetailRoute(
          createdItem,
        ),
      )
    }
  } catch (error) {
    console.error(
      'Could not create research item:',
      error,
    )

    createError.value =
      error?.message ||
      'Scholarory could not create this research item.'
  } finally {
    isCreating.value = false
  }
}

function cancelCreate() {
  resetForm()
  showCreateForm.value = false
}

function resetForm() {
  newTitle.value = ''
  newSummary.value = ''
  newStatus.value = 'inbox'
  topicTagsInput.value = ''
  createError.value = ''

  metadata.value = {}

  mediaFields.value = {
    coverImageUrl: '',
    bannerImageUrl: '',
  }

  authors.value = [
    {
      firstName: '',
      initial: '',
      lastName: '',
    },
  ]

  editors.value = []

  initializeMetadataFields()
}

function formatCreators(item) {
  const itemMetadata =
    item.metadata || {}

  const people =
    itemMetadata.authors

  if (
    Array.isArray(people) &&
    people.length
  ) {
    const formatted =
      people
        .map((person) => {
          if (
            typeof person === 'string'
          ) {
            return person
          }

          return [
            person.firstName,
            person.initial,
            person.lastName,
          ]
            .filter(Boolean)
            .join(' ')
        })
        .filter(Boolean)
        .join(', ')

    if (formatted) {
      return formatted
    }
  }

  return (
    itemMetadata.author ||
    itemMetadata.creator ||
    itemMetadata.sender ||
    'No author listed'
  )
}

function getItemYear(item) {
  return (
    item.metadata?.year ||
    item.metadata?.publishedDate ||
    item.metadata?.date ||
    ''
  )
}

function getGalleryBannerStyle(item) {
  if (
    item.metadata
      ?.bannerImageUrl
  ) {
    const positionY =
      item.metadata
        ?.bannerObjectPositionY ??
      50

    return {
      backgroundImage:
        `url(${item.metadata.bannerImageUrl})`,

      backgroundSize:
        'cover',

      backgroundPosition:
        `center ${positionY}%`,
    }
  }

  return {}
}

function getItemIcon(item) {
  const type =
    getResearchTypeById(
      item.type,
    )

  return type?.icon ||
    '📄'
}

function buildItemSearchText(item) {
  const values = [
    item.title,
    item.summary,
    item.type,
    item.topicTags,
    item.supertags,
    item.metadata,
  ]

  return flattenSearchValues(
    values,
  )
    .join(' ')
    .toLowerCase()
}

function flattenSearchValues(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap(
      (entry) => {
        return flattenSearchValues(
          entry,
        )
      },
    )
  }

  if (
    typeof value === 'object'
  ) {
    return Object.values(
      value,
    ).flatMap((entry) => {
      return flattenSearchValues(
        entry,
      )
    })
  }

  return [
    String(value),
  ]
}

function formatFieldName(field) {
  return String(field || '')
    .replace(
      /([a-z])([A-Z])/g,
      '$1 $2',
    )
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
}
</script>

<style scoped>
.toolbar-card,
.create-card,
.content-card {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  padding: 1.2rem;
  box-shadow: var(--shadow);
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.toolbar-card h2,
.create-header h2,
.source-details h3 {
  margin: 0;
}

.toolbar-card p,
.create-header p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.toolbar-actions,
.browse-toolbar,
.create-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.browse-toolbar {
  margin-bottom: 0.75rem;
}

.search-input,
.sort-select,
.form-group select {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.65rem 0.75rem;
  font: inherit;
}

.search-input {
  flex: 1;
}

.back-link {
  color: var(--accent);
  font-size: 0.85rem;
  text-decoration: none;
}

.new-source-btn,
.create-btn,
.secondary-btn {
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.new-source-btn,
.create-btn {
  border: none;
  background: var(--accent);
  color: white;
}

.create-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
}

.create-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-eyebrow {
  margin: 0 0 0.25rem !important;
  color: var(--accent-text) !important;
  font-size: 0.73rem !important;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.source-details {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 1rem;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.section-heading > span {
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  padding: 0.35rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(220px, 1fr)
    );
  gap: 0.9rem;
}

.media-grid {
  padding-bottom: 0.25rem;
}

.form-group,
.people-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group.wide {
  grid-column: 1 / -1;
}

.form-group label,
.people-section label {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.form-group input,
.form-group textarea,
.person-row input {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.7rem;
  font: inherit;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.person-row {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    90px
    minmax(0, 1fr)
    36px;
  align-items: center;
  gap: 0.5rem;
}

.small-btn,
.remove-btn {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
}

.small-btn {
  align-self: flex-start;
  padding: 0.45rem 0.7rem;
}

.remove-btn {
  height: 38px;
}

.error-box {
  border: 1px solid #ef4444;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.board-view {
  display: grid;
  grid-template-columns:
    repeat(
      5,
      minmax(220px, 1fr)
    );
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.board-column {
  min-width: 220px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 0.8rem;
  transition: 0.2s ease;
}

.board-column.drop-target {
  border-color: var(--accent);
}

.board-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
}

.board-cards {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-height: 80px;
}

.board-card {
  display: block;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  padding: 0.75rem;
  color: inherit;
  text-decoration: none;
  cursor: grab;
}

.board-card:hover {
  border-color: var(--accent);
}

.board-card:active {
  cursor: grabbing;
}

.board-card-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.board-card-meta {
  margin-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.76rem;
}

.empty {
  color: var(--text-muted);
}

.gallery-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(220px, 260px)
    );
  align-items: start;
  gap: 1rem;
}

.gallery-link {
  color: inherit;
  text-decoration: none;
}

.gallery-card {
  overflow: hidden;
  max-width: 260px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  transition: 0.2s ease;
}

.gallery-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.gallery-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
  background:
    linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.12),
      rgba(168, 85, 247, 0.12)
    );
}

.book-cover {
  width: 58px;
  height: 84px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
}

.gallery-icon {
  font-size: 2rem;
}

.gallery-body {
  padding: 0.85rem;
}

.gallery-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.gallery-meta {
  margin-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.76rem;
}

.gallery-summary {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.list-view {
  display: flex;
  flex-direction: column;
}

.list-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.8rem 0;
  color: inherit;
  text-decoration: none;
}

.list-summary {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.table-wrapper {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  border-bottom: 1px solid var(--border-color);
  padding: 0.8rem;
  text-align: left;
}

.items-table a {
  color: inherit;
  text-decoration: none;
}

.placeholder-view {
  padding: 2rem;
  color: var(--text-muted);
  text-align: center;
}

.topic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.topic-tag {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.2rem 0.45rem;
  font-size: 0.72rem;
}

@media (max-width: 760px) {
  .toolbar-card,
  .section-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions,
  .browse-toolbar,
  .create-actions {
    flex-wrap: wrap;
  }

  .person-row {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-card {
    max-width: none;
  }

  .list-row {
    flex-direction: column;
  }
}
</style>

