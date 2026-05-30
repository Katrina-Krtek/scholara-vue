<template>
  <AppLayout
    :title="item?.title || 'Research Item'"
    subtitle="Academic source workspace"
    banner-key="research"
    default-icon="📄"
  >
    <main v-if="item" class="notion-page">
      <div class="top-actions">
        <span class="breadcrumb">📚 Research Items / {{ item.title }}</span>

        <div class="action-row">
          <button class="ghost-btn" @click="toggleEditMode">
            {{ isEditing ? 'Close Edit' : 'Edit Source' }}
          </button>

          <button class="ghost-btn">•••</button>
          <button class="share-btn">Share</button>
          <button class="ghost-btn">☆</button>
        </div>
      </div>

      <section class="page-banner" :style="bannerStyle">
        <span v-if="!item.metadata?.bannerImageUrl">Add banner image later</span>
      </section>

      <section class="page-header">
        <div class="cover-shell">
          <img
            v-if="item.metadata?.coverImageUrl"
            :src="item.metadata.coverImageUrl"
            alt=""
            class="cover-image"
          />

          <div v-else class="page-icon">
            {{ getItemIcon(item) }}
          </div>
        </div>

        <div>
          <h1>{{ item.title }}</h1>
          <p class="summary-line">{{ item.summary || 'Add summary...' }}</p>
        </div>
      </section>

      <section v-if="isEditing" class="edit-panel">
        <div class="edit-header">
          <h2>Edit Source Details</h2>

          <div class="edit-actions">
            <button class="secondary-btn" @click="cancelEdit">Cancel</button>
            <button class="save-btn" @click="saveEdits">Save Changes</button>
          </div>
        </div>

        <div v-if="imageUploadError" class="error-box">
          {{ imageUploadError }}
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
              <span v-else>No cover uploaded</span>
            </div>

            <div class="media-actions">
              <label class="upload-btn">
                {{ isUploadingImage ? 'Uploading...' : 'Upload Cover' }}
                <input type="file" accept="image/*" @change="handleCoverUpload" />
              </label>

              <button
                v-if="editForm.coverImageUrl"
                type="button"
                class="secondary-btn"
                @click="removeCover"
              >
                Remove Cover
              </button>
            </div>
          </div>

          <div class="media-card">
            <label>Banner Image</label>

            <div class="media-preview banner-preview" :style="editBannerPreviewStyle">
              <span v-if="!editForm.bannerImageUrl">No banner uploaded</span>
            </div>

            <div class="media-actions">
              <label class="upload-btn">
                {{ isUploadingImage ? 'Uploading...' : 'Upload Banner' }}
                <input type="file" accept="image/*" @change="handleBannerUpload" />
              </label>

              <button
                v-if="editForm.bannerImageUrl"
                type="button"
                class="secondary-btn"
                @click="removeBanner"
              >
                Remove Banner
              </button>
            </div>

            <div v-if="editForm.bannerImageUrl" class="slider-group">
              <div class="slider-label-row">
                <span>Banner Reposition</span>
                <strong>{{ editForm.bannerObjectPositionY }}%</strong>
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

        <div class="form-grid">
          <div class="form-group wide">
            <label>Title</label>
            <input v-model="editForm.title" type="text" />
          </div>

          <div class="form-group wide">
            <label>Summary</label>
            <textarea v-model="editForm.summary"></textarea>
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

          <div class="form-group">
            <label>Short Title</label>
            <input v-model="editForm.shortTitle" type="text" />
          </div>

          <div class="form-group">
            <label>Publisher</label>
            <input v-model="editForm.publisher" type="text" />
          </div>

          <div class="form-group">
            <label>Place of Publication</label>
            <input v-model="editForm.placeOfPublication" type="text" />
          </div>

          <div class="form-group">
            <label>Year</label>
            <input v-model="editForm.year" type="text" />
          </div>

          <div class="form-group">
            <label>Edition</label>
            <input v-model="editForm.edition" type="text" />
          </div>

          <div class="form-group">
            <label>ISBN</label>
            <input v-model="editForm.isbn" type="text" />
          </div>

          <div class="form-group">
            <label>Page Range</label>
            <input v-model="editForm.pageRange" type="text" />
          </div>

          <div class="form-group">
            <label>Library Location</label>
            <input v-model="editForm.libraryLocation" type="text" />
          </div>
        </div>

        <div class="people-section">
          <label>Authors</label>

          <div
            v-for="(author, index) in editForm.authors"
            :key="`author-${index}`"
            class="person-row"
          >
            <input v-model="author.firstName" placeholder="First name" />
            <input v-model="author.initial" placeholder="Initial" />
            <input v-model="author.lastName" placeholder="Last name" />

            <button class="remove-btn" type="button" @click="removeEditAuthor(index)">
              ×
            </button>
          </div>

          <button class="small-btn" type="button" @click="addEditAuthor">
            + Add Author
          </button>
        </div>

        <div class="people-section">
          <label>Editors</label>

          <div
            v-for="(editor, index) in editForm.editors"
            :key="`editor-${index}`"
            class="person-row"
          >
            <input v-model="editor.firstName" placeholder="First name" />
            <input v-model="editor.initial" placeholder="Initial" />
            <input v-model="editor.lastName" placeholder="Last name" />

            <button class="remove-btn" type="button" @click="removeEditEditor(index)">
              ×
            </button>
          </div>

          <button class="small-btn" type="button" @click="addEditEditor">
            + Add Editor
          </button>
        </div>
      </section>

      <section class="properties-list">
        <div class="property-row">
          <span>◷ Status</span>
          <strong>{{ getStatusLabel(item.metadata?.status) }}</strong>
        </div>

        <div class="property-row">
          <span>▣ Type</span>
          <strong>{{ getTypeName(item) }}</strong>
        </div>

        <div class="property-row">
          <span>👤 Authors</span>
          <strong>{{ formatPeople(item.metadata?.authors) }}</strong>
        </div>

        <div class="property-row">
          <span>✎ Editors</span>
          <strong>{{ formatPeople(item.metadata?.editors) }}</strong>
        </div>

        <div class="property-row">
          <span>🏷️ Knowledge Tags</span>

          <strong>
            <div v-if="attachedKnowledgeTags.length" class="inline-tag-list">
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
          </strong>
        </div>

        <div class="property-row">
          <span>⌁ Short Title</span>
          <strong>{{ item.metadata?.shortTitle || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>⌂ Publisher</span>
          <strong>{{ item.metadata?.publisher || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>⌖ Place of Publication</span>
          <strong>{{ item.metadata?.placeOfPublication || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>◷ Year</span>
          <strong>{{ item.metadata?.year || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>▤ Edition</span>
          <strong>{{ item.metadata?.edition || '—' }}</strong>
        </div>

        <div class="property-row">
          <span># ISBN</span>
          <strong>{{ item.metadata?.isbn || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>☰ Page Range</span>
          <strong>{{ item.metadata?.pageRange || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>⌂ Library Location</span>
          <strong>{{ item.metadata?.libraryLocation || '—' }}</strong>
        </div>

        <div class="property-row">
          <span>⌘ Topics</span>
          <strong>{{ item.topicTags?.length ? item.topicTags.join(', ') : '—' }}</strong>
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

        <blockquote class="citation-block" v-html="generatedCitation"></blockquote>

        <button
          class="copy-btn"
          type="button"
          @click="copyCitation(generatedCitation, 'bibliography')"
        >
          {{ copiedCitationType === 'bibliography' ? 'Copied!' : 'Copy Bibliography' }}
        </button>

        <h2>Full Footnote Citation</h2>

        <blockquote class="citation-block" v-html="generatedFullFootnote"></blockquote>

        <button
          class="copy-btn"
          type="button"
          @click="copyCitation(generatedFullFootnote, 'full')"
        >
          {{ copiedCitationType === 'full' ? 'Copied!' : 'Copy Full Footnote' }}
        </button>

        <h2>Short Footnote Citation</h2>

        <blockquote class="citation-block" v-html="generatedShortFootnote"></blockquote>

        <button
          class="copy-btn"
          type="button"
          @click="copyCitation(generatedShortFootnote, 'short')"
        >
          {{ copiedCitationType === 'short' ? 'Copied!' : 'Copy Short Footnote' }}
        </button>
      </section>

      <hr class="page-divider" />

      <section class="notes-section">
        <div class="notes-header">
          <h2>Reading Notes</h2>

          <div class="notes-actions">
            <span v-if="blocksError" class="error-text">{{ blocksError }}</span>
            <span v-else-if="isLoadingBlocks" class="muted-text">Loading notes...</span>
          </div>
        </div>

        <ScholaroryEditor v-model="editorBlocks" />
      </section>

      <section class="connections-section">
        <details>
          <summary>Connections and Backlinks</summary>

          <div class="connections-grid">
            <div>
              <h3>Knowledge Tags</h3>

              <p v-if="allKnowledgeTags.length === 0" class="muted-text">
                No Knowledge Tags found yet. Create one below.
              </p>

              <template v-else>
                <select v-model="selectedKnowledgeTagId">
                  <option value="">Select Knowledge Tag</option>

                  <option
                    v-for="tag in allKnowledgeTags"
                    :key="tag.id"
                    :value="tag.id"
                  >
                    {{ tag.icon || '🏷️' }} {{ tag.name }}
                  </option>
                </select>

                <button class="connect-btn" @click="addKnowledgeTag">
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
                <option disabled value="">Select a research item</option>

                <option
                  v-for="researchItem in availableItems"
                  :key="researchItem.id"
                  :value="researchItem.id"
                >
                  {{ getItemIcon(researchItem) }} {{ researchItem.title }}
                </option>
              </select>

              <button class="connect-btn" @click="connectItem">
                Add Connection
              </button>
            </div>

            <div>
              <h3>Direct Connections</h3>

              <p v-if="linkedItems.length === 0" class="muted-text">
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

              <h3 class="backlink-heading">Backlinks</h3>

              <p v-if="backlinks.length === 0" class="muted-text">
                Nothing links back to this item yet.
              </p>

              <RouterLink
                v-for="backlink in backlinks"
                :key="backlink.id"
                :to="`/research/items/${backlink.id}`"
                class="connection-link"
              >
                {{ getItemIcon(backlink) }} {{ backlink.title }}
              </RouterLink>
            </div>
          </div>
        </details>
      </section>
    </main>

    <main v-else class="notion-page">
      <h1>Loading item...</h1>
      <p>If this stays here, go back to the Research Hub and reopen the item.</p>
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
import { computed, ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import ScholaroryEditor from '../components/ScholaroryEditor.vue'
import KnowledgeTagModal from '../components/KnowledgeTagModal.vue'
import KnowledgeNetworkCard from '../components/KnowledgeNetworkCard.vue'

import { useResearch } from '../composables/useResearch'
import { useResearchBlocks } from '../composables/useResearchBlocks'
import { useImageUpload } from '../composables/useImageUpload'
import { useKnowledgeTags } from '../composables/useKnowledgeTags'
import { getResearchTypeById } from '../data/researchTypes'
import { researchStatuses, getResearchStatusById } from '../data/researchStatuses'
import {
  generateCitation,
  generateFullFootnote,
  generateShortFootnote
} from '../utils/citations'
import { getCitationStyle } from '../lib/userPreferences'

const route = useRoute()

const {
  allResearchItems,
  loadResearchItems,
  getResearchItemById,
  getBacklinks,
  addLinkToItem,
  updateResearchItem
} = useResearch()

const {
  loadBlocks,
  saveBlocks,
  isLoadingBlocks,
  blocksError
} = useResearchBlocks()

const {
  isUploadingImage,
  imageUploadError,
  uploadResearchImage
} = useImageUpload()

const {
  allKnowledgeTags,
  loadKnowledgeTags,
  loadResearchItemTags,
  createKnowledgeTag,
  getTagsForResearchItem,
  linkTagToResearchItem,
  unlinkTagFromResearchItem
} = useKnowledgeTags()

const selectedLinkId = ref('')
const selectedKnowledgeTagId = ref('')
const editorBlocks = ref([])
const hasLoadedBlocks = ref(false)
const isEditing = ref(false)
const copiedCitationType = ref('')
const isKnowledgeTagModalOpen = ref(false)

const editForm = ref(getEmptyEditForm())

const item = computed(() => {
  return getResearchItemById(route.params.id)
})

const bannerStyle = computed(() => {
  if (item.value?.metadata?.bannerImageUrl) {
    const positionY = item.value.metadata?.bannerObjectPositionY ?? 50

    return {
      backgroundImage: `url(${item.value.metadata.bannerImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: `center ${positionY}%`
    }
  }

  return {}
})

const editBannerPreviewStyle = computed(() => {
  if (!editForm.value.bannerImageUrl) return {}

  return {
    backgroundImage: `url(${editForm.value.bannerImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: `center ${editForm.value.bannerObjectPositionY}%`
  }
})

const generatedCitation = computed(() => {
  if (!item.value) return ''
  return generateCitation(item.value, getCitationStyle())
})

const generatedFullFootnote = computed(() => {
  if (!item.value) return ''
  return generateFullFootnote(item.value, getCitationStyle())
})

const generatedShortFootnote = computed(() => {
  if (!item.value) return ''
  return generateShortFootnote(item.value, getCitationStyle())
})

const backlinks = computed(() => {
  if (!item.value) return []
  return getBacklinks(item.value.id)
})

const linkedItems = computed(() => {
  if (!item.value?.links) return []

  return item.value.links
    .map((id) => getResearchItemById(id))
    .filter(Boolean)
})

const availableItems = computed(() => {
  return allResearchItems.value.filter(
    (researchItem) => researchItem.id !== item.value?.id
  )
})

const attachedKnowledgeTags = computed(() => {
  if (!item.value) return []
  return getTagsForResearchItem(item.value.id)
})

onMounted(async () => {
  await loadResearchItems()
  await loadKnowledgeTags()
  await loadResearchItemTags()

  if (!route.params.id) return

  const loadedBlocks = await loadBlocks(route.params.id)

  if (loadedBlocks.length > 0) {
    editorBlocks.value = loadedBlocks
  } else {
    editorBlocks.value = [
      {
        id: crypto.randomUUID(),
        type: 'text',
        content: '',
        childrenText: '',
        metadata: {}
      }
    ]
  }

  hasLoadedBlocks.value = true
})

watch(
  () => JSON.stringify(editorBlocks.value),
  async () => {
    if (!hasLoadedBlocks.value) return
    if (!route.params.id) return

    await saveBlocks(route.params.id, editorBlocks.value)
  }
)

function getEmptyEditForm() {
  return {
    title: '',
    summary: '',
    status: 'inbox',
    coverImageUrl: '',
    bannerImageUrl: '',
    bannerObjectPositionY: 50,
    authors: [{ firstName: '', initial: '', lastName: '' }],
    editors: [],
    shortTitle: '',
    publisher: '',
    placeOfPublication: '',
    year: '',
    edition: '',
    isbn: '',
    pageRange: '',
    libraryLocation: ''
  }
}

function toggleEditMode() {
  if (!isEditing.value) {
    populateEditForm()
  }

  isEditing.value = !isEditing.value
}

function populateEditForm() {
  if (!item.value) return

  editForm.value = {
    title: item.value.title || '',
    summary: item.value.summary || '',
    status: item.value.metadata?.status || 'inbox',
    coverImageUrl: item.value.metadata?.coverImageUrl || '',
    bannerImageUrl: item.value.metadata?.bannerImageUrl || '',
    bannerObjectPositionY: item.value.metadata?.bannerObjectPositionY ?? 50,
    authors: clonePeople(item.value.metadata?.authors, true),
    editors: clonePeople(item.value.metadata?.editors, false),
    shortTitle: item.value.metadata?.shortTitle || '',
    publisher: item.value.metadata?.publisher || '',
    placeOfPublication: item.value.metadata?.placeOfPublication || '',
    year: item.value.metadata?.year || '',
    edition: item.value.metadata?.edition || '',
    isbn: item.value.metadata?.isbn || '',
    pageRange: item.value.metadata?.pageRange || '',
    libraryLocation: item.value.metadata?.libraryLocation || ''
  }
}

function clonePeople(people = [], ensureOne = false) {
  const cleaned = people.map((person) => ({
    firstName: person.firstName || '',
    initial: person.initial || '',
    lastName: person.lastName || ''
  }))

  if (ensureOne && cleaned.length === 0) {
    return [{ firstName: '', initial: '', lastName: '' }]
  }

  return cleaned
}

function cleanPeopleList(people = []) {
  return people
    .map((person) => ({
      firstName: person.firstName.trim(),
      initial: person.initial.trim(),
      lastName: person.lastName.trim()
    }))
    .filter((person) => person.firstName || person.initial || person.lastName)
}

async function handleCoverUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const url = await uploadResearchImage(file, 'covers')

  if (url) {
    editForm.value.coverImageUrl = url
  }

  event.target.value = ''
}

async function handleBannerUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const url = await uploadResearchImage(file, 'banners')

  if (url) {
    editForm.value.bannerImageUrl = url
    editForm.value.bannerObjectPositionY = 50
  }

  event.target.value = ''
}

function removeCover() {
  editForm.value.coverImageUrl = ''
}

function removeBanner() {
  editForm.value.bannerImageUrl = ''
  editForm.value.bannerObjectPositionY = 50
}

function addEditAuthor() {
  editForm.value.authors.push({
    firstName: '',
    initial: '',
    lastName: ''
  })
}

function removeEditAuthor(index) {
  editForm.value.authors.splice(index, 1)

  if (editForm.value.authors.length === 0) {
    addEditAuthor()
  }
}

function addEditEditor() {
  editForm.value.editors.push({
    firstName: '',
    initial: '',
    lastName: ''
  })
}

function removeEditEditor(index) {
  editForm.value.editors.splice(index, 1)
}

function cancelEdit() {
  populateEditForm()
  isEditing.value = false
}

async function saveEdits() {
  if (!item.value) return

  await updateResearchItem(item.value.id, {
    title: editForm.value.title,
    summary: editForm.value.summary,
    metadata: {
      status: editForm.value.status,
      coverImageUrl: editForm.value.coverImageUrl,
      bannerImageUrl: editForm.value.bannerImageUrl,
      bannerObjectPositionY: Number(editForm.value.bannerObjectPositionY),
      authors: cleanPeopleList(editForm.value.authors),
      editors: cleanPeopleList(editForm.value.editors),
      shortTitle: editForm.value.shortTitle,
      publisher: editForm.value.publisher,
      placeOfPublication: editForm.value.placeOfPublication,
      year: editForm.value.year,
      edition: editForm.value.edition,
      isbn: editForm.value.isbn,
      pageRange: editForm.value.pageRange,
      libraryLocation: editForm.value.libraryLocation
    }
  })

  isEditing.value = false
}

async function copyCitation(citation, type) {
  const plainText = citation
    .replace(/<\/ ?em>/g, '')
    .replace(/<\/em>/g, '')
    .replace(/<em>/g, '')
    .replace(/&amp;/g, '&')

  await navigator.clipboard.writeText(plainText)

  copiedCitationType.value = type

  setTimeout(() => {
    copiedCitationType.value = ''
  }, 1600)
}

function connectItem() {
  if (!selectedLinkId.value || !item.value) return

  addLinkToItem(item.value.id, selectedLinkId.value)
  selectedLinkId.value = ''
}

async function addKnowledgeTag() {
  if (!item.value) return
  if (!selectedKnowledgeTagId.value) return

  await linkTagToResearchItem(item.value.id, selectedKnowledgeTagId.value)
  await loadResearchItemTags()

  selectedKnowledgeTagId.value = ''
}

async function createAndAttachKnowledgeTagFromModal(tagPayload) {
  if (!item.value) return

  const newTag = await createKnowledgeTag(tagPayload)

  if (!newTag) return

  await linkTagToResearchItem(item.value.id, newTag.id)
  await loadResearchItemTags()

  isKnowledgeTagModalOpen.value = false
}

async function removeKnowledgeTag(tagId) {
  if (!item.value) return

  await unlinkTagFromResearchItem(item.value.id, tagId)
  await loadResearchItemTags()
}

function formatPeople(people = []) {
  if (!people.length) return '—'

  return people
    .map((person) => {
      const parts = [
        person.firstName,
        person.initial,
        person.lastName
      ].filter(Boolean)

      return parts.join(' ')
    })
    .join(', ')
}

function getStatusLabel(statusId = 'inbox') {
  const status = getResearchStatusById(statusId || 'inbox')
  return status ? `${status.icon} ${status.name}` : '📥 Inbox'
}

function getItemIcon(researchItem) {
  const type = getResearchTypeById(researchItem.type)
  return type?.icon || '📄'
}

function getTypeName(researchItem) {
  const type = getResearchTypeById(researchItem.type)
  return type?.name || 'Research Item'
}
</script>

<style scoped>
.notion-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.5rem 2rem 8rem;
  background: transparent;
  color: var(--text-primary);
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.breadcrumb {
  font-size: 0.85rem;
  color: var(--text-muted);
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
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
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
  color: var(--text-primary);
  border-color: var(--accent);
}

.save-btn {
  border: none;
  background: var(--accent);
  color: white;
  padding: 0.55rem 0.8rem;
}

.error-box {
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.page-banner {
  height: 210px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.16),
    rgba(168, 85, 247, 0.14)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: -2.5rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  gap: 1.2rem;
  margin-bottom: 2rem;
  padding-left: 1rem;
}

.cover-shell {
  min-width: 112px;
  min-height: 148px;
  display: flex;
  align-items: flex-end;
}

.cover-image {
  width: 112px;
  height: 148px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-icon {
  width: 88px;
  height: 88px;
  border-radius: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: grid;
  place-items: center;
  font-size: 2.4rem;
  box-shadow: var(--shadow);
}

.page-header h1 {
  font-size: 2.35rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin: 0;
}

.summary-line {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
  font-size: 1rem;
}

.edit-panel {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  margin: 1.5rem 0 2rem;
  background: var(--bg-card);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.edit-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.media-editor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.media-card {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  border-radius: 14px;
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
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  margin: 0.55rem 0 0.75rem;
  overflow: hidden;
}

.cover-preview {
  min-height: 190px;
}

.cover-preview img {
  width: 120px;
  height: 168px;
  object-fit: cover;
  border-radius: 8px;
}

.banner-preview {
  min-height: 140px;
  background-size: cover;
  background-position: center 50%;
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
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
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
  grid-template-columns: 1fr 90px 1fr 36px;
  gap: 0.5rem;
  align-items: center;
}

.remove-btn {
  height: 38px;
  padding: 0;
}

.small-btn {
  align-self: flex-start;
}

.properties-list {
  margin: 1.5rem 0 3rem;
  max-width: 820px;
}

.property-row {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 1.25rem;
  align-items: center;
  padding: 0.65rem 0;
}

.property-row span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.property-row strong {
  font-weight: 500;
  color: var(--text-primary);
}

.citation-section {
  margin: 2.5rem 0;
}

.citation-section h2,
.notes-section h2 {
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.citation-block {
  margin: 0 0 0.7rem;
  padding: 0.2rem 0 0.2rem 1rem;
  border-left: 4px solid var(--border-color);
  color: var(--text-primary);
  line-height: 1.7;
}

.page-divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 3rem 0;
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
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 600;
}

.connections-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 1.25rem;
}

.connections-grid h3 {
  font-size: 0.95rem;
  margin: 0 0 0.75rem;
}

.connections-grid select {
  width: 100%;
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.65rem;
}

.connect-btn {
  margin-top: 0.75rem;
  width: 100%;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  padding: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary-connect-btn {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.connection-link {
  display: block;
  color: var(--text-secondary);
  text-decoration: none;
  margin: 0.45rem 0;
}

.connection-link:hover {
  color: var(--text-primary);
}

.tag-list {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.tag-pill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
}

.tag-remove-btn {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.tag-remove-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent);
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
  text-decoration: none;
  font-weight: 600;
}

.inline-tag-link:hover,
.tag-pill-link:hover {
  text-decoration: underline;
}
</style>