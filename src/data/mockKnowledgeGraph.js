// src/data/mockKnowledgeGraph.js

export const graphNodeTypes = [
  'daily-page',
  'planner-block',
  'course',
  'assignment',
  'note',
  'research-source',
  'tag',
]

export const graphRelationshipTypes = [
  'tagged-with',
  'used-in-assignment',
  'belongs-to-course',
  'created-on-daily-page',
  'referenced-in-note',
  'supports-argument',
  'contrasts-with',
  'builds-on',
  'needs-review',
  'scheduled-in-planner',
]

export const mockKnowledgeGraphNodes = [
  {
    id: 'daily-2026-06-03',
    type: 'daily-page',
    title: 'Daily Page: June 3, 2026',
    description: 'Central hub for today’s study plan, planner blocks, notes, research, and focus work.',
    date: '2026-06-03',
    courseId: null,
    assignmentId: null,
    tags: ['daily-pages', 'planner'],
    status: 'active',
    updatedAt: '2026-06-03',
  },
  {
    id: 'course-dmin-851',
    type: 'course',
    title: 'DMIN 851',
    description: 'Current doctoral course workspace for readings, assignments, journals, notes, and research planning.',
    date: null,
    courseId: null,
    assignmentId: null,
    tags: ['doctoral-work', 'spiritual-formation'],
    status: 'active',
    updatedAt: '2026-06-02',
  },
  {
    id: 'assignment-org-phase',
    type: 'assignment',
    title: 'Organization Phase Assignment',
    description: 'Assignment focused on selecting and organizing potential book review publication options.',
    date: '2026-06-01',
    courseId: 'course-dmin-851',
    assignmentId: null,
    tags: ['book-review', 'journals', 'organization-phase'],
    status: 'in-progress',
    updatedAt: '2026-06-01',
  },
  {
    id: 'planner-block-study-1',
    type: 'planner-block',
    title: 'Study Block: Knowledge Graph V3',
    description: 'Focused Scholarory build session for improving graph navigation and discovery.',
    date: '2026-06-03',
    courseId: null,
    assignmentId: null,
    tags: ['scholarory-build', 'knowledge-graph'],
    status: 'scheduled',
    startTime: '19:00',
    endTime: '21:00',
    updatedAt: '2026-06-03',
  },
  {
    id: 'note-tana-friction',
    type: 'note',
    title: 'Tana friction with freewriting',
    description: 'Observation that node-based writing can interrupt paragraph drafting and paper flow.',
    date: '2026-05-31',
    courseId: 'course-dmin-851',
    assignmentId: 'assignment-org-phase',
    tags: ['writing-workflow', 'second-brain'],
    status: 'needs-review',
    updatedAt: '2026-05-31',
  },
  {
    id: 'note-daily-pages-hub',
    type: 'note',
    title: 'Daily Pages as Scholarory Hub',
    description: 'Daily Pages should connect tasks, classes, assignments, notes, research, habits, goals, focus sessions, and planner blocks.',
    date: '2026-06-03',
    courseId: null,
    assignmentId: null,
    tags: ['daily-pages', 'planner', 'scholarory-build'],
    status: 'active',
    updatedAt: '2026-06-03',
  },
  {
    id: 'source-spiritus',
    type: 'research-source',
    title: 'Spiritus: ORU Journal of Theology',
    description: 'Potential journal source connected to book review publication research.',
    date: null,
    courseId: 'course-dmin-851',
    assignmentId: 'assignment-org-phase',
    tags: ['journal', 'theology', 'book-review'],
    status: 'active',
    updatedAt: '2026-06-01',
  },
  {
    id: 'source-christian-education-journal',
    type: 'research-source',
    title: 'Christian Education Journal',
    description: 'Potential journal source connected to Christian education and spiritual formation scholarship.',
    date: null,
    courseId: 'course-dmin-851',
    assignmentId: 'assignment-org-phase',
    tags: ['journal', 'christian-education', 'book-review'],
    status: 'active',
    updatedAt: '2026-06-01',
  },
  {
    id: 'tag-daily-pages',
    type: 'tag',
    title: 'Daily Pages',
    description: 'Central daily workspace connecting Scholarory modules into one operating hub.',
    date: null,
    courseId: null,
    assignmentId: null,
    tags: [],
    status: 'active',
    updatedAt: '2026-06-03',
  },
  {
    id: 'tag-knowledge-graph',
    type: 'tag',
    title: 'Knowledge Graph',
    description: 'Visual and relational map of notes, tags, courses, assignments, sources, and daily work.',
    date: null,
    courseId: null,
    assignmentId: null,
    tags: [],
    status: 'active',
    updatedAt: '2026-06-03',
  },
  {
    id: 'tag-book-review',
    type: 'tag',
    title: 'Book Review',
    description: 'Research and writing related to doctoral book review assignments and possible journal submissions.',
    date: null,
    courseId: null,
    assignmentId: null,
    tags: [],
    status: 'active',
    updatedAt: '2026-06-01',
  },
  {
    id: 'tag-second-brain',
    type: 'tag',
    title: 'Second Brain',
    description: 'Systems for organizing notes, research, sources, writing, and academic workflows.',
    date: null,
    courseId: null,
    assignmentId: null,
    tags: [],
    status: 'active',
    updatedAt: '2026-05-31',
  },
]

export const mockKnowledgeGraphLinks = [
  {
    id: 'link-daily-note-hub',
    source: 'daily-2026-06-03',
    target: 'note-daily-pages-hub',
    type: 'created-on-daily-page',
    label: 'Created on daily page',
    strength: 5,
  },
  {
    id: 'link-daily-planner',
    source: 'daily-2026-06-03',
    target: 'planner-block-study-1',
    type: 'scheduled-in-planner',
    label: 'Scheduled in planner',
    strength: 5,
  },
  {
    id: 'link-planner-graph',
    source: 'planner-block-study-1',
    target: 'tag-knowledge-graph',
    type: 'tagged-with',
    label: 'Tagged with',
    strength: 4,
  },
  {
    id: 'link-daily-tag',
    source: 'note-daily-pages-hub',
    target: 'tag-daily-pages',
    type: 'tagged-with',
    label: 'Tagged with',
    strength: 5,
  },
  {
    id: 'link-daily-note-builds',
    source: 'note-daily-pages-hub',
    target: 'tag-knowledge-graph',
    type: 'builds-on',
    label: 'Builds on',
    strength: 3,
  },
  {
    id: 'link-course-assignment',
    source: 'assignment-org-phase',
    target: 'course-dmin-851',
    type: 'belongs-to-course',
    label: 'Belongs to course',
    strength: 5,
  },
  {
    id: 'link-note-assignment',
    source: 'note-tana-friction',
    target: 'assignment-org-phase',
    type: 'used-in-assignment',
    label: 'Used in assignment',
    strength: 4,
  },
  {
    id: 'link-note-second-brain',
    source: 'note-tana-friction',
    target: 'tag-second-brain',
    type: 'tagged-with',
    label: 'Tagged with',
    strength: 5,
  },
  {
    id: 'link-source-spiritus-assignment',
    source: 'source-spiritus',
    target: 'assignment-org-phase',
    type: 'used-in-assignment',
    label: 'Used in assignment',
    strength: 4,
  },
  {
    id: 'link-source-cej-assignment',
    source: 'source-christian-education-journal',
    target: 'assignment-org-phase',
    type: 'used-in-assignment',
    label: 'Used in assignment',
    strength: 4,
  },
  {
    id: 'link-spiritus-book-review',
    source: 'source-spiritus',
    target: 'tag-book-review',
    type: 'tagged-with',
    label: 'Tagged with',
    strength: 5,
  },
  {
    id: 'link-cej-book-review',
    source: 'source-christian-education-journal',
    target: 'tag-book-review',
    type: 'tagged-with',
    label: 'Tagged with',
    strength: 5,
  },
  {
    id: 'link-assignment-book-review',
    source: 'assignment-org-phase',
    target: 'tag-book-review',
    type: 'tagged-with',
    label: 'Tagged with',
    strength: 5,
  },
]

export const mockGraphActivity = [
  {
    id: 'activity-1',
    action: 'Created graph node',
    title: 'Daily Pages as Scholarory Hub',
    type: 'note',
    date: '2026-06-03',
  },
  {
    id: 'activity-2',
    action: 'Connected source',
    title: 'Christian Education Journal',
    type: 'research-source',
    date: '2026-06-01',
  },
  {
    id: 'activity-3',
    action: 'Added assignment relationship',
    title: 'Organization Phase Assignment',
    type: 'assignment',
    date: '2026-06-01',
  },
  {
    id: 'activity-4',
    action: 'Tagged note',
    title: 'Tana friction with freewriting',
    type: 'note',
    date: '2026-05-31',
  },
]

export const mockGraphDiscoveryItems = [
  {
    id: 'discovery-1',
    category: 'weak-support',
    title: 'Organization Phase Assignment may need more research support.',
    description: 'This assignment is connected to 2 research sources. Add more sources if the final paper needs stronger support.',
    priority: 'medium',
    relatedNodeId: 'assignment-org-phase',
  },
  {
    id: 'discovery-2',
    category: 'frequent-tag',
    title: 'Book Review appears across multiple connected items.',
    description: 'This tag connects journals, assignments, and course work.',
    priority: 'low',
    relatedNodeId: 'tag-book-review',
  },
  {
    id: 'discovery-3',
    category: 'daily-hub',
    title: 'Daily Pages are becoming the Scholarory command center.',
    description: 'Daily Pages now connect notes, planner blocks, tags, and current work.',
    priority: 'high',
    relatedNodeId: 'tag-daily-pages',
  },
  {
    id: 'discovery-4',
    category: 'needs-review',
    title: 'One note is marked needs review.',
    description: 'Review the Tana friction note and decide whether it should become a Scholarory design requirement.',
    priority: 'medium',
    relatedNodeId: 'note-tana-friction',
  },
]

export function getNodeById(nodeId) {
  return mockKnowledgeGraphNodes.find((node) => node.id === nodeId) || null
}

export function getLinksForNode(nodeId) {
  return mockKnowledgeGraphLinks.filter(
    (link) => link.source === nodeId || link.target === nodeId,
  )
}

export function getRelatedNodes(nodeId) {
  const links = getLinksForNode(nodeId)

  return links
    .map((link) => {
      const relatedId = link.source === nodeId ? link.target : link.source
      return getNodeById(relatedId)
    })
    .filter(Boolean)
}

export function getNodesByType(type) {
  if (!type || type === 'all') return mockKnowledgeGraphNodes
  return mockKnowledgeGraphNodes.filter((node) => node.type === type)
}

export function getNodesByTag(tag) {
  if (!tag || tag === 'all') return mockKnowledgeGraphNodes

  return mockKnowledgeGraphNodes.filter((node) =>
    node.tags?.some((nodeTag) => nodeTag.toLowerCase() === tag.toLowerCase()),
  )
}

export function getNodesForToday(today = '2026-06-03') {
  return mockKnowledgeGraphNodes.filter((node) => node.date === today)
}

export function getGraphStats() {
  return {
    nodeCount: mockKnowledgeGraphNodes.length,
    relationshipCount: mockKnowledgeGraphLinks.length,
    noteCount: mockKnowledgeGraphNodes.filter((node) => node.type === 'note').length,
    sourceCount: mockKnowledgeGraphNodes.filter((node) => node.type === 'research-source').length,
    tagCount: mockKnowledgeGraphNodes.filter((node) => node.type === 'tag').length,
    assignmentCount: mockKnowledgeGraphNodes.filter((node) => node.type === 'assignment').length,
    courseCount: mockKnowledgeGraphNodes.filter((node) => node.type === 'course').length,
    dailyPageCount: mockKnowledgeGraphNodes.filter((node) => node.type === 'daily-page').length,
  }
}

export function getTopTags(limit = 5) {
  const tagCounts = {}

  mockKnowledgeGraphNodes.forEach((node) => {
    node.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}