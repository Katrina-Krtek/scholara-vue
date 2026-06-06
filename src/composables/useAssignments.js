import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory_assignments'

const defaultAssignments = [
  {
    id: 1,
    title: 'Book Review Rough Draft',
    course: 'DMIN 851',
    courseId: 1,
    description: 'Draft the structure and organize the main argument.',
    dueDate: '2026-06-06',
    status: 'in-progress',
    priority: 'urgent',
    type: 'Paper',
  },
  {
    id: 2,
    title: 'Discussion Question Response',
    course: 'DMIN 851',
    courseId: 1,
    description: 'Write initial post and prepare two replies.',
    dueDate: '2026-06-06',
    status: 'not-started',
    priority: 'high',
    type: 'Discussion',
  },
  {
    id: 3,
    title: 'Organization Phase Assignment',
    course: 'DMIN 851',
    courseId: 1,
    description: 'Organize sources, journal options, and book review direction.',
    dueDate: '2026-06-07',
    status: 'in-progress',
    priority: 'high',
    type: 'Project',
  },
]

function loadAssignments() {
  try {
    const storedAssignments = localStorage.getItem(STORAGE_KEY)

    if (!storedAssignments) {
      return defaultAssignments
    }

    return JSON.parse(storedAssignments)
  } catch (error) {
    console.error('Failed to load assignments:', error)
    return defaultAssignments
  }
}

const assignments = ref(loadAssignments())

watch(
  assignments,
  (newAssignments) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssignments))
  },
  { deep: true },
)

export function useAssignments() {
  const activeAssignments = computed(() =>
    assignments.value.filter((assignment) => assignment.status !== 'completed'),
  )

  const completedAssignments = computed(() =>
    assignments.value.filter((assignment) => assignment.status === 'completed'),
  )

  function getAssignmentsByDate(date) {
    return assignments.value.filter((assignment) => assignment.dueDate === date)
  }

  function getAssignment(id) {
    return assignments.value.find((assignment) => assignment.id === id)
  }

  function addAssignment(assignment) {
    const newAssignment = {
      id: Date.now(),
      status: 'not-started',
      priority: 'medium',
      type: 'Paper',
      ...assignment,
    }

    assignments.value.push(newAssignment)
    return newAssignment
  }

  function updateAssignment(id, updates) {
    assignments.value = assignments.value.map((assignment) =>
      assignment.id === id ? { ...assignment, ...updates } : assignment,
    )
  }

  function deleteAssignment(id) {
    assignments.value = assignments.value.filter((assignment) => assignment.id !== id)
  }

  function toggleAssignmentComplete(id) {
    const assignment = assignments.value.find((assignmentItem) => assignmentItem.id === id)

    if (!assignment) return

    assignment.status =
      assignment.status === 'completed' ? 'not-started' : 'completed'
  }

  return {
    assignments,
    activeAssignments,
    completedAssignments,
    getAssignmentsByDate,
    getAssignment,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentComplete,
  }
}