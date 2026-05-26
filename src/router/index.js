import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import StudentDashboard from '../views/StudentDashboard.vue';
import InboxView from '../views/InboxView.vue';
import CoursesHub from '../views/CoursesHub.vue';
import CourseDetail from '../views/CourseDetail.vue';
import AssignmentDetail from '../views/AssignmentDetail.vue';

const routes = [
  { path: '/', name: 'Welcome', component: WelcomeView },
  { path: '/student-dashboard', name: 'StudentDashboard', component: StudentDashboard },
  { path: '/inbox', name: 'Inbox', component: InboxView },
  { path: '/courses', name: 'CoursesHub', component: CoursesHub },
  { path: '/courses/:id', name: 'CourseDetail', component: CourseDetail },
  { path: '/courses/:courseId/assignments/:assignmentId', name: 'AssignmentDetail', component: AssignmentDetail }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;