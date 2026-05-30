export const researchTypes = [
  {
    id: 'book',
    name: 'Book',
    icon: '📘',
    defaultSupertags: ['book', 'source'],
    fields: [
      'authors',
      'editors',
      'shortTitle',
      'publisher',
      'placeOfPublication',
      'year',
      'edition',
      'isbn',
      'pageRange',
      'libraryLocation'
    ]
  },
  {
    id: 'article',
    name: 'Article',
    icon: '📰',
    defaultSupertags: ['article', 'source'],
    fields: ['author', 'journal', 'year', 'volume', 'issue', 'pages', 'doi', 'url']
  },
  {
    id: 'dissertation',
    name: 'Dissertation',
    icon: '🎓',
    defaultSupertags: ['dissertation', 'source'],
    fields: ['author', 'institution', 'year', 'degree', 'database', 'url']
  },
  {
    id: 'thesis',
    name: 'Thesis',
    icon: '📄',
    defaultSupertags: ['thesis', 'source'],
    fields: ['author', 'institution', 'year', 'degree', 'database', 'url']
  },
  {
    id: 'website',
    name: 'Website',
    icon: '🌐',
    defaultSupertags: ['website', 'source'],
    fields: ['author', 'siteName', 'publishedDate', 'accessedDate', 'url']
  },
  {
    id: 'blog',
    name: 'Blog',
    icon: '✍️',
    defaultSupertags: ['blog', 'source'],
    fields: ['author', 'blogName', 'publishedDate', 'accessedDate', 'url']
  },
  {
    id: 'video',
    name: 'Video & Media',
    icon: '🎥',
    defaultSupertags: ['video', 'media', 'source'],
    fields: ['creator', 'platform', 'publishedDate', 'accessedDate', 'url']
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    defaultSupertags: ['communication', 'source'],
    fields: ['sender', 'recipient', 'date', 'format']
  },
  {
    id: 'note',
    name: 'Note',
    icon: '📓',
    defaultSupertags: ['note'],
    fields: ['body']
  },
  {
    id: 'concept',
    name: 'Concept',
    icon: '💡',
    defaultSupertags: ['concept'],
    fields: ['definition', 'relatedIdeas']
  },
  {
    id: 'person',
    name: 'Person',
    icon: '👤',
    defaultSupertags: ['person'],
    fields: ['role', 'notes']
  },
  {
    id: 'assignment',
    name: 'Assignment',
    icon: '📝',
    defaultSupertags: ['assignment'],
    fields: ['course', 'dueDate', 'status', 'requirements']
  },
  {
    id: 'quote',
    name: 'Quote',
    icon: '❝',
    defaultSupertags: ['quote', 'note'],
    fields: ['quoteText', 'sourceId', 'pageNumber']
  }
]

export function getResearchTypeById(id) {
  return researchTypes.find((type) => type.id === id)
}