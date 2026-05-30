export const citationStyles = [
  {
    id: 'apa',
    name: 'APA',
    description: 'Common in education, psychology, and social sciences'
  },
  {
    id: 'mla',
    name: 'MLA',
    description: 'Common in literature, writing, and humanities'
  },
  {
    id: 'turabian',
    name: 'Turabian',
    description: 'Common in theology, biblical studies, and seminary work'
  },
  {
    id: 'chicago',
    name: 'Chicago',
    description: 'Common in history and humanities'
  },
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Common author-date citation style'
  },
  {
    id: 'ieee',
    name: 'IEEE',
    description: 'Common in engineering and technical writing'
  }
]

export function getCitationStyleById(id) {
  return citationStyles.find((style) => style.id === id)
}