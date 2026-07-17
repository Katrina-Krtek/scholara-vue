import {
  computed,
  ref,
} from 'vue'

import {
  supertags,
} from '@/data/supertags'

import {
  researchTypes,
  getResearchTypeById,
} from '@/data/researchTypes'

import {
  supabase,
} from '@/lib/supabaseClient'

const researchItems = ref([])
const isLoadingResearch = ref(false)
const researchError = ref(null)

function normalizeId(value) {
  return String(
    value ?? '',
  ).trim()
}

function uniqueIdList(
  values = [],
  excludedId = '',
) {
  const excluded =
    normalizeId(excludedId)

  return [
    ...new Set(
      (Array.isArray(values)
        ? values
        : []
      )
        .map(normalizeId)
        .filter((value) => {
          return (
            value &&
            value !== excluded
          )
        }),
    ),
  ]
}

function mapFromSupabase(row) {
  return {
    id: normalizeId(row.id),
    userId: row.user_id,
    type: row.type || 'note',
    title:
      row.title ||
      'Untitled',
    summary:
      row.summary ||
      '',
    supertags:
      Array.isArray(row.supertags)
        ? row.supertags
        : [],
    topicTags:
      Array.isArray(row.topic_tags)
        ? row.topic_tags
        : [],
    links:
      uniqueIdList(
        row.links,
        row.id,
      ),
    metadata:
      row.metadata &&
      typeof row.metadata ===
        'object'
        ? row.metadata
        : {},
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  }
}

function mapToSupabase(
  item,
  userId,
) {
  return {
    user_id: userId,
    type:
      item.type ||
      'note',
    title:
      item.title ||
      'Untitled',
    summary:
      item.summary ||
      '',
    supertags:
      Array.isArray(item.supertags)
        ? item.supertags
        : [],
    topic_tags:
      Array.isArray(item.topicTags)
        ? item.topicTags
        : [],
    links:
      uniqueIdList(
        item.links,
        item.id,
      ),
    metadata:
      item.metadata &&
      typeof item.metadata ===
        'object'
        ? item.metadata
        : {},
  }
}

async function getCurrentUser() {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser()

  if (error) {
    console.error(
      'Error getting current user:',
      error,
    )

    return null
  }

  return data.user
}


async function synchronizeReciprocalLinks(
  userId,
) {
  const validIds =
    new Set(
      researchItems.value.map(
        (item) => item.id,
      ),
    )

  const desiredLinks =
    new Map(
      researchItems.value.map(
        (item) => [
          item.id,
          new Set(
            uniqueIdList(
              item.links,
              item.id,
            ).filter(
              (linkedId) => {
                return validIds.has(
                  linkedId,
                )
              },
            ),
          ),
        ],
      ),
    )

  researchItems.value.forEach(
    (item) => {
      desiredLinks
        .get(item.id)
        .forEach(
          (linkedId) => {
            desiredLinks
              .get(linkedId)
              ?.add(item.id)
          },
        )
    },
  )

  const changedItems =
    researchItems.value
      .map((item) => {
        const nextLinks =
          Array.from(
            desiredLinks.get(
              item.id,
            ) || [],
          )

        const currentLinks =
          uniqueIdList(
            item.links,
            item.id,
          ).filter(
            (linkedId) => {
              return validIds.has(
                linkedId,
              )
            },
          )

        const currentKey =
          [...currentLinks]
            .sort()
            .join('|')

        const nextKey =
          [...nextLinks]
            .sort()
            .join('|')

        return {
          item,
          nextLinks,
          changed:
            currentKey !== nextKey,
        }
      })
      .filter(
        (entry) => entry.changed,
      )

  if (
    changedItems.length === 0
  ) {
    return true
  }

  const results =
    await Promise.all(
      changedItems.map(
        ({ item, nextLinks }) => {
          return supabase
            .from(
              'research_items',
            )
            .update({
              links: nextLinks,
              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              'id',
              item.id,
            )
            .eq(
              'user_id',
              userId,
            )
        },
      ),
    )

  const failedResult =
    results.find(
      (result) => result.error,
    )

  if (failedResult?.error) {
    researchError.value =
      `Scholarory loaded the research items, but could not finish repairing reciprocal connections: ${failedResult.error.message}`

    return false
  }

  const repairedLinks =
    new Map(
      changedItems.map(
        ({ item, nextLinks }) => [
          item.id,
          nextLinks,
        ],
      ),
    )

  researchItems.value =
    researchItems.value.map(
      (item) => {
        if (
          !repairedLinks.has(
            item.id,
          )
        ) {
          return item
        }

        return {
          ...item,
          links:
            repairedLinks.get(
              item.id,
            ),
        }
      },
    )

  return true
}

export function useResearch() {
  const allResearchItems =
    computed(
      () => researchItems.value,
    )

  const graphNodes = computed(() => {
    return researchItems.value.map(
      (item) => {
        const type =
          getResearchTypeById(
            item.type,
          )

        return {
          id: item.id,
          label: item.title,
          type: item.type,
          supertags:
            item.supertags ||
            [],
          topicTags:
            item.topicTags ||
            [],
          icon:
            type?.icon ||
            '📄',
        }
      },
    )
  })

  const graphEdges = computed(() => {
    const edges = []
    const seenEdges = new Set()

    const validIds =
      new Set(
        researchItems.value.map(
          (item) => item.id,
        ),
      )

    researchItems.value.forEach(
      (item) => {
        uniqueIdList(
          item.links,
          item.id,
        ).forEach(
          (linkedId) => {
            if (
              !validIds.has(
                linkedId,
              )
            ) {
              return
            }

            const pair =
              [
                item.id,
                linkedId,
              ].sort()

            const edgeKey =
              pair.join('<->')

            if (
              seenEdges.has(
                edgeKey,
              )
            ) {
              return
            }

            seenEdges.add(
              edgeKey,
            )

            edges.push({
              id:
                `research-link:${edgeKey}`,
              from:
                pair[0],
              to:
                pair[1],
              label:
                'Research connection',
            })
          },
        )
      },
    )

    return edges
  })

  function clearResearchError() {
    researchError.value = null
  }

  async function loadResearchItems() {
    isLoadingResearch.value = true
    researchError.value = null

    const user =
      await getCurrentUser()

    if (!user) {
      researchItems.value = []
      isLoadingResearch.value = false
      return []
    }

    const {
      data,
      error,
    } =
      await supabase
        .from('research_items')
        .select('*')
        .eq(
          'user_id',
          user.id,
        )
        .order(
          'created_at',
          {
            ascending: false,
          },
        )

    if (error) {
      researchError.value =
        error.message

      isLoadingResearch.value =
        false

      console.error(
        'Error loading research items:',
        error,
      )

      return []
    }

    researchItems.value =
      (data || []).map(
        mapFromSupabase,
      )

    await synchronizeReciprocalLinks(
      user.id,
    )

    isLoadingResearch.value =
      false

    return researchItems.value
  }

  async function addResearchItem(
    item,
  ) {
    researchError.value = null

    const user =
      await getCurrentUser()

    if (!user) {
      researchError.value =
        'You must be signed in to save research items.'

      return null
    }

    const type =
      getResearchTypeById(
        item.type ||
        'note',
      )

    const newItem = {
      type:
        item.type ||
        'note',
      title:
        String(
          item.title ||
          'Untitled',
        ).trim() ||
        'Untitled',
      summary:
        item.summary ||
        '',
      supertags:
        item.supertags ||
        type?.defaultSupertags ||
        ['note'],
      topicTags:
        item.topicTags ||
        [],
      links:
        uniqueIdList(
          item.links,
        ),
      metadata:
        item.metadata ||
        {},
    }

    const {
      data,
      error,
    } =
      await supabase
        .from('research_items')
        .insert(
          mapToSupabase(
            newItem,
            user.id,
          ),
        )
        .select()
        .single()

    if (error) {
      researchError.value =
        error.message

      console.error(
        'Error adding research item:',
        error,
      )

      return null
    }

    const mapped =
      mapFromSupabase(data)

    researchItems.value.unshift(
      mapped,
    )

    return mapped
  }

  async function updateResearchItem(
    itemId,
    updates = {},
  ) {
    researchError.value = null

    const user =
      await getCurrentUser()

    if (!user) {
      researchError.value =
        'You must be signed in to update research items.'

      return null
    }

    const cleanItemId =
      normalizeId(itemId)

    const currentItem =
      researchItems.value.find(
        (item) => {
          return (
            item.id ===
            cleanItemId
          )
        },
      )

    if (!currentItem) {
      researchError.value =
        'Research item not found.'

      return null
    }

    const updatedItem = {
      ...currentItem,
      ...updates,

      links:
        updates.links ===
        undefined
          ? currentItem.links
          : uniqueIdList(
              updates.links,
              cleanItemId,
            ),

      metadata: {
        ...(
          currentItem.metadata ||
          {}
        ),
        ...(
          updates.metadata ||
          {}
        ),
      },
    }

    const {
      data,
      error,
    } =
      await supabase
        .from('research_items')
        .update(
          mapToSupabase(
            updatedItem,
            user.id,
          ),
        )
        .eq(
          'id',
          currentItem.id,
        )
        .eq(
          'user_id',
          user.id,
        )
        .select()
        .single()

    if (error) {
      researchError.value =
        error.message

      console.error(
        'Error updating research item:',
        error,
      )

      return null
    }

    const mapped =
      mapFromSupabase(data)

    const index =
      researchItems.value.findIndex(
        (item) => {
          return (
            item.id ===
            cleanItemId
          )
        },
      )

    if (index !== -1) {
      researchItems.value[index] =
        mapped
    }

    return mapped
  }

  async function deleteResearchItem(
    itemId,
  ) {
    researchError.value = null

    const user =
      await getCurrentUser()

    if (!user) {
      researchError.value =
        'You must be signed in to delete research items.'

      return false
    }

    const cleanItemId =
      normalizeId(itemId)

    const currentItem =
      getResearchItemById(
        cleanItemId,
      )

    if (!currentItem) {
      researchError.value =
        'Research item not found.'

      return false
    }

    const {
      error: deleteError,
    } =
      await supabase
        .from('research_items')
        .delete()
        .eq(
          'id',
          currentItem.id,
        )
        .eq(
          'user_id',
          user.id,
        )

    if (deleteError) {
      researchError.value =
        deleteError.message

      console.error(
        'Error deleting research item:',
        deleteError,
      )

      return false
    }

    const referringItems =
      researchItems.value.filter(
        (item) => {
          return (
            item.id !==
              cleanItemId &&
            uniqueIdList(
              item.links,
            ).includes(
              cleanItemId,
            )
          )
        },
      )

    const cleanupResults =
      await Promise.all(
        referringItems.map(
          async (item) => {
            const cleanedLinks =
              uniqueIdList(
                item.links,
              ).filter(
                (linkedId) => {
                  return (
                    linkedId !==
                    cleanItemId
                  )
                },
              )

            return supabase
              .from(
                'research_items',
              )
              .update({
                links:
                  cleanedLinks,
                updated_at:
                  new Date()
                    .toISOString(),
              })
              .eq(
                'id',
                item.id,
              )
              .eq(
                'user_id',
                user.id,
              )
          },
        ),
      )

    researchItems.value =
      researchItems.value
        .filter((item) => {
          return (
            item.id !==
            cleanItemId
          )
        })
        .map((item) => {
          return {
            ...item,
            links:
              uniqueIdList(
                item.links,
                item.id,
              ).filter(
                (linkedId) => {
                  return (
                    linkedId !==
                    cleanItemId
                  )
                },
              ),
          }
        })

    const cleanupError =
      cleanupResults.find(
        (result) => {
          return result.error
        },
      )?.error

    if (cleanupError) {
      researchError.value =
        `The item was deleted, but Scholarory could not remove every old backlink: ${cleanupError.message}`
    }

    return true
  }

  function getResearchItemById(
    id,
  ) {
    const cleanId =
      normalizeId(id)

    return (
      researchItems.value.find(
        (item) => {
          return (
            item.id === cleanId
          )
        },
      ) ||
      null
    )
  }

  function getItemsByType(
    typeId,
  ) {
    return researchItems.value.filter(
      (item) => {
        return (
          item.type === typeId
        )
      },
    )
  }

  function getBacklinks(
    itemId,
  ) {
    const cleanItemId =
      normalizeId(itemId)

    return researchItems.value.filter(
      (item) => {
        return uniqueIdList(
          item.links,
          item.id,
        ).includes(
          cleanItemId,
        )
      },
    )
  }

  function getSuggestedLinks(
    itemId,
  ) {
    const currentItem =
      getResearchItemById(
        itemId,
      )

    if (!currentItem) {
      return []
    }

    const currentTopicTags =
      new Set(
        (
          currentItem.topicTags ||
          []
        ).map((tag) => {
          return String(tag)
            .trim()
            .toLowerCase()
        }),
      )

    const currentSupertags =
      new Set(
        (
          currentItem.supertags ||
          []
        ).map((tag) => {
          return String(tag)
            .trim()
            .toLowerCase()
        }),
      )

    return researchItems.value
      .filter((item) => {
        return (
          item.id !==
          currentItem.id
        )
      })
      .map((item) => {
        const sharedTopicTags =
          (
            item.topicTags ||
            []
          ).filter((tag) => {
            return currentTopicTags.has(
              String(tag)
                .trim()
                .toLowerCase(),
            )
          })

        const sharedSupertags =
          (
            item.supertags ||
            []
          ).filter((tag) => {
            return currentSupertags.has(
              String(tag)
                .trim()
                .toLowerCase(),
            )
          })

        const score =
          sharedTopicTags.length *
            2 +
          sharedSupertags.length

        return {
          ...item,
          suggestionScore:
            score,
          sharedTopicTags,
          sharedSupertags,
        }
      })
      .filter((item) => {
        return (
          item.suggestionScore >
          0
        )
      })
      .sort((a, b) => {
        return (
          b.suggestionScore -
          a.suggestionScore
        )
      })
  }

  async function addLinkToItem(
    itemId,
    linkedItemId,
  ) {
    const item =
      getResearchItemById(
        itemId,
      )

    const linkedItem =
      getResearchItemById(
        linkedItemId,
      )

    if (
      !item ||
      !linkedItem
    ) {
      researchError.value =
        'One of the selected research items could not be found.'

      return false
    }

    if (
      item.id ===
      linkedItem.id
    ) {
      researchError.value =
        'A research item cannot connect to itself.'

      return false
    }

    const itemLinks =
      uniqueIdList(
        item.links,
        item.id,
      )

    const linkedItemLinks =
      uniqueIdList(
        linkedItem.links,
        linkedItem.id,
      )

    const itemNeedsUpdate =
      !itemLinks.includes(
        linkedItem.id,
      )

    const linkedItemNeedsUpdate =
      !linkedItemLinks.includes(
        item.id,
      )

    if (
      !itemNeedsUpdate &&
      !linkedItemNeedsUpdate
    ) {
      return true
    }

    if (itemNeedsUpdate) {
      const updatedItem =
        await updateResearchItem(
          item.id,
          {
            links: [
              ...itemLinks,
              linkedItem.id,
            ],
          },
        )

      if (!updatedItem) {
        return false
      }
    }

    if (linkedItemNeedsUpdate) {
      const updatedLinkedItem =
        await updateResearchItem(
          linkedItem.id,
          {
            links: [
              ...linkedItemLinks,
              item.id,
            ],
          },
        )

      if (!updatedLinkedItem) {
        const failureMessage =
          researchError.value

        if (itemNeedsUpdate) {
          await updateResearchItem(
            item.id,
            {
              links:
                itemLinks,
            },
          )
        }

        researchError.value =
          failureMessage

        return false
      }
    }

    return true
  }

  async function removeLinkFromItem(
    itemId,
    linkedItemId,
  ) {
    const item =
      getResearchItemById(
        itemId,
      )

    const linkedItem =
      getResearchItemById(
        linkedItemId,
      )

    if (
      !item ||
      !linkedItem
    ) {
      researchError.value =
        'One of the connected research items could not be found.'

      return false
    }

    const itemLinks =
      uniqueIdList(
        item.links,
        item.id,
      )

    const linkedItemLinks =
      uniqueIdList(
        linkedItem.links,
        linkedItem.id,
      )

    const itemNeedsUpdate =
      itemLinks.includes(
        linkedItem.id,
      )

    const linkedItemNeedsUpdate =
      linkedItemLinks.includes(
        item.id,
      )

    if (
      !itemNeedsUpdate &&
      !linkedItemNeedsUpdate
    ) {
      return true
    }

    if (itemNeedsUpdate) {
      const updatedItem =
        await updateResearchItem(
          item.id,
          {
            links:
              itemLinks.filter(
                (linkedId) => {
                  return (
                    linkedId !==
                    linkedItem.id
                  )
                },
              ),
          },
        )

      if (!updatedItem) {
        return false
      }
    }

    if (linkedItemNeedsUpdate) {
      const updatedLinkedItem =
        await updateResearchItem(
          linkedItem.id,
          {
            links:
              linkedItemLinks.filter(
                (linkedId) => {
                  return (
                    linkedId !==
                    item.id
                  )
                },
              ),
          },
        )

      if (!updatedLinkedItem) {
        const failureMessage =
          researchError.value

        if (itemNeedsUpdate) {
          await updateResearchItem(
            item.id,
            {
              links:
                itemLinks,
            },
          )
        }

        researchError.value =
          failureMessage

        return false
      }
    }

    return true
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
    deleteResearchItem,

    getResearchItemById,
    getItemsByType,
    getBacklinks,
    getSuggestedLinks,

    addLinkToItem,
    removeLinkFromItem,

    clearResearchError,
  }
}
