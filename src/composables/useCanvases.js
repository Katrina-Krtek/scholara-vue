import { computed, ref, watch } from 'vue'
import { useCanvasCards } from './useCanvasCards'

const STORAGE_KEY = 'scholarory-canvases-v2'
const LEGACY_STORAGE_KEY = 'scholarory-canvases-v1'

const {
  getCardById,
  createTextCard,
  updateCard: updateLibraryCard,
  importLegacyCard,
} = useCanvasCards()

function createId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

function cloneValue(value) {
  if (value === undefined) {
    return undefined
  }

  return JSON.parse(JSON.stringify(value))
}

function createTimestamp() {
  return new Date().toISOString()
}

function normalizePosition(position = {}) {
  return {
    x: Number(position.x || 0),
    y: Number(position.y || 0),
  }
}

function normalizeViewport(viewport = {}) {
  return {
    x: Number(viewport.x || 0),
    y: Number(viewport.y || 0),
    zoom: Number(viewport.zoom || 1),
  }
}

function normalizePlacement(placement = {}) {
  return {
    id:
      placement.id ||
      createId('placement'),

    objectType:
      placement.objectType || 'card',

    cardId:
      placement.cardId || null,

    position: normalizePosition(
      placement.position,
    ),

    width:
      Number(placement.width) || 290,

    height:
      Number(placement.height) || 240,

    zIndex:
      Number(placement.zIndex) || 1,

    color:
      placement.color || 'default',

    collapsed:
      Boolean(placement.collapsed),

    locked:
      Boolean(placement.locked),

    rotation:
      Number(placement.rotation) || 0,

    parentSectionId:
      placement.parentSectionId || null,

    metadata: {
      ...cloneValue(
        placement.metadata || {},
      ),
    },
  }
}

function normalizeConnection(connection = {}) {
  return {
    id:
      connection.id ||
      createId('connection'),

    source:
      connection.source || '',

    target:
      connection.target || '',

    sourceHandle:
      connection.sourceHandle || null,

    targetHandle:
      connection.targetHandle || null,

    type:
      connection.type || 'smoothstep',

    label:
      connection.label || '',

    color:
      connection.color || '#64748b',

    width:
      Number(connection.width) || 2,

    animated:
      Boolean(connection.animated),

    markerStart:
      connection.markerStart || null,

    markerEnd:
      connection.markerEnd || null,

    metadata: {
      ...cloneValue(
        connection.metadata || {},
      ),
    },
  }
}

function placementToNode(placement) {
  const card = getCardById(
    placement.cardId,
  )

  return {
    id: placement.id,
    type: 'canvasCard',

    position: {
      ...placement.position,
    },

    width: placement.width,
    height: placement.height,

    zIndex: placement.zIndex,

    draggable: !placement.locked,

    data: {
      cardId: placement.cardId,
      libraryCardId: placement.cardId,

      cardType:
        card?.type || 'note',

      title:
        card?.title || 'Untitled Card',

      content:
        card?.content || '',

      color:
        placement.color ||
        card?.color ||
        'default',

      linkedEntityType:
        card?.sourceType || null,

      linkedEntityId:
        card?.sourceId || null,

      assetId:
        card?.assetId || null,

      metadata: cloneValue(
        card?.metadata || {},
      ),

      drawing: cloneValue(
        card?.drawing || {},
      ),

      collapsed:
        placement.collapsed,

      locked:
        placement.locked,

      rotation:
        placement.rotation,

      parentSectionId:
        placement.parentSectionId,
    },
  }
}

function connectionToEdge(connection) {
  return {
    id: connection.id,

    source: connection.source,
    target: connection.target,

    sourceHandle:
      connection.sourceHandle || null,

    targetHandle:
      connection.targetHandle || null,

    type:
      connection.type || 'smoothstep',

    label:
      connection.label || undefined,

    animated:
      Boolean(connection.animated),

    style: {
      stroke:
        connection.color || '#64748b',

      strokeWidth:
        Number(connection.width) || 2,
    },

    markerStart:
      connection.markerStart || undefined,

    markerEnd:
      connection.markerEnd || undefined,

    selectable: true,
    updatable: true,

    data: {
      metadata: cloneValue(
        connection.metadata || {},
      ),
    },
  }
}

function attachCompatibilityAccessors(
  canvas,
) {
  Object.defineProperty(
    canvas,
    'nodes',
    {
      configurable: true,
      enumerable: false,

      get() {
        return canvas.placements.map(
          placementToNode,
        )
      },
    },
  )

  Object.defineProperty(
    canvas,
    'edges',
    {
      configurable: true,
      enumerable: false,

      get() {
        return canvas.connections.map(
          connectionToEdge,
        )
      },
    },
  )

  return canvas
}

function normalizeCanvas(canvas = {}) {
  const now = createTimestamp()

  const normalizedCanvas = {
    id:
      canvas.id ||
      createId('canvas'),

    title:
      typeof canvas.title === 'string' &&
      canvas.title.trim()
        ? canvas.title.trim()
        : 'Untitled Canvas',

    description:
      typeof canvas.description ===
      'string'
        ? canvas.description
        : '',

    createdAt:
      canvas.createdAt || now,

    updatedAt:
      canvas.updatedAt || now,

    placements: Array.isArray(
      canvas.placements,
    )
      ? canvas.placements.map(
          normalizePlacement,
        )
      : [],

    connections: Array.isArray(
      canvas.connections,
    )
      ? canvas.connections.map(
          normalizeConnection,
        )
      : [],

    viewport: normalizeViewport(
      canvas.viewport,
    ),

    settings: {
      background:
        canvas.settings?.background ||
        'grid',

      gridSize:
        Number(
          canvas.settings?.gridSize,
        ) || 20,

      snapToGrid:
        canvas.settings
          ?.snapToGrid !== false,

      showMinimap:
        Boolean(
          canvas.settings?.showMinimap,
        ),

      ...cloneValue(
        canvas.settings || {},
      ),
    },
  }

  return attachCompatibilityAccessors(
    normalizedCanvas,
  )
}

function migrateLegacyCanvas(
  legacyCanvas = {},
) {
  const placementIdMap = new Map()

  const legacyNodes = Array.isArray(
    legacyCanvas.nodes,
  )
    ? legacyCanvas.nodes
    : []

  const placements = legacyNodes.map(
    (legacyNode) => {
      const card =
        importLegacyCard(legacyNode)

      const placementId =
        legacyNode.id ||
        createId('placement')

      placementIdMap.set(
        legacyNode.id,
        placementId,
      )

      return normalizePlacement({
        id: placementId,

        objectType: 'card',

        cardId: card.id,

        position:
          legacyNode.position || {
            x: 100,
            y: 100,
          },

        width:
          legacyNode.width ||
          legacyNode.dimensions?.width ||
          legacyNode.style?.width ||
          290,

        height:
          legacyNode.height ||
          legacyNode.dimensions?.height ||
          legacyNode.style?.height ||
          240,

        zIndex:
          legacyNode.zIndex || 1,

        color:
          legacyNode.data?.color ||
          card.color ||
          'default',

        collapsed:
          legacyNode.data?.collapsed ||
          false,

        locked:
          legacyNode.data?.locked ||
          false,

        rotation:
          legacyNode.data?.rotation ||
          0,

        parentSectionId:
          legacyNode.data
            ?.parentSectionId ||
          null,
      })
    },
  )

  const legacyEdges = Array.isArray(
    legacyCanvas.edges,
  )
    ? legacyCanvas.edges
    : []

  const connections = legacyEdges
    .map((legacyEdge) => {
      const source =
        placementIdMap.get(
          legacyEdge.source,
        ) || legacyEdge.source

      const target =
        placementIdMap.get(
          legacyEdge.target,
        ) || legacyEdge.target

      if (!source || !target) {
        return null
      }

      return normalizeConnection({
        id:
          legacyEdge.id ||
          createId('connection'),

        source,
        target,

        sourceHandle:
          legacyEdge.sourceHandle ||
          null,

        targetHandle:
          legacyEdge.targetHandle ||
          null,

        type:
          legacyEdge.type ||
          'smoothstep',

        label:
          legacyEdge.label || '',

        color:
          legacyEdge.style?.stroke ||
          '#64748b',

        width:
          legacyEdge.style
            ?.strokeWidth || 2,

        animated:
          legacyEdge.animated ||
          false,

        markerStart:
          legacyEdge.markerStart ||
          null,

        markerEnd:
          legacyEdge.markerEnd ||
          null,

        metadata:
          legacyEdge.data || {},
      })
    })
    .filter(Boolean)

  return normalizeCanvas({
    id: legacyCanvas.id,

    title:
      legacyCanvas.title ||
      'Untitled Canvas',

    description:
      legacyCanvas.description || '',

    createdAt:
      legacyCanvas.createdAt,

    updatedAt:
      legacyCanvas.updatedAt,

    placements,
    connections,

    viewport:
      legacyCanvas.viewport,
  })
}

function loadCanvases() {
  try {
    const savedCanvases =
      localStorage.getItem(STORAGE_KEY)

    if (savedCanvases) {
      const parsedCanvases =
        JSON.parse(savedCanvases)

      if (
        Array.isArray(parsedCanvases)
      ) {
        return parsedCanvases.map(
          normalizeCanvas,
        )
      }
    }

    const legacyCanvases =
      localStorage.getItem(
        LEGACY_STORAGE_KEY,
      )

    if (!legacyCanvases) {
      return []
    }

    const parsedLegacyCanvases =
      JSON.parse(legacyCanvases)

    if (
      !Array.isArray(
        parsedLegacyCanvases,
      )
    ) {
      return []
    }

    const migratedCanvases =
      parsedLegacyCanvases.map(
        migrateLegacyCanvas,
      )

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        migratedCanvases,
      ),
    )

    return migratedCanvases
  } catch (error) {
    console.error(
      'Unable to load canvases:',
      error,
    )

    return []
  }
}

const canvases = ref(loadCanvases())

watch(
  canvases,
  (updatedCanvases) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCanvases),
      )
    } catch (error) {
      console.error(
        'Unable to save canvases:',
        error,
      )
    }
  },
  {
    deep: true,
  },
)

export function useCanvases() {
  const sortedCanvases = computed(() =>
    [...canvases.value].sort(
      (firstCanvas, secondCanvas) =>
        new Date(
          secondCanvas.updatedAt,
        ).getTime() -
        new Date(
          firstCanvas.updatedAt,
        ).getTime(),
    ),
  )

  function getCanvasById(canvasId) {
    return (
      canvases.value.find(
        (canvas) =>
          canvas.id === canvasId,
      ) || null
    )
  }

  function createCanvas(
    canvasData = {},
  ) {
    const now = createTimestamp()

    const newCanvas =
      normalizeCanvas({
        id: createId('canvas'),

        title:
          canvasData.title ||
          'Untitled Canvas',

        description:
          canvasData.description ||
          '',

        createdAt: now,
        updatedAt: now,

        placements: [],
        connections: [],

        viewport: {
          x: 0,
          y: 0,
          zoom: 1,
        },

        settings:
          canvasData.settings || {},
      })

    canvases.value.unshift(
      newCanvas,
    )

    return newCanvas
  }

  function updateCanvas(
    canvasId,
    updates = {},
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return null
    }

    if (
      typeof updates.title ===
      'string'
    ) {
      canvas.title =
        updates.title.trim() ||
        'Untitled Canvas'
    }

    if (
      typeof updates.description ===
      'string'
    ) {
      canvas.description =
        updates.description.trim()
    }

    if (
      updates.settings &&
      typeof updates.settings ===
        'object'
    ) {
      canvas.settings = {
        ...canvas.settings,
        ...cloneValue(
          updates.settings,
        ),
      }
    }

    canvas.updatedAt =
      createTimestamp()

    return canvas
  }

  function deleteCanvas(canvasId) {
    const canvasIndex =
      canvases.value.findIndex(
        (canvas) =>
          canvas.id === canvasId,
      )

    if (canvasIndex === -1) {
      return false
    }

    canvases.value.splice(
      canvasIndex,
      1,
    )

    return true
  }

  function duplicateCanvas(canvasId) {
    const sourceCanvas =
      getCanvasById(canvasId)

    if (!sourceCanvas) {
      return null
    }

    const now = createTimestamp()
    const placementIdMap =
      new Map()

    const duplicatedPlacements =
      sourceCanvas.placements.map(
        (placement) => {
          const newPlacementId =
            createId('placement')

          placementIdMap.set(
            placement.id,
            newPlacementId,
          )

          return normalizePlacement({
            ...cloneValue(placement),

            id: newPlacementId,

            cardId:
              placement.cardId,

            position: {
              x:
                Number(
                  placement.position?.x ||
                    0,
                ) + 40,

              y:
                Number(
                  placement.position?.y ||
                    0,
                ) + 40,
            },
          })
        },
      )

    const duplicatedConnections =
      sourceCanvas.connections
        .map((connection) => {
          const newSource =
            placementIdMap.get(
              connection.source,
            )

          const newTarget =
            placementIdMap.get(
              connection.target,
            )

          if (
            !newSource ||
            !newTarget
          ) {
            return null
          }

          return normalizeConnection({
            ...cloneValue(connection),

            id:
              createId(
                'connection',
              ),

            source: newSource,
            target: newTarget,
          })
        })
        .filter(Boolean)

    const duplicatedCanvas =
      normalizeCanvas({
        id: createId('canvas'),

        title:
          `${sourceCanvas.title} Copy`,

        description:
          sourceCanvas.description,

        createdAt: now,
        updatedAt: now,

        placements:
          duplicatedPlacements,

        connections:
          duplicatedConnections,

        viewport:
          cloneValue(
            sourceCanvas.viewport,
          ),

        settings:
          cloneValue(
            sourceCanvas.settings,
          ),
      })

    canvases.value.unshift(
      duplicatedCanvas,
    )

    return duplicatedCanvas
  }

  function addCardPlacement(
    canvasId,
    cardId,
    placementData = {},
  ) {
    const canvas =
      getCanvasById(canvasId)

    const card =
      getCardById(cardId)

    if (!canvas || !card) {
      return null
    }

    const placement =
      normalizePlacement({
        id:
          placementData.id ||
          createId('placement'),

        objectType: 'card',
        cardId,

        position:
          placementData.position || {
            x: 100,
            y: 100,
          },

        width:
          placementData.width ||
          290,

        height:
          placementData.height ||
          240,

        zIndex:
          placementData.zIndex ||
          canvas.placements.length +
            1,

        color:
          placementData.color ||
          card.color ||
          'default',

        collapsed:
          placementData.collapsed,

        locked:
          placementData.locked,

        rotation:
          placementData.rotation,

        parentSectionId:
          placementData
            .parentSectionId,

        metadata:
          placementData.metadata,
      })

    canvas.placements.push(
      placement,
    )

    canvas.updatedAt =
      createTimestamp()

    return placement
  }

  function createCardAndPlace(
    canvasId,
    cardData = {},
    placementData = {},
  ) {
    const card = createTextCard(
      cardData.type ||
        cardData.cardType ||
        'note',
      {
        ...cardData,

        title:
          cardData.title ||
          'Untitled Card',
      },
    )

    const placement =
      addCardPlacement(
        canvasId,
        card.id,
        placementData,
      )

    if (!placement) {
      return null
    }

    return {
      card,
      placement,
    }
  }

  function addCard(
    canvasId,
    cardData = {},
  ) {
    const result =
      createCardAndPlace(
        canvasId,
        {
          type:
            cardData.cardType ||
            cardData.type ||
            'note',

          title:
            cardData.title ||
            'New Note',

          content:
            cardData.content || '',

          color:
            cardData.color ||
            'default',

          sourceType:
            cardData
              .linkedEntityType ||
            null,

          sourceId:
            cardData
              .linkedEntityId ||
            null,
        },
        {
          position:
            cardData.position || {
              x: 100,
              y: 100,
            },

          color:
            cardData.color ||
            'default',
        },
      )

    if (!result) {
      return null
    }

    return placementToNode(
      result.placement,
    )
  }

  function updatePlacement(
    canvasId,
    placementId,
    updates = {},
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return null
    }

    const placement =
      canvas.placements.find(
        (item) =>
          item.id === placementId,
      )

    if (!placement) {
      return null
    }

    if (updates.position) {
      placement.position =
        normalizePosition(
          updates.position,
        )
    }

    if (
      updates.width !== undefined
    ) {
      placement.width =
        Number(updates.width) ||
        placement.width
    }

    if (
      updates.height !== undefined
    ) {
      placement.height =
        Number(updates.height) ||
        placement.height
    }

    if (
      updates.zIndex !== undefined
    ) {
      placement.zIndex =
        Number(updates.zIndex) ||
        placement.zIndex
    }

    if (
      typeof updates.color ===
      'string'
    ) {
      placement.color =
        updates.color
    }

    if (
      updates.collapsed !==
      undefined
    ) {
      placement.collapsed =
        Boolean(updates.collapsed)
    }

    if (
      updates.locked !== undefined
    ) {
      placement.locked =
        Boolean(updates.locked)
    }

    if (
      updates.rotation !==
      undefined
    ) {
      placement.rotation =
        Number(updates.rotation) ||
        0
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        'parentSectionId',
      )
    ) {
      placement.parentSectionId =
        updates.parentSectionId
    }

    if (
      updates.metadata &&
      typeof updates.metadata ===
        'object'
    ) {
      placement.metadata = {
        ...placement.metadata,
        ...cloneValue(
          updates.metadata,
        ),
      }
    }

    canvas.updatedAt =
      createTimestamp()

    return placement
  }

  function updateCard(
    canvasId,
    placementId,
    updates = {},
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return null
    }

    const placement =
      canvas.placements.find(
        (item) =>
          item.id === placementId,
      )

    if (!placement) {
      return null
    }

    const card =
      getCardById(
        placement.cardId,
      )

    if (!card) {
      return null
    }

    updateLibraryCard(card.id, {
      title:
        updates.title ??
        card.title,

      content:
        updates.content ??
        card.content,

      type:
        updates.cardType ??
        updates.type ??
        card.type,

      assetId:
        updates.assetId ??
        card.assetId,

      sourceType:
        updates
          .linkedEntityType ??
        card.sourceType,

      sourceId:
        updates
          .linkedEntityId ??
        card.sourceId,

      metadata:
        updates.metadata,

      drawing:
        updates.drawing,
    })

    if (
      typeof updates.color ===
      'string'
    ) {
      placement.color =
        updates.color
    }

    canvas.updatedAt =
      createTimestamp()

    return placementToNode(
      placement,
    )
  }

  function deletePlacement(
    canvasId,
    placementId,
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return false
    }

    const placementIndex =
      canvas.placements.findIndex(
        (placement) =>
          placement.id ===
          placementId,
      )

    if (
      placementIndex === -1
    ) {
      return false
    }

    canvas.placements.splice(
      placementIndex,
      1,
    )

    canvas.connections =
      canvas.connections.filter(
        (connection) =>
          connection.source !==
            placementId &&
          connection.target !==
            placementId,
      )

    canvas.updatedAt =
      createTimestamp()

    return true
  }

  function deleteCard(
    canvasId,
    placementId,
  ) {
    return deletePlacement(
      canvasId,
      placementId,
    )
  }

  function addConnection(
    canvasId,
    connectionData = {},
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return null
    }

    if (
      !connectionData.source ||
      !connectionData.target
    ) {
      return null
    }

    const connection =
      normalizeConnection({
        ...connectionData,

        id:
          connectionData.id ||
          createId('connection'),
      })

    canvas.connections.push(
      connection,
    )

    canvas.updatedAt =
      createTimestamp()

    return connection
  }

  function deleteConnection(
    canvasId,
    connectionId,
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return false
    }

    const connectionIndex =
      canvas.connections.findIndex(
        (connection) =>
          connection.id ===
          connectionId,
      )

    if (
      connectionIndex === -1
    ) {
      return false
    }

    canvas.connections.splice(
      connectionIndex,
      1,
    )

    canvas.updatedAt =
      createTimestamp()

    return true
  }

  function saveCanvasGraph(
    canvasId,
    graphData = {},
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return null
    }

    if (
      Array.isArray(
        graphData.nodes,
      )
    ) {
      canvas.placements =
        graphData.nodes.map(
          (node) => {
            const existingPlacement =
              canvas.placements.find(
                (placement) =>
                  placement.id ===
                  node.id,
              )

            let cardId =
              node.data?.cardId ||
              node.data
                ?.libraryCardId ||
              existingPlacement
                ?.cardId ||
              null

            let card =
              cardId
                ? getCardById(cardId)
                : null

            if (!card) {
              card =
                importLegacyCard(
                  node,
                )

              cardId = card.id
            }

            updateLibraryCard(
              cardId,
              {
                title:
                  node.data?.title ??
                  card.title,

                content:
                  node.data
                    ?.content ??
                  card.content,

                type:
                  node.data
                    ?.cardType ??
                  card.type,

                assetId:
                  node.data
                    ?.assetId ??
                  card.assetId,

                sourceType:
                  node.data
                    ?.linkedEntityType ??
                  card.sourceType,

                sourceId:
                  node.data
                    ?.linkedEntityId ??
                  card.sourceId,

                metadata:
                  node.data
                    ?.metadata,

                drawing:
                  node.data
                    ?.drawing,
              },
            )

            return normalizePlacement({
              id:
                node.id ||
                existingPlacement?.id ||
                createId(
                  'placement',
                ),

              objectType: 'card',
              cardId,

              position:
                node.position ||
                existingPlacement
                  ?.position,

              width:
                node.width ||
                node.dimensions
                  ?.width ||
                existingPlacement
                  ?.width ||
                290,

              height:
                node.height ||
                node.dimensions
                  ?.height ||
                existingPlacement
                  ?.height ||
                240,

              zIndex:
                node.zIndex ||
                existingPlacement
                  ?.zIndex ||
                1,

              color:
                node.data?.color ||
                existingPlacement
                  ?.color ||
                card.color ||
                'default',

              collapsed:
                node.data
                  ?.collapsed ??
                existingPlacement
                  ?.collapsed,

              locked:
                node.data?.locked ??
                existingPlacement
                  ?.locked,

              rotation:
                node.data
                  ?.rotation ??
                existingPlacement
                  ?.rotation,

              parentSectionId:
                node.data
                  ?.parentSectionId ??
                existingPlacement
                  ?.parentSectionId,

              metadata:
                existingPlacement
                  ?.metadata ||
                {},
            })
          },
        )
    }

    if (
      Array.isArray(
        graphData.edges,
      )
    ) {
      canvas.connections =
        graphData.edges.map(
          (edge) =>
            normalizeConnection({
              id:
                edge.id ||
                createId(
                  'connection',
                ),

              source:
                edge.source,

              target:
                edge.target,

              sourceHandle:
                edge.sourceHandle ||
                null,

              targetHandle:
                edge.targetHandle ||
                null,

              type:
                edge.type ||
                'smoothstep',

              label:
                edge.label || '',

              color:
                edge.style?.stroke ||
                edge.data?.color ||
                '#64748b',

              width:
                edge.style
                  ?.strokeWidth ||
                edge.data?.width ||
                2,

              animated:
                edge.animated ||
                false,

              markerStart:
                edge.markerStart ||
                null,

              markerEnd:
                edge.markerEnd ||
                null,

              metadata:
                edge.data
                  ?.metadata ||
                edge.data ||
                {},
            }),
        )
    }

    if (graphData.viewport) {
      canvas.viewport =
        normalizeViewport(
          graphData.viewport,
        )
    }

    canvas.updatedAt =
      createTimestamp()

    return canvas
  }

  function clearCanvas(canvasId) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return false
    }

    canvas.placements = []
    canvas.connections = []

    canvas.viewport = {
      x: 0,
      y: 0,
      zoom: 1,
    }

    canvas.updatedAt =
      createTimestamp()

    return true
  }

  function findCardPlacements(
    cardId,
  ) {
    const results = []

    canvases.value.forEach(
      (canvas) => {
        canvas.placements.forEach(
          (placement) => {
            if (
              placement.cardId ===
              cardId
            ) {
              results.push({
                canvasId:
                  canvas.id,

                canvasTitle:
                  canvas.title,

                placement,
              })
            }
          },
        )
      },
    )

    return results
  }

  function getCanvasStats(
    canvasId,
  ) {
    const canvas =
      getCanvasById(canvasId)

    if (!canvas) {
      return {
        placements: 0,
        connections: 0,
        uniqueCards: 0,
      }
    }

    return {
      placements:
        canvas.placements.length,

      connections:
        canvas.connections.length,

      uniqueCards:
        new Set(
          canvas.placements
            .map(
              (placement) =>
                placement.cardId,
            )
            .filter(Boolean),
        ).size,
    }
  }

  return {
    canvases,
    sortedCanvases,

    getCanvasById,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    duplicateCanvas,

    addCardPlacement,
    createCardAndPlace,
    updatePlacement,
    deletePlacement,

    addConnection,
    deleteConnection,

    saveCanvasGraph,
    clearCanvas,

    findCardPlacements,
    getCanvasStats,

    // Temporary compatibility methods
    addCard,
    updateCard,
    deleteCard,
  }
}