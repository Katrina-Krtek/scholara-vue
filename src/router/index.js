import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

import AuthView from '../views/AuthView.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import InboxView from '../views/InboxView.vue'
import DailyPageView from '../views/DailyPageView.vue'
import TasksHub from '../views/TasksHub.vue'

import CoursesHub from '../views/courses/CoursesHub.vue'
import CourseDetailView from '../views/courses/CourseDetailView.vue'

import AssignmentDetail from '../views/AssignmentDetail.vue'
import AssignmentDetailView from '../views/assignments/AssignmentDetailView.vue'
import AssignmentsHub from '../views/AssignmentsHub.vue'

import InstructorsHub from '../views/instructors/InstructorsHub.vue'
import InstructorDetailView from '../views/instructors/InstructorDetailView.vue'

import NotesHub from '../views/NotesHub.vue'
import CalendarHub from '../views/CalendarHub.vue'
import DailyPagesView from '../views/DailyPagesView.vue'
import PlannerView from '../views/planner/PlannerView.vue'
import AcademicHub from '../views/AcademicHub.vue'
import WritingHub from '../views/WritingHub.vue'

import ResearchHub from '../views/ResearchHub.vue'
import ResearchDashboard from '../views/research/ResearchDashboard.vue'
import ResearchDetail from '../views/ResearchDetail.vue'
import ResearchTypeView from '../views/ResearchTypeView.vue'

import SourcesHub from '../views/sources/SourcesHub.vue'
import SourceDetailView from '../views/sources/SourceDetailView.vue'
import SourceRelationshipsView from '../views/sources/SourceRelationshipsView.vue'

import BooksHub from '../views/books/BooksHub.vue'
import BookDetailView from '../views/books/BookDetailView.vue'

import JournalsHub from '../views/journals/JournalsHub.vue'
import JournalDetailView from '../views/journals/JournalDetailView.vue'

import ArticlesHub from '../views/articles/ArticlesHub.vue'
import ArticleDetailView from '../views/articles/ArticleDetailView.vue'

import KnowledgeTagsView from '../views/KnowledgeTagsView.vue'
import KnowledgeTagDetail from '../views/KnowledgeTagDetail.vue'
import KnowledgeGraphView from '../views/graph/KnowledgeGraphView.vue'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
  },

  {
    path: '/tools/pomodoro',
    name: 'Pomodoro',
    component: () => import('@/views/tools/PomodoroView.vue'),
  },

  {
    path: '/',
    name: 'StudentDashboard',
    component: StudentDashboard,
  },
  {
    path: '/student-dashboard',
    redirect: '/',
  },

  {
    path: '/inbox',
    name: 'Inbox',
    component: InboxView,
  },
  {
    path: '/daily',
    name: 'DailyPage',
    component: DailyPageView,
  },
  {
    path: '/daily-page',
    redirect: '/daily',
  },
  {
    path: '/daily-pages',
    name: 'DailyPagesView',
    component: DailyPagesView,
  },
  {
    path: '/tasks',
    name: 'TasksHub',
    component: TasksHub,
  },
  {
    path: '/planner',
    name: 'Planner',
    component: PlannerView,
  },

  {
    path: '/academic',
    name: 'AcademicHub',
    component: AcademicHub,
  },

  {
    path: '/courses',
    name: 'CoursesHub',
    component: CoursesHub,
  },
  {
    path: '/courses/:id',
    name: 'CourseDetailView',
    component: CourseDetailView,
  },

  {
    path: '/assignments',
    name: 'AssignmentsHub',
    component: AssignmentsHub,
  },
  {
    path: '/courses/:courseId/assignments/:assignmentId',
    name: 'AssignmentDetail',
    component: AssignmentDetail,
  },
  {
    path: '/assignments/:id',
    name: 'AssignmentDetailView',
    component: AssignmentDetailView,
  },

  {
    path: '/instructors',
    name: 'InstructorsHub',
    component: InstructorsHub,
  },
  {
    path: '/instructors/:id',
    name: 'InstructorDetailView',
    component: InstructorDetailView,
  },

  {
    path: '/notes',
    name: 'NotesHub',
    component: NotesHub,
  },
  {
    path: '/calendar',
    name: 'CalendarHub',
    component: CalendarHub,
  },
  {
    path: '/writing',
    name: 'WritingHub',
    component: WritingHub,
  },

  {
    path: '/knowledge-tags',
    name: 'KnowledgeTagsView',
    component: KnowledgeTagsView,
  },
  {
    path: '/knowledge-tags/:id',
    name: 'KnowledgeTagDetail',
    component: KnowledgeTagDetail,
  },
  {
    path: '/knowledge-graph',
    name: 'KnowledgeGraphView',
    component: KnowledgeGraphView,
  },

  {
    path: '/research',
    name: 'ResearchHub',
    component: ResearchDashboard,
  },
  {
    path: '/research/workspace',
    name: 'ResearchWorkspace',
    component: ResearchHub,
  },
  {
    path: '/research/type/:type',
    name: 'ResearchTypeView',
    component: ResearchTypeView,
  },
  {
    path: '/research/items/:id',
    name: 'ResearchDetail',
    component: ResearchDetail,
  },

  {
    path: '/sources',
    name: 'SourcesHub',
    component: SourcesHub,
    meta: {
      title: 'Sources',
    },
  },
  {
    path: '/sources/relationships',
    name: 'source-relationships',
    component: SourceRelationshipsView,
    meta: {
      title: 'Source Relationships',
      subtitle:
        'Connect sources, journals, articles, books, and research themes.',
    },
  },
  {
    path: '/sources/:id',
    name: 'SourceDetailView',
    component: SourceDetailView,
  },

  {
    path: '/books',
    name: 'BooksHub',
    component: BooksHub,
  },
  {
    path: '/books/:id',
    name: 'BookDetailView',
    component: BookDetailView,
  },

  {
    path: '/journals',
    name: 'JournalsHub',
    component: JournalsHub,
  },
  {
    path: '/journals/:id',
    name: 'JournalDetailView',
    component: JournalDetailView,
  },

  {
    path: '/articles',
    name: 'ArticlesHub',
    component: ArticlesHub,
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetailView',
    component: ArticleDetailView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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