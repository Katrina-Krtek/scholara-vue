export const mockNodes = [
  // Courses
  {
    id: 'course-1',
    label: 'DMIN 851',
    type: 'course',
    color: '#2563eb',
    description: 'Doctor of Ministry Project Design'
  },
  {
    id: 'course-2',
    label: 'Spiritual Formation',
    type: 'course',
    color: '#2563eb',
    description: 'Spiritual Formation Studies'
  },

  // Assignments
  {
    id: 'assignment-1',
    label: 'Organization Phase',
    type: 'assignment',
    color: '#16a34a',
    description: 'Module 2 Assignment'
  },
  {
    id: 'assignment-2',
    label: 'Book Review',
    type: 'assignment',
    color: '#16a34a',
    description: 'Journal Submission Planning'
  },

  // Sources
  {
    id: 'source-1',
    label: 'Foster - Celebration of Discipline',
    type: 'source',
    color: '#f59e0b'
  },
  {
    id: 'source-2',
    label: 'Willard - Divine Conspiracy',
    type: 'source',
    color: '#f59e0b'
  },
  {
    id: 'source-3',
    label: 'Christian Education Journal',
    type: 'source',
    color: '#f59e0b'
  },

  // Notes
  {
    id: 'note-1',
    label: 'Spiritual Disciplines Notes',
    type: 'note',
    color: '#8b5cf6'
  },
  {
    id: 'note-2',
    label: 'Project Ideas',
    type: 'note',
    color: '#8b5cf6'
  },

  // Concepts
  {
    id: 'concept-1',
    label: 'Spiritual Formation',
    type: 'concept',
    color: '#ec4899'
  },
  {
    id: 'concept-2',
    label: 'Discipleship',
    type: 'concept',
    color: '#ec4899'
  },
  {
    id: 'concept-3',
    label: 'Sanctification',
    type: 'concept',
    color: '#ec4899'
  },

  // Terms
  {
    id: 'term-1',
    label: 'Lectio Divina',
    type: 'term',
    color: '#06b6d4'
  },
  {
    id: 'term-2',
    label: 'Rule of Life',
    type: 'term',
    color: '#06b6d4'
  },

  // People
  {
    id: 'person-1',
    label: 'Richard Foster',
    type: 'person',
    color: '#ef4444'
  },
  {
    id: 'person-2',
    label: 'Dallas Willard',
    type: 'person',
    color: '#ef4444'
  },

  // Flashcards
  {
    id: 'flashcard-1',
    label: 'Formation Definition',
    type: 'flashcard',
    color: '#14b8a6'
  },
  {
    id: 'flashcard-2',
    label: 'Discipleship Model',
    type: 'flashcard',
    color: '#14b8a6'
  }
]

export const mockLinks = [
  // Course Relationships
  {
    source: 'course-1',
    target: 'assignment-1'
  },
  {
    source: 'course-1',
    target: 'assignment-2'
  },

  // Assignment Relationships
  {
    source: 'assignment-1',
    target: 'source-1'
  },
  {
    source: 'assignment-1',
    target: 'source-2'
  },
  {
    source: 'assignment-2',
    target: 'source-3'
  },

  // Notes
  {
    source: 'assignment-1',
    target: 'note-1'
  },
  {
    source: 'assignment-2',
    target: 'note-2'
  },

  // Concepts
  {
    source: 'note-1',
    target: 'concept-1'
  },
  {
    source: 'note-1',
    target: 'concept-2'
  },
  {
    source: 'concept-1',
    target: 'concept-3'
  },

  // Terms
  {
    source: 'concept-1',
    target: 'term-1'
  },
  {
    source: 'concept-1',
    target: 'term-2'
  },

  // Authors
  {
    source: 'person-1',
    target: 'source-1'
  },
  {
    source: 'person-2',
    target: 'source-2'
  },

  // Flashcards
  {
    source: 'concept-1',
    target: 'flashcard-1'
  },
  {
    source: 'concept-2',
    target: 'flashcard-2'
  },

  // Additional Cross Links
  {
    source: 'course-2',
    target: 'concept-1'
  },
  {
    source: 'course-2',
    target: 'concept-2'
  }
]

export const graphStats = {
  totalNodes: mockNodes.length,
  totalConnections: mockLinks.length,
  mostConnectedConcept: 'Spiritual Formation',
  orphanNodes: 0
}

export const nodeTypes = [
  'course',
  'assignment',
  'source',
  'note',
  'concept',
  'term',
  'person',
  'flashcard'
]

export const nodeTypeLabels = {
  course: 'Courses',
  assignment: 'Assignments',
  source: 'Sources',
  note: 'Notes',
  concept: 'Concepts',
  term: 'Terms',
  person: 'People',
  flashcard: 'Flashcards'
}