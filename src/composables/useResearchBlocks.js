import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const blocksByItem = ref({})
const isLoadingBlocks = ref(false)
const blocksError = ref(null)

function mapFromSupabase(row) {
  return {
    id: row.id,
    researchItemId: row.research_item_id,
    parentBlockId: row.parent_block_id,
    type: row.block_type || 'text',
    content: row.content || '',
    childrenText: row.children_text || '',
    position: row.position || 0,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapToSupabase(block, researchItemId, userId, position = 0) {
  return {
    id: block.id,
    user_id: userId,
    research_item_id: researchItemId,
    parent_block_id: block.parentBlockId || null,
    block_type: block.type || 'text',
    content: block.content || '',
    children_text: block.childrenText || '',
    position,
    metadata: block.metadata || {}
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

export function useResearchBlocks() {
  async function loadBlocks(researchItemId) {
    if (!researchItemId) return []

    isLoadingBlocks.value = true
    blocksError.value = null

    const user = await getCurrentUser()

    if (!user) {
      blocksByItem.value[researchItemId] = []
      isLoadingBlocks.value = false
      return []
    }

    const { data, error } = await supabase
      .from('research_blocks')
      .select('*')
      .eq('research_item_id', researchItemId)
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      blocksError.value = error.message
      console.error('Error loading research blocks:', error)
      isLoadingBlocks.value = false
      return []
    }

    const mappedBlocks = data.map(mapFromSupabase)
    blocksByItem.value[researchItemId] = mappedBlocks
    isLoadingBlocks.value = false

    return mappedBlocks
  }

  async function saveBlocks(researchItemId, blocks = []) {
    if (!researchItemId) return

    blocksError.value = null

    const user = await getCurrentUser()

    if (!user) {
      blocksError.value = 'You must be signed in to save blocks.'
      return
    }

    const rows = blocks.map((block, index) =>
      mapToSupabase(block, researchItemId, user.id, index)
    )

    if (rows.length === 0) {
      blocksByItem.value[researchItemId] = []
      return
    }

    const { data, error } = await supabase
      .from('research_blocks')
      .upsert(rows, { onConflict: 'id' })
      .select()

    if (error) {
      blocksError.value = error.message
      console.error('Error saving research blocks:', error)
      return
    }

    blocksByItem.value[researchItemId] = data.map(mapFromSupabase)
  }

  function getBlocksForItem(researchItemId) {
    return blocksByItem.value[researchItemId] || []
  }

  return {
    blocksByItem,
    isLoadingBlocks,
    blocksError,
    loadBlocks,
    saveBlocks,
    getBlocksForItem
  }
}