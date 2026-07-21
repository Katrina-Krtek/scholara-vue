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

          <div class="metadata-header-actions">
            <span class="field-count">
              {{ metadataFieldCount }}
              field{{ metadataFieldCount === 1 ? '' : 's' }}
            </span>

            <button
              v-if="hasAdvancedFields"
              class="small-btn"
              type="button"
              @click="toggleAdvancedFields"
            >
              {{
                showAdvancedFields
                  ? 'Hide Advanced Fields'
                  : 'Show Advanced Fields'
              }}
            </button>
          </div>
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
          v-for="role in creatorRoleDefinitions"
          :key="role.key"
          class="people-section"
        >
          <label>{{ role.label }}</label>

          <div
            v-for="(creator, index) in metadata[role.key]"
            :key="`${role.key}-${index}`"
            class="creator-card"
          >
            <div class="creator-toolbar">
              <div>
                <p class="creator-order">
                  {{ getCreatorCardLabel(role, index) }}
                </p>

                <span class="creator-help">
                  Citation position {{ index + 1 }}
                </span>
              </div>

              <div class="creator-toolbar-actions">
                <select
                  v-model="creator.creatorType"
                  class="creator-type-select"
                >
                  <option value="person">
                    Person
                  </option>

                  <option value="literal">
                    Organization / Group
                  </option>
                </select>

                <button
                  type="button"
                  class="remove-btn"
                  :aria-label="`Remove ${getCreatorCardLabel(role, index)}`"
                  @click="removeCreator(role.key, index)"
                >
                  ×
                </button>
              </div>
            </div>

            <div
              v-if="creator.creatorType === 'literal'"
              class="creator-field"
            >
              <label>
                {{ getCreatorCardLabel(role, index) }} Organization or Group Name
              </label>

              <input
                v-model="creator.literal"
                type="text"
                :placeholder="`${role.singularLabel} organization or group name`"
              />
            </div>

            <template v-else>
              <div class="creator-name-grid">
                <div class="creator-field">
                  <label>
                    {{ getCreatorCardLabel(role, index) }} First Name
                  </label>

                  <input
                    v-model="creator.firstName"
                    type="text"
                    :placeholder="`${getCreatorCardLabel(role, index)} first name`"
                  />
                </div>

                <div class="creator-field">
                  <label>
                    {{ getCreatorCardLabel(role, index) }} Middle Name / Initial
                  </label>

                  <input
                    v-model="creator.middleName"
                    type="text"
                    :placeholder="`${getCreatorCardLabel(role, index)} middle name or initial`"
                  />
                </div>

                <div class="creator-field">
                  <label>
                    {{ getCreatorCardLabel(role, index) }} Last Name
                  </label>

                  <input
                    v-model="creator.lastName"
                    type="text"
                    :placeholder="`${getCreatorCardLabel(role, index)} last name`"
                  />
                </div>

                <div class="creator-field">
                  <label>
                    {{ getCreatorCardLabel(role, index) }} Suffix
                  </label>

                  <input
                    v-model="creator.suffix"
                    type="text"
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>
              </div>

              <details class="creator-advanced">
                <summary>
                  Additional name details
                </summary>

                <div class="creator-advanced-grid">
                  <div class="creator-field">
                    <label>Name Particle</label>

                    <input
                      v-model="creator.nameParticle"
                      type="text"
                      placeholder="de, van, von, etc."
                    />
                  </div>

                  <div class="creator-field">
                    <label>Separate Initial Field</label>

                    <input
                      v-model="creator.initial"
                      type="text"
                      placeholder="Optional legacy initial"
                    />
                  </div>
                </div>
              </details>
            </template>
          </div>

          <button
            type="button"
            class="small-btn add-person-btn"
            @click="addCreator(role.key)"
          >
            + Add {{ role.singularLabel }}
          </button>
        </div>

        <div class="form-grid">
          <div
            v-for="field in activeFieldDefinitions"
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
              v-for="researchItem in getItemsByStatus(status.id)"
              :key="researchItem.id"
              :to="getDetailRoute(researchItem)"
              class="board-card"
              draggable="true"
              @dragstart="handleDragStart(researchItem.id)"
              @dragend="handleDragEnd"
            >
              <div class="board-card-title">
                {{ getItemIcon(researchItem) }} {{ researchItem.title }}
              </div>

              <div class="board-card-meta">
                {{ formatCreators(researchItem) }}

                <span v-if="getItemYear(researchItem)">
                  · {{ getItemYear(researchItem) }}
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
          v-for="researchItem in visibleItems"
          :key="researchItem.id"
          :to="getDetailRoute(researchItem)"
          class="gallery-link"
        >
          <article class="gallery-card">
            <div
              class="gallery-banner"
              :style="getGalleryBannerStyle(researchItem)"
            >
              <img
                v-if="researchItem.metadata?.coverImageUrl"
                :src="researchItem.metadata.coverImageUrl"
                alt=""
                class="book-cover"
              />

              <span
                v-else
                class="gallery-icon"
              >
                {{ getItemIcon(researchItem) }}
              </span>
            </div>

            <div class="gallery-body">
              <div class="gallery-title">
                {{ researchItem.title }}
              </div>

              <div class="gallery-meta">
                {{ formatCreators(researchItem) }}

                <span v-if="getItemYear(researchItem)">
                  · {{ getItemYear(researchItem) }}
                </span>
              </div>

              <div class="gallery-summary">
                {{ researchItem.summary || 'No summary added.' }}
              </div>

              <div
                v-if="researchItem.topicTags?.length"
                class="topic-row"
              >
                <span
                  v-for="tag in researchItem.topicTags"
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
          v-for="researchItem in visibleItems"
          :key="researchItem.id"
          :to="getDetailRoute(researchItem)"
          class="list-row"
        >
          <span>
            {{ getItemIcon(researchItem) }} {{ researchItem.title }}
          </span>

          <span class="list-summary">
            {{ formatCreators(researchItem) }}
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
              v-for="researchItem in visibleItems"
              :key="researchItem.id"
            >
              <td>
                <RouterLink :to="getDetailRoute(researchItem)">
                  {{ getItemIcon(researchItem) }} {{ researchItem.title }}
                </RouterLink>
              </td>

              <td>
                {{ formatCreators(researchItem) }}
              </td>

              <td>
                {{ getStatusLabel(researchItem.metadata?.status) }}
              </td>

              <td>
                {{ getItemYear(researchItem) || '—' }}
              </td>

              <td>
                {{ researchItem.topicTags?.join(', ') || '—' }}
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

import {
  cleanCreatorList,
  createEmptyCreator,
  createMetadataForType,
  getCreatorRoleDefinitionsForType,
  getFieldDefinitionsForType,
  getResearchMetadataConfig,
} from '../data/researchMetadataSchema'

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
const showAdvancedFields = ref(false)
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

const researchType = computed(() => {
  return getResearchTypeById(
    typeId.value,
  )
})

const metadataConfig = computed(() => {
  return getResearchMetadataConfig(
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

const creatorRoleDefinitions =
  computed(() => {
    return getCreatorRoleDefinitionsForType(
      typeId.value,
    )
  })

const activeFieldDefinitions =
  computed(() => {
    return getFieldDefinitionsForType(
      typeId.value,
      {
        includeAdvanced:
          showAdvancedFields.value,
      },
    )
  })

const hasAdvancedFields =
  computed(() => {
    return (
      metadataConfig.value
        .advancedFields
        .length > 0
    )
  })

const metadataFieldCount =
  computed(() => {
    return (
      activeFieldDefinitions.value
        .length +
      creatorRoleDefinitions.value
        .length
    )
  })

const filteredItems = computed(() => {
  return allResearchItems.value.filter(
    (researchItem) => {
      return (
        researchItem.type ===
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
      (researchItem) => {
        if (!query) {
          return true
        }

        return buildItemSearchText(
          researchItem,
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

watch(
  showAdvancedFields,
  () => {
    initializeMetadataFields()
  },
)

function toggleCreateForm() {
  showCreateForm.value =
    !showCreateForm.value

  if (showCreateForm.value) {
    initializeMetadataFields()
  }
}

function toggleAdvancedFields() {
  showAdvancedFields.value =
    !showAdvancedFields.value
}

function initializeMetadataFields() {
  metadata.value =
    createMetadataForType(
      typeId.value,
      metadata.value,
      {
        includeAdvanced:
          showAdvancedFields.value,
      },
    )

  creatorRoleDefinitions.value.forEach(
    (role) => {
      if (
        !Array.isArray(
          metadata.value[role.key],
        )
      ) {
        metadata.value[role.key] = []
      }

      ensureDefaultCreatorSlots(
        role.key,
      )
    },
  )
}

function addCreator(roleKey) {
  if (
    !Array.isArray(
      metadata.value[roleKey],
    )
  ) {
    metadata.value[roleKey] = []
  }

  metadata.value[roleKey].push(
    createEmptyCreator(),
  )
}

function removeCreator(
  roleKey,
  index,
) {
  if (
    !Array.isArray(
      metadata.value[roleKey],
    )
  ) {
    return
  }

  metadata.value[roleKey]
    .splice(index, 1)

  ensureDefaultCreatorSlots(
    roleKey,
  )
}

function ensureDefaultCreatorSlots(
  roleKey,
) {
  if (roleKey !== 'authors') {
    return
  }

  if (
    !Array.isArray(
      metadata.value[roleKey],
    )
  ) {
    metadata.value[roleKey] = []
  }

  while (
    metadata.value[roleKey]
      .length < 5
  ) {
    metadata.value[roleKey].push(
      createEmptyCreator(),
    )
  }
}

function getCreatorCardLabel(
  role,
  index,
) {
  const position =
    index + 1

  const ordinalLabels = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
  ]

  const positionLabel =
    ordinalLabels[index] ||
    `${role.singularLabel} ${position}`

  if (index < ordinalLabels.length) {
    return `${positionLabel} ${role.singularLabel}`
  }

  return positionLabel
}

function getDetailRoute(
  researchItem,
) {
  return `/research/items/${researchItem.id}`
}

function getItemsByStatus(
  statusId,
) {
  return visibleItems.value.filter(
    (researchItem) => {
      return (
        (
          researchItem.metadata
            ?.status ||
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

function parseTopicTags(
  text,
) {
  return String(text || '')
    .split(',')
    .map((tag) => {
      return tag.trim()
    })
    .filter(Boolean)
}

function buildMetadata() {
  const finalMetadata =
    createMetadataForType(
      typeId.value,
      metadata.value,
      {
        includeAdvanced: true,
      },
    )

  creatorRoleDefinitions.value.forEach(
    (role) => {
      finalMetadata[role.key] =
        cleanCreatorList(
          metadata.value[
            role.key
          ] || [],
        )
    },
  )

  finalMetadata.status =
    newStatus.value

  finalMetadata.coverImageUrl =
    mediaFields.value
      .coverImageUrl

  finalMetadata.bannerImageUrl =
    mediaFields.value
      .bannerImageUrl

  finalMetadata.bannerObjectPositionY =
    50

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
    const createdItem =
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

        links: [],

        metadata:
          buildMetadata(),
      })

    if (researchError.value) {
      createError.value =
        researchError.value

      return
    }

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
  showAdvancedFields.value = false

  metadata.value = {}

  mediaFields.value = {
    coverImageUrl: '',
    bannerImageUrl: '',
  }

  initializeMetadataFields()
}

function formatCreator(
  creator,
) {
  if (!creator) {
    return ''
  }

  if (
    typeof creator === 'string'
  ) {
    return creator.trim()
  }

  if (
    creator.literal ||
    creator.raw
  ) {
    return String(
      creator.literal ||
      creator.raw,
    ).trim()
  }

  return [
    creator.firstName ||
      creator.given,
    creator.middleName ||
      creator.middle,
    creator.initial,
    creator.nameParticle ||
      creator.particle,
    creator.lastName ||
      creator.family,
    creator.suffix,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function formatCreatorList(
  creators,
) {
  if (!Array.isArray(creators)) {
    return ''
  }

  return creators
    .map(formatCreator)
    .filter(Boolean)
    .join(', ')
}

function formatCreators(
  researchItem,
) {
  const itemMetadata =
    researchItem.metadata ||
    {}

  const preferredRoleKeys = [
    'authors',
    'editors',
    'translators',
    'presenters',
    'directors',
    'senders',
    'interviewees',
    'contributors',
  ]

  for (
    const roleKey
    of preferredRoleKeys
  ) {
    const formatted =
      formatCreatorList(
        itemMetadata[roleKey],
      )

    if (formatted) {
      return formatted
    }
  }

  return (
    itemMetadata.author ||
    itemMetadata.creator ||
    itemMetadata.sender ||
    itemMetadata.editor ||
    'No author listed'
  )
}

function getItemYear(
  researchItem,
) {
  return (
    researchItem.metadata
      ?.publicationDate ||
    researchItem.metadata?.year ||
    researchItem.metadata
      ?.publishedDate ||
    researchItem.metadata?.date ||
    ''
  )
}

function getGalleryBannerStyle(
  researchItem,
) {
  if (
    researchItem.metadata
      ?.bannerImageUrl
  ) {
    const positionY =
      researchItem.metadata
        ?.bannerObjectPositionY ??
      50

    return {
      backgroundImage:
        `url(${researchItem.metadata.bannerImageUrl})`,

      backgroundSize:
        'cover',

      backgroundPosition:
        `center ${positionY}%`,
    }
  }

  return {}
}

function getItemIcon(
  researchItem,
) {
  const type =
    getResearchTypeById(
      researchItem.type,
    )

  return type?.icon ||
    '📄'
}

function buildItemSearchText(
  researchItem,
) {
  const values = [
    researchItem.title,
    researchItem.summary,
    researchItem.type,
    researchItem.topicTags,
    researchItem.supertags,
    researchItem.metadata,
  ]

  return flattenSearchValues(
    values,
  )
    .join(' ')
    .toLowerCase()
}

function flattenSearchValues(
  value,
) {
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
.create-actions,
.metadata-header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.browse-toolbar {
  margin-bottom: 0.75rem;
}

.search-input,
.sort-select,
.form-group select,
.creator-type-select {
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

.field-count {
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
.people-section > label {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.form-group input,
.form-group textarea,
.creator-card input {
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

.creator-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 0.75rem;
}

.creator-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.creator-order {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 800;
}

.creator-help {
  display: block;
  margin-top: 0.12rem;
  color: var(--text-muted);
  font-size: 0.7rem;
}

.creator-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.creator-type-select {
  min-width: 180px;
  background: var(--bg-card);
}

.creator-name-grid,
.creator-advanced-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(170px, 1fr)
    );
  gap: 0.65rem;
}

.creator-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.creator-field label {
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 700;
}

.creator-advanced {
  border-top: 1px solid var(--border-color);
  padding-top: 0.55rem;
}

.creator-advanced summary {
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
}

.creator-advanced-grid {
  margin-top: 0.6rem;
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
  padding: 0.45rem 0.7rem;
}

.add-person-btn {
  align-self: flex-start;
}

.remove-btn {
  flex: 0 0 38px;
  width: 38px;
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
  .create-actions,
  .metadata-header-actions {
    flex-wrap: wrap;
  }

  .creator-toolbar,
  .creator-toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .creator-type-select {
    width: 100%;
    min-width: 0;
  }

  .creator-name-grid,
  .creator-advanced-grid {
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

