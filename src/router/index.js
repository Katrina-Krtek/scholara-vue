import { createRouter, createWebHistory } from 'vue-router'
import StudentDashboard from '../views/StudentDashboard.vue'
import InboxView from '../views/InboxView.vue'
import ResearchHub from '../views/ResearchHub.vue'
import CoursesHub from '../views/CoursesHub.vue'
import AssignmentsHub from '../views/AssignmentsHub.vue'
import NotesHub from '../views/NotesHub.vue'
import CalendarHub from '../views/CalendarHub.vue'
import AcademicHub from '../views/AcademicHub.vue'
import WritingHub from '../views/WritingHub.vue'
import CourseDetail from '../views/CourseDetail.vue'
import AssignmentDetail from '../views/AssignmentDetail.vue'

const routes = [
  { path: '/', name: 'StudentDashboard', component: StudentDashboard },
  { path: '/student-dashboard', redirect: '/' },
  { path: '/inbox', name: 'Inbox', component: InboxView },
  { path: '/research', name: 'ResearchHub', component: ResearchHub },
  { path: '/courses', name: 'CoursesHub', component: CoursesHub },
  { path: '/assignments', name: 'AssignmentsHub', component: AssignmentsHub },
  { path: '/notes', name: 'NotesHub', component: NotesHub },
  { path: '/calendar', name: 'CalendarHub', component: CalendarHub },
  { path: '/academic', name: 'AcademicHub', component: AcademicHub },
  { path: '/writing', name: 'WritingHub', component: WritingHub },
  { path: '/courses/:id', name: 'CourseDetail', component: CourseDetail },
  { path: '/courses/:courseId/assignments/:assignmentId', name: 'AssignmentDetail', component: AssignmentDetail }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router