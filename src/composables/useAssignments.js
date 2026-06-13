import { computed, ref } from 'vue'
import { assignments as assignmentSeedData } from '@/data/assignments'

const assignments = ref([...assignmentSeedData])

export function useAssignments() {
  const allAssignments = computed(() => assignments.value)

  const getAssignmentById = (id) => {
    return assignments.value.find((assignment) => assignment.id === Number(id))
  }

  const upcomingAssignments = computed(() => {
    return [...assignments.value].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    )
  })

  const urgentAssignments = computed(() => {
    return assignments.value.filter(
      (assignment) =>
        assignment.priority === 'urgent' || assignment.status === 'in-progress'
    )
  })

  const addAssignment = (assignment) => {
    const newAssignment = {
      id: Date.now(),
      title: assignment.title || 'Untitled Assignment',
      description: assignment.description || '',
      course: assignment.course || '',
      courseId: assignment.courseId || null,
      instructorId: assignment.instructorId || null,
      dueDate: assignment.dueDate || new Date().toISOString().slice(0, 10),
      status: assignment.status || 'not-started',
      priority: assignment.priority || 'medium',
      progress: assignment.progress || 0,
      type: assignment.type || 'Paper',
      instructions: assignment.instructions || '',
      rubric: assignment.rubric || '',
      instructorNotes: assignment.instructorNotes || '',
      personalNotes: assignment.personalNotes || '',
      wordCount: assignment.wordCount || {
        current: 0,
        target: 0,
      },
      linkedResearch: assignment.linkedResearch || [],
      linkedTasks: assignment.linkedTasks || [],
      linkedFiles: assignment.linkedFiles || [],
      checklist: assignment.checklist || [
        { label: 'Instructions reviewed', completed: false },
        { label: 'Rubric reviewed', completed: false },
        { label: 'Research linked', completed: false },
        { label: 'Draft completed', completed: false },
        { label: 'Grammar checked', completed: false },
        { label: 'Citations verified', completed: false },
        { label: 'Final review completed', completed: false },
        { label: 'Submitted', completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    assignments.value.push(newAssignment)

    return newAssignment
  }

  const updateAssignment = (id, updates) => {
    const index = assignments.value.findIndex(
      (assignment) => assignment.id === Number(id)
    )

    if (index !== -1) {
      assignments.value[index] = {
        ...assignments.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  const deleteAssignment = (id) => {
    assignments.value = assignments.value.filter(
      (assignment) => assignment.id !== Number(id)
    )
  }

  const updateAssignmentStatus = (id, status) => {
    updateAssignment(id, { status })
  }

  const updateAssignmentPriority = (id, priority) => {
    updateAssignment(id, { priority })
  }

  const updateAssignmentProgress = (id, progress) => {
    updateAssignment(id, { progress: Number(progress) })
  }

  const updateAssignmentNotes = (id, notes) => {
    updateAssignment(id, notes)
  }

  const updateAssignmentChecklist = (id, checklist) => {
    updateAssignment(id, { checklist })
  }

  return {
    allAssignments,
    upcomingAssignments,
    urgentAssignments,
    getAssignmentById,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    updateAssignmentStatus,
    updateAssignmentPriority,
    updateAssignmentProgress,
    updateAssignmentNotes,
    updateAssignmentChecklist,
  }
}