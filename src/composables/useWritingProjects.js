// src/composables/useWritingProjects.js

import { computed, ref } from 'vue'

const STORAGE_KEY = 'scholarory-writing-projects'
const MAX_DRAFT_VERSIONS = 25

const LEGACY_STORAGE_KEYS = [
  'scholarory_writing_projects',
  'writingProjects',
]

const projects = ref([])
const initialized = ref(false)

export const WRITING_TYPES = [
  {
    value: 'paper',
    label: 'Academic Paper',
    icon: '📄',
  },
  {
    value: 'article',
    label: 'Article',
    icon: '📰',
  },
  {
    value: 'book-review',
    label: 'Book Review',
    icon: '📘',
  },
  {
    value: 'discussion',
    label: 'Discussion Post',
    icon: '💬',
  },
  {
    value: 'reflection',
    label: 'Reflection',
    icon: '🪞',
  },
  {
    value: 'sermon',
    label: 'Sermon or Lesson',
    icon: '📖',
  },
  {
    value: 'outline',
    label: 'Outline',
    icon: '🗂️',
  },
  {
    value: 'dissertation',
    label: 'Dissertation',
    icon: '🎓',
  },
  {
    value: 'other',
    label: 'Other Writing',
    icon: '✍️',
  },
]

export const WRITING_STATUSES = [
  {
    value: 'planning',
    label: 'Planning',
  },
  {
    value: 'outlining',
    label: 'Outlining',
  },
  {
    value: 'drafting',
    label: 'Drafting',
  },
  {
    value: 'revising',
    label: 'Revising',
  },
  {
    value: 'proofreading',
    label: 'Proofreading',
  },
  {
    value: 'complete',
    label: 'Complete',
  },
]

export const WRITING_PRIORITIES = [
  {
    value: 'low',
    label: 'Low',
  },
  {
    value: 'normal',
    label: 'Normal',
  },
  {
    value: 'high',
    label: 'High',
  },
  {
    value: 'urgent',
    label: 'Urgent',
  },
]

function nowIso() {
  return new Date().toISOString()
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    return fallback
  }

  return Math.round(number)
}

function normalizeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback
  }

  return String(value).trim()
}

function normalizeWritingType(value) {
  const validType = WRITING_TYPES.some(
    (type) => type.value === value,
  )

  return validType ? value : 'paper'
}

function normalizeWritingStatus(value) {
  const validStatus = WRITING_STATUSES.some(
    (status) => status.value === value,
  )

  return validStatus ? value : 'planning'
}

function normalizeWritingPriority(value) {
  const validPriority = WRITING_PRIORITIES.some(
    (priority) => priority.value === value,
  )

  return validPriority ? value : 'normal'
}

function createProjectId() {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)

  return `writing-${Date.now()}-${randomPart}`
}

function createVersionId() {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)

  return `version-${Date.now()}-${randomPart}`
}

function createBlankDocument() {
  return '<p></p>'
}

function decodeHtmlEntities(value) {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return String(value || '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = String(value || '')

  return textarea.value
}

export function htmlToPlainText(html = '') {
  const value = String(html || '')

  if (!value) {
    return ''
  }

  const textWithBreaks = value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')

  return decodeHtmlEntities(textWithBreaks)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function countWordsFromText(text = '') {
  const cleanedText = String(text || '')
    .replace(/[—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanedText) {
    return 0
  }

  const words = cleanedText.match(
    /[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu,
  )

  return words ? words.length : 0
}

export function countWordsFromHtml(html = '') {
  return countWordsFromText(
    htmlToPlainText(html),
  )
}

export function countCharactersFromHtml(
  html = '',
  includeSpaces = true,
) {
  const plainText = htmlToPlainText(html)

  if (includeSpaces) {
    return plainText.length
  }

  return plainText.replace(/\s/g, '').length
}

export function countParagraphsFromHtml(html = '') {
  const plainText = htmlToPlainText(html)

  if (!plainText) {
    return 0
  }

  return plainText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .length
}

export function countSentencesFromHtml(html = '') {
  const plainText = htmlToPlainText(html)

  if (!plainText) {
    return 0
  }

  const sentences = plainText.match(
    /[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g,
  )

  return sentences
    ? sentences
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .length
    : 0
}

export function calculateReadingTime(wordCount = 0) {
  const normalizedWordCount =
    normalizeNumber(wordCount)

  if (normalizedWordCount === 0) {
    return 0
  }

  return Math.max(
    1,
    Math.ceil(normalizedWordCount / 225),
  )
}

function normalizeDraftVersion(version, index = 0) {
  const timestamp = nowIso()

  const contentHtml =
    typeof version.contentHtml === 'string'
      ? version.contentHtml
      : typeof version.documentHtml === 'string'
        ? version.documentHtml
        : typeof version.content === 'string'
          ? version.content
          : createBlankDocument()

  const plainText =
    htmlToPlainText(contentHtml)

  const calculatedWordCount =
    countWordsFromText(plainText)

  return {
    id: normalizeString(
      version.id ||
        version.versionId ||
        `version-${Date.now()}-${index}`,
    ),

    name: normalizeString(
      version.name ||
        version.label ||
        `Version ${index + 1}`,
    ),

    createdAt:
      version.createdAt ||
      version.created_at ||
      timestamp,

    documentTitle: normalizeString(
      version.documentTitle ||
        version.title ||
        'Untitled Writing Project',
    ),

    contentHtml,
    plainText,

    wordCount: normalizeNumber(
      version.wordCount ??
        version.currentWords ??
        calculatedWordCount,
      calculatedWordCount,
    ),

    source: normalizeString(
      version.source ||
        'manual',
      'manual',
    ),
  }
}

function normalizeDraftVersions(project) {
  const rawVersions =
    Array.isArray(project.draftVersions)
      ? project.draftVersions
      : Array.isArray(project.versionHistory)
        ? project.versionHistory
        : Array.isArray(project.versions)
          ? project.versions
          : []

  return rawVersions
    .map(normalizeDraftVersion)
    .sort(
      (firstVersion, secondVersion) =>
        new Date(secondVersion.createdAt).getTime() -
        new Date(firstVersion.createdAt).getTime(),
    )
    .slice(0, MAX_DRAFT_VERSIONS)
}

function createVersionSnapshot(
  project,
  name,
  source = 'manual',
) {
  const contentHtml =
    typeof project.contentHtml === 'string'
      ? project.contentHtml
      : createBlankDocument()

  const plainText =
    htmlToPlainText(contentHtml)

  return normalizeDraftVersion({
    id: createVersionId(),
    name,
    createdAt: nowIso(),
    documentTitle:
      project.documentTitle ||
      project.title ||
      'Untitled Writing Project',
    contentHtml,
    plainText,
    wordCount:
      countWordsFromText(plainText),
    source,
  })
}

function normalizeProject(project, index = 0) {
  const timestamp = nowIso()

  const contentHtml =
    typeof project.contentHtml === 'string'
      ? project.contentHtml
      : typeof project.documentHtml === 'string'
        ? project.documentHtml
        : typeof project.content === 'string'
          ? project.content
          : createBlankDocument()

  const calculatedWordCount =
    countWordsFromHtml(contentHtml)

  const storedWordCount = normalizeNumber(
    project.currentWords ??
      project.wordCount ??
      calculatedWordCount,
  )

  const currentWords =
    calculatedWordCount > 0
      ? calculatedWordCount
      : storedWordCount

  return {
    id: normalizeString(
      project.id ||
        project.projectId ||
        `writing-${Date.now()}-${index}`,
    ),

    title: normalizeString(
      project.title ||
        project.name ||
        'Untitled Writing Project',
    ),

    type: normalizeWritingType(
      project.type ||
        project.projectType ||
        'paper',
    ),

    status: normalizeWritingStatus(
      project.status ||
        project.stage ||
        'planning',
    ),

    priority: normalizeWritingPriority(
      project.priority ||
        'normal',
    ),

    course: normalizeString(
      project.course ||
        project.courseName ||
        '',
    ),

    courseId: normalizeString(
      project.courseId ||
        project.course_id ||
        '',
    ),

    assignment: normalizeString(
      project.assignment ||
        project.assignmentName ||
        '',
    ),

    assignmentId: normalizeString(
      project.assignmentId ||
        project.assignment_id ||
        '',
    ),

    description: normalizeString(
      project.description ||
        project.notes ||
        '',
    ),

    dueDate: normalizeString(
      project.dueDate ||
        project.deadline ||
        '',
    ),

    wordGoal: normalizeNumber(
      project.wordGoal ??
        project.goalWords ??
        1500,
      1500,
    ),

    currentWords,

    contentHtml,

    plainText:
      htmlToPlainText(contentHtml),

    documentTitle: normalizeString(
      project.documentTitle ||
        project.title ||
        project.name ||
        'Untitled Writing Project',
    ),

    outline: Array.isArray(project.outline)
      ? project.outline
      : [],

    researchSourceIds: Array.isArray(
      project.researchSourceIds,
    )
      ? project.researchSourceIds
      : Array.isArray(project.sourceIds)
        ? project.sourceIds
        : [],

    citationIds: Array.isArray(
      project.citationIds,
    )
      ? project.citationIds
      : [],

    tags: Array.isArray(project.tags)
      ? project.tags
      : [],

    draftVersions:
      normalizeDraftVersions(project),

    editorSettings: {
      focusMode:
        project.editorSettings?.focusMode === true,

      spellcheck:
        project.editorSettings?.spellcheck !== false,

      fontSize: normalizeNumber(
        project.editorSettings?.fontSize,
        18,
      ),

      lineHeight:
        Number(
          project.editorSettings?.lineHeight,
        ) || 1.7,

      documentWidth:
        project.editorSettings?.documentWidth ||
        'normal',
    },

    createdAt:
      project.createdAt ||
      project.created_at ||
      timestamp,

    updatedAt:
      project.updatedAt ||
      project.updated_at ||
      project.createdAt ||
      timestamp,

    lastSavedAt:
      project.lastSavedAt ||
      project.last_saved_at ||
      project.updatedAt ||
      timestamp,

    completedAt:
      project.completedAt ||
      project.completed_at ||
      '',
  }
}

function readStorageKey(key) {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) {
    return []
  }

  const storedValue =
    window.localStorage.getItem(key)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue)

    if (Array.isArray(parsedValue)) {
      return parsedValue
    }

    if (Array.isArray(parsedValue?.projects)) {
      return parsedValue.projects
    }

    if (Array.isArray(parsedValue?.items)) {
      return parsedValue.items
    }

    if (Array.isArray(parsedValue?.data)) {
      return parsedValue.data
    }
  } catch (error) {
    console.warn(
      `Scholarory Writing Projects could not read "${key}".`,
      error,
    )
  }

  return []
}

function writeProjectsToStorage() {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects.value),
  )
}

function loadProjects() {
  if (initialized.value) {
    return projects.value
  }

  const currentProjects =
    readStorageKey(STORAGE_KEY)

  if (currentProjects.length > 0) {
    projects.value =
      currentProjects.map(normalizeProject)

    initialized.value = true

    writeProjectsToStorage()

    return projects.value
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyProjects =
      readStorageKey(legacyKey)

    if (legacyProjects.length === 0) {
      continue
    }

    projects.value =
      legacyProjects.map(normalizeProject)

    initialized.value = true

    writeProjectsToStorage()

    return projects.value
  }

  projects.value = []
  initialized.value = true

  return projects.value
}

function ensureInitialized() {
  if (!initialized.value) {
    loadProjects()
  }
}

function getProjectIndex(projectId) {
  ensureInitialized()

  return projects.value.findIndex(
    (project) =>
      String(project.id) ===
      String(projectId),
  )
}

function getProjectById(projectId) {
  ensureInitialized()

  return (
    projects.value.find(
      (project) =>
        String(project.id) ===
        String(projectId),
    ) || null
  )
}

function addProject(projectData = {}) {
  ensureInitialized()

  const timestamp = nowIso()

  const project = normalizeProject({
    id: createProjectId(),
    title:
      projectData.title ||
      'Untitled Writing Project',
    type:
      projectData.type ||
      'paper',
    status:
      projectData.status ||
      'planning',
    priority:
      projectData.priority ||
      'normal',
    course:
      projectData.course ||
      '',
    courseId:
      projectData.courseId ||
      '',
    assignment:
      projectData.assignment ||
      '',
    assignmentId:
      projectData.assignmentId ||
      '',
    description:
      projectData.description ||
      '',
    dueDate:
      projectData.dueDate ||
      '',
    wordGoal:
      projectData.wordGoal ??
      1500,
    currentWords:
      projectData.currentWords ??
      0,
    contentHtml:
      projectData.contentHtml ||
      createBlankDocument(),
    tags:
      projectData.tags ||
      [],
    researchSourceIds:
      projectData.researchSourceIds ||
      [],
    citationIds:
      projectData.citationIds ||
      [],
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSavedAt: timestamp,
  })

  projects.value.unshift(project)

  writeProjectsToStorage()

  return project
}

function updateProject(
  projectId,
  updates = {},
) {
  const projectIndex =
    getProjectIndex(projectId)

  if (projectIndex === -1) {
    return null
  }

  const existingProject =
    projects.value[projectIndex]

  const timestamp = nowIso()

  const updatedProject = normalizeProject({
    ...existingProject,
    ...updates,
    id: existingProject.id,
    createdAt: existingProject.createdAt,
    updatedAt: timestamp,
    lastSavedAt:
      updates.lastSavedAt ||
      timestamp,
  })

  if (
    updatedProject.status === 'complete' &&
    !updatedProject.completedAt
  ) {
    updatedProject.completedAt = timestamp
  }

  if (
    updatedProject.status !== 'complete'
  ) {
    updatedProject.completedAt = ''
  }

  projects.value[projectIndex] =
    updatedProject

  writeProjectsToStorage()

  return updatedProject
}

function updateProjectContent(
  projectId,
  contentHtml,
  options = {},
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return null
  }

  const html =
    typeof contentHtml === 'string'
      ? contentHtml
      : ''

  const plainText =
    htmlToPlainText(html)

  const wordCount =
    countWordsFromText(plainText)

  const timestamp = nowIso()

  return updateProject(
    projectId,
    {
      contentHtml: html,
      plainText,
      currentWords: wordCount,
      lastSavedAt: timestamp,
      ...options,
    },
  )
}

function getDraftVersions(projectId) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return []
  }

  return [...project.draftVersions].sort(
    (firstVersion, secondVersion) =>
      new Date(secondVersion.createdAt).getTime() -
      new Date(firstVersion.createdAt).getTime(),
  )
}

function getDraftVersionById(
  projectId,
  versionId,
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return null
  }

  return (
    project.draftVersions.find(
      (version) =>
        String(version.id) ===
        String(versionId),
    ) || null
  )
}

function createDraftVersion(
  projectId,
  versionName = '',
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return null
  }

  const nextVersionNumber =
    project.draftVersions.length + 1

  const normalizedName =
    normalizeString(
      versionName,
      `Version ${nextVersionNumber}`,
    ) || `Version ${nextVersionNumber}`

  const version =
    createVersionSnapshot(
      project,
      normalizedName,
      'manual',
    )

  const updatedProject =
    updateProject(
      projectId,
      {
        draftVersions: [
          version,
          ...project.draftVersions,
        ].slice(0, MAX_DRAFT_VERSIONS),
      },
    )

  if (!updatedProject) {
    return null
  }

  return (
    updatedProject.draftVersions.find(
      (draftVersion) =>
        draftVersion.id === version.id,
    ) || version
  )
}

function renameDraftVersion(
  projectId,
  versionId,
  versionName,
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return null
  }

  const normalizedName =
    normalizeString(versionName)

  if (!normalizedName) {
    return null
  }

  let renamedVersion = null

  const draftVersions =
    project.draftVersions.map(
      (version) => {
        if (
          String(version.id) !==
          String(versionId)
        ) {
          return version
        }

        renamedVersion = {
          ...version,
          name: normalizedName,
        }

        return renamedVersion
      },
    )

  if (!renamedVersion) {
    return null
  }

  const updatedProject =
    updateProject(
      projectId,
      {
        draftVersions,
      },
    )

  if (!updatedProject) {
    return null
  }

  return (
    updatedProject.draftVersions.find(
      (version) =>
        String(version.id) ===
        String(versionId),
    ) || renamedVersion
  )
}

function deleteDraftVersion(
  projectId,
  versionId,
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return false
  }

  const draftVersions =
    project.draftVersions.filter(
      (version) =>
        String(version.id) !==
        String(versionId),
    )

  if (
    draftVersions.length ===
    project.draftVersions.length
  ) {
    return false
  }

  return Boolean(
    updateProject(
      projectId,
      {
        draftVersions,
      },
    ),
  )
}

function restoreDraftVersion(
  projectId,
  versionId,
  options = {},
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return null
  }

  const version =
    getDraftVersionById(
      projectId,
      versionId,
    )

  if (!version) {
    return null
  }

  const createSafetyCopy =
    options.createSafetyCopy !== false

  let draftVersions =
    [...project.draftVersions]

  const currentTitle =
    project.documentTitle ||
    project.title ||
    'Untitled Writing Project'

  const documentChanged =
    project.contentHtml !==
      version.contentHtml ||
    currentTitle !==
      version.documentTitle

  if (
    createSafetyCopy &&
    documentChanged
  ) {
    const safetyVersion =
      createVersionSnapshot(
        project,
        `Before restoring ${version.name}`,
        'restore-safety',
      )

    draftVersions = [
      safetyVersion,
      ...draftVersions,
    ].slice(0, MAX_DRAFT_VERSIONS)
  }

  return updateProject(
    projectId,
    {
      title:
        version.documentTitle ||
        currentTitle,

      documentTitle:
        version.documentTitle ||
        currentTitle,

      contentHtml:
        version.contentHtml,

      plainText:
        version.plainText ||
        htmlToPlainText(
          version.contentHtml,
        ),

      currentWords:
        normalizeNumber(
          version.wordCount,
          countWordsFromHtml(
            version.contentHtml,
          ),
        ),

      draftVersions,
      lastSavedAt: nowIso(),
    },
  )
}

function deleteProject(projectId) {
  const projectIndex =
    getProjectIndex(projectId)

  if (projectIndex === -1) {
    return false
  }

  projects.value.splice(
    projectIndex,
    1,
  )

  writeProjectsToStorage()

  return true
}

function duplicateProject(projectId) {
  const originalProject =
    getProjectById(projectId)

  if (!originalProject) {
    return null
  }

  return addProject({
    ...originalProject,
    id: undefined,
    title: `${originalProject.title} Copy`,
    status: 'planning',
    completedAt: '',
    draftVersions: [],
  })
}

function markProjectComplete(projectId) {
  return updateProject(
    projectId,
    {
      status: 'complete',
      completedAt: nowIso(),
    },
  )
}

function reopenProject(projectId) {
  return updateProject(
    projectId,
    {
      status: 'drafting',
      completedAt: '',
    },
  )
}

function updateEditorSettings(
  projectId,
  settings = {},
) {
  const project =
    getProjectById(projectId)

  if (!project) {
    return null
  }

  return updateProject(
    projectId,
    {
      editorSettings: {
        ...project.editorSettings,
        ...settings,
      },
    },
  )
}

function getProgress(projectOrId) {
  const project =
    typeof projectOrId === 'object'
      ? projectOrId
      : getProjectById(projectOrId)

  if (!project) {
    return 0
  }

  const goal =
    normalizeNumber(project.wordGoal)

  const current =
    normalizeNumber(project.currentWords)

  if (goal <= 0) {
    return current > 0 ? 100 : 0
  }

  return Math.min(
    100,
    Math.round(
      (current / goal) * 100,
    ),
  )
}

function getRemainingWords(projectOrId) {
  const project =
    typeof projectOrId === 'object'
      ? projectOrId
      : getProjectById(projectOrId)

  if (!project) {
    return 0
  }

  return Math.max(
    0,
    normalizeNumber(project.wordGoal) -
      normalizeNumber(project.currentWords),
  )
}

function getTypeLabel(typeValue) {
  return (
    WRITING_TYPES.find(
      (type) =>
        type.value === typeValue,
    )?.label ||
    'Writing Project'
  )
}

function getTypeIcon(typeValue) {
  return (
    WRITING_TYPES.find(
      (type) =>
        type.value === typeValue,
    )?.icon ||
    '✍️'
  )
}

function getStatusLabel(statusValue) {
  return (
    WRITING_STATUSES.find(
      (status) =>
        status.value === statusValue,
    )?.label ||
    'Planning'
  )
}

function getPriorityLabel(priorityValue) {
  return (
    WRITING_PRIORITIES.find(
      (priority) =>
        priority.value === priorityValue,
    )?.label ||
    'Normal'
  )
}

function refreshProjects() {
  initialized.value = false

  return loadProjects()
}

const allProjects = computed(() => {
  ensureInitialized()

  return projects.value
})

const activeProjects = computed(() => {
  ensureInitialized()

  return projects.value.filter(
    (project) =>
      project.status !== 'complete',
  )
})

const completedProjects = computed(() => {
  ensureInitialized()

  return projects.value.filter(
    (project) =>
      project.status === 'complete',
  )
})

const totalWords = computed(() => {
  ensureInitialized()

  return projects.value.reduce(
    (total, project) =>
      total +
      normalizeNumber(
        project.currentWords,
      ),
    0,
  )
})

const totalGoalWords = computed(() => {
  ensureInitialized()

  return projects.value.reduce(
    (total, project) =>
      total +
      normalizeNumber(
        project.wordGoal,
      ),
    0,
  )
})

const overallProgress = computed(() => {
  if (totalGoalWords.value <= 0) {
    return 0
  }

  return Math.min(
    100,
    Math.round(
      (
        totalWords.value /
        totalGoalWords.value
      ) * 100,
    ),
  )
})

export function useWritingProjects() {
  ensureInitialized()

  return {
    projects,
    initialized,

    allProjects,
    activeProjects,
    completedProjects,
    totalWords,
    totalGoalWords,
    overallProgress,

    writingTypes: WRITING_TYPES,
    writingStatuses: WRITING_STATUSES,
    writingPriorities:
      WRITING_PRIORITIES,

    loadProjects,
    refreshProjects,
    saveProjects:
      writeProjectsToStorage,

    getProjectById,
    addProject,
    updateProject,
    updateProjectContent,

    getDraftVersions,
    getDraftVersionById,
    createDraftVersion,
    renameDraftVersion,
    deleteDraftVersion,
    restoreDraftVersion,

    deleteProject,
    duplicateProject,
    markProjectComplete,
    reopenProject,
    updateEditorSettings,

    getProgress,
    getRemainingWords,
    getTypeLabel,
    getTypeIcon,
    getStatusLabel,
    getPriorityLabel,

    htmlToPlainText,
    countWordsFromText,
    countWordsFromHtml,
    countCharactersFromHtml,
    countParagraphsFromHtml,
    countSentencesFromHtml,
    calculateReadingTime,
  }
}