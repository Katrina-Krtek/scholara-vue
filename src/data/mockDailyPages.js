// src/data/mockDailyPages.js

export const mockDailyPages = [
  {
    id: 'daily-2026-06-03',
    date: '2026-06-03',
    dayOfWeek: 'Wednesday',
    focusWord: 'Build',
    mood: 'Focused',
    energy: 'Medium',
    reflection:
      'Knowledge Graph V3 became interactive, visual, and connected. Daily Pages are now the next major hub.',
    notes:
      'Daily Pages should become the primary command center for Scholarory.',
  },
]

export const mockPlannerBlocks = [
  {
    id: 'planner-1',
    dailyPageId: 'daily-2026-06-03',
    startTime: '8:00 AM',
    endTime: '9:00 AM',
    category: 'Study',
    title: 'Morning setup',
    description: 'Review assignments, tasks, and priorities.',
  },
  {
    id: 'planner-2',
    dailyPageId: 'daily-2026-06-03',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    category: 'Academic',
    title: 'School work block',
    description: 'Focused reading, writing, or research.',
  },
  {
    id: 'planner-3',
    dailyPageId: 'daily-2026-06-03',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    category: 'Scholarory',
    title: 'Scholarory build block',
    description: 'Build Daily Pages and planner integration.',
  },
  {
    id: 'planner-4',
    dailyPageId: 'daily-2026-06-03',
    startTime: '7:00 PM',
    endTime: '8:00 PM',
    category: 'Review',
    title: 'Daily review',
    description: 'Capture notes, update tasks, and prepare tomorrow.',
  },
]

export const mockDailyTasks = [
  {
    id: 'task-1',
    dailyPageId: 'daily-2026-06-03',
    title: 'Review school priorities',
    status: 'open',
    priority: 'high',
  },
  {
    id: 'task-2',
    dailyPageId: 'daily-2026-06-03',
    title: 'Update assignment progress',
    status: 'open',
    priority: 'medium',
  },
  {
    id: 'task-3',
    dailyPageId: 'daily-2026-06-03',
    title: 'Capture one research note',
    status: 'open',
    priority: 'medium',
  },
]

export const mockDailyAssignments = [
  {
    id: 'assignment-org-phase',
    dailyPageId: 'daily-2026-06-03',
    title: 'Organization Phase Assignment',
    course: 'DMIN 851',
    status: 'in-progress',
    dueDate: '2026-06-03',
  },
]

export const mockDailyNotes = [
  {
    id: 'note-daily-pages-hub',
    dailyPageId: 'daily-2026-06-03',
    title: 'Daily Pages as Scholarory Hub',
    description:
      'Daily Pages should connect tasks, assignments, notes, research, and planner blocks.',
  },
  {
    id: 'note-knowledge-graph-next',
    dailyPageId: 'daily-2026-06-03',
    title: 'Knowledge Graph next steps',
    description:
      'Focus Mode and Daily Page integration will make the graph more useful.',
  },
]

export const mockDailyResearch = [
  {
    id: 'source-spiritus',
    dailyPageId: 'daily-2026-06-03',
    title: 'Spiritus: ORU Journal of Theology',
    type: 'Journal',
  },
  {
    id: 'source-christian-education-journal',
    dailyPageId: 'daily-2026-06-03',
    title: 'Christian Education Journal',
    type: 'Journal',
  },
]

export const mockDailyRoryInsights = [
  {
    id: 'insight-1',
    title: 'Daily Pages are becoming your command center.',
    description:
      'This page should eventually pull together planner blocks, assignments, notes, research, focus sessions, and graph activity.',
    priority: 'high',
  },
  {
    id: 'insight-2',
    title: 'Your Knowledge Graph is ready to connect here.',
    description:
      'Daily Pages can become the daily entry point into your graph-based learning map.',
    priority: 'medium',
  },
]