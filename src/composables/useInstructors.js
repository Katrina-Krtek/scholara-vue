import { computed, ref } from 'vue'
import { instructors as instructorSeedData } from '@/data/instructors'

const instructors = ref([...instructorSeedData])

export function useInstructors() {
  const allInstructors = computed(() => instructors.value)

  const getInstructorById = (id) => {
    return instructors.value.find((instructor) => instructor.id === Number(id))
  }

  const addInstructor = (instructor) => {
    const newInstructor = {
      id: Date.now(),

      firstName: instructor.firstName || '',
      lastName: instructor.lastName || '',
      displayName:
        instructor.displayName ||
        `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() ||
        'Unnamed Instructor',

      title: instructor.title || 'Instructor',
      department: instructor.department || '',

      email: instructor.email || '',
      phone: instructor.phone || '',

      officeLocation: instructor.officeLocation || '',
      officeHours: instructor.officeHours || '',

      institution: instructor.institution || '',

      bio: instructor.bio || '',
      notes: instructor.notes || '',

      courseIds: instructor.courseIds || [],

      color: instructor.color || '#6366f1',
      avatar: instructor.avatar || '👩‍🏫',

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    instructors.value.push(newInstructor)

    return newInstructor
  }

  const updateInstructor = (id, updates) => {
    const index = instructors.value.findIndex(
      (instructor) => instructor.id === Number(id)
    )

    if (index !== -1) {
      instructors.value[index] = {
        ...instructors.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  const deleteInstructor = (id) => {
    instructors.value = instructors.value.filter(
      (instructor) => instructor.id !== Number(id)
    )
  }

  const addCourseToInstructor = (instructorId, courseId) => {
    const instructor = getInstructorById(instructorId)

    if (!instructor) return

    if (!instructor.courseIds.includes(courseId)) {
      instructor.courseIds.push(courseId)
    }
  }

  const removeCourseFromInstructor = (instructorId, courseId) => {
    const instructor = getInstructorById(instructorId)

    if (!instructor) return

    instructor.courseIds = instructor.courseIds.filter(
      (id) => id !== courseId
    )
  }

  return {
    allInstructors,
    getInstructorById,

    addInstructor,
    updateInstructor,
    deleteInstructor,

    addCourseToInstructor,
    removeCourseFromInstructor,
  }
}