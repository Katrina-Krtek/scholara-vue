import { computed, ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const knowledgeTags = ref([])
const researchItemTags = ref([])
const isLoadingKnowledgeTags = ref(false)
const knowledgeTagsError = ref(null)

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function mapKnowledgeTag(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    kind: row.kind,
    parentId: row.parent_id,
    description: row.description || '',
    supertags: row.supertags || [],
    aliases: row.aliases || [],
    color: row.color || '',
    icon: row.icon || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapResearchItemTag(row) {
  return {
    id: row.id,
    userId: row.user_id,
    researchItemId: row.research_item_id,
    knowledgeTagId: row.knowledge_tag_id,
    createdAt: row.created_at
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

export function useKnowledgeTags() {
  const allKnowledgeTags = computed(() => knowledgeTags.value)
  const allResearchItemTags = computed(() => researchItemTags.value)

  async function loadKnowledgeTags() {
    isLoadingKnowledgeTags.value = true
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTags.value = []
      researchItemTags.value = []
      isLoadingKnowledgeTags.value = false
      return
    }

    const { data, error } = await supabase
      .from('knowledge_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      knowledgeTagsError.value = error.message
      isLoadingKnowledgeTags.value = false
      return
    }

    knowledgeTags.value = data.map(mapKnowledgeTag)
    isLoadingKnowledgeTags.value = false
  }

  async function loadResearchItemTags() {
    const user = await getCurrentUser()

    if (!user) {
      researchItemTags.value = []
      return
    }

    const { data, error } = await supabase
      .from('research_item_tags')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      knowledgeTagsError.value = error.message
      return
    }

    researchItemTags.value = data.map(mapResearchItemTag)
  }

  async function createKnowledgeTag({
    name,
    kind = 'topic',
    parentId = null,
    description = '',
    supertags = [],
    aliases = [],
    color = '',
    icon = ''
  }) {
    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value = 'You must be signed in to create tags.'
      return null
    }

    const cleanName = String(name || '').trim()

    if (!cleanName) {
      knowledgeTagsError.value = 'Tag name is required.'
      return null
    }

    const newTag = {
      user_id: user.id,
      name: cleanName,
      slug: slugify(cleanName),
      kind,
      parent_id: parentId,
      description,
      supertags,
      aliases,
      color,
      icon
    }

    const { data, error } = await supabase
      .from('knowledge_tags')
      .insert(newTag)
      .select()
      .single()

    if (error) {
      knowledgeTagsError.value = error.message
      return null
    }

    const mapped = mapKnowledgeTag(data)
    knowledgeTags.value.push(mapped)
    knowledgeTags.value.sort((a, b) => a.name.localeCompare(b.name))

    return mapped
  }

  async function updateKnowledgeTag(tagId, updates = {}) {
    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value = 'You must be signed in to update tags.'
      return null
    }

    const payload = {
      name: updates.name,
      slug: updates.name ? slugify(updates.name) : undefined,
      kind: updates.kind,
      parent_id: updates.parentId,
      description: updates.description,
      supertags: updates.supertags,
      aliases: updates.aliases,
      color: updates.color,
      icon: updates.icon,
      updated_at: new Date().toISOString()
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key]
    })

    const { data, error } = await supabase
      .from('knowledge_tags')
      .update(payload)
      .eq('id', tagId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      knowledgeTagsError.value = error.message
      return null
    }

    const mapped = mapKnowledgeTag(data)
    const index = knowledgeTags.value.findIndex((tag) => tag.id === tagId)

    if (index !== -1) {
      knowledgeTags.value[index] = mapped
    }

    return mapped
  }

  async function linkTagToResearchItem(researchItemId, knowledgeTagId) {
    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value = 'You must be signed in to link tags.'
      return null
    }

    const { data, error } = await supabase
      .from('research_item_tags')
      .insert({
        user_id: user.id,
        research_item_id: researchItemId,
        knowledge_tag_id: knowledgeTagId
      })
      .select()
      .single()

    if (error) {
      if (!error.message.includes('duplicate key')) {
        knowledgeTagsError.value = error.message
      }

      return null
    }

    const mapped = mapResearchItemTag(data)
    researchItemTags.value.push(mapped)

    return mapped
  }

  async function unlinkTagFromResearchItem(researchItemId, knowledgeTagId) {
    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value = 'You must be signed in to unlink tags.'
      return
    }

    const { error } = await supabase
      .from('research_item_tags')
      .delete()
      .eq('user_id', user.id)
      .eq('research_item_id', researchItemId)
      .eq('knowledge_tag_id', knowledgeTagId)

    if (error) {
      knowledgeTagsError.value = error.message
      return
    }

    researchItemTags.value = researchItemTags.value.filter(
      (link) =>
        !(
          link.researchItemId === researchItemId &&
          link.knowledgeTagId === knowledgeTagId
        )
    )
  }

  function getTagsForResearchItem(researchItemId) {
    const links = researchItemTags.value.filter(
      (link) => link.researchItemId === researchItemId
    )

    return links
      .map((link) =>
        knowledgeTags.value.find((tag) => tag.id === link.knowledgeTagId)
      )
      .filter(Boolean)
  }

  function getChildTags(parentId) {
    return knowledgeTags.value.filter((tag) => tag.parentId === parentId)
  }

  return {
    allKnowledgeTags,
    allResearchItemTags,
    isLoadingKnowledgeTags,
    knowledgeTagsError,
    loadKnowledgeTags,
    loadResearchItemTags,
    createKnowledgeTag,
    updateKnowledgeTag,
    linkTagToResearchItem,
    unlinkTagFromResearchItem,
    getTagsForResearchItem,
    getChildTags
  }
}