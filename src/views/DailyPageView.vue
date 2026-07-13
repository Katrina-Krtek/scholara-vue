<template>
  <AppLayout>
    <template #header>
      <div>
        <p class="page-eyebrow">Daily View</p>
        <h1>{{ formattedSelectedDate }}</h1>

        <p class="page-subtitle">
          Plan the day, recover missed work, and keep everything moving.
        </p>
      </div>
    </template>

    <template #actions>
      <div class="date-actions">
        <button
          class="ghost-button"
          type="button"
          @click="goToPreviousDay"
        >
          ← Previous
        </button>

        <input
          v-model="selectedDate"
          class="date-input"
          type="date"
        />

        <button
          class="ghost-button"
          type="button"
          @click="goToToday"
        >
          Today
        </button>

        <button
          class="ghost-button"
          type="button"
          @click="goToNextDay"
        >
          Next →
        </button>
      </div>
    </template>

    <section class="daily-page">
      <section class="daily-summary-grid">
        <article class="summary-card">
          <span class="summary-icon">✅</span>

          <div>
            <p>Daily Progress</p>
            <strong>{{ dailyProgress }}%</strong>
            <span>
              {{ completedItemCount }} of {{ totalItemCount }} items complete
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">🗓️</span>

          <div>
            <p>Planned Time</p>
            <strong>{{ formatDuration(plannedMinutes) }}</strong>
            <span>{{ plannerItemsForSelectedDate.length }} planner items</span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">📌</span>

          <div>
            <p>Due Today</p>
            <strong>{{ dueTodayCount }}</strong>
            <span>Tasks and assignments</span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">⚠️</span>

          <div>
            <p>Catch-Up Queue</p>
            <strong>{{ catchUpItemCount }}</strong>
            <span>Unfinished items from earlier dates</span>
          </div>
        </article>
      </section>

      <section
        v-if="catchUpItemCount"
        class="catch-up-card"
      >
        <div class="section-heading">
          <div>
            <p class="page-eyebrow">Catch Up</p>
            <h2>Items that still need attention</h2>

            <p>
              Move missed planner blocks into this day, complete overdue
              tasks, or open the original assignment.
            </p>
          </div>

          <span class="count-pill">
            {{ catchUpItemCount }}
          </span>
        </div>

        <div class="catch-up-grid">
          <article
            v-for="item in catchUpItems"
            :key="`${item.kind}-${item.id}`"
            class="catch-up-item"
          >
            <div class="catch-up-main">
              <span
                class="kind-pill"
                :class="`kind-${item.kind}`"
              >
                {{ item.kindLabel }}
              </span>

              <strong>{{ item.title }}</strong>

              <small>
                {{ item.dateLabel }}
                <template v-if="item.context">
                  · {{ item.context }}
                </template>
              </small>
            </div>

            <div class="catch-up-actions">
              <button
                v-if="item.kind === 'planner'"
                class="small-button"
                type="button"
                @click="movePlannerItemHere(item.raw)"
              >
                Move here
              </button>

              <button
                v-if="item.kind === 'task'"
                class="small-button"
                type="button"
                @click="toggleTaskComplete(item.raw)"
              >
                Complete
              </button>

              <button
                v-if="item.kind === 'assignment'"
                class="small-button"
                type="button"
                @click="openAssignment(item.raw)"
              >
                Open
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="daily-main-grid">
        <div class="main-column">
          <section class="daily-card schedule-card">
            <div class="section-heading">
              <div>
                <p class="page-eyebrow">Planner</p>
                <h2>Today’s schedule</h2>

                <p>
                  Scheduled and flexible work for
                  {{ selectedDateContext.toLowerCase() }}.
                </p>
              </div>

              <button
                class="secondary-button"
                type="button"
                @click="openPlanner"
              >
                Open Planner
              </button>
            </div>

            <div
              v-if="scheduledPlannerItems.length"
              class="schedule-list"
            >
              <article
                v-for="item in scheduledPlannerItems"
                :key="item.id"
                class="schedule-row"
                :class="{ completed: item.completed }"
              >
                <button
                  class="completion-box"
                  type="button"
                  :aria-label="
                    item.completed
                      ? `Mark ${item.title} incomplete`
                      : `Mark ${item.title} complete`
                  "
                  @click="togglePlannerComplete(item)"
                >
                  {{ item.completed ? '✓' : '' }}
                </button>

                <div class="schedule-time">
                  <strong>{{ formatTime(item.start) }}</strong>
                  <span>{{ formatTime(item.end) }}</span>
                </div>

                <div class="schedule-copy">
                  <strong>{{ item.title }}</strong>

                  <span>
                    {{ getCategoryLabel(item.category) }}
                    ·
                    {{ formatDuration(getDurationMinutes(item)) }}
                  </span>

                  <p v-if="item.notes">
                    {{ item.notes }}
                  </p>
                </div>
              </article>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <span>🗓️</span>
              <h3>No scheduled blocks</h3>
              <p>
                Open the Planner to add focused work, appointments,
                meals, exercise, or rest.
              </p>

              <button
                class="primary-button"
                type="button"
                @click="openPlanner"
              >
                Plan This Day
              </button>
            </div>

            <div
              v-if="unscheduledPlannerItems.length"
              class="flexible-section"
            >
              <div class="mini-heading">
                <strong>Flexible work</strong>
                <span>{{ unscheduledPlannerItems.length }}</span>
              </div>

              <div class="flexible-list">
                <label
                  v-for="item in unscheduledPlannerItems"
                  :key="item.id"
                  class="flexible-item"
                  :class="{ completed: item.completed }"
                >
                  <input
                    type="checkbox"
                    :checked="item.completed"
                    @change="togglePlannerComplete(item)"
                  />

                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ getCategoryLabel(item.category) }}</small>
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section class="daily-card">
            <div class="section-heading">
              <div>
                <p class="page-eyebrow">Notes</p>
                <h2>Daily notes</h2>

                <p>
                  Capture progress, obstacles, ideas, and anything that
                  should carry forward.
                </p>
              </div>

              <span
                class="save-status"
                :class="`save-${notesSaveState}`"
              >
                {{ notesSaveLabel }}
              </span>
            </div>

            <textarea
              v-model="dailyNotes[selectedDate]"
              class="daily-notes"
              placeholder="Jot down what happened today, what you studied, what Rory should remember, or what needs to carry forward."
            ></textarea>
          </section>
        </div>

        <aside class="side-column">
          <section class="daily-card">
            <div class="section-heading compact">
              <div>
                <p class="page-eyebrow">Tasks</p>
                <h2>Due this day</h2>
              </div>

              <span class="count-pill">
                {{ tasksForSelectedDate.length }}
              </span>
            </div>

            <div
              v-if="tasksForSelectedDate.length"
              class="item-list"
            >
              <label
                v-for="task in tasksForSelectedDate"
                :key="task.id"
                class="check-item"
                :class="{ completed: isCompleted(task) }"
              >
                <input
                  type="checkbox"
                  :checked="isCompleted(task)"
                  @change="toggleTaskComplete(task)"
                />

                <span>
                  <strong>{{ task.title }}</strong>

                  <small>
                    {{ formatPriority(task.priority) }}
                    <template v-if="task.course">
                      · {{ task.course }}
                    </template>
                  </small>
                </span>
              </label>
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>✅</span>
              <strong>No tasks due</strong>
              <p>This date has no scheduled tasks.</p>
            </div>

            <button
              class="secondary-button full-width"
              type="button"
              @click="openTasks"
            >
              Open Tasks
            </button>
          </section>

          <section class="daily-card">
            <div class="section-heading compact">
              <div>
                <p class="page-eyebrow">Assignments</p>
                <h2>Due this day</h2>
              </div>

              <span class="count-pill">
                {{ assignmentsForSelectedDate.length }}
              </span>
            </div>

            <div
              v-if="assignmentsForSelectedDate.length"
              class="item-list"
            >
              <button
                v-for="assignment in assignmentsForSelectedDate"
                :key="assignment.id"
                class="assignment-item"
                :class="{ completed: isCompleted(assignment) }"
                type="button"
                @click="openAssignment(assignment)"
              >
                <strong>{{ assignment.title }}</strong>

                <span>
                  {{ assignment.course || 'Independent assignment' }}
                </span>

                <small>
                  {{ formatStatus(assignment.status) }}
                </small>
              </button>
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>📚</span>
              <strong>No assignments due</strong>
              <p>This date has no assignment deadlines.</p>
            </div>

            <button
              class="secondary-button full-width"
              type="button"
              @click="openAssignments"
            >
              Open Assignments
            </button>
          </section>

          <section class="daily-card progress-card">
            <div class="section-heading compact">
              <div>
                <p class="page-eyebrow">Daily Progress</p>
                <h2>Completion</h2>
              </div>

              <strong class="progress-number">
                {{ dailyProgress }}%
              </strong>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-label="Daily completion"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="dailyProgress"
            >
              <span
                :style="{ width: `${dailyProgress}%` }"
              ></span>
            </div>

            <div class="progress-details">
              <div>
                <span>Complete</span>
                <strong>{{ completedItemCount }}</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>{{ remainingItemCount }}</strong>
              </div>

              <div>
                <span>Planned</span>
                <strong>{{ formatDuration(plannedMinutes) }}</strong>
              </div>

              <div>
                <span>Finished</span>
                <strong>{{ formatDuration(completedMinutes) }}</strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>

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
  reactive,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useTasks } from '@/composables/useTasks'
import { useAssignments } from '@/composables/useAssignments'

const PLANNER_STORAGE_KEY = 'scholarory-planner-blocks'
const NOTES_STORAGE_KEY = 'scholarory-daily-notes'

const completedStatuses = new Set([
  'complete',
  'completed',
  'done',
  'submitted',
])

const router = useRouter()

const taskStore = useTasks()
const assignmentStore = useAssignments()

const tasks = taskStore.tasks || ref([])
const assignments = assignmentStore.assignments || ref([])

const getTasksByDate =
  taskStore.getTasksByDate ||
  ((dateValue) =>
    taskList.value.filter(
      (task) => getItemDate(task) === dateValue,
    ))

const getAssignmentsByDate =
  assignmentStore.getAssignmentsByDate ||
  ((dateValue) =>
    assignmentList.value.filter(
      (assignment) =>
        getItemDate(assignment) === dateValue,
    ))

const plannerItems = ref([])
const selectedDate = ref(getTodayKey())
const dailyNotes = reactive({})

const notesSaveState = ref('saved')
const toastMessage = ref('')

let notesSaveTimer = null
let toastTimer = null

const taskList = computed(() => {
  return Array.isArray(tasks.value)
    ? tasks.value
    : []
})

const assignmentList = computed(() => {
  return Array.isArray(assignments.value)
    ? assignments.value
    : []
})

const formattedSelectedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parseDateKey(selectedDate.value))
})

const selectedDateContext = computed(() => {
  const today = getTodayKey()

  if (selectedDate.value === today) {
    return 'Today'
  }

  if (
    selectedDate.value === shiftDateKey(today, 1)
  ) {
    return 'Tomorrow'
  }

  if (
    selectedDate.value === shiftDateKey(today, -1)
  ) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
  }).format(parseDateKey(selectedDate.value))
})

const plannerItemsForSelectedDate = computed(() => {
  return plannerItems.value.filter(
    (item) => item.date === selectedDate.value,
  )
})

const scheduledPlannerItems = computed(() => {
  return plannerItemsForSelectedDate.value
    .filter(hasScheduledTime)
    .slice()
    .sort((a, b) => {
      return (
        timeToMinutes(a.start) -
        timeToMinutes(b.start)
      )
    })
})

const unscheduledPlannerItems = computed(() => {
  return plannerItemsForSelectedDate.value
    .filter((item) => !hasScheduledTime(item))
    .slice()
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      return a.title.localeCompare(b.title)
    })
})

const tasksForSelectedDate = computed(() => {
  const result = getTasksByDate(
    selectedDate.value,
  )

  return Array.isArray(result)
    ? result
    : result?.value || []
})

const assignmentsForSelectedDate = computed(() => {
  const result = getAssignmentsByDate(
    selectedDate.value,
  )

  return Array.isArray(result)
    ? result
    : result?.value || []
})

const overduePlannerItems = computed(() => {
  return plannerItems.value.filter((item) => {
    return (
      item.date < selectedDate.value &&
      !item.completed
    )
  })
})

const overdueTasks = computed(() => {
  return taskList.value.filter((task) => {
    const itemDate = getItemDate(task)

    return (
      itemDate &&
      itemDate < selectedDate.value &&
      !isCompleted(task)
    )
  })
})

const overdueAssignments = computed(() => {
  return assignmentList.value.filter(
    (assignment) => {
      const itemDate = getItemDate(assignment)

      return (
        itemDate &&
        itemDate < selectedDate.value &&
        !isCompleted(assignment)
      )
    },
  )
})

const catchUpItems = computed(() => {
  const planner = overduePlannerItems.value.map(
    (item) => ({
      id: item.id,
      kind: 'planner',
      kindLabel: 'Planner',
      title: item.title,
      dateLabel: `Missed ${formatShortDate(item.date)}`,
      context: hasScheduledTime(item)
        ? formatTime(item.start)
        : getCategoryLabel(item.category),
      raw: item,
    }),
  )

  const taskItems = overdueTasks.value.map(
    (task) => ({
      id: task.id,
      kind: 'task',
      kindLabel: 'Task',
      title: task.title,
      dateLabel: `Due ${formatShortDate(getItemDate(task))}`,
      context:
        task.course ||
        formatPriority(task.priority),
      raw: task,
    }),
  )

  const assignmentItems =
    overdueAssignments.value.map(
      (assignment) => ({
        id: assignment.id,
        kind: 'assignment',
        kindLabel: 'Assignment',
        title: assignment.title,
        dateLabel: `Due ${formatShortDate(
          getItemDate(assignment),
        )}`,
        context:
          assignment.course ||
          formatStatus(assignment.status),
        raw: assignment,
      }),
    )

  return [
    ...planner,
    ...taskItems,
    ...assignmentItems,
  ]
    .sort((a, b) => {
      return (
        getItemDate(a.raw).localeCompare(
          getItemDate(b.raw),
        )
      )
    })
    .slice(0, 12)
})

const catchUpItemCount = computed(() => {
  return (
    overduePlannerItems.value.length +
    overdueTasks.value.length +
    overdueAssignments.value.length
  )
})

const dueTodayCount = computed(() => {
  return (
    tasksForSelectedDate.value.length +
    assignmentsForSelectedDate.value.length
  )
})

const totalItemCount = computed(() => {
  return (
    plannerItemsForSelectedDate.value.length +
    tasksForSelectedDate.value.length +
    assignmentsForSelectedDate.value.length
  )
})

const completedItemCount = computed(() => {
  const plannerCompleted =
    plannerItemsForSelectedDate.value.filter(
      (item) => item.completed,
    ).length

  const tasksCompleted =
    tasksForSelectedDate.value.filter(
      isCompleted,
    ).length

  const assignmentsCompleted =
    assignmentsForSelectedDate.value.filter(
      isCompleted,
    ).length

  return (
    plannerCompleted +
    tasksCompleted +
    assignmentsCompleted
  )
})

const remainingItemCount = computed(() => {
  return Math.max(
    0,
    totalItemCount.value -
      completedItemCount.value,
  )
})

const dailyProgress = computed(() => {
  if (totalItemCount.value === 0) {
    return 0
  }

  return Math.round(
    (
      completedItemCount.value /
      totalItemCount.value
    ) * 100,
  )
})

const plannedMinutes = computed(() => {
  return scheduledPlannerItems.value.reduce(
    (total, item) =>
      total + getDurationMinutes(item),
    0,
  )
})

const completedMinutes = computed(() => {
  return scheduledPlannerItems.value.reduce(
    (total, item) => {
      if (!item.completed) {
        return total
      }

      return total + getDurationMinutes(item)
    },
    0,
  )
})

const notesSaveLabel = computed(() => {
  if (notesSaveState.value === 'saving') {
    return 'Saving…'
  }

  if (notesSaveState.value === 'unsaved') {
    return 'Unsaved changes'
  }

  return 'Saved'
})

watch(
  dailyNotes,
  () => {
    notesSaveState.value = 'unsaved'

    window.clearTimeout(notesSaveTimer)

    notesSaveTimer = window.setTimeout(() => {
      saveDailyNotes()
    }, 700)
  },
  { deep: true },
)

onMounted(() => {
  loadPlannerItems()
  loadDailyNotes()

  window.addEventListener(
    'storage',
    handleStorageChange,
  )
})

onBeforeUnmount(() => {
  window.clearTimeout(notesSaveTimer)
  window.clearTimeout(toastTimer)

  if (notesSaveState.value === 'unsaved') {
    saveDailyNotes()
  }

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

    plannerItems.value = Array.isArray(parsed)
      ? parsed
      : []
  } catch (error) {
    console.warn(
      'Scholarory Daily View could not load planner items.',
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

function loadDailyNotes() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        NOTES_STORAGE_KEY,
      ) || '{}',
    )

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      Object.assign(dailyNotes, parsed)
    }
  } catch (error) {
    console.warn(
      'Scholarory Daily View could not load daily notes.',
      error,
    )
  }

  notesSaveState.value = 'saved'
}

function saveDailyNotes() {
  notesSaveState.value = 'saving'

  try {
    window.localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(dailyNotes),
    )

    notesSaveState.value = 'saved'
  } catch (error) {
    console.error(
      'Scholarory Daily View could not save daily notes.',
      error,
    )

    notesSaveState.value = 'unsaved'
  }
}

function handleStorageChange(event) {
  if (
    event.key === PLANNER_STORAGE_KEY
  ) {
    loadPlannerItems()
  }

  if (
    event.key === NOTES_STORAGE_KEY
  ) {
    loadDailyNotes()
  }
}

function togglePlannerComplete(item) {
  const index = plannerItems.value.findIndex(
    (plannerItem) =>
      plannerItem.id === item.id,
  )

  if (index === -1) {
    return
  }

  plannerItems.value[index] = {
    ...plannerItems.value[index],
    completed:
      !plannerItems.value[index].completed,
    updatedAt: new Date().toISOString(),
  }

  writePlannerItems()

  showToastMessage(
    plannerItems.value[index].completed
      ? 'Planner item completed.'
      : 'Planner item reopened.',
  )
}

function movePlannerItemHere(item) {
  const index = plannerItems.value.findIndex(
    (plannerItem) =>
      plannerItem.id === item.id,
  )

  if (index === -1) {
    return
  }

  plannerItems.value[index] = {
    ...plannerItems.value[index],
    date: selectedDate.value,
    updatedAt: new Date().toISOString(),
  }

  writePlannerItems()

  showToastMessage(
    `Moved to ${selectedDateContext.value}.`,
  )
}

function toggleTaskComplete(task) {
  const nextStatus = isCompleted(task)
    ? 'not-started'
    : 'completed'

  if (
    typeof taskStore.updateTask === 'function'
  ) {
    taskStore.updateTask(task.id, {
      status: nextStatus,
    })
  } else {
    tasks.value = taskList.value.map(
      (item) => {
        if (item.id !== task.id) {
          return item
        }

        return {
          ...item,
          status: nextStatus,
        }
      },
    )

    if (
      typeof taskStore.saveTasks === 'function'
    ) {
      taskStore.saveTasks()
    }
  }

  showToastMessage(
    nextStatus === 'completed'
      ? 'Task completed.'
      : 'Task reopened.',
  )
}

function openPlanner() {
  router.push('/planner')
}

function openTasks() {
  router.push('/tasks')
}

function openAssignments() {
  router.push('/assignments')
}

function openAssignment(assignment) {
  if (assignment?.id) {
    router.push(
      `/assignments/${encodeURIComponent(
        assignment.id,
      )}`,
    )

    return
  }

  openAssignments()
}

function goToPreviousDay() {
  selectedDate.value = shiftDateKey(
    selectedDate.value,
    -1,
  )
}

function goToNextDay() {
  selectedDate.value = shiftDateKey(
    selectedDate.value,
    1,
  )
}

function goToToday() {
  selectedDate.value = getTodayKey()
}

function isCompleted(item) {
  if (item?.completed === true) {
    return true
  }

  return completedStatuses.has(
    String(item?.status || '')
      .trim()
      .toLowerCase(),
  )
}

function getItemDate(item) {
  return String(
    item?.dueDate ||
    item?.date ||
    item?.deadline ||
    item?.scheduledDate ||
    '',
  ).slice(0, 10)
}

function hasScheduledTime(item) {
  return Boolean(item?.start && item?.end)
}

function getDurationMinutes(item) {
  if (!hasScheduledTime(item)) {
    return 0
  }

  return Math.max(
    0,
    timeToMinutes(item.end) -
      timeToMinutes(item.start),
  )
}

function timeToMinutes(value) {
  const [hour, minute] = String(
    value || '00:00',
  )
    .split(':')
    .map(Number)

  return (
    (Number.isFinite(hour) ? hour : 0) *
      60 +
    (Number.isFinite(minute) ? minute : 0)
  )
}

function formatTime(value) {
  const [hourValue, minuteValue] =
    String(value || '00:00')
      .split(':')
      .map(Number)

  const date = new Date()
  date.setHours(
    Number.isFinite(hourValue)
      ? hourValue
      : 0,
    Number.isFinite(minuteValue)
      ? minuteValue
      : 0,
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

function formatDuration(minutes) {
  const normalized = Math.max(
    0,
    Math.round(Number(minutes) || 0),
  )

  const hours = Math.floor(
    normalized / 60,
  )

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

function getCategoryLabel(value) {
  const labels = {
    scholarory: 'Scholarory',
    classwork: 'Classwork',
    study: 'Study',
    meeting: 'Meeting',
    personal: 'Personal',
    meal: 'Meal',
    gym: 'Gym',
    rest: 'Rest',
    other: 'Other',
  }

  return labels[value] || 'Other'
}

function formatPriority(value) {
  const normalized = String(
    value || 'normal',
  )

  return `${normalized
    .charAt(0)
    .toUpperCase()}${normalized.slice(1)} priority`
}

function formatStatus(value) {
  const normalized = String(
    value || 'active',
  )
    .replace(/-/g, ' ')
    .trim()

  return normalized
    .split(/\s+/)
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(' ')
}

function formatShortDate(dateKey) {
  if (!dateKey) {
    return 'Earlier'
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(parseDateKey(dateKey))
}

function getTodayKey() {
  return dateToKey(new Date())
}

function shiftDateKey(dateKey, amount) {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + amount)

  return dateToKey(date)
}

function dateToKey(date) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey) {
  const [year, month, day] =
    String(dateKey)
      .split('-')
      .map(Number)

  return new Date(
    year,
    month - 1,
    day,
  )
}

function showToastMessage(message) {
  window.clearTimeout(toastTimer)

  toastMessage.value = message

  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
  }, 2200)
}
</script>

<style scoped>
.daily-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.page-eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent, #d4a017);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--text-primary, #111827);
}

.page-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-secondary, #64748b);
}

.date-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.ghost-button,
.primary-button,
.secondary-button,
.small-button,
.completion-box,
.assignment-item {
  font: inherit;
  cursor: pointer;
}

.ghost-button {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 999px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #111827);
  font-size: 0.75rem;
  font-weight: 800;
}

.ghost-button:hover {
  border-color: var(--accent, #d4a017);
  color: var(--accent-text, #b45309);
}

.date-input {
  min-height: 40px;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 999px;
  outline: none;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #111827);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
}

.date-input:focus {
  border-color: var(--accent, #d4a017);
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(212, 160, 23, 0.12));
}

.daily-summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-card, #ffffff);
  box-shadow: var(--shadow, 0 12px 30px rgba(15, 23, 42, 0.06));
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: var(--input-bg, #f8fafc);
  font-size: 1.15rem;
}

.summary-card div {
  display: grid;
  min-width: 0;
}

.summary-card p {
  margin: 0;
  color: var(--text-muted, #64748b);
  font-size: 0.61rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-card strong {
  margin-top: 0.18rem;
  color: var(--text-primary, #111827);
  font-size: 1.35rem;
  line-height: 1;
}

.summary-card span:not(.summary-icon) {
  margin-top: 0.28rem;
  overflow: hidden;
  color: var(--text-muted, #64748b);
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.daily-card,
.catch-up-card {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 16px;
  background: var(--bg-card, #ffffff);
  box-shadow: var(--shadow, 0 12px 30px rgba(15, 23, 42, 0.06));
}

.daily-card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
}

.catch-up-card {
  padding: 1rem;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading.compact {
  align-items: center;
}

.section-heading h2 {
  margin: 0;
  color: var(--text-primary, #111827);
  font-size: 1.05rem;
}

.section-heading p:not(.page-eyebrow) {
  margin: 0.3rem 0 0;
  color: var(--text-muted, #64748b);
  font-size: 0.72rem;
  line-height: 1.45;
}

.count-pill {
  display: grid;
  place-items: center;
  min-width: 29px;
  height: 29px;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--input-bg, #f8fafc);
  color: var(--text-secondary, #475569);
  font-size: 0.68rem;
  font-weight: 850;
}

.catch-up-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.catch-up-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 11px;
  background: var(--input-bg, #f8fafc);
}

.catch-up-main {
  display: grid;
  min-width: 0;
}

.catch-up-main strong {
  margin-top: 0.3rem;
  overflow: hidden;
  color: var(--text-primary, #111827);
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catch-up-main small {
  margin-top: 0.18rem;
  color: var(--text-muted, #64748b);
  font-size: 0.62rem;
}

.kind-pill {
  justify-self: start;
  padding: 0.16rem 0.4rem;
  border-radius: 999px;
  background: #eef2f7;
  color: #536075;
  font-size: 0.54rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.kind-planner {
  background: #edf3fb;
  color: #416e9b;
}

.kind-task {
  background: #fff5dc;
  color: #926614;
}

.kind-assignment {
  background: #f2edfb;
  color: #7053a2;
}

.catch-up-actions {
  flex: 0 0 auto;
}

.small-button {
  min-height: 32px;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #475569);
  font-size: 0.65rem;
  font-weight: 800;
}

.small-button:hover {
  border-color: var(--accent, #d4a017);
  color: var(--accent-text, #b45309);
}

.daily-main-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(290px, 0.75fr);
  align-items: start;
  gap: 1rem;
}

.main-column,
.side-column {
  display: grid;
  gap: 1rem;
}

.primary-button,
.secondary-button {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  font-size: 0.76rem;
  font-weight: 800;
}

.primary-button {
  border: 1px solid var(--accent, #d4a017);
  background: var(--accent, #d4a017);
  color: white;
}

.secondary-button {
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--btn-bg, #ffffff);
  color: var(--text-primary, #111827);
}

.primary-button:hover {
  filter: brightness(1.08);
}

.secondary-button:hover {
  border-color: var(--accent, #d4a017);
  color: var(--accent-text, #b45309);
}

.full-width {
  width: 100%;
}

.schedule-list {
  display: grid;
  gap: 0.6rem;
}

.schedule-row {
  display: grid;
  grid-template-columns:
    auto 82px minmax(0, 1fr);
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 11px;
  background: var(--input-bg, #f8fafc);
}

.schedule-row.completed {
  opacity: 0.65;
}

.schedule-row.completed .schedule-copy > strong {
  text-decoration: line-through;
}

.completion-box {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: var(--bg-card, #ffffff);
  color: white;
  font-size: 0.72rem;
  font-weight: 900;
}

.schedule-row.completed .completion-box {
  border-color: var(--accent, #d4a017);
  background: var(--accent, #d4a017);
}

.schedule-time {
  display: grid;
}

.schedule-time strong {
  color: var(--text-primary, #111827);
  font-size: 0.69rem;
}

.schedule-time span {
  margin-top: 0.15rem;
  color: var(--text-muted, #64748b);
  font-size: 0.62rem;
}

.schedule-copy {
  display: grid;
  min-width: 0;
}

.schedule-copy > strong {
  color: var(--text-primary, #111827);
  font-size: 0.78rem;
}

.schedule-copy > span {
  margin-top: 0.18rem;
  color: var(--text-muted, #64748b);
  font-size: 0.63rem;
}

.schedule-copy p {
  margin: 0.28rem 0 0;
  color: var(--text-secondary, #475569);
  font-size: 0.68rem;
  line-height: 1.4;
}

.flexible-section {
  display: grid;
  gap: 0.55rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.mini-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.mini-heading strong {
  color: var(--text-primary, #111827);
  font-size: 0.75rem;
}

.mini-heading span {
  color: var(--text-muted, #64748b);
  font-size: 0.66rem;
}

.flexible-list,
.item-list {
  display: grid;
  gap: 0.5rem;
}

.flexible-item,
.check-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  background: var(--input-bg, #f8fafc);
  cursor: pointer;
}

.flexible-item.completed,
.check-item.completed {
  opacity: 0.62;
}

.flexible-item.completed strong,
.check-item.completed strong {
  text-decoration: line-through;
}

.flexible-item input,
.check-item input {
  width: 17px;
  height: 17px;
  accent-color: var(--accent, #d4a017);
}

.flexible-item > span,
.check-item > span {
  display: grid;
  min-width: 0;
}

.flexible-item strong,
.check-item strong {
  color: var(--text-primary, #111827);
  font-size: 0.74rem;
}

.flexible-item small,
.check-item small {
  margin-top: 0.15rem;
  color: var(--text-muted, #64748b);
  font-size: 0.61rem;
}

.assignment-item {
  display: grid;
  gap: 0.18rem;
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  background: var(--input-bg, #f8fafc);
  color: inherit;
  text-align: left;
}

.assignment-item:hover {
  border-color: var(--accent, #d4a017);
}

.assignment-item.completed {
  opacity: 0.62;
}

.assignment-item.completed strong {
  text-decoration: line-through;
}

.assignment-item strong {
  color: var(--text-primary, #111827);
  font-size: 0.74rem;
}

.assignment-item span,
.assignment-item small {
  color: var(--text-muted, #64748b);
  font-size: 0.61rem;
}

.empty-state,
.small-empty {
  display: grid;
  justify-items: center;
  text-align: center;
}

.empty-state {
  min-height: 260px;
  align-content: center;
  padding: 1rem;
  border: 1px dashed var(--border-color, #e5e7eb);
  border-radius: 12px;
  background: var(--input-bg, #f8fafc);
}

.empty-state > span {
  font-size: 1.8rem;
}

.empty-state h3 {
  margin: 0.55rem 0 0;
  color: var(--text-primary, #111827);
}

.empty-state p {
  max-width: 440px;
  margin: 0.4rem 0 0.9rem;
  color: var(--text-muted, #64748b);
  font-size: 0.74rem;
  line-height: 1.45;
}

.small-empty {
  padding: 0.8rem 0.5rem;
}

.small-empty > span {
  font-size: 1.3rem;
}

.small-empty strong {
  margin-top: 0.4rem;
  color: var(--text-primary, #111827);
  font-size: 0.73rem;
}

.small-empty p {
  margin: 0.2rem 0 0;
  color: var(--text-muted, #64748b);
  font-size: 0.62rem;
}

.daily-notes {
  width: 100%;
  min-height: 260px;
  box-sizing: border-box;
  resize: vertical;
  padding: 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  outline: none;
  background: var(--input-bg, #f8fafc);
  color: var(--text-primary, #111827);
  font: inherit;
  line-height: 1.55;
}

.daily-notes:focus {
  border-color: var(--accent, #d4a017);
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(212, 160, 23, 0.12));
}

.save-status {
  color: var(--text-muted, #64748b);
  font-size: 0.67rem;
  font-weight: 800;
}

.save-unsaved {
  color: #9b6c13;
}

.save-saving {
  color: #416e9b;
}

.progress-number {
  color: var(--accent-text, #b45309);
  font-size: 1.2rem;
}

.progress-track {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--input-bg, #f8fafc);
}

.progress-track span {
  display: block;
  min-width: 2px;
  height: 100%;
  border-radius: inherit;
  background: var(--accent, #d4a017);
  transition: width 220ms ease;
}

.progress-details {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.progress-details div {
  display: grid;
  gap: 0.15rem;
  padding: 0.65rem;
  border-radius: 9px;
  background: var(--input-bg, #f8fafc);
}

.progress-details span {
  color: var(--text-muted, #64748b);
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
}

.progress-details strong {
  color: var(--text-primary, #111827);
  font-size: 0.73rem;
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
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.28);
}

@media (max-width: 1100px) {
  .daily-summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .daily-main-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .catch-up-grid,
  .side-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .daily-summary-grid,
  .progress-details {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .catch-up-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .date-actions {
    width: 100%;
  }

  .date-input {
    width: 100%;
    box-sizing: border-box;
  }

  .ghost-button {
    flex: 1;
  }

  .schedule-row {
    grid-template-columns:
      auto minmax(0, 1fr);
  }

  .schedule-copy {
    grid-column: 2;
  }
}
</style>
