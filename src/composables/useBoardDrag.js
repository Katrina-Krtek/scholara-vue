import { ref } from 'vue'

export function useBoardDrag(updateResearchItem) {
  const draggedItemId = ref(null)

  function handleDragStart(itemId) {
    draggedItemId.value = itemId
  }

  function handleDragEnd() {
    draggedItemId.value = null
  }

  async function handleDrop(statusId) {
    if (!draggedItemId.value) return

    await updateResearchItem(draggedItemId.value, {
      metadata: {
        status: statusId
      }
    })

    draggedItemId.value = null
  }

  return {
    draggedItemId,
    handleDragStart,
    handleDragEnd,
    handleDrop
  }
}