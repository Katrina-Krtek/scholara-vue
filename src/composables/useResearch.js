import { ref, computed } from 'vue'
import { supertags } from '@/data/supertags'
import { researchTypes, getResearchTypeById } from '@/data/researchTypes'
import { supabase } from '@/lib/supabaseClient'

const researchItems = ref([])
const isLoadingResearch = ref(false)
const researchError = ref(null)

function mapFromSupabase(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || 'note',
    title: row.title || 'Untitled',
    summary: row.summary || '',
    supertags: row.supertags || [],
    topicTags: row.topic_tags || [],
    links: row.links || [],
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapToSupabase(item, userId) {
  return {
    user_id: userId,
    type: item.type || 'note',
    title: item.title || 'Untitled',
    summary: item.summary || '',
    supertags: item.supertags || [],
    topic_tags: item.topicTags || [],
    links: item.links || [],
    metadata: item.metadata || {}
  }
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  return data.user
}

export function useResearch() {
  const allResearchItems = computed(() => researchItems.value)

  const graphNodes = computed(() =>
    researchItems.value.map((item) => {
      const type = getResearchTypeById(item.type)

      return {
        id: item.id,
        label: item.title,
        type: item.type,
        supertags: item.supertags || [],
        topicTags: item.topicTags || [],
        icon: type?.icon || '📄'
      }
    })
  )

  const graphEdges = computed(() => {
    const edges = []

    researchItems.value.forEach((item) => {
      ;(item.links || []).forEach((linkedId) => {
        edges.push({
          from: item.id,
          to: linkedId
        })
      })
    })

    return edges
  })

  async function loadResearchItems() {
    isLoadingResearch.value = true
    researchError.value = null

    const user = await getCurrentUser()

    if (!user) {
      researchItems.value = []
      isLoadingResearch.value = false
      return
    }

    const { data, error } = await supabase
      .from('research_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      researchError.value = error.message
      isLoadingResearch.value = false
      console.error('Error loading research items:', error)
      return
    }

    researchItems.value = data.map(mapFromSupabase)
    isLoadingResearch.value = false
  }

  async function addResearchItem(item) {
    const user = await getCurrentUser()

    if (!user) {
      researchError.value = 'You must be signed in to save research items.'
      return
    }

    const type = getResearchTypeById(item.type || 'note')

    const newItem = {
      type: item.type || 'note',
      title: item.title || 'Untitled',
      summary: item.summary || '',
      supertags: item.supertags || type?.defaultSupertags || ['note'],
      topicTags: item.topicTags || [],
      links: item.links || [],
      metadata: item.metadata || {}
    }

    const { data, error } = await supabase
      .from('research_items')
      .insert(mapToSupabase(newItem, user.id))
      .select()
      .single()

    if (error) {
      researchError.value = error.message
      console.error('Error adding research item:', error)
      return
    }

    researchItems.value.unshift(mapFromSupabase(data))
  }

  async function updateResearchItem(itemId, updates = {}) {
    const user = await getCurrentUser()

    if (!user) {
      researchError.value = 'You must be signed in to update research items.'
      return
    }

    const currentItem = researchItems.value.find((item) => item.id === itemId)

    if (!currentItem) {
      researchError.value = 'Research item not found.'
      return
    }

    const updatedItem = {
      ...currentItem,
      ...updates,
      metadata: {
        ...(currentItem.metadata || {}),
        ...(updates.metadata || {})
      }
    }

    const { data, error } = await supabase
      .from('research_items')
      .update(mapToSupabase(updatedItem, user.id))
      .eq('id', itemId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      researchError.value = error.message
      console.error('Error updating research item:', error)
      return
    }

    const index = researchItems.value.findIndex((item) => item.id === itemId)

    if (index !== -1) {
      researchItems.value[index] = mapFromSupabase(data)
    }
  }

  function getResearchItemById(id) {
    return researchItems.value.find((item) => item.id === id)
  }

  function getItemsByType(typeId) {
    return researchItems.value.filter((item) => item.type === typeId)
  }

  function getBacklinks(itemId) {
    return researchItems.value.filter((item) =>
      (item.links || []).includes(itemId)
    )
  }

  function getSuggestedLinks(itemId) {
    const currentItem = getResearchItemById(itemId)

    if (!currentItem) return []

    const currentTopicTags = currentItem.topicTags || []
    const currentSupertags = currentItem.supertags || []

    return researchItems.value
      .filter((item) => item.id !== itemId)
      .map((item) => {
        const sharedTopicTags = (item.topicTags || []).filter((tag) =>
          currentTopicTags.includes(tag)
        )

        const sharedSupertags = (item.supertags || []).filter((tag) =>
          currentSupertags.includes(tag)
        )

        const score = sharedTopicTags.length * 2 + sharedSupertags.length

        return {
          ...item,
          suggestionScore: score,
          sharedTopicTags,
          sharedSupertags
        }
      })
      .filter((item) => item.suggestionScore > 0)
      .sort((a, b) => b.suggestionScore - a.suggestionScore)
  }

  async function addLinkToItem(itemId, linkedItemId) {
    const item = getResearchItemById(itemId)

    if (!item) return
    if (!item.links) item.links = []
    if (item.links.includes(linkedItemId)) return

    const updatedLinks = [...item.links, linkedItemId]

    await updateResearchItem(itemId, {
      links: updatedLinks
    })
  }

  return {
    supertags,
    researchTypes,
    allResearchItems,
    graphNodes,
    graphEdges,
    isLoadingResearch,
    researchError,
    loadResearchItems,
    addResearchItem,
    updateResearchItem,
    getResearchItemById,
    getItemsByType,
    getBacklinks,
    addLinkToItem,
    getSuggestedLinks
  }
}