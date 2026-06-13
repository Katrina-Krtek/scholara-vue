export const courses = [
  {
    id: 1,
    title: 'Spiritual Formation',
    code: 'DMIN 851',
    term: 'Summer 2026',
    level: 'Doctoral',
    status: 'active',

    instructorId: 1,
    instructorName: 'Instructor Name',

    startDate: '2026-05-19',
    endDate: '2026-07-10',

    description:
      'Course workspace for readings, assignments, notes, research, and formation reflections.',

    meetingFormat: 'Online',
    location: 'Liberty University Online',

    syllabus: '',
    courseNotes: '',
    instructorNotes: '',

    assignmentIds: [1, 2],
    researchIds: [],
    noteIds: [],
    fileIds: [],

    progress: 25,

    color: '#6366f1',
    icon: '📘',

    createdAt: '2026-06-11',
    updatedAt: '2026-06-11',
  },

  {
    id: 2,
    title: 'Example Course',
    code: 'COURSE 101',
    term: 'Fall 2026',
    level: 'High School / College',
    status: 'planned',

    instructorId: null,
    instructorName: '',

    startDate: '',
    endDate: '',

    description:
      'Sample course used for testing the Scholarory course database structure.',

    meetingFormat: 'Online',
    location: '',

    syllabus: '',
    courseNotes: '',
    instructorNotes: '',

    assignmentIds: [],
    researchIds: [],
    noteIds: [],
    fileIds: [],

    progress: 0,

    color: '#f59e0b',
    icon: '📗',

    createdAt: '2026-06-11',
    updatedAt: '2026-06-11',
  },
]