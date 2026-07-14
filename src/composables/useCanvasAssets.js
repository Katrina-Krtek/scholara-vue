import {
  computed,
  ref,
  watch,
} from 'vue'

import { supabase } from '../lib/supabaseClient'

const BUCKET_NAME = 'canvas-assets'

const STORAGE_KEY =
  'scholarory-canvas-assets-v1'

const MAX_FILE_SIZE =
  50 * 1024 * 1024

const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
]

const MIME_TYPE_BY_EXTENSION = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
}

function createId(prefix = 'asset') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function createTimestamp() {
  return new Date().toISOString()
}

function cloneValue(value) {
  if (value === undefined) {
    return undefined
  }

  return JSON.parse(
    JSON.stringify(value),
  )
}

function getFileExtension(fileName = '') {
  const parts = String(fileName)
    .toLowerCase()
    .split('.')

  if (parts.length < 2) {
    return ''
  }

  return parts.pop()
}

function resolveMimeType(file) {
  if (
    file?.type &&
    SUPPORTED_MIME_TYPES.includes(
      file.type,
    )
  ) {
    return file.type
  }

  const extension =
    getFileExtension(file?.name)

  return (
    MIME_TYPE_BY_EXTENSION[
      extension
    ] || ''
  )
}

function resolveAssetType(mimeType) {
  if (mimeType === 'application/pdf') {
    return 'pdf'
  }

  if (mimeType === 'image/gif') {
    return 'gif'
  }

  if (mimeType.startsWith('image/')) {
    return 'image'
  }

  return 'file'
}

function sanitizeFileName(
  fileName = 'file',
) {
  const normalizedName = String(fileName)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .slice(0, 140)

  return normalizedName || 'file'
}

function sanitizePathSegment(
  value,
  fallback = 'general',
) {
  const sanitized = String(
    value || fallback,
  )
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)

  return sanitized || fallback
}

function normalizeAsset(asset = {}) {
  const now = createTimestamp()

  return {
    id:
      asset.id ||
      createId('asset'),

    ownerId:
      asset.ownerId || null,

    canvasId:
      asset.canvasId || null,

    assetType:
      asset.assetType || 'file',

    title:
      asset.title ||
      asset.fileName ||
      'Uploaded File',

    fileName:
      asset.fileName ||
      'uploaded-file',

    mimeType:
      asset.mimeType ||
      'application/octet-stream',

    size:
      Number(asset.size) || 0,

    storagePath:
      asset.storagePath || '',

    bucketName:
      asset.bucketName ||
      BUCKET_NAME,

    width:
      Number(asset.width) || null,

    height:
      Number(asset.height) || null,

    pageCount:
      Number(asset.pageCount) || null,

    createdAt:
      asset.createdAt || now,

    updatedAt:
      asset.updatedAt || now,

    metadata: {
      ...cloneValue(
        asset.metadata || {},
      ),
    },
  }
}

function loadAssets() {
  try {
    const savedAssets =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (!savedAssets) {
      return []
    }

    const parsedAssets =
      JSON.parse(savedAssets)

    if (!Array.isArray(parsedAssets)) {
      return []
    }

    return parsedAssets.map(
      normalizeAsset,
    )
  } catch (error) {
    console.error(
      'Unable to load Canvas assets:',
      error,
    )

    return []
  }
}

function validateFile(file) {
  if (!(file instanceof File)) {
    return {
      valid: false,
      error:
        'Please select a valid file.',
    }
  }

  const mimeType =
    resolveMimeType(file)

  if (
    !mimeType ||
    !SUPPORTED_MIME_TYPES.includes(
      mimeType,
    )
  ) {
    return {
      valid: false,
      error:
        'This file type is not supported. Upload a PNG, JPG, JPEG, GIF, WebP, or PDF.',
    }
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error:
        'The selected file is empty.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error:
        'The selected file is larger than the 50 MB limit.',
    }
  }

  return {
    valid: true,
    error: null,
    mimeType,
    assetType:
      resolveAssetType(mimeType),
  }
}

function normalizeUploadFile(
  file,
  mimeType,
) {
  if (file.type === mimeType) {
    return file
  }

  return new File(
    [file],
    file.name,
    {
      type: mimeType,
      lastModified:
        file.lastModified,
    },
  )
}

function readImageDimensions(file) {
  return new Promise((resolve) => {
    const mimeType =
      resolveMimeType(file)

    if (
      !mimeType.startsWith('image/')
    ) {
      resolve({
        width: null,
        height: null,
      })

      return
    }

    const objectUrl =
      URL.createObjectURL(file)

    const image = new Image()

    image.onload = () => {
      const dimensions = {
        width:
          Number(
            image.naturalWidth,
          ) || null,

        height:
          Number(
            image.naturalHeight,
          ) || null,
      }

      URL.revokeObjectURL(
        objectUrl,
      )

      resolve(dimensions)
    }

    image.onerror = () => {
      URL.revokeObjectURL(
        objectUrl,
      )

      resolve({
        width: null,
        height: null,
      })
    }

    image.src = objectUrl
  })
}

const assets = ref(loadAssets())

watch(
  assets,
  (updatedAssets) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          updatedAssets,
        ),
      )
    } catch (error) {
      console.error(
        'Unable to save Canvas asset metadata:',
        error,
      )
    }
  },
  {
    deep: true,
  },
)

export function useCanvasAssets() {
  const sortedAssets = computed(() =>
    [...assets.value].sort(
      (firstAsset, secondAsset) =>
        new Date(
          secondAsset.updatedAt,
        ).getTime() -
        new Date(
          firstAsset.updatedAt,
        ).getTime(),
    ),
  )

  const imageAssets = computed(() =>
    sortedAssets.value.filter(
      (asset) =>
        asset.assetType ===
          'image' ||
        asset.assetType === 'gif',
    ),
  )

  const pdfAssets = computed(() =>
    sortedAssets.value.filter(
      (asset) =>
        asset.assetType === 'pdf',
    ),
  )

  function getAssetById(assetId) {
    return (
      assets.value.find(
        (asset) =>
          asset.id === assetId,
      ) || null
    )
  }

  function getAssetsForCanvas(
    canvasId,
  ) {
    return sortedAssets.value.filter(
      (asset) =>
        asset.canvasId === canvasId,
    )
  }

  async function getCurrentUser() {
    const {
      data,
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw new Error(
        error.message ||
          'Unable to verify the signed-in user.',
      )
    }

    if (!data?.user) {
      throw new Error(
        'You must be signed in before uploading Canvas files.',
      )
    }

    return data.user
  }

  async function uploadAsset(
    file,
    options = {},
  ) {
    const validation =
      validateFile(file)

    if (!validation.valid) {
      throw new Error(
        validation.error,
      )
    }

    const user =
      await getCurrentUser()

    const assetId =
      createId('asset')

    const canvasFolder =
      sanitizePathSegment(
        options.canvasId,
        'library',
      )

    const safeFileName =
      sanitizeFileName(
        file.name,
      )

    const storagePath = [
      user.id,
      canvasFolder,
      `${assetId}-${safeFileName}`,
    ].join('/')

    const normalizedFile =
      normalizeUploadFile(
        file,
        validation.mimeType,
      )

    const dimensions =
      await readImageDimensions(
        normalizedFile,
      )

    const {
      data,
      error,
    } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(
        storagePath,
        normalizedFile,
        {
          cacheControl: '3600',
          upsert: false,
          contentType:
            validation.mimeType,
        },
      )

    if (error) {
      throw new Error(
        error.message ||
          'The file could not be uploaded.',
      )
    }

    const now =
      createTimestamp()

    const asset =
      normalizeAsset({
        id: assetId,

        ownerId: user.id,

        canvasId:
          options.canvasId || null,

        assetType:
          validation.assetType,

        title:
          options.title ||
          file.name
            .replace(
              /\.[^.]+$/,
              '',
            )
            .trim() ||
          'Uploaded File',

        fileName:
          file.name,

        mimeType:
          validation.mimeType,

        size:
          file.size,

        storagePath:
          data?.path ||
          storagePath,

        bucketName:
          BUCKET_NAME,

        width:
          dimensions.width,

        height:
          dimensions.height,

        pageCount: null,

        createdAt: now,
        updatedAt: now,

        metadata: {
          originalFileName:
            file.name,

          lastModified:
            file.lastModified,

          uploadedFrom:
            options.uploadedFrom ||
            'canvas',

          ...cloneValue(
            options.metadata || {},
          ),
        },
      })

    assets.value.unshift(asset)

    return asset
  }

  async function createSignedUrl(
    assetOrId,
    expiresIn = 3600,
  ) {
    const asset =
      typeof assetOrId === 'string'
        ? getAssetById(assetOrId)
        : assetOrId

    if (
      !asset ||
      !asset.storagePath
    ) {
      throw new Error(
        'The requested Canvas asset could not be found.',
      )
    }

    const {
      data,
      error,
    } = await supabase.storage
      .from(
        asset.bucketName ||
          BUCKET_NAME,
      )
      .createSignedUrl(
        asset.storagePath,
        expiresIn,
      )

    if (error) {
      throw new Error(
        error.message ||
          'A temporary file URL could not be created.',
      )
    }

    if (!data?.signedUrl) {
      throw new Error(
        'Supabase did not return a signed file URL.',
      )
    }

    return data.signedUrl
  }

  async function downloadAsset(
    assetOrId,
  ) {
    const asset =
      typeof assetOrId === 'string'
        ? getAssetById(assetOrId)
        : assetOrId

    if (
      !asset ||
      !asset.storagePath
    ) {
      throw new Error(
        'The requested Canvas asset could not be found.',
      )
    }

    const {
      data,
      error,
    } = await supabase.storage
      .from(
        asset.bucketName ||
          BUCKET_NAME,
      )
      .download(
        asset.storagePath,
      )

    if (error) {
      throw new Error(
        error.message ||
          'The file could not be downloaded.',
      )
    }

    const objectUrl =
      URL.createObjectURL(data)

    const downloadLink =
      document.createElement('a')

    downloadLink.href =
      objectUrl

    downloadLink.download =
      asset.fileName ||
      'canvas-file'

    document.body.appendChild(
      downloadLink,
    )

    downloadLink.click()
    downloadLink.remove()

    window.setTimeout(() => {
      URL.revokeObjectURL(
        objectUrl,
      )
    }, 1000)

    return true
  }

  async function deleteAsset(
    assetId,
  ) {
    const asset =
      getAssetById(assetId)

    if (!asset) {
      return false
    }

    if (asset.storagePath) {
      const {
        error,
      } = await supabase.storage
        .from(
          asset.bucketName ||
            BUCKET_NAME,
        )
        .remove([
          asset.storagePath,
        ])

      if (error) {
        throw new Error(
          error.message ||
            'The file could not be deleted.',
        )
      }
    }

    const assetIndex =
      assets.value.findIndex(
        (item) =>
          item.id === assetId,
      )

    if (assetIndex !== -1) {
      assets.value.splice(
        assetIndex,
        1,
      )
    }

    return true
  }

  function updateAsset(
    assetId,
    updates = {},
  ) {
    const asset =
      getAssetById(assetId)

    if (!asset) {
      return null
    }

    if (
      typeof updates.title ===
      'string'
    ) {
      asset.title =
        updates.title.trim() ||
        asset.fileName ||
        'Uploaded File'
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        'canvasId',
      )
    ) {
      asset.canvasId =
        updates.canvasId
    }

    if (
      updates.pageCount !==
      undefined
    ) {
      asset.pageCount =
        Number(
          updates.pageCount,
        ) || null
    }

    if (
      updates.metadata &&
      typeof updates.metadata ===
        'object'
    ) {
      asset.metadata = {
        ...asset.metadata,
        ...cloneValue(
          updates.metadata,
        ),
      }
    }

    asset.updatedAt =
      createTimestamp()

    return asset
  }

  function removeAssetRecord(
    assetId,
  ) {
    const assetIndex =
      assets.value.findIndex(
        (asset) =>
          asset.id === assetId,
      )

    if (assetIndex === -1) {
      return false
    }

    assets.value.splice(
      assetIndex,
      1,
    )

    return true
  }

  function searchAssets(
    searchTerm = '',
  ) {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase()

    if (!normalizedSearch) {
      return sortedAssets.value
    }

    return sortedAssets.value.filter(
      (asset) => {
        const searchableText = [
          asset.title,
          asset.fileName,
          asset.mimeType,
          asset.assetType,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(
          normalizedSearch,
        )
      },
    )
  }

  function formatFileSize(
    sizeInBytes = 0,
  ) {
    const size =
      Number(sizeInBytes) || 0

    if (size < 1024) {
      return `${size} B`
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  return {
    assets,
    sortedAssets,
    imageAssets,
    pdfAssets,

    getAssetById,
    getAssetsForCanvas,
    uploadAsset,
    createSignedUrl,
    downloadAsset,
    deleteAsset,
    updateAsset,
    removeAssetRecord,
    searchAssets,

    validateFile,
    resolveMimeType,
    resolveAssetType,
    formatFileSize,

    bucketName: BUCKET_NAME,
    maximumFileSize:
      MAX_FILE_SIZE,
    supportedMimeTypes:
      SUPPORTED_MIME_TYPES,
  }
}