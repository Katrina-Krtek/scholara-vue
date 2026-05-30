export const viewLayouts = [
  { id: 'table', name: 'Table', icon: '▦' },
  { id: 'board', name: 'Board', icon: '▤' },
  { id: 'timeline', name: 'Timeline', icon: '⟶' },
  { id: 'calendar', name: 'Calendar', icon: '◷' },
  { id: 'list', name: 'List', icon: '☰' },
  { id: 'gallery', name: 'Gallery', icon: '▣' },
  { id: 'chart', name: 'Chart', icon: '◌' },
  { id: 'feed', name: 'Feed', icon: '≋' },
  { id: 'map', name: 'Map', icon: '⌖' },
  { id: 'dashboard', name: 'Dashboard', icon: '◈' }
]

export function getViewLayoutById(id) {
  return viewLayouts.find((layout) => layout.id === id)
}