export const researchStatuses = [
  { id: 'inbox', name: 'Inbox', icon: '📥' },
  { id: 'reading', name: 'Reading', icon: '📖' },
  { id: 'annotating', name: 'Annotating', icon: '✍️' },
  { id: 'writing', name: 'Writing', icon: '📝' },
  { id: 'complete', name: 'Complete', icon: '✅' }
]

export function getResearchStatusById(id) {
  return researchStatuses.find((status) => status.id === id)
}