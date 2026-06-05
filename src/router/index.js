import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

import AuthView from '../views/AuthView.vue'

import StudentDashboard from '../views/StudentDashboard.vue'
import InboxView from '../views/InboxView.vue'


import CoursesHub from '../views/CoursesHub.vue'
import CourseDetail from '../views/CourseDetail.vue'
import AssignmentDetail from '../views/AssignmentDetail.vue'
import AssignmentsHub from '../views/AssignmentsHub.vue'

import NotesHub from '../views/NotesHub.vue'
import CalendarHub from '../views/CalendarHub.vue'
import DailyPagesView from '../views/DailyPagesView.vue'
import PlannerView from '../views/planner/PlannerView.vue'
import AcademicHub from '../views/AcademicHub.vue'
import WritingHub from '../views/WritingHub.vue'

import ResearchHub from '../views/ResearchHub.vue'
import ResearchDetail from '../views/ResearchDetail.vue'
import ResearchTypeView from '../views/ResearchTypeView.vue'

import KnowledgeTagsView from '../views/KnowledgeTagsView.vue'
import KnowledgeTagDetail from '../views/KnowledgeTagDetail.vue'
import KnowledgeGraphView from '../views/graph/KnowledgeGraphView.vue'

const routes = [
  { path: '/auth', name: 'Auth', component: AuthView },
  {
  path: '/tools/pomodoro',
  name: 'pomodoro',
  component: () => import('@/views/tools/PomodoroView.vue'),
},

  { path: '/', name: 'StudentDashboard', component: StudentDashboard },
  { path: '/student-dashboard', redirect: '/' },

  { path: '/inbox', name: 'Inbox', component: InboxView },
  
  { path: '/academic', name: 'AcademicHub', component: AcademicHub },

  { path: '/courses', name: 'CoursesHub', component: CoursesHub },
  { path: '/courses/:id', name: 'CourseDetail', component: CourseDetail },

  { path: '/assignments', name: 'AssignmentsHub', component: AssignmentsHub },
  {
    path: '/courses/:courseId/assignments/:assignmentId',
    name: 'AssignmentDetail',
    component: AssignmentDetail
  },

  { path: '/notes', name: 'NotesHub', component: NotesHub },
  { path: '/calendar', name: 'CalendarHub', component: CalendarHub },
  { path: '/daily-pages', name: 'DailyPagesView', component: DailyPagesView },
  { path: '/planner', name: 'Planner', component: PlannerView },
  { path: '/writing', name: 'WritingHub', component: WritingHub },

  { path: '/knowledge-graph', name: 'KnowledgeGraphView', component: KnowledgeGraphView },
  { path: '/knowledge-tags/:id', name: 'KnowledgeTagDetail', component: KnowledgeTagDetail },
  { path: '/knowledge-tags', name: 'KnowledgeTagsView', component: KnowledgeTagsView },

  { path: '/research/type/:type', name: 'ResearchTypeView', component: ResearchTypeView },
  { path: '/research/items/:id', name: 'ResearchDetail', component: ResearchDetail },
  { path: '/research', name: 'ResearchHub', component: ResearchHub }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  const publicPages = ['/auth']
  const isPublicPage = publicPages.includes(to.path)

  const { data } = await supabase.auth.getSession()
  const isLoggedIn = !!data.session

  if (!isLoggedIn && !isPublicPage) {
    return '/auth'
  }

  if (isLoggedIn && to.path === '/auth') {
    return '/'
  }

  return true
})

export default router