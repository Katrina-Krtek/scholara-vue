import {
  computed,
  ref,
} from 'vue'

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

function normalizeKind(value) {
  return (
    slugify(value) ||
    'topic'
  )
}

function normalizeStringList(value) {
  const values = Array.isArray(value)
    ? value
    : String(value || '').split(/[,\n]/)

  return [
    ...new Set(
      values
        .map((item) =>
          String(item || '')
            .replace(/^#/, '')
            .trim(),
        )
        .filter(Boolean),
    ),
  ]
}

function sortKnowledgeTags(
  first,
  second,
) {
  return String(
    first.name || '',
  ).localeCompare(
    String(second.name || ''),
    undefined,
    {
      sensitivity: 'base',
    },
  )
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
    updatedAt: row.updated_at,
  }
}

function mapResearchItemTag(row) {
  return {
    id: row.id,
    userId: row.user_id,
    researchItemId:
      row.research_item_id,
    knowledgeTagId:
      row.knowledge_tag_id,
    createdAt: row.created_at,
  }
}

async function getCurrentUser() {
  const {
    data,
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error(
      'Error getting current user:',
      error,
    )

    return null
  }

  return data.user
}

export function useKnowledgeTags() {
  const allKnowledgeTags = computed(
    () => knowledgeTags.value,
  )

  const allResearchItemTags = computed(
    () => researchItemTags.value,
  )

  function clearKnowledgeTagsError() {
    knowledgeTagsError.value = null
  }

  function getKnowledgeTagById(tagId) {
    return (
      knowledgeTags.value.find(
        (tag) =>
          String(tag.id) ===
          String(tagId),
      ) || null
    )
  }

  function getChildTags(parentId) {
    return knowledgeTags.value.filter(
      (tag) =>
        String(tag.parentId || '') ===
        String(parentId || ''),
    )
  }

  function wouldCreateParentCycle(
    tagId,
    proposedParentId,
  ) {
    const cleanTagId =
      String(tagId || '').trim()

    let currentId =
      String(
        proposedParentId || '',
      ).trim()

    if (
      !cleanTagId ||
      !currentId
    ) {
      return false
    }

    if (cleanTagId === currentId) {
      return true
    }

    const visited = new Set()

    while (currentId) {
      if (
        currentId === cleanTagId
      ) {
        return true
      }

      if (visited.has(currentId)) {
        return true
      }

      visited.add(currentId)

      const currentTag =
        getKnowledgeTagById(currentId)

      currentId = String(
        currentTag?.parentId || '',
      ).trim()
    }

    return false
  }

  async function loadKnowledgeTags() {
    isLoadingKnowledgeTags.value = true
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTags.value = []
      researchItemTags.value = []
      isLoadingKnowledgeTags.value = false
      return []
    }

    const {
      data,
      error,
    } = await supabase
      .from('knowledge_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name', {
        ascending: true,
      })

    if (error) {
      knowledgeTagsError.value =
        error.message

      isLoadingKnowledgeTags.value =
        false

      return []
    }

    knowledgeTags.value =
      (data || [])
        .map(mapKnowledgeTag)
        .sort(sortKnowledgeTags)

    isLoadingKnowledgeTags.value =
      false

    return knowledgeTags.value
  }

  async function loadResearchItemTags() {
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      researchItemTags.value = []
      return []
    }

    const {
      data,
      error,
    } = await supabase
      .from('research_item_tags')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      knowledgeTagsError.value =
        error.message

      return []
    }

    researchItemTags.value =
      (data || []).map(
        mapResearchItemTag,
      )

    return researchItemTags.value
  }

  async function loadKnowledgeTagSystem() {
    isLoadingKnowledgeTags.value = true
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTags.value = []
      researchItemTags.value = []
      isLoadingKnowledgeTags.value = false
      return {
        tags: [],
        links: [],
      }
    }

    const [
      tagsResponse,
      linksResponse,
    ] = await Promise.all([
      supabase
        .from('knowledge_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name', {
          ascending: true,
        }),

      supabase
        .from('research_item_tags')
        .select('*')
        .eq('user_id', user.id),
    ])

    if (tagsResponse.error) {
      knowledgeTagsError.value =
        tagsResponse.error.message
    }

    if (linksResponse.error) {
      knowledgeTagsError.value =
        linksResponse.error.message
    }

    knowledgeTags.value =
      tagsResponse.error
        ? []
        : (tagsResponse.data || [])
            .map(mapKnowledgeTag)
            .sort(sortKnowledgeTags)

    researchItemTags.value =
      linksResponse.error
        ? []
        : (linksResponse.data || [])
            .map(mapResearchItemTag)

    isLoadingKnowledgeTags.value =
      false

    return {
      tags: knowledgeTags.value,
      links: researchItemTags.value,
    }
  }

  async function createKnowledgeTag({
    name,
    kind = 'topic',
    parentId = null,
    description = '',
    supertags = [],
    aliases = [],
    color = '',
    icon = '',
  }) {
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value =
        'You must be signed in to create tags.'

      return null
    }

    const cleanName =
      String(name || '').trim()

    if (!cleanName) {
      knowledgeTagsError.value =
        'Tag name is required.'

      return null
    }

    const duplicateTag =
      knowledgeTags.value.find((tag) => {
        return (
          String(tag.name)
            .trim()
            .toLowerCase() ===
          cleanName.toLowerCase()
        )
      })

    if (duplicateTag) {
      knowledgeTagsError.value =
        'A knowledge tag with this name already exists.'

      return null
    }

    const cleanParentId =
      parentId || null

    if (
      cleanParentId &&
      !getKnowledgeTagById(
        cleanParentId,
      )
    ) {
      knowledgeTagsError.value =
        'The selected parent tag could not be found.'

      return null
    }

    const newTag = {
      user_id: user.id,
      name: cleanName,
      slug:
        slugify(cleanName) ||
        `tag-${Date.now()}`,
      kind: normalizeKind(kind),
      parent_id: cleanParentId,
      description:
        String(
          description || '',
        ).trim(),
      supertags:
        normalizeStringList(supertags),
      aliases:
        normalizeStringList(aliases),
      color:
        String(color || '').trim(),
      icon:
        String(icon || '').trim(),
    }

    const {
      data,
      error,
    } = await supabase
      .from('knowledge_tags')
      .insert(newTag)
      .select()
      .single()

    if (error) {
      knowledgeTagsError.value =
        error.message

      return null
    }

    const mapped =
      mapKnowledgeTag(data)

    knowledgeTags.value = [
      ...knowledgeTags.value,
      mapped,
    ].sort(sortKnowledgeTags)

    return mapped
  }

  async function updateKnowledgeTag(
    tagId,
    updates = {},
  ) {
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value =
        'You must be signed in to update tags.'

      return null
    }

    const existingTag =
      getKnowledgeTagById(tagId)

    if (!existingTag) {
      knowledgeTagsError.value =
        'Knowledge tag not found.'

      return null
    }

    const cleanName =
      updates.name === undefined
        ? undefined
        : String(
            updates.name || '',
          ).trim()

    if (
      updates.name !== undefined &&
      !cleanName
    ) {
      knowledgeTagsError.value =
        'Tag name is required.'

      return null
    }

    if (cleanName) {
      const duplicateTag =
        knowledgeTags.value.find(
          (tag) => {
            return (
              String(tag.id) !==
                String(tagId) &&
              String(tag.name)
                .trim()
                .toLowerCase() ===
                cleanName.toLowerCase()
            )
          },
        )

      if (duplicateTag) {
        knowledgeTagsError.value =
          'A knowledge tag with this name already exists.'

        return null
      }
    }

    const proposedParentId =
      updates.parentId === undefined
        ? undefined
        : updates.parentId || null

    if (
      proposedParentId &&
      wouldCreateParentCycle(
        tagId,
        proposedParentId,
      )
    ) {
      knowledgeTagsError.value =
        'A tag cannot be its own parent or a child of one of its descendants.'

      return null
    }

    const payload = {
      name: cleanName,
      slug: cleanName
        ? slugify(cleanName) ||
          existingTag.slug
        : undefined,
      kind:
        updates.kind === undefined
          ? undefined
          : normalizeKind(
              updates.kind,
            ),
      parent_id: proposedParentId,
      description:
        updates.description ===
        undefined
          ? undefined
          : String(
              updates.description ||
                '',
            ).trim(),
      supertags:
        updates.supertags ===
        undefined
          ? undefined
          : normalizeStringList(
              updates.supertags,
            ),
      aliases:
        updates.aliases ===
        undefined
          ? undefined
          : normalizeStringList(
              updates.aliases,
            ),
      color:
        updates.color === undefined
          ? undefined
          : String(
              updates.color || '',
            ).trim(),
      icon:
        updates.icon === undefined
          ? undefined
          : String(
              updates.icon || '',
            ).trim(),
      updated_at:
        new Date().toISOString(),
    }

    Object.keys(payload).forEach(
      (key) => {
        if (
          payload[key] === undefined
        ) {
          delete payload[key]
        }
      },
    )

    const {
      data,
      error,
    } = await supabase
      .from('knowledge_tags')
      .update(payload)
      .eq('id', tagId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      knowledgeTagsError.value =
        error.message

      return null
    }

    const mapped =
      mapKnowledgeTag(data)

    knowledgeTags.value =
      knowledgeTags.value
        .map((tag) => {
          return (
            String(tag.id) ===
            String(tagId)
          )
            ? mapped
            : tag
        })
        .sort(sortKnowledgeTags)

    return mapped
  }

  async function deleteKnowledgeTag(
    tagId,
  ) {
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value =
        'You must be signed in to delete tags.'

      return false
    }

    const existingTag =
      getKnowledgeTagById(tagId)

    if (!existingTag) {
      knowledgeTagsError.value =
        'Knowledge tag not found.'

      return false
    }

    const childIds =
      getChildTags(tagId).map(
        (tag) => tag.id,
      )

    if (childIds.length) {
      const {
        error: childError,
      } = await supabase
        .from('knowledge_tags')
        .update({
          parent_id:
            existingTag.parentId ||
            null,
          updated_at:
            new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .in('id', childIds)

      if (childError) {
        knowledgeTagsError.value =
          childError.message

        return false
      }
    }

    let {
      error,
    } = await supabase
      .from('knowledge_tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', user.id)

    if (
      error &&
      error.code === '23503'
    ) {
      const {
        error: linkError,
      } = await supabase
        .from('research_item_tags')
        .delete()
        .eq('user_id', user.id)
        .eq(
          'knowledge_tag_id',
          tagId,
        )

      if (linkError) {
        knowledgeTagsError.value =
          linkError.message

        return false
      }

      const retryResponse =
        await supabase
          .from('knowledge_tags')
          .delete()
          .eq('id', tagId)
          .eq('user_id', user.id)

      error =
        retryResponse.error
    }

    if (error) {
      if (childIds.length) {
        await supabase
          .from('knowledge_tags')
          .update({
            parent_id: tagId,
            updated_at:
              new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .in('id', childIds)
      }

      knowledgeTagsError.value =
        error.message

      return false
    }

    knowledgeTags.value =
      knowledgeTags.value
        .filter((tag) => {
          return (
            String(tag.id) !==
            String(tagId)
          )
        })
        .map((tag) => {
          if (
            String(tag.parentId) ===
            String(tagId)
          ) {
            return {
              ...tag,
              parentId:
                existingTag.parentId ||
                null,
            }
          }

          return tag
        })
        .sort(sortKnowledgeTags)

    researchItemTags.value =
      researchItemTags.value.filter(
        (link) => {
          return (
            String(
              link.knowledgeTagId,
            ) !== String(tagId)
          )
        },
      )

    return true
  }

  async function linkTagToResearchItem(
    researchItemId,
    knowledgeTagId,
  ) {
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value =
        'You must be signed in to link tags.'

      return null
    }

    const existingLink =
      researchItemTags.value.find(
        (link) => {
          return (
            String(
              link.researchItemId,
            ) ===
              String(
                researchItemId,
              ) &&
            String(
              link.knowledgeTagId,
            ) ===
              String(
                knowledgeTagId,
              )
          )
        },
      )

    if (existingLink) {
      return existingLink
    }

    const {
      data,
      error,
    } = await supabase
      .from('research_item_tags')
      .insert({
        user_id: user.id,
        research_item_id:
          researchItemId,
        knowledge_tag_id:
          knowledgeTagId,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        await loadResearchItemTags()

        return (
          researchItemTags.value.find(
            (link) => {
              return (
                String(
                  link.researchItemId,
                ) ===
                  String(
                    researchItemId,
                  ) &&
                String(
                  link.knowledgeTagId,
                ) ===
                  String(
                    knowledgeTagId,
                  )
              )
            },
          ) || null
        )
      }

      knowledgeTagsError.value =
        error.message

      return null
    }

    const mapped =
      mapResearchItemTag(data)

    researchItemTags.value = [
      ...researchItemTags.value,
      mapped,
    ]

    return mapped
  }

  async function unlinkTagFromResearchItem(
    researchItemId,
    knowledgeTagId,
  ) {
    knowledgeTagsError.value = null

    const user = await getCurrentUser()

    if (!user) {
      knowledgeTagsError.value =
        'You must be signed in to unlink tags.'

      return false
    }

    const {
      error,
    } = await supabase
      .from('research_item_tags')
      .delete()
      .eq('user_id', user.id)
      .eq(
        'research_item_id',
        researchItemId,
      )
      .eq(
        'knowledge_tag_id',
        knowledgeTagId,
      )

    if (error) {
      knowledgeTagsError.value =
        error.message

      return false
    }

    researchItemTags.value =
      researchItemTags.value.filter(
        (link) => {
          return !(
            String(
              link.researchItemId,
            ) ===
              String(
                researchItemId,
              ) &&
            String(
              link.knowledgeTagId,
            ) ===
              String(
                knowledgeTagId,
              )
          )
        },
      )

    return true
  }

  function getTagsForResearchItem(
    researchItemId,
  ) {
    const links =
      researchItemTags.value.filter(
        (link) => {
          return (
            String(
              link.researchItemId,
            ) ===
            String(researchItemId)
          )
        },
      )

    return links
      .map((link) => {
        return getKnowledgeTagById(
          link.knowledgeTagId,
        )
      })
      .filter(Boolean)
  }

  function getLinkedResearchItemIdsForTag(
    knowledgeTagId,
  ) {
    return researchItemTags.value
      .filter((link) => {
        return (
          String(
            link.knowledgeTagId,
          ) ===
          String(knowledgeTagId)
        )
      })
      .map((link) => {
        return link.researchItemId
      })
  }

  function isTagLinkedToResearchItem(
    researchItemId,
    knowledgeTagId,
  ) {
    return researchItemTags.value.some(
      (link) => {
        return (
          String(
            link.researchItemId,
          ) ===
            String(
              researchItemId,
            ) &&
          String(
            link.knowledgeTagId,
          ) ===
            String(
              knowledgeTagId,
            )
        )
      },
    )
  }

  return {
    allKnowledgeTags,
    allResearchItemTags,
    isLoadingKnowledgeTags,
    knowledgeTagsError,

    loadKnowledgeTags,
    loadResearchItemTags,
    loadKnowledgeTagSystem,

    createKnowledgeTag,
    updateKnowledgeTag,
    deleteKnowledgeTag,

    linkTagToResearchItem,
    unlinkTagFromResearchItem,

    getKnowledgeTagById,
    getTagsForResearchItem,
    getLinkedResearchItemIdsForTag,
    isTagLinkedToResearchItem,
    getChildTags,
    wouldCreateParentCycle,

    clearKnowledgeTagsError,
  }
}

