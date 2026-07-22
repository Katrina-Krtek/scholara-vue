<template>
  <AppLayout
    :title="item?.title || 'Research Item'"
    subtitle="Academic source workspace"
    banner-key="research"
    default-icon="📄"
  >
    <main
      v-if="item"
      class="notion-page"
    >
      <div class="top-actions">
        <span class="breadcrumb">
          📚 Research Items / {{ item.title }}
        </span>

        <div class="action-row">
          <button
            class="ghost-btn"
            type="button"
            @click="toggleEditMode"
          >
            {{ isEditing ? 'Close Edit' : 'Edit Source' }}
          </button>

          <button
            class="danger-btn"
            type="button"
            @click="handleDeleteItem"
          >
            Delete Item
          </button>

          <button
            class="share-btn"
            type="button"
          >
            Share
          </button>

          <button
            class="ghost-btn"
            type="button"
          >
            ☆
          </button>
        </div>
      </div>

      <section
        class="page-banner"
        :style="bannerStyle"
      >
        <span v-if="!item.metadata?.bannerImageUrl">
          Add banner image later
        </span>
      </section>

      <section class="page-header">
        <div class="cover-shell">
          <img
            v-if="item.metadata?.coverImageUrl"
            :src="item.metadata.coverImageUrl"
            alt=""
            class="cover-image"
          />

          <div
            v-else
            class="page-icon"
          >
            {{ getItemIcon(item) }}
          </div>
        </div>

        <div>
          <h1>{{ item.title }}</h1>

          <p class="summary-line">
            {{ item.summary || 'Add summary...' }}
          </p>
        </div>
      </section>

      <section
        v-if="isEditing"
        class="edit-panel"
      >
        <div class="edit-header">
          <div>
            <h2>Edit Research Item</h2>

            <p class="edit-description">
              Choose a type to show the correct academic metadata fields.
            </p>
          </div>

          <div class="edit-actions">
            <button
              class="secondary-btn"
              type="button"
              @click="cancelEdit"
            >
              Cancel
            </button>

            <button
              class="save-btn"
              type="button"
              @click="saveEdits"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div
          v-if="imageUploadError"
          class="error-box"
        >
          {{ imageUploadError }}
        </div>

        <div class="form-grid identity-grid">
          <div class="form-group">
            <label>Type</label>

            <select
              v-model="editForm.type"
              @change="handleEditTypeChange"
            >
              <option
                v-for="typeOption in researchTypes"
                :key="typeOption.id"
                :value="typeOption.id"
              >
                {{ typeOption.icon }} {{ typeOption.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Status</label>

            <select v-model="editForm.status">
              <option
                v-for="status in researchStatuses"
                :key="status.id"
                :value="status.id"
              >
                {{ status.icon }} {{ status.name }}
              </option>
            </select>
          </div>

          <div class="form-group wide">
            <label>Title</label>

            <input
              v-model="editForm.title"
              type="text"
            />
          </div>

          <div class="form-group wide">
            <label>Summary</label>

            <textarea
              v-model="editForm.summary"
              rows="4"
            ></textarea>
          </div>
        </div>

        <section class="media-editor">
          <div class="media-card">
            <label>Cover Image</label>

            <div class="media-preview cover-preview">
              <img
                v-if="editForm.coverImageUrl"
                :src="editForm.coverImageUrl"
                alt=""
              />

              <span v-else>
                No cover uploaded
              </span>
            </div>

            <div class="media-actions">
              <label class="upload-btn">
                {{ isUploadingImage ? 'Uploading...' : 'Upload Cover' }}

                <input
                  type="file"
                  accept="image/*"
                  @change="handleCoverUpload"
                />
              </label>

              <button
                v-if="editForm.coverImageUrl"
                class="secondary-btn"
                type="button"
                @click="removeCover"
              >
                Remove Cover
              </button>
            </div>
          </div>

          <div class="media-card">
            <label>Banner Image</label>

            <div
              class="media-preview banner-preview"
              :style="editBannerPreviewStyle"
            >
              <span v-if="!editForm.bannerImageUrl">
                No banner uploaded
              </span>
            </div>

            <div class="media-actions">
              <label class="upload-btn">
                {{ isUploadingImage ? 'Uploading...' : 'Upload Banner' }}

                <input
                  type="file"
                  accept="image/*"
                  @change="handleBannerUpload"
                />
              </label>

              <button
                v-if="editForm.bannerImageUrl"
                class="secondary-btn"
                type="button"
                @click="removeBanner"
              >
                Remove Banner
              </button>
            </div>

            <div
              v-if="editForm.bannerImageUrl"
              class="slider-group"
            >
              <div class="slider-label-row">
                <span>Banner Reposition</span>
                <strong>
                  {{ editForm.bannerObjectPositionY }}%
                </strong>
              </div>

              <input
                v-model="editForm.bannerObjectPositionY"
                type="range"
                min="0"
                max="100"
              />

              <div class="slider-help">
                Move left for higher image placement, right for lower.
              </div>
            </div>
          </div>
        </section>

        <section class="type-metadata-editor">
          <div class="metadata-editor-header">
            <div>
              <p class="metadata-eyebrow">
                {{ activeEditType?.icon || '📄' }}
                {{ activeEditType?.name || 'Research Item' }}
              </p>

              <h3>
                {{ activeEditType?.name || 'Research Item' }} Details
              </h3>
            </div>

            <div class="metadata-header-actions">
              <span class="metadata-field-count">
                {{ metadataFieldCount }}
                field{{ metadataFieldCount === 1 ? '' : 's' }}
              </span>

              <button
                v-if="hasAdvancedFields"
                class="small-btn"
                type="button"
                @click="showAdvancedFields = !showAdvancedFields"
              >
                {{
                  showAdvancedFields
                    ? 'Hide Advanced Fields'
                    : 'Show Advanced Fields'
                }}
              </button>
            </div>
          </div>

          <div
            v-for="role in creatorRoleDefinitions"
            :key="role.key"
            class="people-section"
          >
            <label>{{ role.label }}</label>

            <div
              v-for="(creator, index) in editForm.metadata[role.key]"
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
                    class="remove-btn"
                    type="button"
                    :aria-label="`Remove ${getCreatorCardLabel(role, index)}`"
                    @click="removeEditCreator(role.key, index)"
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
                  Organization or Group Name
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
                      :placeholder="`${getCreatorCardLabel(role, index)} first name`"
                    />
                  </div>

                  <div class="creator-field">
                    <label>
                    {{ getCreatorCardLabel(role, index) }} Middle Name / Initial
                  </label>

                    <input
                      v-model="creator.middleName"
                      :placeholder="`${getCreatorCardLabel(role, index)} middle name or initial`"
                    />
                  </div>

                  <div class="creator-field">
                    <label>
                    {{ getCreatorCardLabel(role, index) }} Last Name
                  </label>

                    <input
                      v-model="creator.lastName"
                      :placeholder="`${getCreatorCardLabel(role, index)} last name`"
                    />
                  </div>

                  <div class="creator-field">
                    <label>
                    {{ getCreatorCardLabel(role, index) }} Suffix
                  </label>

                    <input
                      v-model="creator.suffix"
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
                        placeholder="de, van, von, etc."
                      />
                    </div>

                    <div class="creator-field">
                      <label>Separate Initial Field</label>

                      <input
                        v-model="creator.initial"
                        placeholder="Optional legacy initial"
                      />
                    </div>
                  </div>
                </details>
              </template>
            </div>

            <button
              class="small-btn"
              type="button"
              @click="addEditCreator(role.key)"
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
              <label :for="`research-field-${field.key}`">
                {{ field.label }}
              </label>

              <textarea
                v-if="field.control === 'textarea'"
                :id="`research-field-${field.key}`"
                v-model="editForm.metadata[field.key]"
                :placeholder="field.placeholder"
                :rows="field.rows || 5"
              ></textarea>

              <input
                v-else
                :id="`research-field-${field.key}`"
                v-model="editForm.metadata[field.key]"
                :type="field.control || 'text'"
                :placeholder="field.placeholder"
              />
            </div>
          </div>
        </section>
      </section>

      <section class="properties-list">
        <div class="property-row">
          <span>◷ Status</span>

          <strong>
            {{ getStatusLabel(item.metadata?.status) }}
          </strong>
        </div>

        <div class="property-row">
          <span>▣ Type</span>

          <strong>
            {{ getTypeName(item) }}
          </strong>
        </div>

        <div class="property-row">
          <span>🏷️ Knowledge Tags</span>

          <div class="property-value">
            <div
              v-if="attachedKnowledgeTags.length"
              class="inline-tag-list"
            >
              <RouterLink
                v-for="tag in attachedKnowledgeTags"
                :key="tag.id"
                :to="`/knowledge-tags/${tag.id}`"
                class="inline-tag-link"
              >
                {{ tag.icon || '🏷️' }} {{ tag.name }}
              </RouterLink>
            </div>

            <span v-else>—</span>
          </div>
        </div>

        <div
          v-for="role in displayCreatorRoleDefinitions"
          :key="`display-${role.key}`"
          class="property-row"
        >
          <span>👤 {{ role.label }}</span>

          <div class="property-value">
            {{ formatCreatorList(normalizedItemMetadata?.[role.key]) || '—' }}
          </div>
        </div>

        <div
          v-for="field in displayFieldDefinitions"
          :key="field.key"
          class="property-row"
        >
          <span>
            {{ field.icon || '•' }} {{ field.label }}
          </span>

          <div
            class="property-value"
            :class="{
              multiline:
                field.control === 'textarea',
            }"
          >
            {{ getDisplayFieldValue(field.key) }}
          </div>
        </div>

        <div class="property-row">
          <span>⌘ Topics</span>

          <div class="property-value">
            {{
              item.topicTags?.length
                ? item.topicTags.join(', ')
                : '—'
            }}
          </div>
        </div>
      </section>

      <KnowledgeNetworkCard
        :item="item"
        :attached-tags="attachedKnowledgeTags"
        :linked-items="linkedItems"
        :backlinks="backlinks"
      />

      <CitationPanel
        v-if="isCitableItem"
        :item="item"
      />

      <hr class="page-divider" />

      <section class="notes-section">
        <div class="notes-header">
          <h2>Reading Notes</h2>

          <div class="notes-actions">
            <span
              v-if="blocksError"
              class="error-text"
            >
              {{ blocksError }}
            </span>

            <span
              v-else-if="isLoadingBlocks"
              class="muted-text"
            >
              Loading notes...
            </span>
          </div>
        </div>

        <ScholaroryEditor v-model="editorBlocks" />
      </section>

      <section class="connections-section">
        <details>
          <summary>
            Connections and Backlinks
          </summary>

          <div class="connections-grid">
            <div>
              <h3>Knowledge Tags</h3>

              <p
                v-if="allKnowledgeTags.length === 0"
                class="muted-text"
              >
                No Knowledge Tags found yet. Create one below.
              </p>

              <template v-else>
                <select v-model="selectedKnowledgeTagId">
                  <option value="">
                    Select Knowledge Tag
                  </option>

                  <option
                    v-for="tag in allKnowledgeTags"
                    :key="tag.id"
                    :value="tag.id"
                  >
                    {{ tag.icon || '🏷️' }} {{ tag.name }}
                  </option>
                </select>

                <button
                  class="connect-btn"
                  type="button"
                  @click="addKnowledgeTag"
                >
                  Add Tag
                </button>
              </template>

              <button
                class="connect-btn secondary-connect-btn"
                type="button"
                @click="isKnowledgeTagModalOpen = true"
              >
                Create & Attach New Tag
              </button>

              <div class="tag-list">
                <div
                  v-for="tag in attachedKnowledgeTags"
                  :key="tag.id"
                  class="tag-pill-row"
                >
                  <RouterLink
                    :to="`/knowledge-tags/${tag.id}`"
                    class="tag-pill-link"
                  >
                    {{ tag.icon || '🏷️' }} {{ tag.name }}
                  </RouterLink>

                  <button
                    class="tag-remove-btn"
                    type="button"
                    @click="removeKnowledgeTag(tag.id)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3>Add Connection</h3>

              <select v-model="selectedLinkId">
                <option
                  disabled
                  value=""
                >
                  Select a research item
                </option>

                <option
                  v-for="researchItem in availableItems"
                  :key="researchItem.id"
                  :value="researchItem.id"
                >
                  {{ getItemIcon(researchItem) }}
                  {{ researchItem.title }}
                </option>
              </select>

              <button
                class="connect-btn"
                type="button"
                @click="connectItem"
              >
                Add Connection
              </button>
            </div>

            <div>
              <h3>Direct Connections</h3>

              <p
                v-if="linkedItems.length === 0"
                class="muted-text"
              >
                This item does not link to anything yet.
              </p>

              <div
                v-for="link in linkedItems"
                :key="link.id"
                class="connection-row"
              >
                <RouterLink
                  :to="`/research/items/${link.id}`"
                  class="connection-link"
                >
                  {{ getItemIcon(link) }} {{ link.title }}
                </RouterLink>

                <button
                  class="connection-remove-btn"
                  type="button"
                  @click="removeDirectConnection(link)"
                >
                  Remove
                </button>
              </div>

              <h3 class="backlink-heading">
                Backlinks
              </h3>

              <p
                v-if="backlinks.length === 0"
                class="muted-text"
              >
                Nothing links back to this item yet.
              </p>

              <div
                v-for="backlink in backlinks"
                :key="backlink.id"
                class="connection-row"
              >
                <RouterLink
                  :to="`/research/items/${backlink.id}`"
                  class="connection-link"
                >
                  {{ getItemIcon(backlink) }}
                  {{ backlink.title }}
                </RouterLink>

                <button
                  class="connection-remove-btn"
                  type="button"
                  @click="removeBacklink(backlink)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </details>
      </section>
    </main>

    <main
      v-else
      class="notion-page"
    >
      <h1>Loading item...</h1>

      <p>
        If this stays here, go back to the Research Hub and reopen the item.
      </p>
    </main>

    <KnowledgeTagModal
      :show="isKnowledgeTagModalOpen"
      mode-title="Create & Attach Knowledge Tag"
      submit-label="Create & Attach"
      @close="isKnowledgeTagModalOpen = false"
      @create="createAndAttachKnowledgeTagFromModal"
    />
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
import ScholaroryEditor from '../components/ScholaroryEditor.vue'
import KnowledgeTagModal from '../components/KnowledgeTagModal.vue'
import KnowledgeNetworkCard from '../components/KnowledgeNetworkCard.vue'
import CitationPanel from '../components/citations/CitationPanel.vue'

import {
  useResearch,
} from '../composables/useResearch'

import {
  useResearchBlocks,
} from '../composables/useResearchBlocks'

import {
  useImageUpload,
} from '../composables/useImageUpload'

import {
  useKnowledgeTags,
} from '../composables/useKnowledgeTags'

import {
  getResearchTypeById,
  researchTypes,
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
  isCitableResearchType,
} from '../data/researchMetadataSchema'

const route = useRoute()
const router = useRouter()

const {
  allResearchItems,
  loadResearchItems,
  getResearchItemById,
  getBacklinks,
  addLinkToItem,
  removeLinkFromItem,
  updateResearchItem,
  deleteResearchItem,
} = useResearch()

const {
  loadBlocks,
  saveBlocks,
  isLoadingBlocks,
  blocksError,
} = useResearchBlocks()

const {
  isUploadingImage,
  imageUploadError,
  uploadResearchImage,
} = useImageUpload()

const {
  allKnowledgeTags,
  loadKnowledgeTags,
  loadResearchItemTags,
  createKnowledgeTag,
  getTagsForResearchItem,
  linkTagToResearchItem,
  unlinkTagFromResearchItem,
} = useKnowledgeTags()

const selectedLinkId = ref('')
const selectedKnowledgeTagId = ref('')
const editorBlocks = ref([])
const hasLoadedBlocks = ref(false)
const activeBlocksItemId = ref('')
const isEditing = ref(false)
const showAdvancedFields = ref(false)
const isKnowledgeTagModalOpen = ref(false)

const editForm = ref(
  getEmptyEditForm(),
)

const item = computed(() => {
  return getResearchItemById(
    route.params.id,
  )
})

const normalizedItemMetadata =
  computed(() => {
    if (!item.value) {
      return {}
    }

    return createMetadataForType(
      item.value.type,
      item.value.metadata || {},
      {
        includeAdvanced: true,
      },
    )
  })

const bannerStyle = computed(() => {
  if (
    item.value?.metadata?.bannerImageUrl
  ) {
    const positionY =
      item.value.metadata
        ?.bannerObjectPositionY ??
      50

    return {
      backgroundImage:
        `url(${item.value.metadata.bannerImageUrl})`,

      backgroundSize:
        'cover',

      backgroundPosition:
        `center ${positionY}%`,
    }
  }

  return {}
})

const editBannerPreviewStyle =
  computed(() => {
    if (!editForm.value.bannerImageUrl) {
      return {}
    }

    return {
      backgroundImage:
        `url(${editForm.value.bannerImageUrl})`,

      backgroundSize:
        'cover',

      backgroundPosition:
        `center ${editForm.value.bannerObjectPositionY}%`,
    }
  })

const activeEditType = computed(() => {
  return (
    getResearchTypeById(
      editForm.value.type,
    ) ||
    researchTypes[0]
  )
})

const activeItemType = computed(() => {
  return (
    getResearchTypeById(
      item.value?.type,
    ) ||
    researchTypes[0]
  )
})

const activeFieldDefinitions =
  computed(() => {
    return getFieldDefinitionsForType(
      editForm.value.type,
      {
        includeAdvanced:
          showAdvancedFields.value,
      },
    )
  })

const displayFieldDefinitions =
  computed(() => {
    return getFieldDefinitionsForType(
      item.value?.type,
      {
        includeAdvanced: true,
      },
    )
  })

const creatorRoleDefinitions =
  computed(() => {
    return getCreatorRoleDefinitionsForType(
      editForm.value.type,
    )
  })

const displayCreatorRoleDefinitions =
  computed(() => {
    return getCreatorRoleDefinitionsForType(
      item.value?.type,
    )
  })

const activeMetadataConfig =
  computed(() => {
    return getResearchMetadataConfig(
      editForm.value.type,
    )
  })

const hasAdvancedFields =
  computed(() => {
    return (
      activeMetadataConfig.value
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

const isCitableItem =
  computed(() => {
    return isCitableResearchType(
      item.value?.type,
    )
  })

const backlinks = computed(() => {
  if (!item.value) {
    return []
  }

  const directLinkIds =
    new Set(
      (item.value.links || [])
        .map((id) =>
          String(id),
        ),
    )

  return getBacklinks(
    item.value.id,
  ).filter(
    (backlink) => {
      return !directLinkIds.has(
        String(backlink.id),
      )
    },
  )
})

const linkedItems = computed(() => {
  if (!item.value?.links) {
    return []
  }

  return item.value.links
    .map((id) => {
      return getResearchItemById(id)
    })
    .filter(Boolean)
})

const availableItems = computed(() => {
  const currentId =
    String(
      item.value?.id ||
      '',
    )

  const linkedIds =
    new Set(
      (item.value?.links || [])
        .map((id) =>
          String(id),
        ),
    )

  return allResearchItems.value.filter(
    (researchItem) => {
      const researchItemId =
        String(
          researchItem.id,
        )

      return (
        researchItemId !==
          currentId &&
        !linkedIds.has(
          researchItemId,
        )
      )
    },
  )
})

const attachedKnowledgeTags =
  computed(() => {
    if (!item.value) {
      return []
    }

    return getTagsForResearchItem(
      item.value.id,
    )
  })

onMounted(async () => {
  await loadResearchItems()
  await loadKnowledgeTags()
  await loadResearchItemTags()

  await loadItemBlocks(
    route.params.id,
  )
})

watch(
  () =>
    JSON.stringify(
      editorBlocks.value,
    ),

  async () => {
    if (!hasLoadedBlocks.value) {
      return
    }

    if (
      !activeBlocksItemId.value
    ) {
      return
    }

    await saveBlocks(
      activeBlocksItemId.value,
      editorBlocks.value,
    )
  },
)

watch(
  () => route.params.id,

  async (nextId, previousId) => {
    if (
      !nextId ||
      String(nextId) ===
        String(previousId)
    ) {
      return
    }

    selectedLinkId.value = ''
    selectedKnowledgeTagId.value = ''
    isEditing.value = false
    showAdvancedFields.value = false

    await loadItemBlocks(nextId)
  },
)

async function loadItemBlocks(
  itemId,
) {
  const cleanItemId =
    String(itemId || '').trim()

  hasLoadedBlocks.value = false
  activeBlocksItemId.value = ''

  if (!cleanItemId) {
    editorBlocks.value = []
    return
  }

  const loadedBlocks =
    await loadBlocks(
      cleanItemId,
    )

  if (loadedBlocks.length > 0) {
    editorBlocks.value =
      loadedBlocks
  } else {
    editorBlocks.value = [
      {
        id:
          crypto.randomUUID(),

        type:
          'text',

        content:
          '',

        childrenText:
          '',

        metadata:
          {},
      },
    ]
  }

  activeBlocksItemId.value =
    cleanItemId

  hasLoadedBlocks.value = true
}

function getEmptyEditForm() {
  return {
    title: '',
    summary: '',
    type: 'book',
    status: 'inbox',
    coverImageUrl: '',
    bannerImageUrl: '',
    bannerObjectPositionY: 50,
    metadata: {},
  }
}

function ensureEditMetadataFields() {
  editForm.value.metadata =
    createMetadataForType(
      editForm.value.type,
      editForm.value.metadata,
      {
        includeAdvanced: true,
      },
    )

  creatorRoleDefinitions.value.forEach(
    (role) => {
      if (
        !Array.isArray(
          editForm.value.metadata[
            role.key
          ],
        )
      ) {
        editForm.value.metadata[
          role.key
        ] = []
      }

      ensureDefaultEditCreatorSlots(
        role.key,
      )
    },
  )
}

function toggleEditMode() {
  if (!isEditing.value) {
    populateEditForm()
  }

  isEditing.value =
    !isEditing.value
}

function populateEditForm() {
  if (!item.value) {
    return
  }

  const normalizedMetadata =
    createMetadataForType(
      item.value.type,
      item.value.metadata || {},
      {
        includeAdvanced: true,
      },
    )

  const metadata = {
    ...normalizedMetadata,
  }

  getCreatorRoleDefinitionsForType(
    item.value.type,
  ).forEach((role) => {
    metadata[role.key] =
      cleanCreatorList(
        normalizedMetadata[
          role.key
        ] || [],
      ).map((creator) => {
        return {
          ...creator,
        }
      })
  })

  editForm.value = {
    title:
      item.value.title ||
      '',

    summary:
      item.value.summary ||
      '',

    type:
      item.value.type ||
      'book',

    status:
      normalizedMetadata.status ||
      'inbox',

    coverImageUrl:
      normalizedMetadata.coverImageUrl ||
      '',

    bannerImageUrl:
      normalizedMetadata.bannerImageUrl ||
      '',

    bannerObjectPositionY:
      normalizedMetadata.bannerObjectPositionY ??
      50,

    metadata,
  }

  showAdvancedFields.value = false
  ensureEditMetadataFields()
}

function handleEditTypeChange() {
  editForm.value.metadata =
    createMetadataForType(
      editForm.value.type,
      editForm.value.metadata,
      {
        includeAdvanced: true,
      },
    )

  showAdvancedFields.value = false
  ensureEditMetadataFields()
}

function addEditCreator(
  roleKey,
) {
  if (
    !Array.isArray(
      editForm.value.metadata[
        roleKey
      ],
    )
  ) {
    editForm.value.metadata[
      roleKey
    ] = []
  }

  editForm.value.metadata[
    roleKey
  ].push(
    createEmptyCreator(),
  )
}

function removeEditCreator(
  roleKey,
  index,
) {
  if (
    !Array.isArray(
      editForm.value.metadata[
        roleKey
      ],
    )
  ) {
    return
  }

  editForm.value.metadata[
    roleKey
  ].splice(index, 1)

  if (
    roleKey === 'authors' &&
    editForm.value.metadata[
      roleKey
    ].length === 0
  ) {
    editForm.value.metadata[
      roleKey
    ].push(
      createEmptyCreator(),
    )
  }
}

function ensureDefaultEditCreatorSlots(
  roleKey,
) {
  if (roleKey !== 'authors') {
    return
  }

  if (
    !Array.isArray(
      editForm.value.metadata[
        roleKey
      ],
    )
  ) {
    editForm.value.metadata[
      roleKey
    ] = []
  }

  if (
    editForm.value.metadata[
      roleKey
    ].length > 0
  ) {
    return
  }

  while (
    editForm.value.metadata[
      roleKey
    ].length < 5
  ) {
    editForm.value.metadata[
      roleKey
    ].push(
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

async function handleCoverUpload(
  event,
) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  const url =
    await uploadResearchImage(
      file,
      'covers',
    )

  if (url) {
    editForm.value.coverImageUrl =
      url
  }

  event.target.value =
    ''
}

async function handleBannerUpload(
  event,
) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  const url =
    await uploadResearchImage(
      file,
      'banners',
    )

  if (url) {
    editForm.value.bannerImageUrl =
      url

    editForm.value.bannerObjectPositionY =
      50
  }

  event.target.value =
    ''
}

function removeCover() {
  editForm.value.coverImageUrl =
    ''
}

function removeBanner() {
  editForm.value.bannerImageUrl =
    ''

  editForm.value.bannerObjectPositionY =
    50
}

function cancelEdit() {
  populateEditForm()
  isEditing.value = false
}

async function saveEdits() {
  if (!item.value) {
    return
  }

  const metadata =
    createMetadataForType(
      editForm.value.type,
      {
        ...(item.value.metadata || {}),
        ...(editForm.value.metadata || {}),
      },
      {
        includeAdvanced: true,
      },
    )

  getCreatorRoleDefinitionsForType(
    editForm.value.type,
  ).forEach((role) => {
    metadata[role.key] =
      cleanCreatorList(
        editForm.value.metadata[
          role.key
        ] || [],
      )
  })

  metadata.status =
    editForm.value.status

  metadata.coverImageUrl =
    editForm.value.coverImageUrl

  metadata.bannerImageUrl =
    editForm.value.bannerImageUrl

  metadata.bannerObjectPositionY =
    Number(
      editForm.value
        .bannerObjectPositionY,
    )

  await updateResearchItem(
    item.value.id,
    {
      type:
        editForm.value.type,

      title:
        editForm.value.title,

      summary:
        editForm.value.summary,

      metadata,
    },
  )

  isEditing.value = false
  showAdvancedFields.value = false
}

async function connectItem() {
  if (
    !selectedLinkId.value ||
    !item.value
  ) {
    return
  }

  const connected =
    await addLinkToItem(
      item.value.id,
      selectedLinkId.value,
    )

  if (connected) {
    selectedLinkId.value = ''
  }
}

async function removeDirectConnection(
  linkedItem,
) {
  if (!item.value) {
    return
  }

  const confirmed =
    window.confirm(
      `Remove the connection between "${item.value.title}" and "${linkedItem.title}"?`,
    )

  if (!confirmed) {
    return
  }

  await removeLinkFromItem(
    item.value.id,
    linkedItem.id,
  )
}

async function removeBacklink(
  backlink,
) {
  if (!item.value) {
    return
  }

  const confirmed =
    window.confirm(
      `Remove the connection between "${backlink.title}" and "${item.value.title}"?`,
    )

  if (!confirmed) {
    return
  }

  await removeLinkFromItem(
    backlink.id,
    item.value.id,
  )
}

async function handleDeleteItem() {
  if (!item.value) {
    return
  }

  const confirmed =
    window.confirm(
      `Delete "${item.value.title}"? Scholarory will also remove links and backlinks pointing to this research item. This cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  const deleted =
    await deleteResearchItem(
      item.value.id,
    )

  if (deleted) {
    router.push(
      '/research/workspace',
    )
  }
}

async function addKnowledgeTag() {
  if (
    !item.value ||
    !selectedKnowledgeTagId.value
  ) {
    return
  }

  await linkTagToResearchItem(
    item.value.id,
    selectedKnowledgeTagId.value,
  )

  await loadResearchItemTags()

  selectedKnowledgeTagId.value =
    ''
}

async function createAndAttachKnowledgeTagFromModal(
  tagPayload,
) {
  if (!item.value) {
    return
  }

  const newTag =
    await createKnowledgeTag(
      tagPayload,
    )

  if (!newTag) {
    return
  }

  await linkTagToResearchItem(
    item.value.id,
    newTag.id,
  )

  await loadResearchItemTags()

  isKnowledgeTagModalOpen.value =
    false
}

async function removeKnowledgeTag(
  tagId,
) {
  if (!item.value) {
    return
  }

  await unlinkTagFromResearchItem(
    item.value.id,
    tagId,
  )

  await loadResearchItemTags()
}

function getDisplayFieldValue(
  fieldKey,
) {
  const value =
    normalizedItemMetadata.value?.[
      fieldKey
    ]

  if (Array.isArray(value)) {
    return (
      value
        .map((entry) => {
          if (
            typeof entry === 'string'
          ) {
            return entry
          }

          return (
            entry?.name ||
            entry?.title ||
            entry?.literal ||
            JSON.stringify(entry)
          )
        })
        .filter(Boolean)
        .join(', ') ||
      '—'
    )
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return (
      value.name ||
      value.title ||
      value.literal ||
      JSON.stringify(value)
    )
  }

  return (
    String(value || '').trim() ||
    '—'
  )
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
    return (
      String(creators || '').trim()
    )
  }

  return creators
    .map(formatCreator)
    .filter(Boolean)
    .join(', ')
}

function formatFieldLabel(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase()
    })
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

function getTypeName(
  researchItem,
) {
  const type =
    getResearchTypeById(
      researchItem.type,
    )

  return type?.name ||
    'Research Item'
}
</script>

<style scoped>
.notion-page {
  max-width: 1180px;
  margin: 0 auto;
  background: transparent;
  padding: 2.5rem 2rem 8rem;
  color: var(--text-primary);
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.breadcrumb {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.action-row,
.edit-actions,
.media-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ghost-btn,
.share-btn,
.danger-btn,
.secondary-btn,
.save-btn,
.small-btn,
.remove-btn,
.copy-btn,
.upload-btn {
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.ghost-btn,
.share-btn,
.secondary-btn,
.small-btn,
.remove-btn,
.copy-btn,
.upload-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  padding: 0.45rem 0.7rem;
}

.upload-btn input {
  display: none;
}

.copy-btn {
  margin-bottom: 1.5rem;
  font-size: 0.82rem;
}

.copy-btn:hover,
.ghost-btn:hover,
.share-btn:hover,
.secondary-btn:hover,
.small-btn:hover,
.upload-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.save-btn {
  border: none;
  background: var(--accent);
  color: white;
  padding: 0.55rem 0.8rem;
}
.danger-btn {
  border: 1px solid rgba(190, 18, 60, 0.28);
  background: rgba(190, 18, 60, 0.08);
  color: #be123c;
  padding: 0.45rem 0.7rem;
}

.danger-btn:hover {
  border-color: #be123c;
  background: rgba(190, 18, 60, 0.14);
}


.error-box {
  margin-bottom: 1rem;
  border: 1px solid #ef4444;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.page-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 210px;
  margin-bottom: -2.5rem;
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.16),
      rgba(168, 85, 247, 0.14)
    );
  color: var(--text-muted);
}

.page-header {
  display: flex;
  align-items: flex-end;
  gap: 1.2rem;
  margin-bottom: 2rem;
  padding-left: 1rem;
}

.cover-shell {
  display: flex;
  align-items: flex-end;
  min-width: 112px;
  min-height: 148px;
}

.cover-image {
  width: 112px;
  height: 148px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.24);
}

.page-icon {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  font-size: 2.4rem;
  box-shadow: var(--shadow);
}

.page-header h1 {
  margin: 0;
  font-size: 2.35rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.summary-line {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
  font-size: 1rem;
}

.edit-panel {
  margin: 1.5rem 0 2rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  padding: 1rem;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.edit-header h2,
.metadata-editor-header h3 {
  margin: 0;
}

.edit-description {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.identity-grid {
  margin-bottom: 1rem;
}

.media-editor {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(260px, 1fr)
    );
  gap: 1rem;
  margin-bottom: 1rem;
}

.media-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 0.85rem;
}

.media-card > label,
.slider-label-row span {
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
}

.media-preview {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  margin: 0.55rem 0 0.75rem;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
}

.cover-preview {
  min-height: 190px;
}

.cover-preview img {
  width: 120px;
  height: 168px;
  border-radius: 8px;
  object-fit: cover;
}

.banner-preview {
  min-height: 140px;
  background-position: center 50%;
  background-size: cover;
}

.slider-group {
  margin-top: 0.8rem;
}

.slider-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.slider-group input[type='range'] {
  width: 100%;
}

.slider-help {
  margin-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.type-metadata-editor {
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--btn-bg);
  padding: 1rem;
}

.metadata-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.metadata-eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-text);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.metadata-field-count {
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

.form-group,
.people-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
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
.form-group select {
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

.metadata-header-actions,
.creator-toolbar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.creator-card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 0.8rem;
}

.creator-toolbar {
  justify-content: space-between;
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
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.65rem 0.75rem;
  font: inherit;
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

.creator-card input {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 0.7rem;
  font: inherit;
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

.remove-btn {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  padding: 0;
}

.small-btn {
  align-self: flex-start;
}

.properties-list {
  max-width: 920px;
  margin: 1.5rem 0 3rem;
}

.property-row {
  display: grid;
  grid-template-columns:
    250px minmax(0, 1fr);
  align-items: start;
  gap: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  padding: 0.7rem 0;
}

.property-row > span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.property-row strong,
.property-value {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-weight: 500;
}

.property-value.multiline {
  white-space: pre-wrap;
  line-height: 1.55;
}

.citation-section {
  margin: 2.5rem 0;
}

.citation-section h2,
.notes-section h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.citation-block {
  margin: 0 0 0.7rem;
  border-left: 4px solid var(--border-color);
  padding: 0.2rem 0 0.2rem 1rem;
  color: var(--text-primary);
  line-height: 1.7;
}

.page-divider {
  margin: 3rem 0;
  border: none;
  border-top: 1px solid var(--border-color);
}

.notes-section {
  min-height: 420px;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notes-actions {
  font-size: 0.82rem;
}

.muted-text {
  color: var(--text-muted);
}

.error-text {
  color: #ef4444;
}

.connections-section {
  margin-top: 3rem;
  color: var(--text-primary);
}

.connections-section summary {
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
}

.connections-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 1.25rem;
}

.connections-grid h3 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
}

.connections-grid select {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.65rem;
}

.connect-btn {
  width: 100%;
  margin-top: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  padding: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary-connect-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
}

.connection-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin: 0.45rem 0;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
  padding: 0.45rem 0.55rem;
}

.connection-link {
  display: block;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connection-remove-btn {
  flex: 0 0 auto;
  border: 1px solid rgba(190, 18, 60, 0.24);
  border-radius: 7px;
  background: rgba(190, 18, 60, 0.07);
  color: #be123c;
  padding: 0.3rem 0.45rem;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.connection-remove-btn:hover {
  border-color: #be123c;
}

.connection-link:hover {
  color: var(--text-primary);
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.tag-pill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-secondary);
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
}

.tag-remove-btn {
  width: 22px;
  height: 22px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.tag-remove-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.backlink-heading {
  margin-top: 1.5rem !important;
}

.inline-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.inline-tag-link,
.tag-pill-link {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}

.inline-tag-link:hover,
.tag-pill-link:hover {
  text-decoration: underline;
}

@media (max-width: 760px) {
  .notion-page {
    padding: 1.5rem 1rem 6rem;
  }

  .top-actions,
  .edit-header {
    align-items: stretch;
    flex-direction: column;
  }

  .action-row,
  .edit-actions,
  .metadata-header-actions {
    flex-wrap: wrap;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
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
  .creator-advanced-grid,
  .property-row,
  .connections-grid {
    grid-template-columns: 1fr;
  }
}
</style>