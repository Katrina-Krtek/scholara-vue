const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = getLocalDateKey()

export const graphNodeTypes = [
  'course',
  'assignment',
  'research-source',
  'book',
  'note',
  'concept',
  'term',
  'person',
  'flashcard',
  'tag',
  'daily-page',
  'planner-block',
]

export const nodeTypeLabels = {
  course: 'Courses',
  assignment: 'Assignments',
  'research-source': 'Research Sources',
  book: 'Books',
  note: 'Notes',
  concept: 'Concepts',
  term: 'Terms',
  person: 'People',
  flashcard: 'Flashcards',
  tag: 'Knowledge Tags',
  'daily-page': 'Daily Pages',
  'planner-block': 'Planner Blocks',
}

export const mockKnowledgeGraphNodes = [
  {
    id: 'course-1',
    entityId: 'course-1',
    title: 'DMIN 851',
    type: 'course',
    description: 'Doctor of Ministry Project Design.',
    tags: ['Doctor of Ministry', 'Research'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/courses',
  },
  {
    id: 'course-2',
    entityId: 'course-2',
    title: 'Spiritual Formation',
    type: 'course',
    description: 'Studies in Christian spiritual formation.',
    tags: ['Spiritual Formation', 'Theology'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/courses',
  },
  {
    id: 'assignment-1',
    entityId: 'assignment-1',
    title: 'Organization Phase',
    type: 'assignment',
    description: 'Module 2 organization phase assignment.',
    tags: ['DMIN 851', 'Micro-Project'],
    status: 'in-progress',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/assignments',
  },
  {
    id: 'assignment-2',
    entityId: 'assignment-2',
    title: 'Book Review',
    type: 'assignment',
    description: 'Prepare a scholarly book review for journal submission.',
    tags: ['Book Review', 'Writing'],
    status: 'planned',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/assignments',
  },
  {
    id: 'source-1',
    entityId: 'source-1',
    title: 'Celebration of Discipline',
    type: 'research-source',
    description: 'Richard Foster on Christian spiritual disciplines.',
    tags: ['Spiritual Formation', 'Spiritual Disciplines'],
    status: 'reading',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/sources',
  },
  {
    id: 'source-2',
    entityId: 'source-2',
    title: 'The Divine Conspiracy',
    type: 'research-source',
    description: 'Dallas Willard on discipleship and the kingdom of God.',
    tags: ['Discipleship', 'Kingdom of God'],
    status: 'reference',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/sources',
  },
  {
    id: 'source-3',
    entityId: 'source-3',
    title: 'Christian Education Journal',
    type: 'research-source',
    description: 'Potential journal for scholarly submission.',
    tags: ['Journal', 'Christian Education'],
    status: 'candidate',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/journals',
  },
  {
    id: 'note-1',
    entityId: 'note-1',
    title: 'Spiritual Disciplines Notes',
    type: 'note',
    description: 'Reading notes about formative Christian practices.',
    tags: ['Spiritual Formation', 'Practices'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: null,
  },
  {
    id: 'note-2',
    entityId: 'note-2',
    title: 'Project Ideas',
    type: 'note',
    description: 'Possible directions for the DMIN micro-project.',
    tags: ['DMIN 851', 'Project'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: null,
  },
  {
    id: 'concept-1',
    entityId: 'concept-1',
    title: 'Spiritual Formation',
    type: 'concept',
    description: 'The process of being formed into the likeness of Christ.',
    tags: ['Spiritual Formation', 'Discipleship'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/concepts',
  },
  {
    id: 'concept-2',
    entityId: 'concept-2',
    title: 'Discipleship',
    type: 'concept',
    description: 'Following Jesus through belief, practice, and community.',
    tags: ['Discipleship', 'Spiritual Formation'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/concepts',
  },
  {
    id: 'concept-3',
    entityId: 'concept-3',
    title: 'Sanctification',
    type: 'concept',
    description: 'Growth in holiness through the work of the Holy Spirit.',
    tags: ['Sanctification', 'Theology'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/concepts',
  },
  {
    id: 'term-1',
    entityId: 'term-1',
    title: 'Lectio Divina',
    type: 'term',
    description: 'A prayerful method of reading and responding to Scripture.',
    tags: ['Prayer', 'Scripture'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/terms',
  },
  {
    id: 'term-2',
    entityId: 'term-2',
    title: 'Rule of Life',
    type: 'term',
    description: 'An intentional pattern of practices and relationships.',
    tags: ['Practices', 'Spiritual Formation'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/terms',
  },
  {
    id: 'person-1',
    entityId: 'person-1',
    title: 'Richard Foster',
    type: 'person',
    description: 'Author associated with spiritual formation and disciplines.',
    tags: ['Author', 'Spiritual Formation'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: null,
  },
  {
    id: 'person-2',
    entityId: 'person-2',
    title: 'Dallas Willard',
    type: 'person',
    description: 'Author and philosopher associated with discipleship.',
    tags: ['Author', 'Discipleship'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: null,
  },
  {
    id: 'flashcard-1',
    entityId: 'flashcard-1',
    title: 'Formation Definition',
    type: 'flashcard',
    description: 'Review the definition of Christian spiritual formation.',
    tags: ['Study', 'Spiritual Formation'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/flashcards',
  },
  {
    id: 'flashcard-2',
    entityId: 'flashcard-2',
    title: 'Discipleship Model',
    type: 'flashcard',
    description: 'Review a model of Christian discipleship.',
    tags: ['Study', 'Discipleship'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: 'course-2',
    route: '/flashcards',
  },
  {
    id: 'tag-1',
    entityId: 'tag-1',
    title: 'Spiritual Formation',
    type: 'tag',
    description: 'Knowledge Tag connecting formation-related records.',
    tags: ['Knowledge Tag'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: null,
    route: '/knowledge-tags',
  },
  {
    id: 'daily-page-1',
    entityId: today,
    title: `Daily Page — ${today}`,
    type: 'daily-page',
    description: 'Today’s tasks, assignments, notes, and learning activity.',
    tags: ['Daily Page'],
    status: 'active',
    updatedAt: today,
    date: today,
    courseId: null,
    route: '/daily',
  },
  {
    id: 'planner-block-1',
    entityId: 'planner-block-1',
    title: 'DMIN Reading Block',
    type: 'planner-block',
    description: 'Scheduled reading and research time.',
    tags: ['Planning', 'DMIN 851'],
    status: 'scheduled',
    updatedAt: today,
    date: today,
    courseId: 'course-1',
    route: '/planner',
  },
]

export const mockKnowledgeGraphLinks = [
  {
    id: 'link-course-1-assignment-1',
    source: 'course-1',
    target: 'assignment-1',
    label: 'Contains assignment',
    strength: 5,
  },
  {
    id: 'link-course-1-assignment-2',
    source: 'course-1',
    target: 'assignment-2',
    label: 'Contains assignment',
    strength: 5,
  },
  {
    id: 'link-assignment-1-source-1',
    source: 'assignment-1',
    target: 'source-1',
    label: 'Uses source',
    strength: 4,
  },
  {
    id: 'link-assignment-1-source-2',
    source: 'assignment-1',
    target: 'source-2',
    label: 'Uses source',
    strength: 4,
  },
  {
    id: 'link-assignment-2-source-3',
    source: 'assignment-2',
    target: 'source-3',
    label: 'Targets journal',
    strength: 4,
  },
  {
    id: 'link-assignment-1-note-1',
    source: 'assignment-1',
    target: 'note-1',
    label: 'Supported by note',
    strength: 3,
  },
  {
    id: 'link-assignment-2-note-2',
    source: 'assignment-2',
    target: 'note-2',
    label: 'Developed in note',
    strength: 3,
  },
  {
    id: 'link-note-1-concept-1',
    source: 'note-1',
    target: 'concept-1',
    label: 'Explores concept',
    strength: 4,
  },
  {
    id: 'link-note-1-concept-2',
    source: 'note-1',
    target: 'concept-2',
    label: 'Explores concept',
    strength: 3,
  },
  {
    id: 'link-concept-1-concept-3',
    source: 'concept-1',
    target: 'concept-3',
    label: 'Related concept',
    strength: 4,
  },
  {
    id: 'link-concept-1-term-1',
    source: 'concept-1',
    target: 'term-1',
    label: 'Practiced through',
    strength: 3,
  },
  {
    id: 'link-concept-1-term-2',
    source: 'concept-1',
    target: 'term-2',
    label: 'Structured through',
    strength: 4,
  },
  {
    id: 'link-person-1-source-1',
    source: 'person-1',
    target: 'source-1',
    label: 'Authored',
    strength: 5,
  },
  {
    id: 'link-person-2-source-2',
    source: 'person-2',
    target: 'source-2',
    label: 'Authored',
    strength: 5,
  },
  {
    id: 'link-concept-1-flashcard-1',
    source: 'concept-1',
    target: 'flashcard-1',
    label: 'Studied with',
    strength: 2,
  },
  {
    id: 'link-concept-2-flashcard-2',
    source: 'concept-2',
    target: 'flashcard-2',
    label: 'Studied with',
    strength: 2,
  },
  {
    id: 'link-course-2-concept-1',
    source: 'course-2',
    target: 'concept-1',
    label: 'Teaches concept',
    strength: 5,
  },
  {
    id: 'link-course-2-concept-2',
    source: 'course-2',
    target: 'concept-2',
    label: 'Teaches concept',
    strength: 5,
  },
  {
    id: 'link-tag-1-concept-1',
    source: 'tag-1',
    target: 'concept-1',
    label: 'Tags concept',
    strength: 4,
  },
  {
    id: 'link-tag-1-note-1',
    source: 'tag-1',
    target: 'note-1',
    label: 'Tags note',
    strength: 3,
  },
  {
    id: 'link-daily-page-assignment-1',
    source: 'daily-page-1',
    target: 'assignment-1',
    label: 'Scheduled today',
    strength: 3,
  },
  {
    id: 'link-daily-page-planner-1',
    source: 'daily-page-1',
    target: 'planner-block-1',
    label: 'Includes planner block',
    strength: 4,
  },
  {
    id: 'link-planner-course-1',
    source: 'planner-block-1',
    target: 'course-1',
    label: 'Scheduled for course',
    strength: 4,
  },
]

export const mockGraphDiscoveryItems = [
  {
    id: 'discovery-1',
    category: 'strong-connection',
    priority: 'high',
    title: 'Spiritual Formation is a major knowledge hub',
    description:
      'This concept connects courses, notes, terms, flashcards, and Knowledge Tags.',
    relatedNodeId: 'concept-1',
  },
  {
    id: 'discovery-2',
    category: 'research-pattern',
    priority: 'medium',
    title: 'The Organization Phase uses several sources',
    description:
      'Review whether each linked source has complete notes and citation details.',
    relatedNodeId: 'assignment-1',
  },
  {
    id: 'discovery-3',
    category: 'study-opportunity',
    priority: 'low',
    title: 'Discipleship has a connected flashcard',
    description:
      'The concept and flashcard can be reviewed together during a study session.',
    relatedNodeId: 'concept-2',
  },
]

export function getGraphStats(
  nodes = mockKnowledgeGraphNodes,
  links = mockKnowledgeGraphLinks,
) {
  const countsByType = {}

  graphNodeTypes.forEach((type) => {
    countsByType[type] = nodes.filter((node) => node.type === type).length
  })

  return {
    nodeCount: nodes.length,
    relationshipCount: links.length,
    totalNodes: nodes.length,
    totalConnections: links.length,
    countsByType,
  }
}

export function getLinksForNode(
  nodeId,
  links = mockKnowledgeGraphLinks,
) {
  return links.filter((link) => {
    return link.source === nodeId || link.target === nodeId
  })
}

export function getRelatedNodes(
  nodeId,
  nodes = mockKnowledgeGraphNodes,
  links = mockKnowledgeGraphLinks,
) {
  const relatedIds = new Set()

  getLinksForNode(nodeId, links).forEach((link) => {
    relatedIds.add(
      link.source === nodeId ? link.target : link.source,
    )
  })

  return nodes.filter((node) => relatedIds.has(node.id))
}

export function getGraphNodeById(
  nodeId,
  nodes = mockKnowledgeGraphNodes,
) {
  return nodes.find((node) => node.id === nodeId) || null
}

/*
 * Temporary compatibility exports.
 * These prevent older graph imports from breaking while the duplicate
 * graph implementation is being removed.
 */
export const mockNodes = mockKnowledgeGraphNodes
export const mockLinks = mockKnowledgeGraphLinks
export const nodeTypes = graphNodeTypes
export const graphStats = getGraphStats()