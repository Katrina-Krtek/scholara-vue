<template>
  <AppLayout
    :title="assignment?.title || 'Assignment Detail'"
    :subtitle="assignment?.course || 'Assignment workspace'"
    banner-key="assignment-detail"
    default-icon="📝"
  >
    <section v-if="assignment" class="assignment-detail-page">
      <div class="assignment-hero">
        <div class="assignment-hero-copy">
          <p class="eyebrow">{{ assignment.type }}</p>
          <h2>{{ assignment.title }}</h2>

          <p>
            {{
              assignment.description ||
              'No assignment description added yet.'
            }}
          </p>

          <div class="hero-actions">
            <button
              class="primary-btn"
              type="button"
              @click="openCreateSession"
            >
              + Schedule Work Session
            </button>

            <button
              class="secondary-btn hero-secondary-btn"
              type="button"
              @click="openPlanner"
            >
              Open Planner
            </button>
          </div>
        </div>

        <div class="assignment-meta-card">
          <p>
            <strong>Course:</strong>
            {{ assignment.course }}
          </p>

          <p>
            <strong>Due:</strong>
            {{ formatDate(assignment.dueDate) }}
          </p>

          <p>
            <strong>Scheduled sessions:</strong>
            {{ assignmentSessions.length }}
          </p>

          <p>
            <strong>Planned study time:</strong>
            {{ formatDuration(totalScheduledMinutes) }}
          </p>

          <label>
            Status

            <select
              v-model="assignment.status"
              class="meta-select"
              @change="
                updateAssignmentStatus(
                  assignment.id,
                  assignment.status,
                )
              "
            >
              <option value="not-started">
                Not Started
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="waiting">
                Waiting
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </label>

          <label>
            Priority

            <select
              v-model="assignment.priority"
              class="meta-select"
              @change="
                updateAssignmentPriority(
                  assignment.id,
                  assignment.priority,
                )
              "
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
      </div>

      <AssignmentProgressTracker
        v-model="assignment.progress"
        @update:modelValue="
          updateAssignmentProgress(
            assignment.id,
            $event,
          )
        "
      />

      <section class="planner-sessions-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Planner Integration</p>
            <h3>Assignment Work Sessions</h3>

            <p>
              Schedule as many focused work sessions as needed.
              Completing a session does not complete the entire
              assignment.
            </p>
          </div>

          <button
            class="primary-btn"
            type="button"
            @click="openCreateSession"
          >
            + Schedule Session
          </button>
        </div>

        <div
          v-if="assignmentSessions.length"
          class="session-list"
        >
          <article
            v-for="session in assignmentSessions"
            :key="session.id"
            class="session-row"
            :class="{ completed: session.completed }"
          >
            <button
              class="completion-box"
              type="button"
              :aria-label="
                session.completed
                  ? `Mark ${session.title} incomplete`
                  : `Mark ${session.title} complete`
              "
              @click="toggleSessionComplete(session)"
            >
              {{ session.completed ? '✓' : '' }}
            </button>

            <div class="session-date">
              <strong>
                {{ formatMonthDay(session.date) }}
              </strong>

              <span>
                {{ formatWeekday(session.date) }}
              </span>
            </div>

            <button
              class="session-main"
              type="button"
              @click="openEditSession(session)"
            >
              <strong>{{ session.title }}</strong>

              <span>
                <template v-if="hasScheduledTime(session)">
                  {{ formatTime(session.start) }}
                  –
                  {{ formatTime(session.end) }}
                </template>

                <template v-else>
                  Flexible work session
                </template>
              </span>

              <small v-if="session.notes">
                {{ session.notes }}
              </small>
            </button>

            <span
              v-if="hasScheduledTime(session)"
              class="duration-pill"
            >
              {{
                formatDuration(
                  getDurationMinutes(session),
                )
              }}
            </span>

            <div class="session-actions">
              <button
                class="row-btn"
                type="button"
                @click="openEditSession(session)"
              >
                Edit
              </button>

              <button
                class="row-btn delete-row-btn"
                type="button"
                @click="deleteSession(session)"
              >
                Delete
              </button>
            </div>
          </article>
        </div>

        <div
          v-else
          class="empty-sessions"
        >
          <span>🗓️</span>
          <h4>No work sessions scheduled</h4>

          <p>
            Break the assignment into smaller sessions so the
            work appears across the daily, weekly, monthly, and
            yearly planners.
          </p>

          <button
            class="primary-btn"
            type="button"
            @click="openCreateSession"
          >
            Schedule First Session
          </button>
        </div>
      </section>

      <div class="detail-grid">
        <section class="detail-card">
          <h3>Instructions</h3>

          <p>
            {{
              assignment.instructions ||
              'No instructions added yet.'
            }}
          </p>
        </section>

        <section class="detail-card">
          <h3>Rubric</h3>

          <p>
            {{
              assignment.rubric ||
              'No rubric added yet.'
            }}
          </p>
        </section>

        <section class="detail-card">
          <h3>Word Count</h3>

          <p>
            Current:
            {{ assignment.wordCount?.current || 0 }}
          </p>

          <p>
            Target:
            {{ assignment.wordCount?.target || 0 }}
          </p>

          <p>
            Remaining:
            {{ remainingWordCount }}
          </p>
        </section>

        <section class="detail-card">
          <h3>Linked Research</h3>
          <p>No research sources linked yet.</p>

          <button
            class="secondary-btn"
            type="button"
          >
            + Link Research Source
          </button>
        </section>

        <section class="detail-card">
          <h3>Linked Tasks</h3>
          <p>No tasks linked yet.</p>

          <button
            class="secondary-btn"
            type="button"
          >
            + Link Task
          </button>
        </section>

        <section class="detail-card rory-card">
          <h3>Rory Assignment Assistant</h3>

          <ul>
            <li>Explain assignment</li>
            <li>Summarize instructions</li>
            <li>Suggest research</li>
            <li>Create task plan</li>
            <li>Estimate completion time</li>
          </ul>
        </section>
      </div>

      <AssignmentNotes
        v-model:instructorNotes="
          assignment.instructorNotes
        "
        v-model:personalNotes="
          assignment.personalNotes
        "
        @update:instructorNotes="
          updateAssignmentNotes(
            assignment.id,
            {
              instructorNotes:
                assignment.instructorNotes,
            },
          )
        "
        @update:personalNotes="
          updateAssignmentNotes(
            assignment.id,
            {
              personalNotes:
                assignment.personalNotes,
            },
          )
        "
      />

      <SubmissionChecklist
        :checklist="assignment.checklist"
        @update:checklist="
          updateAssignmentChecklist(
            assignment.id,
            $event,
          )
        "
      />
    </section>

    <section
      v-else
      class="assignment-detail-page"
    >
      <h2>Assignment not found</h2>
      <p>This assignment does not exist yet.</p>
    </section>

    <div
      v-if="sessionModalOpen"
      class="modal-backdrop"
      @click.self="closeSessionModal"
    >
      <form
        class="session-modal"
        @submit.prevent="saveSession"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">
              Assignment Planner
            </p>

            <h2>
              {{
                editingSessionId
                  ? 'Edit Work Session'
                  : 'Schedule Work Session'
              }}
            </h2>

            <p>
              {{ assignment?.title }}
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close work session"
            @click="closeSessionModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label class="full-field">
            Session title

            <input
              v-model.trim="sessionForm.title"
              type="text"
              required
              placeholder="Example: Draft introduction"
            />
          </label>

          <div class="form-grid">
            <label>
              Date

              <input
                v-model="sessionForm.date"
                type="date"
                required
              />
            </label>

            <label>
              Session type

              <select
                v-model="sessionForm.sessionType"
              >
                <option value="research">
                  Research
                </option>

                <option value="reading">
                  Reading
                </option>

                <option value="outline">
                  Outline
                </option>

                <option value="drafting">
                  Drafting
                </option>

                <option value="revision">
                  Revision
                </option>

                <option value="editing">
                  Editing
                </option>

                <option value="submission">
                  Submission
                </option>

                <option value="general">
                  General Work
                </option>
              </select>
            </label>
          </div>

          <label class="schedule-toggle">
            <span>
              <strong>Schedule a specific time</strong>

              <small>
                Turn this off to create a flexible session for
                the selected day.
              </small>
            </span>

            <input
              v-model="sessionForm.scheduled"
              type="checkbox"
            />
          </label>

          <div
            v-if="sessionForm.scheduled"
            class="form-grid"
          >
            <label>
              Start time

              <input
                v-model="sessionForm.start"
                type="time"
                required
              />
            </label>

            <label>
              End time

              <input
                v-model="sessionForm.end"
                type="time"
                required
              />
            </label>
          </div>

          <label class="full-field">
            Notes

            <textarea
              v-model.trim="sessionForm.notes"
              rows="4"
              placeholder="Add the goal, chapter, section, source list, or next action for this session."
            ></textarea>
          </label>

          <label class="schedule-toggle">
            <span>
              <strong>Session completed</strong>

              <small>
                This only completes the planner session, not
                the full assignment.
              </small>
            </span>

            <input
              v-model="sessionForm.completed"
              type="checkbox"
            />
          </label>

          <p
            v-if="formError"
            class="form-error"
          >
            {{ formError }}
          </p>
        </div>

        <div class="modal-actions">
          <button
            v-if="editingSessionId"
            class="delete-btn"
            type="button"
            @click="deleteEditingSession"
          >
            Delete Session
          </button>

          <div class="modal-actions-right">
            <button
              class="secondary-btn modal-secondary-btn"
              type="button"
              @click="closeSessionModal"
            >
              Cancel
            </button>

            <button
              class="primary-btn"
              type="submit"
            >
              {{
                editingSessionId
                  ? 'Save Changes'
                  : 'Add to Planner'
              }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div
      v-if="toastMessage"
      class="save-toast"
    >
      {{ toastMessage }}
    </div>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import AssignmentProgressTracker from '@/components/assignments/AssignmentProgressTracker.vue'
import AssignmentNotes from '@/components/assignments/AssignmentNotes.vue'
import SubmissionChecklist from '@/components/assignments/SubmissionChecklist.vue'
import { useAssignments } from '@/composables/useAssignments'

const PLANNER_STORAGE_KEY =
  'scholarory-planner-blocks'

const route = useRoute()
const router = useRouter()

const {
  getAssignmentById,
  updateAssignmentStatus,
  updateAssignmentPriority,
  updateAssignmentProgress,
  updateAssignmentNotes,
  updateAssignmentChecklist,
} = useAssignments()

const plannerItems = ref([])
const sessionModalOpen = ref(false)
const editingSessionId = ref('')
const formError = ref('')
const toastMessage = ref('')

const sessionForm = ref(
  createBlankSession(),
)

let toastTimer = null

const assignment = computed(() => {
  return getAssignmentById(
    route.params.id,
  )
})

const assignmentSessions = computed(() => {
  const assignmentId =
    String(assignment.value?.id || '')

  if (!assignmentId) {
    return []
  }

  return plannerItems.value
    .filter((item) => {
      const linkedAssignmentId =
        String(
          item.assignmentId ||
          (
            item.sourceType === 'assignment'
              ? item.sourceId
              : ''
          ) ||
          '',
        )

      return (
        linkedAssignmentId ===
        assignmentId
      )
    })
    .slice()
    .sort(sortSessions)
})

const totalScheduledMinutes = computed(() => {
  return assignmentSessions.value.reduce(
    (total, session) => {
      return (
        total +
        getDurationMinutes(session)
      )
    },
    0,
  )
})

const remainingWordCount = computed(() => {
  const current = Number(
    assignment.value?.wordCount?.current,
  ) || 0

  const target = Number(
    assignment.value?.wordCount?.target,
  ) || 0

  return Math.max(
    0,
    target - current,
  )
})

watch(
  () => route.params.id,
  () => {
    loadPlannerItems()
    closeSessionModal()
  },
)

onMounted(() => {
  loadPlannerItems()

  window.addEventListener(
    'storage',
    handleStorageChange,
  )
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)

  window.removeEventListener(
    'storage',
    handleStorageChange,
  )
})

function loadPlannerItems() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        PLANNER_STORAGE_KEY,
      ) || '[]',
    )

    plannerItems.value =
      Array.isArray(parsed)
        ? parsed
        : []
  } catch (error) {
    console.warn(
      'Scholarory could not load assignment planner sessions.',
      error,
    )

    plannerItems.value = []
  }
}

function writePlannerItems() {
  window.localStorage.setItem(
    PLANNER_STORAGE_KEY,
    JSON.stringify(plannerItems.value),
  )
}

function handleStorageChange(event) {
  if (
    event.key === PLANNER_STORAGE_KEY
  ) {
    loadPlannerItems()
  }
}

function createBlankSession() {
  return {
    title: '',
    date: getTodayKey(),
    scheduled: true,
    start: '09:00',
    end: '10:00',
    sessionType: 'general',
    notes: '',
    completed: false,
  }
}

function openCreateSession() {
  if (!assignment.value) {
    return
  }

  editingSessionId.value = ''
  formError.value = ''

  sessionForm.value = {
    ...createBlankSession(),

    title:
      `Work on ${assignment.value.title}`,

    date: getDefaultSessionDate(),
  }

  sessionModalOpen.value = true
}

function openEditSession(session) {
  editingSessionId.value =
    session.id

  formError.value = ''

  sessionForm.value = {
    title: session.title,
    date: session.date,
    scheduled:
      hasScheduledTime(session),

    start:
      session.start || '09:00',

    end:
      session.end || '10:00',

    sessionType:
      session.assignmentSessionType ||
      session.sessionType ||
      'general',

    notes:
      session.notes || '',

    completed:
      session.completed === true,
  }

  sessionModalOpen.value = true
}

function closeSessionModal() {
  sessionModalOpen.value = false
  editingSessionId.value = ''
  formError.value = ''

  sessionForm.value =
    createBlankSession()
}

function saveSession() {
  formError.value = ''

  if (!assignment.value) {
    formError.value =
      'This assignment could not be found.'

    return
  }

  const title =
    sessionForm.value.title.trim()

  if (!title) {
    formError.value =
      'Please enter a title for the work session.'

    return
  }

  if (
    !isValidDateKey(
      sessionForm.value.date,
    )
  ) {
    formError.value =
      'Please choose a valid date.'

    return
  }

  let start = ''
  let end = ''

  if (sessionForm.value.scheduled) {
    start = normalizeTime(
      sessionForm.value.start,
    )

    end = normalizeTime(
      sessionForm.value.end,
    )

    if (!start || !end) {
      formError.value =
        'Please choose a start and end time.'

      return
    }

    if (
      timeToMinutes(end) <=
      timeToMinutes(start)
    ) {
      formError.value =
        'The end time must be later than the start time.'

      return
    }
  }

  const existingSession =
    plannerItems.value.find(
      (item) =>
        item.id ===
        editingSessionId.value,
    )

  const timestamp =
    new Date().toISOString()

  const session = {
    ...(existingSession || {}),

    id:
      editingSessionId.value ||
      createSessionId(),

    title,
    date: sessionForm.value.date,
    start,
    end,
    category: 'classwork',

    notes:
      sessionForm.value.notes.trim(),

    completed:
      sessionForm.value.completed === true,

    assignmentId:
      String(assignment.value.id),

    assignmentTitle:
      assignment.value.title,

    assignmentCourse:
      assignment.value.course || '',

    assignmentDueDate:
      assignment.value.dueDate || '',

    assignmentSessionType:
      sessionForm.value.sessionType,

    sourceType: 'assignment',

    sourceId:
      String(assignment.value.id),

    sourceLabel:
      assignment.value.title,

    createdAt:
      existingSession?.createdAt ||
      timestamp,

    updatedAt: timestamp,
  }

  if (editingSessionId.value) {
    const index =
      plannerItems.value.findIndex(
        (item) =>
          item.id ===
          editingSessionId.value,
      )

    if (index !== -1) {
      plannerItems.value[index] =
        session
    }

    showToast(
      'Work session updated.',
    )
  } else {
    plannerItems.value.push(session)

    showToast(
      'Work session added to the planner.',
    )
  }

  writePlannerItems()
  closeSessionModal()
}

function toggleSessionComplete(session) {
  const index =
    plannerItems.value.findIndex(
      (item) => item.id === session.id,
    )

  if (index === -1) {
    return
  }

  plannerItems.value[index] = {
    ...plannerItems.value[index],

    completed:
      !plannerItems.value[index]
        .completed,

    updatedAt:
      new Date().toISOString(),
  }

  writePlannerItems()

  showToast(
    plannerItems.value[index].completed
      ? 'Work session completed.'
      : 'Work session reopened.',
  )
}

function deleteSession(session) {
  const confirmed =
    window.confirm(
      `Delete "${session.title}" from the planner?`,
    )

  if (!confirmed) {
    return
  }

  plannerItems.value =
    plannerItems.value.filter(
      (item) =>
        item.id !== session.id,
    )

  writePlannerItems()

  showToast(
    'Work session deleted.',
  )
}

function deleteEditingSession() {
  const session =
    plannerItems.value.find(
      (item) =>
        item.id ===
        editingSessionId.value,
    )

  if (!session) {
    return
  }

  const confirmed =
    window.confirm(
      `Delete "${session.title}" from the planner?`,
    )

  if (!confirmed) {
    return
  }

  plannerItems.value =
    plannerItems.value.filter(
      (item) =>
        item.id !==
        editingSessionId.value,
    )

  writePlannerItems()
  closeSessionModal()

  showToast(
    'Work session deleted.',
  )
}

function openPlanner() {
  router.push('/planner')
}

function getDefaultSessionDate() {
  const today =
    getTodayKey()

  const dueDate =
    String(
      assignment.value?.dueDate ||
      '',
    ).slice(0, 10)

  if (
    isValidDateKey(dueDate) &&
    dueDate < today
  ) {
    return today
  }

  return today
}

function sortSessions(a, b) {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date)
  }

  const aTime =
    hasScheduledTime(a)
      ? timeToMinutes(a.start)
      : 1440

  const bTime =
    hasScheduledTime(b)
      ? timeToMinutes(b.start)
      : 1440

  return aTime - bTime
}

function hasScheduledTime(session) {
  return Boolean(
    normalizeTime(session.start) &&
    normalizeTime(session.end),
  )
}

function getDurationMinutes(session) {
  if (!hasScheduledTime(session)) {
    return 0
  }

  return Math.max(
    0,
    timeToMinutes(session.end) -
      timeToMinutes(session.start),
  )
}

function normalizeTime(value) {
  const match =
    String(value || '').match(
      /^(\d{1,2}):(\d{2})/,
    )

  if (!match) {
    return ''
  }

  const hour =
    Number(match[1])

  const minute =
    Number(match[2])

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return ''
  }

  return `${String(hour).padStart(
    2,
    '0',
  )}:${String(minute).padStart(
    2,
    '0',
  )}`
}

function timeToMinutes(value) {
  const normalized =
    normalizeTime(value)

  if (!normalized) {
    return 0
  }

  const [hour, minute] =
    normalized
      .split(':')
      .map(Number)

  return hour * 60 + minute
}

function formatTime(value) {
  const minutes =
    timeToMinutes(value)

  const hour =
    Math.floor(minutes / 60)

  const minute =
    minutes % 60

  const period =
    hour >= 12 ? 'PM' : 'AM'

  const displayHour =
    hour % 12 || 12

  return `${displayHour}:${String(
    minute,
  ).padStart(2, '0')} ${period}`
}

function formatDuration(minutes) {
  const normalized =
    Math.max(
      0,
      Math.round(
        Number(minutes) || 0,
      ),
    )

  const hours =
    Math.floor(normalized / 60)

  const remainder =
    normalized % 60

  if (hours === 0) {
    return `${remainder}m`
  }

  if (remainder === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainder}m`
}

function formatDate(dateString) {
  if (!isValidDateKey(dateString)) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    parseDateKey(dateString),
  )
}

function formatMonthDay(dateString) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(
    parseDateKey(dateString),
  )
}

function formatWeekday(dateString) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      weekday: 'short',
    },
  ).format(
    parseDateKey(dateString),
  )
}

function createSessionId() {
  return `planner-assignment-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function getTodayKey() {
  const today = new Date()

  const year =
    today.getFullYear()

  const month =
    String(
      today.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      today.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDateKey(dateString) {
  const [year, month, day] =
    String(dateString)
      .slice(0, 10)
      .split('-')
      .map(Number)

  return new Date(
    year,
    month - 1,
    day,
  )
}

function isValidDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    String(value || '').slice(0, 10),
  )
}

function showToast(message) {
  window.clearTimeout(toastTimer)

  toastMessage.value = message

  toastTimer =
    window.setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
}
</script>

<style scoped>
.assignment-detail-page {
  display: grid;
  gap: 1.25rem;
}

.assignment-hero {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 300px;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.assignment-hero-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: var(--accent-text);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.assignment-hero h2 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.assignment-hero p {
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1rem;
}

.assignment-meta-card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-secondary);
}

.assignment-meta-card p {
  margin: 0;
}

.assignment-meta-card label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 800;
}

.meta-select {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.primary-btn,
.secondary-btn,
.row-btn,
.completion-box,
.session-main,
.modal-close,
.delete-btn {
  font: inherit;
  cursor: pointer;
}

.primary-btn {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--accent);
  border-radius: 9px;
  background: var(--accent);
  color: white;
  font-weight: 800;
}

.primary-btn:hover {
  filter: brightness(1.08);
}

.secondary-btn {
  margin-top: 0.75rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 700;
}

.hero-secondary-btn,
.modal-secondary-btn {
  min-height: 40px;
  margin-top: 0;
}

.secondary-btn:hover,
.row-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.planner-sessions-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading h3 {
  margin: 0;
  color: var(--text-primary);
}

.section-heading p:not(.eyebrow) {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
}

.session-list {
  display: grid;
  gap: 0.65rem;
}

.session-row {
  display: grid;
  grid-template-columns:
    auto 85px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
}

.session-row.completed {
  opacity: 0.62;
}

.session-row.completed
.session-main strong {
  text-decoration: line-through;
}

.completion-box {
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: white;
  font-size: 0.72rem;
  font-weight: 900;
}

.session-row.completed
.completion-box {
  border-color: var(--accent);
  background: var(--accent);
}

.session-date {
  display: grid;
}

.session-date strong {
  color: var(--text-primary);
  font-size: 0.72rem;
}

.session-date span {
  color: var(--text-secondary);
  font-size: 0.62rem;
}

.session-main {
  display: grid;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.session-main strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-main span,
.session-main small {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.65rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.duration-pill {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 0.6rem;
  font-weight: 850;
  white-space: nowrap;
}

.session-actions {
  display: flex;
  gap: 0.35rem;
}

.row-btn {
  min-height: 31px;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.65rem;
  font-weight: 800;
}

.delete-row-btn {
  color: #b4443e;
}

.empty-sessions {
  display: grid;
  justify-items: center;
  min-height: 220px;
  align-content: center;
  text-align: center;
}

.empty-sessions span {
  font-size: 2rem;
}

.empty-sessions h4 {
  margin: 0.6rem 0 0;
  color: var(--text-primary);
}

.empty-sessions p {
  max-width: 540px;
  margin: 0.35rem 0 1rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.detail-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.detail-card h3 {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
}

.detail-card p,
.detail-card li {
  color: var(--text-secondary);
}

.rory-card ul {
  margin: 0;
  padding-left: 1.2rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.65);
}

.session-modal {
  width: min(680px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow:
    0 24px 70px
    rgba(15, 23, 42, 0.3);
}

.modal-heading,
.modal-actions,
.modal-actions-right {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.modal-heading {
  align-items: flex-start;
}

.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-heading p:not(.eyebrow) {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-secondary);
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
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
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
  width: 100%;
  box-sizing: border-box;
  padding: 0.68rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.8rem;
}

.modal-form textarea {
  resize: vertical;
}

.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.schedule-toggle {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
}

.schedule-toggle > span {
  display: grid;
  gap: 0.15rem;
}

.schedule-toggle strong {
  color: var(--text-primary);
  font-size: 0.75rem;
}

.schedule-toggle small {
  color: var(--text-secondary);
  font-size: 0.64rem;
  line-height: 1.35;
}

.schedule-toggle input {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  accent-color: var(--accent);
}

.form-error {
  margin: 0;
  padding: 0.7rem;
  border: 1px solid #efc2bf;
  border-radius: 9px;
  background: #fff1f0;
  color: #aa3e38;
  font-size: 0.72rem;
  font-weight: 750;
}

.modal-actions {
  margin-top: 1rem;
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
  border-radius: 9px;
  background: #c9453f;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
}

.save-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 140;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow:
    0 18px 34px
    rgba(15, 23, 42, 0.28);
}

@media (max-width: 1000px) {
  .session-row {
    grid-template-columns:
      auto 75px minmax(0, 1fr);
  }

  .duration-pill,
  .session-actions {
    grid-column: 3;
  }
}

@media (max-width: 860px) {
  .assignment-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
  }
}

@media (max-width: 620px) {
  .session-row {
    grid-template-columns:
      auto minmax(0, 1fr);
  }

  .session-date {
    display: none;
  }

  .session-main,
  .duration-pill,
  .session-actions {
    grid-column: 2;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    align-items: flex-start;
    flex-direction: column;
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