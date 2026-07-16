Library
/
Scholarory App Build
/ResearchDetail_dynamic_sources.txt

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
            class="ghost-btn"
            type="button"
          >
            •••
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

            <span class="metadata-field-count">
              {{ activeFieldDefinitions.length }}
              field{{ activeFieldDefinitions.length === 1 ? '' : 's' }}
            </span>
          </div>

          <div
            v-if="usesAuthors"
            class="people-section"
          >
            <label>Authors</label>

            <div
              v-for="(author, index) in editForm.metadata.authors"
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
                class="remove-btn"
                type="button"
                @click="removeEditAuthor(index)"
              >
                ×
              </button>
            </div>

            <button
              class="small-btn"
              type="button"
              @click="addEditAuthor"
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
              v-for="(editor, index) in editForm.metadata.editors"
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
                class="remove-btn"
                type="button"
                @click="removeEditEditor(index)"
              >
                ×
              </button>
            </div>

            <button
              class="small-btn"
              type="button"
              @click="addEditEditor"
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

      <section class="citation-section">
        <h2>Bibliography Citation</h2>

        <blockquote
          class="citation-block"
          v-html="generatedCitation"
        ></blockquote>

        <button
          class="copy-btn"
          type="button"
          @click="copyCitation(generatedCitation, 'bibliography')"
        >
          {{
            copiedCitationType === 'bibliography'
              ? 'Copied!'
              : 'Copy Bibliography'
          }}
        </button>

        <h2>Full Footnote Citation</h2>

        <blockquote
          class="citation-block"
          v-html="generatedFullFootnote"
        ></blockquote>

        <button
          class="copy-btn"
          type="button"
          @click="copyCitation(generatedFullFootnote, 'full')"
        >
          {{
            copiedCitationType === 'full'
              ? 'Copied!'
              : 'Copy Full Footnote'
          }}
        </button>

        <h2>Short Footnote Citation</h2>

        <blockquote
          class="citation-block"
          v-html="generatedShortFootnote"
        ></blockquote>

        <button
          class="copy-btn"
          type="button"
          @click="copyCitation(generatedShortFootnote, 'short')"
        >
          {{
            copiedCitationType === 'short'
              ? 'Copied!'
              : 'Copy Short Footnote'
          }}
        </button>
      </section>

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

              <RouterLink
                v-for="link in linkedItems"
                :key="link.id"
                :to="`/research/items/${link.id}`"
                class="connection-link"
              >
                {{ getItemIcon(link) }} {{ link.title }}
              </RouterLink>

              <h3 class="backlink-heading">
                Backlinks
              </h3>

              <p
                v-if="backlinks.length === 0"
                class="muted-text"
              >
                Nothing links back to this item yet.
              </p>

              <RouterLink
                v-for="backlink in backlinks"
                :key="backlink.id"
                :to="`/research/items/${backlink.id}`"
                class="connection-link"
              >
                {{ getItemIcon(backlink) }}
                {{ backlink.title }}
              </RouterLink>
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
} from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import ScholaroryEditor from '../components/ScholaroryEditor.vue'
import KnowledgeTagModal from '../components/KnowledgeTagModal.vue'
import KnowledgeNetworkCard from '../components/KnowledgeNetworkCard.vue'

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
  generateCitation,
  generateFullFootnote,
  generateShortFootnote,
} from '../utils/citations'

import {
  getCitationStyle,
} from '../lib/userPreferences'

const route = useRoute()

const {
  allResearchItems,
  loadResearchItems,
  getResearchItemById,
  getBacklinks,
  addLinkToItem,
  updateResearchItem,
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
const isEditing = ref(false)
const copiedCitationType = ref('')
const isKnowledgeTagModalOpen = ref(false)

const editForm = ref(
  getEmptyEditForm(),
)

const FIELD_DEFINITIONS = {
  author: {
    key: 'author',
    label: 'Author',
    icon: '👤',
    placeholder: 'Author name',
  },
  shortTitle: {
    key: 'shortTitle',
    label: 'Short Title',
    icon: '⌁',
    placeholder: 'Shortened title for notes',
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
  year: {
    key: 'year',
    label: 'Publication Year',
    icon: '◷',
    placeholder: '2026',
  },
  edition: {
    key: 'edition',
    label: 'Edition',
    icon: '▤',
    placeholder: '2nd edition',
  },
  isbn: {
    key: 'isbn',
    label: 'ISBN',
    icon: '#',
    placeholder: 'ISBN',
  },
  pageRange: {
    key: 'pageRange',
    label: 'Page Range / Count',
    icon: '☰',
    placeholder: '1–250',
  },
  libraryLocation: {
    key: 'libraryLocation',
    label: 'Library Location',
    icon: '⌂',
    placeholder: 'Shelf, library, or collection',
  },
  journal: {
    key: 'journal',
    label: 'Journal',
    icon: '📰',
    placeholder: 'Journal title',
  },
  volume: {
    key: 'volume',
    label: 'Volume',
    icon: 'V',
    placeholder: 'Volume',
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
  advisor: {
    key: 'advisor',
    label: 'Advisor / Committee Chair',
    icon: '👤',
    placeholder: 'Advisor or committee chair',
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
    placeholder: 'Institutional repository or archive',
  },
  publicationNumber: {
    key: 'publicationNumber',
    label: 'Publication / Document Number',
    icon: '#',
    placeholder: 'Publication or document number',
  },
  siteName: {
    key: 'siteName',
    label: 'Website Name',
    icon: '🌐',
    placeholder: 'Website or organization',
  },
  publishedDate: {
    key: 'publishedDate',
    label: 'Published Date',
    icon: '📅',
    control: 'date',
  },
  accessedDate: {
    key: 'accessedDate',
    label: 'Accessed Date',
    icon: '📅',
    control: 'date',
  },
  blogName: {
    key: 'blogName',
    label: 'Blog Name',
    icon: '✍️',
    placeholder: 'Blog title',
  },
  creator: {
    key: 'creator',
    label: 'Creator',
    icon: '👤',
    placeholder: 'Creator, director, or presenter',
  },
  platform: {
    key: 'platform',
    label: 'Platform',
    icon: '▶️',
    placeholder: 'YouTube, Vimeo, podcast platform, etc.',
  },
  sender: {
    key: 'sender',
    label: 'Sender',
    icon: '↗',
    placeholder: 'Sender',
  },
  recipient: {
    key: 'recipient',
    label: 'Recipient',
    icon: '↙',
    placeholder: 'Recipient',
  },
  date: {
    key: 'date',
    label: 'Date',
    icon: '📅',
    control: 'date',
  },
  format: {
    key: 'format',
    label: 'Format',
    icon: '▣',
    placeholder: 'Email, letter, interview, etc.',
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

const item = computed(() => {
  return getResearchItemById(
    route.params.id,
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
      activeEditType.value,
    )
  })

const displayFieldDefinitions =
  computed(() => {
    return getFieldDefinitionsForType(
      activeItemType.value,
    )
  })

const usesAuthors = computed(() => {
  return activeEditType.value
    ?.fields
    ?.includes('authors')
})

const usesEditors = computed(() => {
  return activeEditType.value
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

const generatedCitation = computed(() => {
  if (!item.value) {
    return ''
  }

  return generateCitation(
    item.value,
    getCitationStyle(),
  )
})

const generatedFullFootnote =
  computed(() => {
    if (!item.value) {
      return ''
    }

    return generateFullFootnote(
      item.value,
      getCitationStyle(),
    )
  })

const generatedShortFootnote =
  computed(() => {
    if (!item.value) {
      return ''
    }

    return generateShortFootnote(
      item.value,
      getCitationStyle(),
    )
  })

const backlinks = computed(() => {
  if (!item.value) {
    return []
  }

  return getBacklinks(
    item.value.id,
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
  return allResearchItems.value.filter(
    (researchItem) => {
      return (
        researchItem.id !==
        item.value?.id
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

  if (!route.params.id) {
    return
  }

  const loadedBlocks =
    await loadBlocks(
      route.params.id,
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

  hasLoadedBlocks.value =
    true
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

    if (!route.params.id) {
      return
    }

    await saveBlocks(
      route.params.id,
      editorBlocks.value,
    )
  },
)

function getEmptyEditForm() {
  return {
    title: '',
    summary: '',
    type: 'book',
    status: 'inbox',
    coverImageUrl: '',
    bannerImageUrl: '',
    bannerObjectPositionY: 50,
    metadata: {
      authors: [
        {
          firstName: '',
          initial: '',
          lastName: '',
        },
      ],
      editors: [],
    },
  }
}

function getFieldDefinitionsForType(
  typeDefinition,
) {
  const fieldKeys =
    typeDefinition?.fields ||
    []

  return fieldKeys.map((key) => {
    return (
      FIELD_DEFINITIONS[key] ||
      {
        key,
        label:
          formatFieldLabel(key),
        icon:
          '•',
        placeholder:
          '',
      }
    )
  })
}

function ensureEditMetadataFields() {
  if (
    !editForm.value.metadata ||
    typeof editForm.value.metadata !==
      'object'
  ) {
    editForm.value.metadata = {}
  }

  const fieldDefinitions =
    getFieldDefinitionsForType(
      activeEditType.value,
    )

  fieldDefinitions.forEach((field) => {
    if (
      field.key === 'authors'
    ) {
      if (
        !Array.isArray(
          editForm.value.metadata.authors,
        ) ||
        editForm.value.metadata.authors
          .length === 0
      ) {
        editForm.value.metadata.authors = [
          {
            firstName: '',
            initial: '',
            lastName: '',
          },
        ]
      }

      return
    }

    if (
      field.key === 'editors'
    ) {
      if (
        !Array.isArray(
          editForm.value.metadata.editors,
        )
      ) {
        editForm.value.metadata.editors = []
      }

      return
    }

    if (
      editForm.value.metadata[
        field.key
      ] === undefined ||
      editForm.value.metadata[
        field.key
      ] === null
    ) {
      editForm.value.metadata[
        field.key
      ] = ''
    }
  })

  if (
    activeEditType.value
      ?.fields
      ?.includes('author') &&
    !editForm.value.metadata.author
  ) {
    const people =
      editForm.value.metadata
        .authors || []

    const peopleText =
      formatPeople(people)

    if (peopleText !== '—') {
      editForm.value.metadata.author =
        peopleText
    }
  }
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

  const metadata = {
    ...(item.value.metadata || {}),
  }

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
      metadata.status ||
      'inbox',

    coverImageUrl:
      metadata.coverImageUrl ||
      '',

    bannerImageUrl:
      metadata.bannerImageUrl ||
      '',

    bannerObjectPositionY:
      metadata.bannerObjectPositionY ??
      50,

    metadata: {
      ...metadata,

      authors:
        clonePeople(
          metadata.authors,
          true,
        ),

      editors:
        clonePeople(
          metadata.editors,
          false,
        ),
    },
  }

  ensureEditMetadataFields()
}

function handleEditTypeChange() {
  ensureEditMetadataFields()
}

function clonePeople(
  people = [],
  ensureOne = false,
) {
  const safePeople =
    Array.isArray(people)
      ? people
      : []

  const cleaned = safePeople.map(
    (person) => {
      if (
        typeof person === 'string'
      ) {
        const parts =
          person
            .trim()
            .split(/\s+/)

        return {
          firstName:
            parts.slice(0, -1)
              .join(' '),

          initial:
            '',

          lastName:
            parts.slice(-1)
              .join(''),
        }
      }

      return {
        firstName:
          person?.firstName ||
          '',

        initial:
          person?.initial ||
          '',

        lastName:
          person?.lastName ||
          '',
      }
    },
  )

  if (
    ensureOne &&
    cleaned.length === 0
  ) {
    return [
      {
        firstName: '',
        initial: '',
        lastName: '',
      },
    ]
  }

  return cleaned
}

function cleanPeopleList(
  people = [],
) {
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

function addEditAuthor() {
  editForm.value.metadata
    .authors
    .push({
      firstName: '',
      initial: '',
      lastName: '',
    })
}

function removeEditAuthor(index) {
  editForm.value.metadata
    .authors
    .splice(index, 1)

  if (
    editForm.value.metadata
      .authors.length === 0
  ) {
    addEditAuthor()
  }
}

function addEditEditor() {
  editForm.value.metadata
    .editors
    .push({
      firstName: '',
      initial: '',
      lastName: '',
    })
}

function removeEditEditor(index) {
  editForm.value.metadata
    .editors
    .splice(index, 1)
}

function cancelEdit() {
  populateEditForm()
  isEditing.value = false
}

async function saveEdits() {
  if (!item.value) {
    return
  }

  const metadata = {
    ...(item.value.metadata || {}),
    ...(editForm.value.metadata || {}),

    status:
      editForm.value.status,

    coverImageUrl:
      editForm.value.coverImageUrl,

    bannerImageUrl:
      editForm.value.bannerImageUrl,

    bannerObjectPositionY:
      Number(
        editForm.value
          .bannerObjectPositionY,
      ),

    authors:
      cleanPeopleList(
        editForm.value.metadata
          .authors || [],
      ),

    editors:
      cleanPeopleList(
        editForm.value.metadata
          .editors || [],
      ),
  }

  if (
    activeEditType.value
      ?.fields
      ?.includes('author') &&
    !String(
      metadata.author ||
      '',
    ).trim()
  ) {
    const formattedAuthors =
      formatPeople(
        metadata.authors,
      )

    if (formattedAuthors !== '—') {
      metadata.author =
        formattedAuthors
    }
  }

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

  isEditing.value =
    false
}

async function copyCitation(
  citation,
  type,
) {
  const plainText =
    String(citation || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

  await navigator.clipboard.writeText(
    plainText,
  )

  copiedCitationType.value =
    type

  setTimeout(() => {
    copiedCitationType.value =
      ''
  }, 1600)
}

function connectItem() {
  if (
    !selectedLinkId.value ||
    !item.value
  ) {
    return
  }

  addLinkToItem(
    item.value.id,
    selectedLinkId.value,
  )

  selectedLinkId.value =
    ''
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
    item.value?.metadata?.[
      fieldKey
    ]

  if (
    fieldKey === 'authors' ||
    fieldKey === 'editors'
  ) {
    return formatPeople(value)
  }

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
      JSON.stringify(value)
    )
  }

  return (
    String(value || '').trim() ||
    '—'
  )
}

function formatPeople(
  people = [],
) {
  if (!Array.isArray(people)) {
    return (
      String(people || '').trim() ||
      '—'
    )
  }

  if (!people.length) {
    return '—'
  }

  return people
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
    .join(', ') ||
    '—'
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
.form-group select,
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

.remove-btn {
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

.connection-link {
  display: block;
  margin: 0.45rem 0;
  color: var(--text-secondary);
  text-decoration: none;
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
  .edit-actions {
    flex-wrap: wrap;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .person-row,
  .property-row,
  .connections-grid {
    grid-template-columns: 1fr;
  }
}
</style>

