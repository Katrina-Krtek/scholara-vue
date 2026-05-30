import { ref, watch } from 'vue'

export function useViewPreferences(preferenceKey, defaultView = 'gallery') {
  const storageKey = `scholarory_view_${preferenceKey}`

  const selectedView = ref(
    localStorage.getItem(storageKey) || defaultView
  )

  watch(selectedView, (newView) => {
    localStorage.setItem(storageKey, newView)
  })

  return {
    selectedView
  }
}