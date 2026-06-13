import { computed, ref } from 'vue'
import { courses as courseSeedData } from '@/data/courses'

const courses = ref([...courseSeedData])

export function useCourses() {
  const allCourses = computed(() => courses.value)

  const getCourseById = (id) => {
    return courses.value.find((course) => course.id === Number(id))
  }

  const activeCourses = computed(() => {
    return courses.value.filter(
      (course) => course.status === 'active'
    )
  })

  const plannedCourses = computed(() => {
    return courses.value.filter(
      (course) => course.status === 'planned'
    )
  })

  const addCourse = (course) => {
    const newCourse = {
      id: Date.now(),

      title: course.title || 'Untitled Course',
      code: course.code || '',
      term: course.term || '',
      level: course.level || '',
      status: course.status || 'planned',

      instructorId: course.instructorId || null,
      instructorName: course.instructorName || '',

      startDate: course.startDate || '',
      endDate: course.endDate || '',

      description: course.description || '',

      meetingFormat: course.meetingFormat || '',
      location: course.location || '',

      syllabus: course.syllabus || '',
      courseNotes: course.courseNotes || '',
      instructorNotes: course.instructorNotes || '',

      assignmentIds: [],
      researchIds: [],
      noteIds: [],
      fileIds: [],

      progress: 0,

      color: course.color || '#6366f1',
      icon: course.icon || '📘',

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    courses.value.push(newCourse)

    return newCourse
  }

  const updateCourse = (id, updates) => {
    const index = courses.value.findIndex(
      (course) => course.id === Number(id)
    )

    if (index !== -1) {
      courses.value[index] = {
        ...courses.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  const deleteCourse = (id) => {
    courses.value = courses.value.filter(
      (course) => course.id !== Number(id)
    )
  }

  const updateCourseProgress = (id, progress) => {
    updateCourse(id, {
      progress: Number(progress),
    })
  }

  const addAssignmentToCourse = (courseId, assignmentId) => {
    const course = getCourseById(courseId)

    if (!course) return

    if (!course.assignmentIds.includes(assignmentId)) {
      course.assignmentIds.push(assignmentId)
    }
  }

  const removeAssignmentFromCourse = (courseId, assignmentId) => {
    const course = getCourseById(courseId)

    if (!course) return

    course.assignmentIds =
      course.assignmentIds.filter(
        (id) => id !== assignmentId
      )
  }

  return {
    allCourses,
    activeCourses,
    plannedCourses,

    getCourseById,

    addCourse,
    updateCourse,
    deleteCourse,

    updateCourseProgress,

    addAssignmentToCourse,
    removeAssignmentFromCourse,
  }
}