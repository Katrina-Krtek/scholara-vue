export const supertags = [
  {
    id: 'book',
    name: 'Book',
    icon: '📘',
    color: 'blue',
    description: 'A book used for research or coursework'
  },
  {
    id: 'article',
    name: 'Article',
    icon: '📰',
    color: 'green',
    description: 'A journal article, magazine article, or scholarly article'
  },
  {
    id: 'assignment',
    name: 'Assignment',
    icon: '📝',
    color: 'purple',
    description: 'A paper, project, quiz, exam, or academic task'
  },
  {
    id: 'course',
    name: 'Course',
    icon: '📚',
    color: 'gold',
    description: 'A class or course'
  },
  {
    id: 'note',
    name: 'Note',
    icon: '📓',
    color: 'gray',
    description: 'A class note, research note, or idea'
  },
  {
    id: 'concept',
    name: 'Concept',
    icon: '💡',
    color: 'yellow',
    description: 'A topic, theme, doctrine, idea, or recurring thought'
  },
  {
    id: 'person',
    name: 'Person',
    icon: '👤',
    color: 'pink',
    description: 'A professor, author, classmate, historical figure, or contact'
  },
  {
    id: 'source',
    name: 'Source',
    icon: '📎',
    color: 'teal',
    description: 'A general research source'
  }
]

export function getSupertagById(id) {
  return supertags.find((tag) => tag.id === id)
}