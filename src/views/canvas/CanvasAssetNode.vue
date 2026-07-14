<template>
  <article
    class="asset-node"
    :class="[
      `asset-node--${localColor}`,
      {
        'asset-node--selected': selected,
        'asset-node--missing': !libraryCard,
      },
    ]"
  >
    <NodeResizer
      :is-visible="selected"
      :min-width="260"
      :min-height="240"
      :max-width="1200"
      :max-height="1200"
      color="#375d95"
    />

    <Handle
      id="target-left"
      type="target"
      :position="Position.Left"
      class="canvas-handle canvas-handle--left"
    />

    <Handle
      id="source-right"
      type="source"
      :position="Position.Right"
      class="canvas-handle canvas-handle--right"
    />

    <header class="asset-header">
      <div class="asset-heading">
        <span
          class="asset-icon"
          aria-hidden="true"
        >
          {{ assetIcon }}
        </span>

        <div class="asset-heading-text">
          <span class="asset-type">
            {{ assetLabel }}
          </span>

          <span
            v-if="libraryCard"
            class="library-label"
          >
            Shared card
          </span>
        </div>
      </div>

      <div class="asset-actions nodrag nopan">
        <button
          class="header-action"
          type="button"
          :title="`Card color: ${localColor}`"
          aria-label="Change card color"
          @click.stop="cycleColor"
        >
          <span class="color-dot"></span>
        </button>

        <button
          class="header-action header-action--delete"
          type="button"
          title="Remove file from this canvas"
          aria-label="Remove file from this canvas"
          @click.stop="requestDelete"
        >
          ×
        </button>
      </div>
    </header>

    <div
      v-if="libraryCard"
      class="asset-body"
    >
      <input
        v-model="localTitle"
        class="asset-title nodrag nopan"
        type="text"
        maxlength="160"
        placeholder="File title"
        aria-label="File title"
        @pointerdown.stop
        @input="saveTextChanges"
      />

      <section
        class="preview-area nodrag nopan"
        @pointerdown.stop
      >
        <div
          v-if="isLoadingPreview"
          class="preview-state"
        >
          <span
            class="preview-spinner"
            aria-hidden="true"
          ></span>

          <strong>Loading preview...</strong>
        </div>

        <div
          v-else-if="previewError"
          class="preview-state preview-state--error"
        >
          <span
            class="preview-state-icon"
            aria-hidden="true"
          >
            ⚠️
          </span>

          <strong>Preview unavailable</strong>

          <p>
            {{ previewError }}
          </p>

          <button
            type="button"
            class="preview-retry-button"
            @click="loadPreview"
          >
            Try Again
          </button>
        </div>

        <img
          v-else-if="
            isImageAsset &&
            previewUrl
          "
          class="asset-image"
          :src="previewUrl"
          :alt="previewAlt"
          draggable="false"
          @dblclick="openAsset"
        />

        <iframe
          v-else-if="
            isPdfAsset &&
            previewUrl
          "
          class="asset-pdf"
          :src="pdfPreviewUrl"
          :title="`${localTitle || 'PDF'} preview`"
        ></iframe>

        <div
          v-else-if="previewUrl"
          class="generic-file-preview"
        >
          <span
            class="generic-file-icon"
            aria-hidden="true"
          >
            {{ assetIcon }}
          </span>

          <strong>
            {{ fileName }}
          </strong>

          <p>
            Select Open to view this file.
          </p>
        </div>

        <div
          v-else
          class="preview-state"
        >
          <span
            class="preview-state-icon"
            aria-hidden="true"
          >
            📎
          </span>

          <strong>No preview available</strong>

          <p>
            The file record does not contain a usable storage path.
          </p>
        </div>
      </section>

      <textarea
        v-model="localCaption"
        class="asset-caption nodrag nopan"
        maxlength="5000"
        placeholder="Add a caption or notes about this file..."
        aria-label="File caption"
        @pointerdown.stop
        @input="saveTextChanges"
      ></textarea>
    </div>

    <div
      v-else
      class="missing-asset nodrag nopan"
      @pointerdown.stop
    >
      <strong>File card unavailable</strong>

      <p>
        This Canvas placement no longer has a matching Card Library
        record.
      </p>
    </div>

    <footer class="asset-footer nodrag nopan">
      <div class="file-information">
        <span class="file-name">
          {{ fileName }}
        </span>

        <span
          v-if="formattedFileSize"
          class="file-size"
        >
          {{ formattedFileSize }}
        </span>
      </div>

      <div class="footer-actions">
        <button
          type="button"
          :disabled="!previewUrl"
          @click="openAsset"
        >
          Open
        </button>

        <button
          type="button"
          :disabled="
            !assetStoragePath &&
            !previewUrl
          "
          @click="downloadAssetFile"
        >
          Download
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  Handle,
  Position,
} from '@vue-flow/core'

import {
  NodeResizer,
} from '@vue-flow/node-resizer'

import '@vue-flow/node-resizer/dist/style.css'

import {
  useCanvasCards,
} from '../../composables/useCanvasCards.js'

import {
  useCanvasAssets,
} from '../../composables/useCanvasAssets.js'

import {
  supabase,
} from '../../lib/supabaseClient'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },

  data: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update',
  'delete',
])

const BUCKET_NAME = 'canvas-assets'
const ASSET_STORAGE_KEY =
  'scholarory-canvas-assets-v1'

const SIGNED_URL_DURATION = 60 * 60
const SIGNED_URL_REFRESH_TIME =
  45 * 60 * 1000

const {
  getCardById,
  updateCard: updateLibraryCard,
} = useCanvasCards()

const assetStore = useCanvasAssets()

const availableColors = [
  'default',
  'gold',
  'blue',
  'green',
  'purple',
  'rose',
]

const previewUrl = ref('')
const previewError = ref('')
const isLoadingPreview = ref(false)
const previewLoadedAt = ref(0)

const cardId = computed(() =>
  props.data.cardId ||
  props.data.libraryCardId ||
  null,
)

const libraryCard = computed(() => {
  if (!cardId.value) {
    return null
  }

  return getCardById(
    cardId.value,
  )
})

const assetId = computed(() =>
  libraryCard.value?.assetId ||
  props.data.assetId ||
  null,
)

const storedAsset = computed(() =>
  findStoredAsset(
    assetId.value,
  ),
)

const combinedMetadata = computed(() => ({
  ...(
    props.data.metadata ||
    {}
  ),

  ...(
    libraryCard.value
      ?.metadata ||
    {}
  ),

  ...(
    storedAsset.value ||
    {}
  ),
}))

const resolvedAssetType = computed(() => {
  const explicitType =
    libraryCard.value?.type ||
    props.data.cardType ||
    storedAsset.value
      ?.assetType ||
    ''

  if (explicitType) {
    return String(
      explicitType,
    ).toLowerCase()
  }

  const mimeType =
    String(
      combinedMetadata.value
        .mimeType ||
      '',
    ).toLowerCase()

  if (
    mimeType ===
    'application/pdf'
  ) {
    return 'pdf'
  }

  if (
    mimeType ===
    'image/gif'
  ) {
    return 'gif'
  }

  if (
    mimeType.startsWith(
      'image/',
    )
  ) {
    return 'image'
  }

  if (
    mimeType.startsWith(
      'audio/',
    )
  ) {
    return 'audio'
  }

  if (
    mimeType.startsWith(
      'video/',
    )
  ) {
    return 'video'
  }

  return 'file'
})

const isImageAsset = computed(() =>
  [
    'image',
    'gif',
  ].includes(
    resolvedAssetType.value,
  ),
)

const isPdfAsset = computed(() =>
  resolvedAssetType.value ===
  'pdf',
)

const assetStoragePath = computed(() =>
  combinedMetadata.value
    .storagePath ||
  '',
)

const fileName = computed(() =>
  combinedMetadata.value
    .fileName ||
  combinedMetadata.value
    .name ||
  libraryCard.value?.title ||
  'Attached file',
)

const fileSize = computed(() =>
  Number(
    combinedMetadata.value
      .size ||
    combinedMetadata.value
      .sizeBytes ||
    0,
  ),
)

const formattedFileSize = computed(() =>
  formatFileSize(
    fileSize.value,
  ),
)

const localTitle = ref(
  libraryCard.value?.title ||
  props.data.title ||
  '',
)

const localCaption = ref(
  libraryCard.value?.content ||
  props.data.content ||
  '',
)

const localColor = ref(
  props.data.color ||
  libraryCard.value?.color ||
  'default',
)

const assetLabel = computed(() => {
  const labels = {
    image: 'Image',
    gif: 'Animated GIF',
    pdf: 'PDF Document',
    audio: 'Audio',
    video: 'Video',
    file: 'File',
  }

  return (
    labels[
      resolvedAssetType.value
    ] ||
    'File'
  )
})

const assetIcon = computed(() => {
  const icons = {
    image: '🖼️',
    gif: '🎞️',
    pdf: '📑',
    audio: '🎧',
    video: '🎥',
    file: '📎',
  }

  return (
    icons[
      resolvedAssetType.value
    ] ||
    '📎'
  )
})

const previewAlt = computed(() =>
  localTitle.value ||
  fileName.value ||
  'Canvas image',
)

const pdfPreviewUrl = computed(() => {
  if (!previewUrl.value) {
    return ''
  }

  return `${previewUrl.value}#toolbar=0&navpanes=0&view=FitH`
})

watch(
  libraryCard,
  (updatedCard) => {
    if (!updatedCard) {
      return
    }

    if (
      updatedCard.title !==
      localTitle.value
    ) {
      localTitle.value =
        updatedCard.title ||
        ''
    }

    if (
      updatedCard.content !==
      localCaption.value
    ) {
      localCaption.value =
        updatedCard.content ||
        ''
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => props.data.color,
  (updatedColor) => {
    localColor.value =
      updatedColor ||
      libraryCard.value?.color ||
      'default'
  },
)

watch(
  [
    assetId,
    assetStoragePath,
  ],
  () => {
    loadPreview()
  },
  {
    immediate: true,
  },
)

function findStoredAsset(
  requestedAssetId,
) {
  if (!requestedAssetId) {
    return null
  }

  const possibleLookupMethods = [
    'getAssetById',
    'findAssetById',
  ]

  for (
    const methodName
    of possibleLookupMethods
  ) {
    const lookupMethod =
      assetStore?.[methodName]

    if (
      typeof lookupMethod ===
      'function'
    ) {
      try {
        const result =
          lookupMethod(
            requestedAssetId,
          )

        if (result) {
          return result
        }
      } catch (error) {
        console.warn(
          `Canvas asset lookup using ${methodName} failed.`,
          error,
        )
      }
    }
  }

  const possibleAssets =
    assetStore?.assets?.value ||
    assetStore?.assets ||
    []

  if (
    Array.isArray(
      possibleAssets,
    )
  ) {
    const matchedAsset =
      possibleAssets.find(
        (asset) =>
          asset.id ===
          requestedAssetId,
      )

    if (matchedAsset) {
      return matchedAsset
    }
  }

  try {
    const savedAssets =
      JSON.parse(
        window.localStorage.getItem(
          ASSET_STORAGE_KEY,
        ) || '[]',
      )

    if (
      Array.isArray(
        savedAssets,
      )
    ) {
      return (
        savedAssets.find(
          (asset) =>
            asset.id ===
            requestedAssetId,
        ) || null
      )
    }
  } catch (error) {
    console.warn(
      'Canvas asset metadata could not be read.',
      error,
    )
  }

  return null
}

async function loadPreview() {
  previewError.value = ''
  previewUrl.value = ''

  const storagePath =
    assetStoragePath.value

  if (!storagePath) {
    previewError.value =
      'The file does not have a storage path.'

    return
  }

  isLoadingPreview.value = true

  try {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(
          storagePath,
          SIGNED_URL_DURATION,
        )

    if (error) {
      throw error
    }

    if (!data?.signedUrl) {
      throw new Error(
        'Supabase did not return a preview address.',
      )
    }

    previewUrl.value =
      data.signedUrl

    previewLoadedAt.value =
      Date.now()
  } catch (error) {
    console.error(
      'Unable to create Canvas asset preview:',
      error,
    )

    previewError.value =
      error?.message ||
      'The private file preview could not be loaded.'
  } finally {
    isLoadingPreview.value = false
  }
}

function saveTextChanges() {
  if (!libraryCard.value) {
    return
  }

  const normalizedTitle =
    localTitle.value.trim() ||
    'Untitled File'

  updateLibraryCard(
    libraryCard.value.id,
    {
      title:
        normalizedTitle,

      content:
        localCaption.value,
    },
  )

  emit('update', {
    cardId: props.id,

    libraryCardId:
      libraryCard.value.id,

    updates: {
      cardId:
        libraryCard.value.id,

      libraryCardId:
        libraryCard.value.id,

      title:
        normalizedTitle,

      content:
        localCaption.value,

      cardType:
        resolvedAssetType.value,

      assetId:
        assetId.value,

      metadata: {
        ...combinedMetadata.value,
      },

      color:
        localColor.value,
    },
  })
}

function cycleColor() {
  const currentIndex =
    availableColors.indexOf(
      localColor.value,
    )

  const nextIndex =
    currentIndex === -1
      ? 0
      : (
          currentIndex + 1
        ) %
        availableColors.length

  localColor.value =
    availableColors[nextIndex]

  emit('update', {
    cardId: props.id,

    libraryCardId:
      libraryCard.value?.id ||
      cardId.value,

    updates: {
      color:
        localColor.value,
    },
  })
}

function requestDelete() {
  emit(
    'delete',
    props.id,
  )
}

function openAsset() {
  if (!previewUrl.value) {
    return
  }

  const openedWindow =
    window.open(
      previewUrl.value,
      '_blank',
      'noopener,noreferrer',
    )

  if (openedWindow) {
    openedWindow.opener = null
  }
}

async function downloadAssetFile() {
  const storagePath =
    assetStoragePath.value

  if (!storagePath) {
    downloadFromSignedUrl()
    return
  }

  try {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from(BUCKET_NAME)
        .download(
          storagePath,
        )

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error(
        'No file data was returned.',
      )
    }

    const objectUrl =
      URL.createObjectURL(
        data,
      )

    triggerDownload(
      objectUrl,
      fileName.value,
    )

    window.setTimeout(() => {
      URL.revokeObjectURL(
        objectUrl,
      )
    }, 1000)
  } catch (error) {
    console.error(
      'Unable to download Canvas asset:',
      error,
    )

    downloadFromSignedUrl()
  }
}

function downloadFromSignedUrl() {
  if (!previewUrl.value) {
    return
  }

  triggerDownload(
    previewUrl.value,
    fileName.value,
  )
}

function triggerDownload(
  url,
  downloadName,
) {
  const anchor =
    document.createElement('a')

  anchor.href = url
  anchor.download =
    downloadName ||
    'canvas-file'

  anchor.rel =
    'noopener noreferrer'

  document.body.appendChild(
    anchor,
  )

  anchor.click()
  anchor.remove()
}

function formatFileSize(
  value,
) {
  const bytes =
    Number(value)

  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return ''
  }

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
  ]

  let size = bytes
  let unitIndex = 0

  while (
    size >= 1024 &&
    unitIndex <
      units.length - 1
  ) {
    size /= 1024
    unitIndex += 1
  }

  const decimalPlaces =
    size >= 10 ||
    unitIndex === 0
      ? 0
      : 1

  return `${size.toFixed(
    decimalPlaces,
  )} ${units[unitIndex]}`
}

function handleVisibilityChange() {
  if (
    document.visibilityState !==
    'visible'
  ) {
    return
  }

  const previewAge =
    Date.now() -
    previewLoadedAt.value

  if (
    !previewUrl.value ||
    previewAge >=
      SIGNED_URL_REFRESH_TIME
  ) {
    loadPreview()
  }
}

onMounted(() => {
  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'visibilitychange',
    handleVisibilityChange,
  )
})
</script>

<style scoped>
.asset-node {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  flex-direction: column;
  overflow: visible;
  border: 1px solid #cbd3df;
  border-top: 5px solid #75839a;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 8px 22px rgba(15, 31, 54, 0.12),
    0 2px 5px rgba(15, 31, 54, 0.08);
  color: #17233a;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.asset-node:hover {
  box-shadow:
    0 12px 30px rgba(15, 31, 54, 0.16),
    0 3px 7px rgba(15, 31, 54, 0.1);
}

.asset-node--selected {
  border-color: #375d95;
  box-shadow:
    0 0 0 3px rgba(55, 93, 149, 0.2),
    0 12px 30px rgba(15, 31, 54, 0.16);
}

.asset-node--missing {
  border-color: #d79a9a;
  border-top-color: #b13b3b;
}

.asset-node--default {
  border-top-color: #75839a;
}

.asset-node--gold {
  border-top-color: #c69b2f;
}

.asset-node--blue {
  border-top-color: #3c78b5;
}

.asset-node--green {
  border-top-color: #4c8a66;
}

.asset-node--purple {
  border-top-color: #7657a5;
}

.asset-node--rose {
  border-top-color: #a95770;
}

.asset-header {
  display: flex;
  min-height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #e0e5ec;
  padding: 0.55rem 0.65rem 0.5rem 0.8rem;
  cursor: grab;
}

.asset-header:active {
  cursor: grabbing;
}

.asset-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.45rem;
}

.asset-icon {
  flex: 0 0 auto;
  font-size: 0.95rem;
}

.asset-heading-text {
  display: grid;
  min-width: 0;
  gap: 0.08rem;
}

.asset-type {
  overflow: hidden;
  color: #69768a;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.library-label {
  color: #8c96a5;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.asset-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.3rem;
}

.header-action {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #657187;
  cursor: pointer;
}

.header-action:hover {
  border-color: #d6dce5;
  background: #f1f4f8;
  color: #17233a;
}

.header-action--delete {
  font-size: 1.15rem;
  line-height: 1;
}

.header-action--delete:hover {
  border-color: #ebc8c8;
  background: #fff0f0;
  color: #b13b3b;
}

.color-dot {
  display: block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(23, 35, 58, 0.18);
  border-radius: 50%;
  background: #75839a;
}

.asset-node--gold .color-dot {
  background: #c69b2f;
}

.asset-node--blue .color-dot {
  background: #3c78b5;
}

.asset-node--green .color-dot {
  background: #4c8a66;
}

.asset-node--purple .color-dot {
  background: #7657a5;
}

.asset-node--rose .color-dot {
  background: #a95770;
}

.asset-body {
  display: grid;
  min-height: 0;
  flex: 1 1 auto;
  grid-template-rows:
    auto
    minmax(100px, 1fr)
    auto;
  gap: 0.55rem;
  padding: 0.7rem;
}

.asset-title,
.asset-caption {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #17233a;
  font: inherit;
  outline: none;
}

.asset-title {
  padding: 0.35rem 0.45rem;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.3;
}

.asset-caption {
  min-height: 54px;
  max-height: 110px;
  resize: vertical;
  padding: 0.45rem;
  color: #3f4b5e;
  font-size: 0.78rem;
  line-height: 1.45;
}

.asset-title::placeholder,
.asset-caption::placeholder {
  color: #98a2b2;
}

.asset-title:hover,
.asset-caption:hover {
  background: #f7f8fa;
}

.asset-title:focus,
.asset-caption:focus {
  border-color: #7a9ac5;
  background: #ffffff;
  box-shadow:
    0 0 0 3px
    rgba(55, 93, 149, 0.12);
}

.preview-area {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  place-items: center;
  border: 1px solid #dde3eb;
  border-radius: 10px;
  background:
    linear-gradient(
      45deg,
      #f6f7f9 25%,
      transparent 25%
    ),
    linear-gradient(
      -45deg,
      #f6f7f9 25%,
      transparent 25%
    ),
    linear-gradient(
      45deg,
      transparent 75%,
      #f6f7f9 75%
    ),
    linear-gradient(
      -45deg,
      transparent 75%,
      #f6f7f9 75%
    );
  background-color: #ffffff;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  background-size: 16px 16px;
}

.asset-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
  user-select: none;
}

.asset-pdf {
  width: 100%;
  height: 100%;
  min-height: 220px;
  border: 0;
  background: #ffffff;
}

.preview-state,
.generic-file-preview {
  display: grid;
  max-width: 320px;
  justify-items: center;
  gap: 0.45rem;
  padding: 1.2rem;
  color: #68758a;
  text-align: center;
}

.preview-state strong,
.generic-file-preview strong {
  color: #2f3d53;
  font-size: 0.86rem;
}

.preview-state p,
.generic-file-preview p {
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.45;
}

.preview-state--error strong {
  color: #a12f2f;
}

.preview-state-icon,
.generic-file-icon {
  font-size: 2rem;
}

.preview-spinner {
  width: 25px;
  height: 25px;
  border: 3px solid #dbe2ec;
  border-top-color: #375d95;
  border-radius: 50%;
  animation: preview-spin 0.8s linear infinite;
}

@keyframes preview-spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-retry-button {
  border: 1px solid #c8d2e0;
  border-radius: 7px;
  background: #ffffff;
  padding: 0.4rem 0.65rem;
  color: #375d95;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 750;
  cursor: pointer;
}

.preview-retry-button:hover {
  border-color: #375d95;
  background: #f0f5fb;
}

.missing-asset {
  flex: 1 1 auto;
  padding: 1rem;
}

.missing-asset strong {
  color: #a12f2f;
}

.missing-asset p {
  margin: 0.4rem 0 0;
  color: #69768a;
  font-size: 0.8rem;
  line-height: 1.45;
}

.asset-footer {
  display: flex;
  min-height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  border-top: 1px solid #e0e5ec;
  padding: 0.45rem 0.65rem;
}

.file-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.08rem;
}

.file-name {
  overflow: hidden;
  max-width: 190px;
  color: #68758a;
  font-size: 0.65rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #929baa;
  font-size: 0.6rem;
}

.footer-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.3rem;
}

.footer-actions button {
  border: 1px solid #d3dae4;
  border-radius: 7px;
  background: #ffffff;
  padding: 0.34rem 0.5rem;
  color: #536279;
  font: inherit;
  font-size: 0.65rem;
  font-weight: 750;
  cursor: pointer;
}

.footer-actions button:hover:not(:disabled) {
  border-color: #375d95;
  background: #f0f5fb;
  color: #375d95;
}

.footer-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.canvas-handle {
  width: 12px;
  height: 12px;
  border: 2px solid #ffffff;
  background: #375d95;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.asset-node:hover .canvas-handle,
.asset-node--selected .canvas-handle {
  opacity: 1;
}

.canvas-handle:hover {
  transform: scale(1.25);
}

.canvas-handle--left {
  left: -7px;
}

.canvas-handle--right {
  right: -7px;
}

:deep(.vue-flow__resize-control) {
  z-index: 30;
}

:deep(.vue-flow__resize-control.handle) {
  width: 10px;
  height: 10px;
  border: 2px solid #ffffff;
  border-radius: 3px;
  background: #375d95;
}

:deep(.vue-flow__resize-control.line) {
  border-color: #375d95;
}
</style>