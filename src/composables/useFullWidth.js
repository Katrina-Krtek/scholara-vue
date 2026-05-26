import { ref, watch } from 'vue'
import { getFullWidth, setFullWidth } from '@/lib/userpreferences'

// Singleton shared across the app
const isFullWidth = ref(getFullWidth())

watch(isFullWidth, (val) => setFullWidth(val))

export function useFullWidth() {
  return { isFullWidth }
}
