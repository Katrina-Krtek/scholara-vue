import { computed, ref } from 'vue'
import {
  mockNodes,
  mockLinks,
  nodeTypes
} from '@/data/mockKnowledgeGraph'

export function useKnowledgeGraph() {
  const searchQuery = ref('')

  const selectedNode = ref(null)

  const activeTypes = ref([...nodeTypes])

  const nodes = ref([...mockNodes])

  const links = ref([...mockLinks])

  const toggleType = (type) => {
    if (activeTypes.value.includes(type)) {
      activeTypes.value = activeTypes.value.filter(
        t => t !== type
      )
    } else {
      activeTypes.value.push(type)
    }
  }

  const clearFilters = () => {
    activeTypes.value = [...nodeTypes]
  }

  const selectNode = (node) => {
    selectedNode.value = node
  }

  const clearSelection = () => {
    selectedNode.value = null
  }

  const filteredNodes = computed(() => {
    return nodes.value.filter(node => {
      const matchesType =
        activeTypes.value.includes(node.type)

      const matchesSearch =
        !searchQuery.value ||
        node.label
          .toLowerCase()
          .includes(
            searchQuery.value.toLowerCase()
          )

      return matchesType && matchesSearch
    })
  })

  const filteredLinks = computed(() => {
    const visibleIds = filteredNodes.value.map(
      node => node.id
    )

    return links.value.filter(link => {
      return (
        visibleIds.includes(link.source) &&
        visibleIds.includes(link.target)
      )
    })
  })

  const connectedNodes = computed(() => {
    if (!selectedNode.value) return []

    const relatedIds = new Set()

    links.value.forEach(link => {
      if (link.source === selectedNode.value.id) {
        relatedIds.add(link.target)
      }

      if (link.target === selectedNode.value.id) {
        relatedIds.add(link.source)
      }
    })

    return nodes.value.filter(node =>
      relatedIds.has(node.id)
    )
  })

  const nodeStats = computed(() => {
    const totalNodes = nodes.value.length

    const totalConnections =
      links.value.length

    const countsByType = {}

    nodeTypes.forEach(type => {
      countsByType[type] =
        nodes.value.filter(
          node => node.type === type
        ).length
    })

    return {
      totalNodes,
      totalConnections,
      countsByType
    }
  })

  const mostConnectedNode = computed(() => {
    const counts = {}

    links.value.forEach(link => {
      counts[link.source] =
        (counts[link.source] || 0) + 1

      counts[link.target] =
        (counts[link.target] || 0) + 1
    })

    let winnerId = null
    let highestCount = 0

    Object.entries(counts).forEach(
      ([id, count]) => {
        if (count > highestCount) {
          winnerId = id
          highestCount = count
        }
      }
    )

    return (
      nodes.value.find(
        node => node.id === winnerId
      ) || null
    )
  })

  const orphanNodes = computed(() => {
    const connectedIds = new Set()

    links.value.forEach(link => {
      connectedIds.add(link.source)
      connectedIds.add(link.target)
    })

    return nodes.value.filter(
      node => !connectedIds.has(node.id)
    )
  })

  const searchNode = (query) => {
    searchQuery.value = query
  }

  const getNodeById = (id) => {
    return (
      nodes.value.find(
        node => node.id === id
      ) || null
    )
  }

  const getConnectionsForNode = (id) => {
    return links.value.filter(
      link =>
        link.source === id ||
        link.target === id
    )
  }

  return {
    searchQuery,

    selectedNode,

    activeTypes,

    nodes,

    links,

    filteredNodes,

    filteredLinks,

    connectedNodes,

    nodeStats,

    mostConnectedNode,

    orphanNodes,

    toggleType,

    clearFilters,

    selectNode,

    clearSelection,

    searchNode,

    getNodeById,

    getConnectionsForNode
  }
}