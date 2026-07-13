<template>
  <AppLayout
    title="Writing Dashboard"
    subtitle="Manage papers, drafts, word goals, deadlines, and writing progress."
    banner-key="writing"
    default-icon="✍️"
  >
    <template #actions>
      <button class="topbar-primary-btn" type="button" @click="openCreateModal">
        + New Writing Project
      </button>
    </template>

    <div class="writing-dashboard">
      <section class="summary-grid">
        <article class="summary-card">
          <div class="summary-icon">📝</div>

          <div>
            <p>Active Projects</p>
            <strong>{{ activeProjects.length }}</strong>
            <span>{{ completedProjects.length }} completed</span>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon">🔤</div>

          <div>
            <p>Total Words</p>
            <strong>{{ formatNumber(totalWords) }}</strong>
            <span>Across all writing projects</span>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon">🎯</div>

          <div>
            <p>Goal Progress</p>
            <strong>{{ overallProgress }}%</strong>
            <span>
              {{ formatNumber(totalGoalWords) }} planned words
            </span>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon">📅</div>

          <div>
            <p>Upcoming Deadlines</p>
            <strong>{{ dueSoonProjects.length }}</strong>
            <span>
              <template v-if="overdueProjects.length">
                {{ overdueProjects.length }} overdue
              </template>

              <template v-else>
                Due within seven days
              </template>
            </span>
          </div>
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="focus-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Writing Focus</p>
              <h2>Continue writing</h2>
            </div>

            <span v-if="focusProject" class="focus-status">
              {{ getStatusLabel(focusProject.status) }}
            </span>
          </div>

          <div v-if="focusProject" class="focus-content">
            <div class="focus-project-heading">
              <div>
                <span class="type-pill">
                  {{ getTypeLabel(focusProject.type) }}
                </span>

                <h3>{{ focusProject.title }}</h3>

                <p>
                  <span v-if="focusProject.course">
                    {{ focusProject.course }}
                  </span>

                  <span
                    v-if="focusProject.course && focusProject.assignment"
                    aria-hidden="true"
                  >
                    ·
                  </span>

                  <span v-if="focusProject.assignment">
                    {{ focusProject.assignment }}
                  </span>

                  <span
                    v-if="!focusProject.course && !focusProject.assignment"
                  >
                    Independent writing project
                  </span>
                </p>
              </div>

              <div
                v-if="focusProject.dueDate"
                class="focus-deadline"
                :class="getDeadlineClass(focusProject)"
              >
                <span>{{ getDeadlineLabel(focusProject) }}</span>
                <strong>{{ formatDate(focusProject.dueDate) }}</strong>
              </div>
            </div>

            <div class="word-progress-header">
              <div>
                <strong>
                  {{ formatNumber(focusProject.currentWords) }}
                </strong>

                <span>
                  of {{ formatNumber(focusProject.wordGoal) }} words
                </span>
              </div>

              <strong>{{ getProgress(focusProject) }}%</strong>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-label="Writing progress"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="getProgress(focusProject)"
            >
              <span
                class="progress-fill"
                :style="{ width: `${getProgress(focusProject)}%` }"
              ></span>
            </div>

            <div class="focus-stat-grid">
              <div>
                <span>Words remaining</span>
                <strong>
                  {{ formatNumber(getRemainingWords(focusProject)) }}
                </strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>
                  {{ formatUpdatedDate(focusProject.updatedAt) }}
                </strong>
              </div>

              <div>
                <span>Stage</span>
                <strong>
                  {{ getStatusLabel(focusProject.status) }}
                </strong>
              </div>
            </div>

            <div class="focus-actions">
              <button
                class="primary-btn"
                type="button"
                @click="openEditModal(focusProject)"
              >
                Update Project
              </button>

              <button
                v-if="focusProject.status !== 'complete'"
                class="secondary-btn"
                type="button"
                @click="markComplete(focusProject)"
              >
                Mark Complete
              </button>
            </div>
          </div>

          <div v-else class="focus-empty">
            <div class="empty-icon">✍️</div>
            <h3>No active writing project</h3>
            <p>
              Create a paper, article, outline, reflection, or other writing
              project to begin tracking your progress.
            </p>

            <button
              class="primary-btn"
              type="button"
              @click="openCreateModal"
            >
              Create Writing Project
            </button>
          </div>
        </article>

        <article class="deadline-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Deadlines</p>
              <h2>Writing schedule</h2>
            </div>

            <span>{{ deadlineProjects.length }}</span>
          </div>

          <div v-if="deadlineProjects.length" class="deadline-list">
            <button
              v-for="project in deadlineProjects"
              :key="project.id"
              class="deadline-row"
              type="button"
              @click="openEditModal(project)"
            >
              <div
                class="deadline-date"
                :class="getDeadlineClass(project)"
              >
                <strong>{{ getDateDay(project.dueDate) }}</strong>
                <span>{{ getDateMonth(project.dueDate) }}</span>
              </div>

              <div class="deadline-copy">
                <strong>{{ project.title }}</strong>

                <span>
                  {{ getDeadlineLabel(project) }}
                  ·
                  {{ getProgress(project) }}% complete
                </span>
              </div>

              <span class="deadline-arrow">›</span>
            </button>
          </div>

          <div v-else class="small-empty-state">
            <span>📅</span>
            <h3>No upcoming deadlines</h3>
            <p>Add a due date to a writing project to see it here.</p>
          </div>
        </article>
      </section>

      <section class="projects-panel">
        <div class="projects-heading">
          <div>
            <p class="eyebrow">Writing Projects</p>
            <h2>Project library</h2>
            <p>
              Track word counts, writing stages, assignments, and deadlines.
            </p>
          </div>

          <span class="project-count">
            {{ filteredProjects.length }}
            {{
              filteredProjects.length === 1
                ? 'project shown'
                : 'projects shown'
            }}
          </span>
        </div>

        <div class="project-toolbar">
          <label class="search-field">
            <span class="search-icon" aria-hidden="true">⌕</span>

            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search projects, courses, or assignments..."
            />
          </label>

          <label class="filter-field">
            <span>Status</span>

            <select v-model="statusFilter">
              <option value="all">All statuses</option>

              <option
                v-for="status in writingStatuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Project type</span>

            <select v-model="typeFilter">
              <option value="all">All types</option>

              <option
                v-for="type in writingTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </label>

          <label class="filter-field">
            <span>Sort</span>

            <select v-model="sortBy">
              <option value="recent">Recently updated</option>
              <option value="deadline">Nearest deadline</option>
              <option value="progress-high">Highest progress</option>
              <option value="progress-low">Lowest progress</option>
              <option value="title">Project title</option>
            </select>
          </label>

          <button
            v-if="hasActiveFilters"
            class="clear-btn"
            type="button"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>

        <div v-if="projects.length === 0" class="large-empty-state">
          <div class="empty-icon">📄</div>
          <h3>Your writing dashboard is ready</h3>
          <p>
            Create your first writing project to track drafts, deadlines,
            word goals, and completion progress.
          </p>

          <button
            class="primary-btn"
            type="button"
            @click="openCreateModal"
          >
            + Create First Project
          </button>
        </div>

        <div
          v-else-if="filteredProjects.length === 0"
          class="large-empty-state"
        >
          <div class="empty-icon">⌕</div>
          <h3>No projects match these filters</h3>
          <p>Try another search or clear the current filters.</p>

          <button class="secondary-btn" type="button" @click="clearFilters">
            Clear Filters
          </button>
        </div>

        <div v-else class="project-grid">
          <article
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-card-header">
              <div class="project-labels">
                <span class="type-pill">
                  {{ getTypeLabel(project.type) }}
                </span>

                <span
                  class="status-pill"
                  :class="`status-${project.status}`"
                >
                  {{ getStatusLabel(project.status) }}
                </span>
              </div>

              <button
                class="icon-btn"
                type="button"
                aria-label="Edit writing project"
                @click="openEditModal(project)"
              >
                ✎
              </button>
            </div>

            <div class="project-title">
              <h3>{{ project.title }}</h3>

              <p>
                <template v-if="project.course">
                  {{ project.course }}
                </template>

                <template v-if="project.course && project.assignment">
                  ·
                </template>

                <template v-if="project.assignment">
                  {{ project.assignment }}
                </template>

                <template v-if="!project.course && !project.assignment">
                  Independent project
                </template>
              </p>
            </div>

            <p v-if="project.description" class="project-description">
              {{ project.description }}
            </p>

            <div class="project-progress">
              <div class="word-progress-header">
                <div>
                  <strong>
                    {{ formatNumber(project.currentWords) }}
                  </strong>

                  <span>
                    of {{ formatNumber(project.wordGoal) }} words
                  </span>
                </div>

                <strong>{{ getProgress(project) }}%</strong>
              </div>

              <div class="progress-track">
                <span
                  class="progress-fill"
                  :style="{ width: `${getProgress(project)}%` }"
                ></span>
              </div>
            </div>

            <div class="quick-word-update">
              <label>
                Current word count

                <input
                  v-model.number="project.currentWords"
                  type="number"
                  min="0"
                  @change="saveInlineProject(project)"
                />
              </label>
            </div>

            <div class="project-meta">
              <div>
                <span>Deadline</span>

                <strong
                  v-if="project.dueDate"
                  :class="getDeadlineClass(project)"
                >
                  {{ formatDate(project.dueDate) }}
                </strong>

                <strong v-else>No due date</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>
                  {{ formatNumber(getRemainingWords(project)) }} words
                </strong>
              </div>
            </div>

            <div class="project-card-actions">
              <select
                v-model="project.status"
                class="status-select"
                aria-label="Writing project status"
                @change="saveInlineProject(project)"
              >
                <option
                  v-for="status in writingStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>

              <button
                class="secondary-btn"
                type="button"
                @click="openEditModal(project)"
              >
                Edit
              </button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="recentProjects.length" class="recent-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Recent Activity</p>
            <h2>Recently updated</h2>
          </div>
        </div>

        <div class="recent-grid">
          <button
            v-for="project in recentProjects"
            :key="project.id"
            class="recent-row"
            type="button"
            @click="openEditModal(project)"
          >
            <div class="recent-icon">
              {{ getTypeIcon(project.type) }}
            </div>

            <div>
              <strong>{{ project.title }}</strong>
              <span>
                Updated {{ formatUpdatedDate(project.updatedAt) }}
              </span>
            </div>

            <span>{{ formatNumber(project.currentWords) }} words</span>
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="projectModalOpen"
      class="modal-backdrop"
      @click.self="closeProjectModal"
    >
      <form class="project-modal" @submit.prevent="saveProject">
        <div class="modal-heading">
          <div>
            <p class="eyebrow">Writing Project</p>

            <h2>
              {{ editingProjectId ? 'Edit Project' : 'New Writing Project' }}
            </h2>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close project editor"
            @click="closeProjectModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label class="full-field">
            Project title

            <input
              v-model.trim="projectForm.title"
              type="text"
              required
              placeholder="Example: Spiritual Formation Research Paper"
            />
          </label>

          <div class="form-grid">
            <label>
              Project type

              <select v-model="projectForm.type">
                <option
                  v-for="type in writingTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </label>

            <label>
              Writing stage

              <select v-model="projectForm.status">
                <option
                  v-for="status in writingStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </label>

            <label>
              Course

              <input
                v-model.trim="projectForm.course"
                type="text"
                placeholder="Example: DMIN 851"
              />
            </label>

            <label>
              Assignment

              <input
                v-model.trim="projectForm.assignment"
                type="text"
                placeholder="Example: Micro-Project Assessment"
              />
            </label>

            <label>
              Current word count

              <input
                v-model.number="projectForm.currentWords"
                type="number"
                min="0"
              />
            </label>

            <label>
              Word goal

              <input
                v-model.number="projectForm.wordGoal"
                type="number"
                min="0"
                step="100"
              />
            </label>

            <label>
              Due date

              <input v-model="projectForm.dueDate" type="date" />
            </label>

            <label>
              Priority

              <select v-model="projectForm.priority">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          <label class="full-field">
            Project description

            <textarea
              v-model.trim="projectForm.description"
              rows="4"
              placeholder="Add the purpose, thesis, requirements, or next writing step."
            ></textarea>
          </label>
        </div>

        <div class="modal-actions">
          <button
            v-if="editingProjectId"
            class="delete-btn"
            type="button"
            @click="deleteEditingProject"
          >
            Delete Project
          </button>

          <div class="modal-actions-right">
            <button
              class="secondary-btn"
              type="button"
              @click="closeProjectModal"
            >
              Cancel
            </button>

            <button class="primary-btn" type="submit">
              {{ editingProjectId ? 'Save Changes' : 'Create Project' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="saveMessage" class="save-toast">
      {{ saveMessage }}
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const STORAGE_KEY = 'scholarory-writing-projects'

const LEGACY_STORAGE_KEYS = [
  'scholarory_writing_projects',
  'writingProjects',
]

const writingTypes = [
  { value: 'paper', label: 'Academic Paper', icon: '📄' },
  { value: 'article', label: 'Article', icon: '📰' },
  { value: 'book-review', label: 'Book Review', icon: '📘' },
  { value: 'discussion', label: 'Discussion Post', icon: '💬' },
  { value: 'reflection', label: 'Reflection', icon: '🪞' },
  { value: 'sermon', label: 'Sermon or Lesson', icon: '📖' },
  { value: 'outline', label: 'Outline', icon: '🗂️' },
  { value: 'dissertation', label: 'Dissertation', icon: '🎓' },
  { value: 'other', label: 'Other Writing', icon: '✍️' },
]

const writingStatuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'outlining', label: 'Outlining' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'revising', label: 'Revising' },
  { value: 'proofreading', label: 'Proofreading' },
  { value: 'complete', label: 'Complete' },
]

const projects = ref([])

const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const sortBy = ref('recent')

const projectModalOpen = ref(false)
const editingProjectId = ref('')
const saveMessage = ref('')

const projectForm = ref(createBlankProject())

const activeProjects = computed(() => {
  return projects.value.filter(
    (project) => project.status !== 'complete',
  )
})

const completedProjects = computed(() => {
  return projects.value.filter(
    (project) => project.status === 'complete',
  )
})

const totalWords = computed(() => {
  return projects.value.reduce(
    (total, project) =>
      total + normalizeNumber(project.currentWords),
    0,
  )
})

const totalGoalWords = computed(() => {
  return projects.value.reduce(
    (total, project) =>
      total + normalizeNumber(project.wordGoal),
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
      (totalWords.value / totalGoalWords.value) * 100,
    ),
  )
})

const overdueProjects = computed(() => {
  return activeProjects.value.filter((project) => {
    return project.dueDate && getDaysUntil(project.dueDate) < 0
  })
})

const dueSoonProjects = computed(() => {
  return activeProjects.value.filter((project) => {
    if (!project.dueDate) {
      return false
    }

    const days = getDaysUntil(project.dueDate)

    return days >= 0 && days <= 7
  })
})

const deadlineProjects = computed(() => {
  return activeProjects.value
    .filter((project) => project.dueDate)
    .slice()
    .sort((a, b) => {
      return getDateValue(a.dueDate) - getDateValue(b.dueDate)
    })
    .slice(0, 6)
})

const focusProject = computed(() => {
  const active = activeProjects.value.slice()

  if (!active.length) {
    return null
  }

  return active.sort((a, b) => {
    const aOverdue = a.dueDate && getDaysUntil(a.dueDate) < 0
    const bOverdue = b.dueDate && getDaysUntil(b.dueDate) < 0

    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1
    }

    const aDate = a.dueDate
      ? getDateValue(a.dueDate)
      : Number.POSITIVE_INFINITY

    const bDate = b.dueDate
      ? getDateValue(b.dueDate)
      : Number.POSITIVE_INFINITY

    if (aDate !== bDate) {
      return aDate - bDate
    }

    return getDateValue(b.updatedAt) - getDateValue(a.updatedAt)
  })[0]
})

const recentProjects = computed(() => {
  return projects.value
    .slice()
    .sort((a, b) => {
      return getDateValue(b.updatedAt) - getDateValue(a.updatedAt)
    })
    .slice(0, 4)
})

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    statusFilter.value !== 'all' ||
    typeFilter.value !== 'all'
  )
})

const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const filtered = projects.value.filter((project) => {
    if (
      statusFilter.value !== 'all' &&
      project.status !== statusFilter.value
    ) {
      return false
    }

    if (
      typeFilter.value !== 'all' &&
      project.type !== typeFilter.value
    ) {
      return false
    }

    if (!query) {
      return true
    }

    const searchableText = [
      project.title,
      project.course,
      project.assignment,
      project.description,
      getTypeLabel(project.type),
      getStatusLabel(project.status),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(query)
  })

  return filtered.slice().sort((a, b) => {
    switch (sortBy.value) {
      case 'deadline':
        return (
          getSortableDeadline(a.dueDate) -
          getSortableDeadline(b.dueDate)
        )

      case 'progress-high':
        return getProgress(b) - getProgress(a)

      case 'progress-low':
        return getProgress(a) - getProgress(b)

      case 'title':
        return a.title.localeCompare(b.title)

      case 'recent':
      default:
        return getDateValue(b.updatedAt) - getDateValue(a.updatedAt)
    }
  })
})

onMounted(() => {
  loadProjects()
})

function createBlankProject() {
  return {
    title: '',
    type: 'paper',
    status: 'planning',
    course: '',
    assignment: '',
    currentWords: 0,
    wordGoal: 1500,
    dueDate: '',
    priority: 'normal',
    description: '',
  }
}

function loadProjects() {
  const currentProjects = readStorageKey(STORAGE_KEY)

  if (currentProjects.length) {
    projects.value = currentProjects.map(normalizeProject)
    return
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyProjects = readStorageKey(legacyKey)

    if (legacyProjects.length) {
      projects.value = legacyProjects.map(normalizeProject)
      saveProjects()
      return
    }
  }

  projects.value = []
}

function readStorageKey(key) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return []
  }

  try {
    const parsed = JSON.parse(storedValue)

    if (Array.isArray(parsed)) {
      return parsed
    }

    if (Array.isArray(parsed?.projects)) {
      return parsed.projects
    }

    if (Array.isArray(parsed?.items)) {
      return parsed.items
    }
  } catch (error) {
    console.warn(
      `Scholarory Writing Dashboard could not read "${key}".`,
      error,
    )
  }

  return []
}

function normalizeProject(project, index) {
  const now = new Date().toISOString()

  return {
    id: String(
      project.id ||
        project.projectId ||
        `writing-${Date.now()}-${index}`,
    ),

    title:
      String(project.title || project.name || 'Untitled Project').trim(),

    type: project.type || project.projectType || 'paper',
    status: project.status || project.stage || 'planning',

    course: String(
      project.course || project.courseName || '',
    ).trim(),

    assignment: String(
      project.assignment || project.assignmentName || '',
    ).trim(),

    currentWords: normalizeNumber(
      project.currentWords ?? project.wordCount,
    ),

    wordGoal: normalizeNumber(
      project.wordGoal ?? project.goalWords ?? 1500,
    ),

    dueDate: project.dueDate || project.deadline || '',
    priority: project.priority || 'normal',

    description: String(
      project.description || project.notes || '',
    ).trim(),

    createdAt: project.createdAt || now,
    updatedAt: project.updatedAt || project.createdAt || now,
  }
}

function saveProjects() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects.value),
  )
}

function openCreateModal() {
  editingProjectId.value = ''
  projectForm.value = createBlankProject()
  projectModalOpen.value = true
}

function openEditModal(project) {
  editingProjectId.value = project.id

  projectForm.value = {
    title: project.title,
    type: project.type,
    status: project.status,
    course: project.course,
    assignment: project.assignment,
    currentWords: normalizeNumber(project.currentWords),
    wordGoal: normalizeNumber(project.wordGoal),
    dueDate: project.dueDate,
    priority: project.priority,
    description: project.description,
  }

  projectModalOpen.value = true
}

function closeProjectModal() {
  projectModalOpen.value = false
  editingProjectId.value = ''
  projectForm.value = createBlankProject()
}

function saveProject() {
  const now = new Date().toISOString()

  const cleanedProject = {
    title: projectForm.value.title.trim(),
    type: projectForm.value.type,
    status: projectForm.value.status,
    course: projectForm.value.course.trim(),
    assignment: projectForm.value.assignment.trim(),
    currentWords: normalizeNumber(projectForm.value.currentWords),
    wordGoal: normalizeNumber(projectForm.value.wordGoal),
    dueDate: projectForm.value.dueDate,
    priority: projectForm.value.priority,
    description: projectForm.value.description.trim(),
    updatedAt: now,
  }

  if (editingProjectId.value) {
    const projectIndex = projects.value.findIndex(
      (project) => project.id === editingProjectId.value,
    )

    if (projectIndex !== -1) {
      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        ...cleanedProject,
      }

      showSaveMessage('Writing project updated.')
    }
  } else {
    projects.value.unshift({
      id: `writing-${Date.now()}`,
      ...cleanedProject,
      createdAt: now,
    })

    showSaveMessage('Writing project created.')
  }

  saveProjects()
  closeProjectModal()
}

function saveInlineProject(project) {
  project.currentWords = normalizeNumber(project.currentWords)
  project.wordGoal = normalizeNumber(project.wordGoal)
  project.updatedAt = new Date().toISOString()

  saveProjects()
  showSaveMessage('Writing progress saved.')
}

function markComplete(project) {
  project.status = 'complete'
  project.updatedAt = new Date().toISOString()

  saveProjects()
  showSaveMessage('Writing project marked complete.')
}

function deleteEditingProject() {
  if (!editingProjectId.value) {
    return
  }

  const project = projects.value.find(
    (item) => item.id === editingProjectId.value,
  )

  const confirmed = window.confirm(
    `Delete "${project?.title || 'this writing project'}"?`,
  )

  if (!confirmed) {
    return
  }

  projects.value = projects.value.filter(
    (item) => item.id !== editingProjectId.value,
  )

  saveProjects()
  closeProjectModal()
  showSaveMessage('Writing project deleted.')
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
}

function normalizeNumber(value) {
  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    return 0
  }

  return Math.round(number)
}

function getProgress(project) {
  const goal = normalizeNumber(project.wordGoal)
  const current = normalizeNumber(project.currentWords)

  if (goal <= 0) {
    return current > 0 ? 100 : 0
  }

  return Math.min(
    100,
    Math.round((current / goal) * 100),
  )
}

function getRemainingWords(project) {
  return Math.max(
    0,
    normalizeNumber(project.wordGoal) -
      normalizeNumber(project.currentWords),
  )
}

function getStatusLabel(statusValue) {
  return (
    writingStatuses.find(
      (status) => status.value === statusValue,
    )?.label || 'Planning'
  )
}

function getTypeLabel(typeValue) {
  return (
    writingTypes.find(
      (type) => type.value === typeValue,
    )?.label || 'Writing Project'
  )
}

function getTypeIcon(typeValue) {
  return (
    writingTypes.find(
      (type) => type.value === typeValue,
    )?.icon || '✍️'
  )
}

function getDateValue(dateValue) {
  if (!dateValue) {
    return 0
  }

  const date = new Date(dateValue)
  const time = date.getTime()

  return Number.isNaN(time) ? 0 : time
}

function getSortableDeadline(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY
  }

  return getDateValue(`${dateValue}T00:00:00`)
}

function getDaysUntil(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(`${dateValue}T00:00:00`)

  return Math.round(
    (dueDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  )
}

function getDeadlineLabel(project) {
  if (!project.dueDate) {
    return 'No deadline'
  }

  const days = getDaysUntil(project.dueDate)

  if (days < 0) {
    const overdueDays = Math.abs(days)

    return `${overdueDays} ${
      overdueDays === 1 ? 'day' : 'days'
    } overdue`
  }

  if (days === 0) {
    return 'Due today'
  }

  if (days === 1) {
    return 'Due tomorrow'
  }

  return `Due in ${days} days`
}

function getDeadlineClass(project) {
  if (!project.dueDate || project.status === 'complete') {
    return ''
  }

  const days = getDaysUntil(project.dueDate)

  if (days < 0) {
    return 'deadline-overdue'
  }

  if (days <= 7) {
    return 'deadline-soon'
  }

  return 'deadline-upcoming'
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'No due date'
  }

  const date = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatUpdatedDate(dateValue) {
  if (!dateValue) {
    return 'recently'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'recently'
  }

  const now = new Date()
  const difference = now.getTime() - date.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))

  if (days <= 0) {
    return 'today'
  }

  if (days === 1) {
    return 'yesterday'
  }

  if (days < 7) {
    return `${days} days ago`
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getDateDay(dateValue) {
  if (!dateValue) {
    return '--'
  }

  const date = new Date(`${dateValue}T00:00:00`)

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
  }).format(date)
}

function getDateMonth(dateValue) {
  if (!dateValue) {
    return ''
  }

  const date = new Date(`${dateValue}T00:00:00`)

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
  })
    .format(date)
    .toUpperCase()
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(
    normalizeNumber(value),
  )
}

function showSaveMessage(message) {
  saveMessage.value = message

  window.setTimeout(() => {
    saveMessage.value = ''
  }, 2200)
}
</script>

<style scoped>
.writing-dashboard {
  display: grid;
  gap: 1.25rem;
  padding-bottom: 2rem;
}

.topbar-primary-btn,
.primary-btn,
.secondary-btn,
.delete-btn,
.clear-btn,
.icon-btn,
.modal-close {
  font: inherit;
  cursor: pointer;
}

.topbar-primary-btn,
.primary-btn {
  min-height: 40px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-size: 0.82rem;
  font-weight: 800;
}

.topbar-primary-btn:hover,
.primary-btn:hover {
  filter: brightness(1.08);
}

.secondary-btn {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--btn-bg);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 750;
}

.secondary-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  border-radius: 13px;
  background: var(--input-bg);
  font-size: 1.3rem;
}

.summary-card div:last-child {
  display: grid;
  min-width: 0;
}

.summary-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.summary-card strong {
  margin-top: 0.15rem;
  color: var(--text-primary);
  font-size: 1.6rem;
  line-height: 1;
}

.summary-card span {
  margin-top: 0.3rem;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.85fr);
  gap: 1rem;
}

.focus-card,
.deadline-card,
.projects-panel,
.recent-panel {
  padding: 1.15rem;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.section-heading,
.projects-heading,
.project-card-header,
.focus-project-heading,
.word-progress-header,
.project-card-actions,
.modal-heading,
.modal-actions,
.modal-actions-right {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading {
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent);
  font-size: 0.69rem;
  font-weight: 850;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.section-heading h2,
.projects-heading h2,
.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.focus-status,
.section-heading > span,
.project-count {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 750;
}

.focus-content {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.focus-project-heading {
  align-items: flex-start;
}

.focus-project-heading h3 {
  margin: 0.45rem 0 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.focus-project-heading p {
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.type-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 23px;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.type-pill {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.status-pill {
  background: var(--input-bg);
  color: var(--text-secondary);
}

.status-planning {
  background: #eef2f7;
  color: #536075;
}

.status-outlining {
  background: #edf3fb;
  color: #416e9b;
}

.status-drafting {
  background: #fff5dc;
  color: #926614;
}

.status-revising {
  background: #f2edfb;
  color: #7053a2;
}

.status-proofreading {
  background: #e9f6ef;
  color: #287354;
}

.status-complete {
  background: #e7f5ed;
  color: #226c4f;
}

.focus-deadline {
  display: grid;
  gap: 0.15rem;
  min-width: 120px;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  text-align: right;
}

.focus-deadline span {
  font-size: 0.68rem;
  font-weight: 750;
}

.focus-deadline strong {
  font-size: 0.8rem;
}

.word-progress-header {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.word-progress-header div {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.word-progress-header div strong {
  color: var(--text-primary);
  font-size: 1rem;
}

.progress-track {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--input-bg);
}

.progress-fill {
  display: block;
  min-width: 2px;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 220ms ease;
}

.focus-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.focus-stat-grid div {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--input-bg);
}

.focus-stat-grid span {
  color: var(--text-muted);
  font-size: 0.67rem;
  font-weight: 750;
  text-transform: uppercase;
}

.focus-stat-grid strong {
  color: var(--text-primary);
  font-size: 0.78rem;
}

.focus-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.focus-empty,
.large-empty-state,
.small-empty-state {
  display: grid;
  justify-items: center;
  text-align: center;
}

.focus-empty {
  min-height: 280px;
  align-content: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 0.8rem;
  border-radius: 16px;
  background: var(--input-bg);
  font-size: 1.5rem;
}

.focus-empty h3,
.large-empty-state h3,
.small-empty-state h3 {
  margin: 0;
  color: var(--text-primary);
}

.focus-empty p,
.large-empty-state p,
.small-empty-state p {
  max-width: 520px;
  margin: 0.45rem 0 1rem;
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.deadline-list {
  display: grid;
  gap: 0.55rem;
  margin-top: 1rem;
}

.deadline-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--input-bg);
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.deadline-row:hover {
  border-color: var(--accent);
}

.deadline-date {
  display: grid;
  place-items: center;
  align-content: center;
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background: var(--bg-card);
}

.deadline-date strong {
  font-size: 1rem;
  line-height: 1;
}

.deadline-date span {
  margin-top: 0.15rem;
  font-size: 0.57rem;
  font-weight: 850;
}

.deadline-copy {
  display: grid;
  min-width: 0;
}

.deadline-copy strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deadline-copy span {
  margin-top: 0.2rem;
  color: var(--text-muted);
  font-size: 0.67rem;
}

.deadline-arrow {
  color: var(--text-muted);
  font-size: 1.2rem;
}

.deadline-overdue {
  color: #b43d37 !important;
}

.deadline-soon {
  color: #9b6c13 !important;
}

.deadline-upcoming {
  color: #416e9b !important;
}

.small-empty-state {
  min-height: 230px;
  align-content: center;
}

.small-empty-state > span {
  font-size: 1.7rem;
}

.projects-panel {
  display: grid;
  gap: 1rem;
}

.projects-heading {
  align-items: flex-end;
}

.projects-heading p:not(.eyebrow) {
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.project-toolbar {
  display: grid;
  grid-template-columns:
    minmax(220px, 1.8fr)
    repeat(3, minmax(130px, 0.75fr))
    auto;
  align-items: end;
  gap: 0.65rem;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 13px;
  background: var(--input-bg);
}

.search-field {
  position: relative;
}

.search-field input,
.filter-field select,
.modal-form input,
.modal-form select,
.modal-form textarea,
.quick-word-update input,
.status-select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  outline: none;
}

.search-field input {
  min-height: 42px;
  padding: 0.65rem 0.75rem 0.65rem 2.15rem;
  font-size: 0.8rem;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  color: var(--text-muted);
  transform: translateY(-50%);
}

.filter-field {
  display: grid;
  gap: 0.3rem;
}

.filter-field > span {
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.filter-field select {
  min-height: 42px;
  padding: 0.55rem;
  font-size: 0.78rem;
}

.search-field input:focus,
.filter-field select:focus,
.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus,
.quick-word-update input:focus,
.status-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.clear-btn {
  min-height: 42px;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 750;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.project-card {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
}

.project-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--btn-bg);
  color: var(--text-secondary);
}

.icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.project-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.project-title p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.73rem;
}

.project-description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.76rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.project-progress {
  display: grid;
  gap: 0.5rem;
}

.quick-word-update label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.67rem;
  font-weight: 750;
}

.quick-word-update input {
  padding: 0.55rem 0.65rem;
  font-size: 0.78rem;
}

.project-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.project-meta div {
  display: grid;
  gap: 0.2rem;
  padding: 0.65rem;
  border-radius: 9px;
  background: var(--input-bg);
}

.project-meta span {
  color: var(--text-muted);
  font-size: 0.62rem;
  font-weight: 750;
  text-transform: uppercase;
}

.project-meta strong {
  color: var(--text-primary);
  font-size: 0.72rem;
}

.status-select {
  min-height: 40px;
  padding: 0.5rem;
  font-size: 0.75rem;
}

.project-card-actions .status-select {
  flex: 1;
}

.large-empty-state {
  padding: 3rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: 14px;
  background: var(--input-bg);
}

.recent-panel {
  display: grid;
  gap: 0.9rem;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.recent-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--input-bg);
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.recent-row:hover {
  border-color: var(--accent);
}

.recent-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--bg-card);
}

.recent-row div:nth-child(2) {
  display: grid;
  min-width: 0;
}

.recent-row strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-row span {
  color: var(--text-muted);
  font-size: 0.67rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.62);
}

.project-modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.3);
}

.modal-heading {
  align-items: flex-start;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  font-size: 1.15rem;
}

.modal-form {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.modal-form label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 750;
}

.modal-form input,
.modal-form select,
.modal-form textarea {
  padding: 0.68rem;
  font-size: 0.8rem;
}

.modal-form textarea {
  resize: vertical;
}

.modal-actions {
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.modal-actions-right {
  margin-left: auto;
}

.delete-btn {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid #c9453f;
  border-radius: 10px;
  background: #c9453f;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
}

.save-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 120;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.28);
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .project-toolbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-field {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .project-grid,
  .recent-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .project-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-field {
    grid-column: 1 / -1;
  }

  .projects-heading {
    align-items: flex-start;
  }
}

@media (max-width: 560px) {
  .summary-grid,
  .project-toolbar,
  .focus-stat-grid,
  .project-meta {
    grid-template-columns: 1fr;
  }

  .focus-project-heading,
  .projects-heading,
  .modal-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .focus-deadline {
    width: 100%;
    box-sizing: border-box;
    text-align: left;
  }

  .modal-actions-right {
    width: 100%;
    margin-left: 0;
  }

  .modal-actions-right button {
    flex: 1;
  }
}
</style>