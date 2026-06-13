export const assignments = [
  {
    id: 1,
    title: 'Book Review Rough Draft',
    description: 'Draft the structure and organize the main argument.',

    course: 'DMIN 851',
    courseId: 1,
    instructorId: 1,

    dueDate: '2026-06-06',
    status: 'in-progress',
    priority: 'urgent',
    progress: 35,
    type: 'Paper',

    instructions: '',
    rubric: '',
    instructorNotes: '',
    personalNotes: '',

    wordCount: {
      current: 0,
      target: 2000,
    },

    linkedResearch: [],
    linkedTasks: [],
    linkedFiles: [],

    checklist: [
      { label: 'Instructions reviewed', completed: false },
      { label: 'Rubric reviewed', completed: false },
      { label: 'Research linked', completed: false },
      { label: 'Draft completed', completed: false },
      { label: 'Grammar checked', completed: false },
      { label: 'Citations verified', completed: false },
      { label: 'Final review completed', completed: false },
      { label: 'Submitted', completed: false },
    ],

    createdAt: '2026-06-11',
    updatedAt: '2026-06-11',
  },

  {
    id: 2,
    title: 'Discussion Question Response',
    description: 'Write initial post and prepare two replies.',

    course: 'DMIN 851',
    courseId: 1,
    instructorId: 1,

    dueDate: '2026-06-07',
    status: 'not-started',
    priority: 'high',
    progress: 0,
    type: 'Discussion',

    instructions: '',
    rubric: '',
    instructorNotes: '',
    personalNotes: '',

    wordCount: {
      current: 0,
      target: 600,
    },

    linkedResearch: [],
    linkedTasks: [],
    linkedFiles: [],

    checklist: [
      { label: 'Instructions reviewed', completed: false },
      { label: 'Rubric reviewed', completed: false },
      { label: 'Research linked', completed: false },
      { label: 'Draft completed', completed: false },
      { label: 'Grammar checked', completed: false },
      { label: 'Citations verified', completed: false },
      { label: 'Final review completed', completed: false },
      { label: 'Submitted', completed: false },
    ],

    createdAt: '2026-06-11',
    updatedAt: '2026-06-11',
  },
]