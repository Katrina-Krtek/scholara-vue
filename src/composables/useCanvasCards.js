import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory-canvas-cards-v1'

function createId(prefix = 'card') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

function createTimestamp() {
  return new Date().toISOString()
}

function createDefaultCardData(cardData = {}) {
  const now = createTimestamp()

  return {
    id: cardData.id || createId('card'),

    type: cardData.type || 'note',

    title:
      typeof cardData.title === 'string' &&
      cardData.title.trim()
        ? cardData.title.trim()
        : 'Untitled Card',

    content:
      typeof cardData.content === 'string'
        ? cardData.content
        : '',

    tags: Array.isArray(cardData.tags)
      ? [...cardData.tags]
      : [],

    color: cardData.color || 'default',

    createdAt: cardData.createdAt || now,
    updatedAt: cardData.updatedAt || now,

    sourceType: cardData.sourceType || null,
    sourceId: cardData.sourceId || null,

    assetId: cardData.assetId || null,

    metadata: {
      author: cardData.metadata?.author || '',
      pageNumber:
        cardData.metadata?.pageNumber ?? null,
      quotation: cardData.metadata?.quotation || '',
      citation: cardData.metadata?.citation || '',
      url: cardData.metadata?.url || '',
      ...cardData.metadata,
    },

    drawing: {
      strokes: Array.isArray(
        cardData.drawing?.strokes,
      )
        ? cloneValue(cardData.drawing.strokes)
        : [],

      background:
        cardData.drawing?.background || 'plain',

      width:
        Number(cardData.drawing?.width) || 900,

      height:
        Number(cardData.drawing?.height) || 600,

      ...cardData.drawing,
    },
  }
}

function loadCards() {
  try {
    const savedCards =
      localStorage.getItem(STORAGE_KEY)

    if (!savedCards) {
      return []
    }

    const parsedCards = JSON.parse(savedCards)

    if (!Array.isArray(parsedCards)) {
      return []
    }

    return parsedCards.map((card) =>
      createDefaultCardData(card),
    )
  } catch (error) {
    console.error(
      'Unable to load canvas cards:',
      error,
    )

    return []
  }
}

const cards = ref(loadCards())

watch(
  cards,
  (updatedCards) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCards),
      )
    } catch (error) {
      console.error(
        'Unable to save canvas cards:',
        error,
      )
    }
  },
  {
    deep: true,
  },
)

export function useCanvasCards() {
  const sortedCards = computed(() =>
    [...cards.value].sort(
      (firstCard, secondCard) =>
        new Date(secondCard.updatedAt).getTime() -
        new Date(firstCard.updatedAt).getTime(),
    ),
  )

  const textCards = computed(() =>
    sortedCards.value.filter((card) =>
      [
        'note',
        'idea',
        'question',
        'quote',
        'concept',
      ].includes(card.type),
    ),
  )

  const mediaCards = computed(() =>
    sortedCards.value.filter((card) =>
      [
        'image',
        'gif',
        'pdf',
        'audio',
        'video',
        'drawing',
      ].includes(card.type),
    ),
  )

  const linkedCards = computed(() =>
    sortedCards.value.filter(
      (card) =>
        Boolean(card.sourceType) &&
        Boolean(card.sourceId),
    ),
  )

  function getCardById(cardId) {
    return (
      cards.value.find(
        (card) => card.id === cardId,
      ) || null
    )
  }

  function createCard(cardData = {}) {
    const newCard =
      createDefaultCardData(cardData)

    cards.value.unshift(newCard)

    return newCard
  }

  function createTextCard(
    cardType = 'note',
    cardData = {},
  ) {
    return createCard({
      ...cardData,
      type: cardType,
    })
  }

  function createLinkedCard({
    sourceType,
    sourceId,
    title,
    content = '',
    metadata = {},
    cardType = 'linked-record',
  }) {
    if (!sourceType || !sourceId) {
      return null
    }

    const existingCard =
      cards.value.find(
        (card) =>
          card.sourceType === sourceType &&
          card.sourceId === sourceId,
      )

    if (existingCard) {
      return existingCard
    }

    return createCard({
      type: cardType,
      title:
        title ||
        `${sourceType} ${sourceId}`,
      content,
      sourceType,
      sourceId,
      metadata,
    })
  }

  function createAssetCard({
    assetId,
    assetType,
    title,
    metadata = {},
  }) {
    if (!assetId) {
      return null
    }

    return createCard({
      type: assetType || 'file',
      title:
        title ||
        metadata.fileName ||
        'Uploaded File',
      assetId,
      metadata,
    })
  }

  function createDrawingCard(cardData = {}) {
    return createCard({
      ...cardData,
      type: 'drawing',
      title:
        cardData.title ||
        'Handwritten Note',
      drawing: {
        strokes: [],
        background: 'plain',
        width: 900,
        height: 600,
        ...cardData.drawing,
      },
    })
  }

  function updateCard(cardId, updates = {}) {
    const card = getCardById(cardId)

    if (!card) {
      return null
    }

    if (
      typeof updates.title === 'string'
    ) {
      card.title =
        updates.title.trim() ||
        'Untitled Card'
    }

    if (
      typeof updates.content === 'string'
    ) {
      card.content = updates.content
    }

    if (
      typeof updates.type === 'string'
    ) {
      card.type = updates.type
    }

    if (
      typeof updates.color === 'string'
    ) {
      card.color = updates.color
    }

    if (Array.isArray(updates.tags)) {
      card.tags = [...updates.tags]
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        'assetId',
      )
    ) {
      card.assetId = updates.assetId
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        'sourceType',
      )
    ) {
      card.sourceType =
        updates.sourceType
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        'sourceId',
      )
    ) {
      card.sourceId = updates.sourceId
    }

    if (
      updates.metadata &&
      typeof updates.metadata === 'object'
    ) {
      card.metadata = {
        ...card.metadata,
        ...cloneValue(updates.metadata),
      }
    }

    if (
      updates.drawing &&
      typeof updates.drawing === 'object'
    ) {
      card.drawing = {
        ...card.drawing,
        ...cloneValue(updates.drawing),
      }
    }

    card.updatedAt = createTimestamp()

    return card
  }

  function updateDrawingStrokes(
    cardId,
    strokes,
  ) {
    const card = getCardById(cardId)

    if (
      !card ||
      card.type !== 'drawing' ||
      !Array.isArray(strokes)
    ) {
      return null
    }

    card.drawing = {
      ...card.drawing,
      strokes: cloneValue(strokes),
    }

    card.updatedAt = createTimestamp()

    return card
  }

  function duplicateCard(cardId) {
    const sourceCard = getCardById(cardId)

    if (!sourceCard) {
      return null
    }

    const duplicatedCard =
      createDefaultCardData({
        ...cloneValue(sourceCard),
        id: createId('card'),
        title: `${sourceCard.title} Copy`,
        createdAt: createTimestamp(),
        updatedAt: createTimestamp(),
      })

    cards.value.unshift(duplicatedCard)

    return duplicatedCard
  }

  function deleteCard(cardId) {
    const cardIndex =
      cards.value.findIndex(
        (card) => card.id === cardId,
      )

    if (cardIndex === -1) {
      return false
    }

    cards.value.splice(cardIndex, 1)

    return true
  }

  function cardIsUsed(cardId) {
    try {
      const savedCanvases =
        localStorage.getItem(
          'scholarory-canvases-v2',
        ) ||
        localStorage.getItem(
          'scholarory-canvases-v1',
        )

      if (!savedCanvases) {
        return false
      }

      const parsedCanvases =
        JSON.parse(savedCanvases)

      if (!Array.isArray(parsedCanvases)) {
        return false
      }

      return parsedCanvases.some(
        (canvas) =>
          Array.isArray(
            canvas.placements,
          ) &&
          canvas.placements.some(
            (placement) =>
              placement.cardId === cardId,
          ),
      )
    } catch (error) {
      console.error(
        'Unable to check card usage:',
        error,
      )

      return false
    }
  }

  function searchCards(searchTerm = '') {
    const normalizedSearch =
      searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return sortedCards.value
    }

    return sortedCards.value.filter(
      (card) => {
        const searchableText = [
          card.title,
          card.content,
          card.type,
          card.sourceType,
          card.metadata?.author,
          card.metadata?.quotation,
          card.metadata?.citation,
          ...(card.tags || []),
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

  function importLegacyCard(
    legacyNode = {},
  ) {
    const existingLegacyId =
      legacyNode.data?.libraryCardId ||
      legacyNode.data?.cardId

    if (existingLegacyId) {
      const existingCard =
        getCardById(existingLegacyId)

      if (existingCard) {
        return existingCard
      }
    }

    const cardType =
      legacyNode.data?.cardType ||
      legacyNode.data?.type ||
      'note'

    return createCard({
      id:
        legacyNode.data?.libraryCardId ||
        legacyNode.data?.cardId ||
        undefined,

      type: cardType,

      title:
        legacyNode.data?.title ||
        'Untitled Card',

      content:
        legacyNode.data?.content || '',

      color:
        legacyNode.data?.color ||
        'default',

      sourceType:
        legacyNode.data
          ?.linkedEntityType ||
        null,

      sourceId:
        legacyNode.data
          ?.linkedEntityId ||
        null,

      assetId:
        legacyNode.data?.assetId ||
        null,

      metadata:
        legacyNode.data?.metadata || {},

      drawing:
        legacyNode.data?.drawing || {},
    })
  }

  return {
    cards,
    sortedCards,
    textCards,
    mediaCards,
    linkedCards,

    getCardById,
    createCard,
    createTextCard,
    createLinkedCard,
    createAssetCard,
    createDrawingCard,
    updateCard,
    updateDrawingStrokes,
    duplicateCard,
    deleteCard,
    cardIsUsed,
    searchCards,
    importLegacyCard,
  }
}