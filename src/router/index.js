import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import { supabase } from '../lib/supabaseClient'

import AuthView from '../views/AuthView.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import InboxView from '../views/InboxView.vue'
import DailyPageView from '../views/DailyPageView.vue'
import TasksHub from '../views/TasksHub.vue'

import CoursesHub from '../views/courses/CoursesHub.vue'
import CourseDetailView from '../views/courses/CourseDetailView.vue'

import AssignmentDetailView from '../views/assignments/AssignmentDetailView.vue'
import AssignmentsHub from '../views/AssignmentsHub.vue'

import InstructorsHub from '../views/instructors/InstructorsHub.vue'
import InstructorDetailView from '../views/instructors/InstructorDetailView.vue'

import NotesHub from '../views/NotesHub.vue'
import CalendarHub from '../views/CalendarHub.vue'

import PlannerView from '../views/planner/PlannerView.vue'
import WeeklyPlannerView from '../views/planner/WeeklyPlannerView.vue'
import MonthlyPlannerView from '../views/planner/MonthlyPlannerView.vue'
import YearlyPlannerView from '../views/planner/YearlyPlannerView.vue'
import WeeklyView from '../views/planner/WeeklyView.vue'
import MonthlyView from '../views/planner/MonthlyView.vue'
import YearlyView from '../views/planner/YearlyView.vue'

import AcademicHub from '../views/AcademicHub.vue'

import WritingHub from '../views/WritingHub.vue'
import WritingEditorView from '../views/writing/WritingEditorView.vue'

import ResearchHub from '../views/ResearchHub.vue'
import ResearchDashboard from '../views/research/ResearchDashboard.vue'
import ResearchAuditHub from '../views/research/ResearchAuditHub.vue'
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

import ConceptsHub from '../views/concepts/ConceptsHub.vue'
import ConceptDetailView from '../views/concepts/ConceptDetailView.vue'

import TermsHub from '../views/terms/TermsHub.vue'
import TermDetailView from '../views/terms/TermDetailView.vue'

import CanvasHub from '../views/canvas/CanvasHub.vue'
import CanvasDetailView from '../views/canvas/CanvasDetailView.vue'

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
    component: () =>
      import('@/views/tools/PomodoroView.vue'),
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
  redirect: '/daily',
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
    path: '/planner/week',
    name: 'WeeklyPlanner',
    component: WeeklyPlannerView,
  },
  {
    path: '/planner/weekly',
    name: 'WeeklyView',
    component: WeeklyView,
  },
  {
    path: '/planner/month',
    name: 'MonthlyPlanner',
    component: MonthlyPlannerView,
  },
  {
    path: '/planner/monthly',
    redirect: '/planner/month',
  },
  {
    path: '/planner/month-view',
    name: 'MonthlyView',
    component: MonthlyView,
  },
  {
    path: '/planner/year',
    name: 'YearlyPlanner',
    component: YearlyPlannerView,
  },
  {
    path: '/planner/yearly',
    redirect: '/planner/year',
  },
  {
    path: '/planner/year-view',
    name: 'YearlyView',
    component: YearlyView,
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
    path:
      '/courses/:courseId/assignments/:assignmentId',

    redirect: (to) =>
      `/assignments/${encodeURIComponent(
        String(to.params.assignmentId),
      )}`,
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
    path: '/writing/projects/:id',
    name: 'WritingEditorView',
    component: WritingEditorView,
    meta: {
      title: 'Writing Editor',
      subtitle:
        'Draft, revise, and track writing progress.',
    },
  },

  {
    path: '/concepts',
    name: 'ConceptsHub',
    component: ConceptsHub,
    meta: {
      title: 'Concepts',
      subtitle:
        'Build and connect reusable ideas across Scholarory.',
    },
  },
  {
    path: '/concepts/:id',
    name: 'ConceptDetailView',
    component: ConceptDetailView,
    meta: {
      title: 'Concept Detail',
      subtitle:
        'Develop definitions, notes, and concept relationships.',
    },
  },

  {
    path: '/terms',
    name: 'TermsHub',
    component: TermsHub,
    meta: {
      title: 'Terms Database',
      subtitle:
        'Build a searchable glossary of academic and technical vocabulary.',
    },
  },
  {
    path: '/terms/:id',
    name: 'TermDetailView',
    component: TermDetailView,
    meta: {
      title: 'Term Detail',
      subtitle:
        'Develop definitions, examples, notes, and term relationships.',
    },
  },

  {
    path: '/canvas',
    name: 'CanvasHub',
    component: CanvasHub,
    meta: {
      title: 'Canvas',
      subtitle:
        'Build visual maps from notes, ideas, sources, concepts, and connections.',
    },
  },
  {
    path: '/canvas/:id',
    name: 'CanvasDetailView',
    component: CanvasDetailView,
    meta: {
      title: 'Canvas Workspace',
      subtitle:
        'Arrange cards and connect related ideas in a visual workspace.',
    },
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
    path: '/research/audit',
    alias: '/research-audit',
    name: 'ResearchAuditHub',
    component: ResearchAuditHub,
    meta: {
      title: 'Research Audit',
      subtitle:
        'Find incomplete records, citation gaps, and disconnected research.',
    },
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
  history: createWebHistory(
    import.meta.env.BASE_URL,
  ),
  routes,
})

router.beforeEach(async (to) => {
  const publicPages = ['/auth']

  const isPublicPage =
    publicPages.includes(to.path)

  const { data } =
    await supabase.auth.getSession()

  const isLoggedIn =
    Boolean(data.session)

  if (
    !isLoggedIn &&
    !isPublicPage
  ) {
    return '/auth'
  }

  if (
    isLoggedIn &&
    to.path === '/auth'
  ) {
    return '/'
  }

  return true
})

export default router