<template>
  <AppLayout
    title="Weekly View"
    subtitle="See the week’s workload, deadlines, progress, priorities, and catch-up work in one place."
    banner-key="planner"
    default-icon="📆"
  >
    <template #actions>
      <button
        class="secondary-btn"
        type="button"
        @click="openWeeklyPlanner"
      >
        Weekly Planner
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="openDailyView"
      >
        Daily View
      </button>
    </template>

    <div class="weekly-view">
      <section class="week-navigation">
        <div class="week-navigation-actions">
          <button
            class="icon-btn"
            type="button"
            aria-label="Previous week"
            @click="changeWeek(-1)"
          >
            ←
          </button>

          <button
            class="today-btn"
            type="button"
            @click="goToThisWeek"
          >
            This Week
          </button>

          <button
            class="icon-btn"
            type="button"
            aria-label="Next week"
            @click="changeWeek(1)"
          >
            →
          </button>
        </div>

        <div class="selected-week-copy">
          <p>{{ weekContext }}</p>
          <h2>{{ formattedWeekRange }}</h2>
        </div>

        <label class="date-picker-field">
          <span>Jump to week</span>

          <input
            v-model="selectedDate"
            type="date"
          />
        </label>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span class="summary-icon">📋</span>

          <div>
            <p>Total Work</p>
            <strong>{{ totalWeeklyItems }}</strong>
            <span>
              Planner items, tasks, and assignments
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">✅</span>

          <div>
            <p>Completed</p>
            <strong>{{ completedWeeklyItems }}</strong>
            <span>
              {{ weeklyProgress }}% of the week complete
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">⏱️</span>

          <div>
            <p>Planned Time</p>
            <strong>
              {{ formatDuration(plannedMinutes) }}
            </strong>

            <span>
              {{ formatDuration(completedMinutes) }}
              completed
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">⚠️</span>

          <div>
            <p>Catch-Up Queue</p>
            <strong>{{ catchUpCount }}</strong>
            <span>
              Unfinished work from before this week
            </span>
          </div>
        </article>
      </section>

      <section
        v-if="catchUpCount"
        class="catch-up-card"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">Catch Up</p>
            <h2>Work that still needs attention</h2>

            <p>
              Complete overdue tasks, open overdue
              assignments, or move missed planner items into
              this week.
            </p>
          </div>

          <span class="count-pill">
            {{ catchUpCount }}
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

            <button
              v-if="item.kind === 'planner'"
              class="small-btn"
              type="button"
              @click="movePlannerItemToWeek(item.raw)"
            >
              Move to Monday
            </button>

            <button
              v-else-if="item.kind === 'task'"
              class="small-btn"
              type="button"
              @click="toggleTaskComplete(item.raw)"
            >
              Complete
            </button>

            <button
              v-else
              class="small-btn"
              type="button"
              @click="openAssignment(item.raw)"
            >
              Open
            </button>
          </article>
        </div>
      </section>

      <section class="weekly-main-grid">
        <div class="main-column">
          <section class="weekly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Workload</p>
                <h2>Day-by-day overview</h2>

                <p>
                  Compare the workload across all seven days.
                </p>
              </div>

              <button
                class="secondary-btn"
                type="button"
                @click="openWeeklyPlanner"
              >
                Manage Schedule
              </button>
            </div>

            <div class="day-overview-grid">
              <article
                v-for="day in weekDays"
                :key="day.date"
                class="day-card"
                :class="{ today: day.isToday }"
              >
                <header class="day-card-header">
                  <div>
                    <span>{{ day.weekday }}</span>
                    <strong>{{ day.dayNumber }}</strong>
                    <small>{{ day.month }}</small>
                  </div>

                  <b>{{ day.progress }}%</b>
                </header>

                <div class="progress-track small">
                  <span
                    :style="{
                      width: `${day.progress}%`,
                    }"
                  ></span>
                </div>

                <div class="day-stat-grid">
                  <div>
                    <span>Planner</span>
                    <strong>
                      {{ day.plannerItems.length }}
                    </strong>
                  </div>

                  <div>
                    <span>Tasks</span>
                    <strong>{{ day.tasks.length }}</strong>
                  </div>

                  <div>
                    <span>Assignments</span>
                    <strong>
                      {{ day.assignments.length }}
                    </strong>
                  </div>

                  <div>
                    <span>Time</span>
                    <strong>
                      {{
                        formatDuration(
                          day.plannedMinutes,
                        )
                      }}
                    </strong>
                  </div>
                </div>

                <div
                  v-if="day.highlights.length"
                  class="day-highlights"
                >
                  <article
                    v-for="item in day.highlights"
                    :key="`${item.kind}-${item.id}`"
                    :class="{
                      completed: item.completed,
                    }"
                  >
                    <i
                      :class="`dot-${item.kind}`"
                    ></i>

                    <div>
                      <strong>{{ item.title }}</strong>
                      <small>{{ item.meta }}</small>
                    </div>
                  </article>
                </div>

                <p
                  v-else
                  class="day-empty"
                >
                  Open day
                </p>
              </article>
            </div>
          </section>

          <section class="weekly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Schedule</p>
                <h2>Planner blocks this week</h2>
              </div>

              <span class="count-pill">
                {{ weeklyPlannerItems.length }}
              </span>
            </div>

            <div
              v-if="weeklyPlannerItems.length"
              class="planner-list"
            >
              <article
                v-for="item in weeklyPlannerItems"
                :key="item.id"
                class="planner-row"
                :class="{
                  completed: item.completed,
                }"
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

                <div class="planner-date">
                  <strong>
                    {{ formatWeekday(item.date) }}
                  </strong>

                  <span>
                    {{ formatShortDate(item.date) }}
                  </span>
                </div>

                <div class="planner-copy">
                  <strong>{{ item.title }}</strong>

                  <span>
                    <template
                      v-if="hasScheduledTime(item)"
                    >
                      {{ formatTime(item.start) }}–{{
                        formatTime(item.end)
                      }}
                      ·
                    </template>

                    {{
                      getCategoryLabel(item.category)
                    }}
                  </span>
                </div>

                <span
                  v-if="hasScheduledTime(item)"
                  class="duration-pill"
                >
                  {{
                    formatDuration(
                      getDurationMinutes(item),
                    )
                  }}
                </span>
              </article>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <span>🗓️</span>
              <h3>No planner items this week</h3>

              <p>
                Open the Weekly Planner to schedule the week.
              </p>

              <button
                class="primary-btn"
                type="button"
                @click="openWeeklyPlanner"
              >
                Plan This Week
              </button>
            </div>
          </section>

          <section class="weekly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">
                  Weekly Reflection
                </p>

                <h2>Notes and review</h2>
              </div>

              <span
                class="save-status"
                :class="`save-${saveState}`"
              >
                {{ saveStatusLabel }}
              </span>
            </div>

            <textarea
              v-model="weeklyForm.notes"
              class="weekly-notes"
              placeholder="Record progress, obstacles, wins, lessons, and anything Rory should remember about this week."
            ></textarea>
          </section>
        </div>

        <aside class="side-column">
          <section class="weekly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Weekly Focus</p>
                <h2>Main outcome</h2>
              </div>
            </div>

            <label class="field-label">
              Focus for this week

              <input
                v-model="weeklyForm.focus"
                type="text"
                placeholder="Example: Catch up the Scholarory build schedule"
              />
            </label>

            <label class="field-label">
              Top priorities

              <textarea
                v-model="weeklyForm.priorities"
                rows="6"
                placeholder="List the three to five most important outcomes for this week."
              ></textarea>
            </label>
          </section>

          <section class="weekly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Tasks</p>
                <h2>Due this week</h2>
              </div>

              <span class="count-pill">
                {{ weeklyTasks.length }}
              </span>
            </div>

            <div
              v-if="weeklyTasks.length"
              class="item-list"
            >
              <label
                v-for="task in weeklyTasks"
                :key="task.id"
                class="check-item"
                :class="{
                  completed: isCompleted(task),
                }"
              >
                <input
                  type="checkbox"
                  :checked="isCompleted(task)"
                  @change="toggleTaskComplete(task)"
                />

                <span>
                  <strong>{{ task.title }}</strong>

                  <small>
                    {{
                      formatShortDate(
                        getItemDate(task),
                      )
                    }}
                    ·
                    {{ formatPriority(task.priority) }}
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
              <p>This week has no dated tasks.</p>
            </div>

            <button
              class="secondary-btn full-width"
              type="button"
              @click="openTasks"
            >
              Open Tasks
            </button>
          </section>

          <section class="weekly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Assignments</p>
                <h2>Due this week</h2>
              </div>

              <span class="count-pill">
                {{ weeklyAssignments.length }}
              </span>
            </div>

            <div
              v-if="weeklyAssignments.length"
              class="item-list"
            >
              <button
                v-for="assignment in weeklyAssignments"
                :key="assignment.id"
                class="assignment-item"
                :class="{
                  completed: isCompleted(
                    assignment,
                  ),
                }"
                type="button"
                @click="openAssignment(assignment)"
              >
                <strong>
                  {{ assignment.title }}
                </strong>

                <span>
                  {{
                    assignment.course ||
                    'Independent assignment'
                  }}
                </span>

                <small>
                  Due
                  {{
                    formatShortDate(
                      getItemDate(assignment),
                    )
                  }}
                  ·
                  {{
                    formatStatus(
                      assignment.status,
                    )
                  }}
                </small>
              </button>
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>📚</span>
              <strong>No assignments due</strong>
              <p>
                This week has no assignment deadlines.
              </p>
            </div>

            <button
              class="secondary-btn full-width"
              type="button"
              @click="openAssignments"
            >
              Open Assignments
            </button>
          </section>

          <section class="weekly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Progress</p>
                <h2>Weekly completion</h2>
              </div>

              <strong class="progress-number">
                {{ weeklyProgress }}%
              </strong>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-label="Weekly completion"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="weeklyProgress"
            >
              <span
                :style="{
                  width: `${weeklyProgress}%`,
                }"
              ></span>
            </div>

            <div class="progress-details">
              <div>
                <span>Complete</span>
                <strong>
                  {{ completedWeeklyItems }}
                </strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>
                  {{ remainingWeeklyItems }}
                </strong>
              </div>

              <div>
                <span>Planned</span>
                <strong>
                  {{
                    formatDuration(
                      plannedMinutes,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Finished</span>
                <strong>
                  {{
                    formatDuration(
                      completedMinutes,
                    )
                  }}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
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
  isRef,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '../../components/AppLayout.vue'
import { useTasks } from '@/composables/useTasks'
import { useAssignments } from '@/composables/useAssignments'

const PLANNER_STORAGE_KEY =
  'scholarory-planner-blocks'

const SETTINGS_STORAGE_KEY =
  'scholarory-planner-settings'

const WEEKLY_DATA_STORAGE_KEY =
  'scholarory-weekly-view-data'

const completedStatuses = new Set([
  'complete',
  'completed',
  'done',
  'submitted',
])

const categoryLabels = {
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

const router = useRouter()
const taskStore = useTasks()
const assignmentStore = useAssignments()

const tasksSource =
  taskStore.tasks ||
  taskStore.allTasks ||
  ref([])

const assignmentsSource =
  assignmentStore.assignments ||
  assignmentStore.allAssignments ||
  ref([])

const plannerItems = ref([])
const weeklyData = ref({})

const weeklyForm = ref(
  createBlankWeeklyForm(),
)

const selectedDate = ref(
  getTodayKey(),
)

const timeFormat = ref('12')
const saveState = ref('saved')
const toastMessage = ref('')
const hydratingWeeklyForm = ref(false)

let saveTimer = null
let toastTimer = null

const taskList = computed(() => {
  const value = unref(tasksSource)

  return Array.isArray(value)
    ? value
    : []
})

const assignmentList = computed(() => {
  const value = unref(
    assignmentsSource,
  )

  return Array.isArray(value)
    ? value
    : []
})

const weekStartKey = computed(() => {
  return getWeekStartKey(
    selectedDate.value,
  )
})

const weekEndKey = computed(() => {
  return shiftDateKey(
    weekStartKey.value,
    6,
  )
})

const formattedWeekRange = computed(() => {
  const start = parseDateKey(
    weekStartKey.value,
  )

  const end = parseDateKey(
    weekEndKey.value,
  )

  const startLabel =
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(start)

  const endLabel =
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(end)

  return `${startLabel} – ${endLabel}`
})

const weekContext = computed(() => {
  const current =
    getWeekStartKey(
      getTodayKey(),
    )

  if (
    weekStartKey.value === current
  ) {
    return 'This Week'
  }

  if (
    weekStartKey.value ===
    shiftDateKey(current, 7)
  ) {
    return 'Next Week'
  }

  if (
    weekStartKey.value ===
    shiftDateKey(current, -7)
  ) {
    return 'Last Week'
  }

  return 'Selected Week'
})

const weeklyPlannerItems = computed(() => {
  return plannerItems.value
    .filter((item) => {
      return isDateInSelectedWeek(
        item.date,
      )
    })
    .slice()
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(
          b.date,
        )
      }

      const aScheduled =
        hasScheduledTime(a)

      const bScheduled =
        hasScheduledTime(b)

      if (aScheduled !== bScheduled) {
        return aScheduled ? -1 : 1
      }

      return (
        timeToMinutes(a.start) -
        timeToMinutes(b.start)
      )
    })
})

const weeklyTasks = computed(() => {
  return taskList.value
    .filter((task) => {
      return isDateInSelectedWeek(
        getItemDate(task),
      )
    })
    .slice()
    .sort((a, b) => {
      return getItemDate(a).localeCompare(
        getItemDate(b),
      )
    })
})

const weeklyAssignments = computed(() => {
  return assignmentList.value
    .filter((assignment) => {
      return isDateInSelectedWeek(
        getItemDate(assignment),
      )
    })
    .slice()
    .sort((a, b) => {
      return getItemDate(a).localeCompare(
        getItemDate(b),
      )
    })
})

const overduePlannerItems = computed(() => {
  return plannerItems.value.filter(
    (item) => {
      return (
        item.date &&
        item.date < weekStartKey.value &&
        !item.completed
      )
    },
  )
})

const overdueTasks = computed(() => {
  return taskList.value.filter(
    (task) => {
      const date = getItemDate(task)

      return (
        date &&
        date < weekStartKey.value &&
        !isCompleted(task)
      )
    },
  )
})

const overdueAssignments = computed(() => {
  return assignmentList.value.filter(
    (assignment) => {
      const date =
        getItemDate(assignment)

      return (
        date &&
        date < weekStartKey.value &&
        !isCompleted(assignment)
      )
    },
  )
})

const catchUpCount = computed(() => {
  return (
    overduePlannerItems.value.length +
    overdueTasks.value.length +
    overdueAssignments.value.length
  )
})

const catchUpItems = computed(() => {
  const planner =
    overduePlannerItems.value.map(
      (item) => ({
        id: item.id,
        kind: 'planner',
        kindLabel: 'Planner',
        title: item.title,

        dateLabel:
          `Missed ${
            formatShortDate(item.date)
          }`,

        context:
          hasScheduledTime(item)
            ? formatTime(item.start)
            : getCategoryLabel(
                item.category,
              ),

        raw: item,
      }),
    )

  const taskItems =
    overdueTasks.value.map(
      (task) => ({
        id: task.id,
        kind: 'task',
        kindLabel: 'Task',
        title: task.title,

        dateLabel:
          `Due ${
            formatShortDate(
              getItemDate(task),
            )
          }`,

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

        dateLabel:
          `Due ${
            formatShortDate(
              getItemDate(assignment),
            )
          }`,

        context:
          assignment.course ||
          formatStatus(
            assignment.status,
          ),

        raw: assignment,
      }),
    )

  return [
    ...planner,
    ...taskItems,
    ...assignmentItems,
  ]
    .sort((a, b) => {
      return getItemDate(
        a.raw,
      ).localeCompare(
        getItemDate(b.raw),
      )
    })
    .slice(0, 12)
})

const weekDays = computed(() => {
  return Array.from(
    { length: 7 },
    (_, index) => {
      const date = shiftDateKey(
        weekStartKey.value,
        index,
      )

      const parsedDate =
        parseDateKey(date)

      const dayPlannerItems =
        weeklyPlannerItems.value.filter(
          (item) =>
            item.date === date,
        )

      const dayTasks =
        weeklyTasks.value.filter(
          (task) =>
            getItemDate(task) === date,
        )

      const dayAssignments =
        weeklyAssignments.value.filter(
          (assignment) =>
            getItemDate(
              assignment,
            ) === date,
        )

      const planned =
        dayPlannerItems.reduce(
          (total, item) => {
            return (
              total +
              getDurationMinutes(item)
            )
          },
          0,
        )

      const highlights = [
        ...dayPlannerItems.map(
          (item) => ({
            id: item.id,
            kind: 'planner',
            title: item.title,
            completed:
              item.completed,

            meta:
              hasScheduledTime(item)
                ? formatTime(item.start)
                : getCategoryLabel(
                    item.category,
                  ),
          }),
        ),

        ...dayTasks.map(
          (task) => ({
            id: task.id,
            kind: 'task',
            title: task.title,
            completed:
              isCompleted(task),

            meta:
              formatPriority(
                task.priority,
              ),
          }),
        ),

        ...dayAssignments.map(
          (assignment) => ({
            id: assignment.id,
            kind: 'assignment',
            title:
              assignment.title,

            completed:
              isCompleted(
                assignment,
              ),

            meta:
              assignment.course ||
              formatStatus(
                assignment.status,
              ),
          }),
        ),
      ]

      const completedCount =
        highlights.filter(
          (item) =>
            item.completed,
        ).length

      const progress =
        highlights.length === 0
          ? 0
          : Math.round(
              (
                completedCount /
                highlights.length
              ) * 100,
            )

      return {
        date,
        plannerItems:
          dayPlannerItems,
        tasks: dayTasks,
        assignments:
          dayAssignments,
        plannedMinutes: planned,
        progress,

        highlights:
          highlights.slice(0, 4),

        isToday:
          date === getTodayKey(),

        weekday:
          new Intl.DateTimeFormat(
            undefined,
            {
              weekday: 'short',
            },
          ).format(parsedDate),

        dayNumber:
          new Intl.DateTimeFormat(
            undefined,
            {
              day: 'numeric',
            },
          ).format(parsedDate),

        month:
          new Intl.DateTimeFormat(
            undefined,
            {
              month: 'short',
            },
          ).format(parsedDate),
      }
    },
  )
})

const totalWeeklyItems = computed(() => {
  return (
    weeklyPlannerItems.value.length +
    weeklyTasks.value.length +
    weeklyAssignments.value.length
  )
})

const completedWeeklyItems = computed(() => {
  return (
    weeklyPlannerItems.value.filter(
      (item) => item.completed,
    ).length +
    weeklyTasks.value.filter(
      isCompleted,
    ).length +
    weeklyAssignments.value.filter(
      isCompleted,
    ).length
  )
})

const remainingWeeklyItems = computed(() => {
  return Math.max(
    0,
    totalWeeklyItems.value -
      completedWeeklyItems.value,
  )
})

const weeklyProgress = computed(() => {
  if (
    totalWeeklyItems.value === 0
  ) {
    return 0
  }

  return Math.round(
    (
      completedWeeklyItems.value /
      totalWeeklyItems.value
    ) * 100,
  )
})

const plannedMinutes = computed(() => {
  return weeklyPlannerItems.value.reduce(
    (total, item) => {
      return (
        total +
        getDurationMinutes(item)
      )
    },
    0,
  )
})

const completedMinutes = computed(() => {
  return weeklyPlannerItems.value.reduce(
    (total, item) => {
      return item.completed
        ? total +
            getDurationMinutes(item)
        : total
    },
    0,
  )
})

const saveStatusLabel = computed(() => {
  if (saveState.value === 'saving') {
    return 'Saving…'
  }

  if (saveState.value === 'unsaved') {
    return 'Unsaved changes'
  }

  return 'Saved'
})

watch(
  weekStartKey,
  () => {
    loadWeeklyForm()
  },
  { immediate: true },
)

watch(
  weeklyForm,
  () => {
    if (
      hydratingWeeklyForm.value
    ) {
      return
    }

    saveState.value = 'unsaved'

    window.clearTimeout(
      saveTimer,
    )

    saveTimer =
      window.setTimeout(
        saveWeeklyForm,
        700,
      )
  },
  { deep: true },
)

onMounted(() => {
  loadPlannerItems()
  loadWeeklyData()
  loadSettings()
  loadWeeklyForm()

  window.addEventListener(
    'storage',
    handleStorageChange,
  )
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(toastTimer)

  if (
    saveState.value === 'unsaved'
  ) {
    saveWeeklyForm()
  }

  window.removeEventListener(
    'storage',
    handleStorageChange,
  )
})

function createBlankWeeklyForm() {
  return {
    focus: '',
    priorities: '',
    notes: '',
  }
}

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
      'Scholarory Weekly View could not load planner items.',
      error,
    )

    plannerItems.value = []
  }
}

function writePlannerItems() {
  window.localStorage.setItem(
    PLANNER_STORAGE_KEY,
    JSON.stringify(
      plannerItems.value,
    ),
  )
}

function loadWeeklyData() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        WEEKLY_DATA_STORAGE_KEY,
      ) || '{}',
    )

    weeklyData.value =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
        ? parsed
        : {}
  } catch (error) {
    console.warn(
      'Scholarory Weekly View could not load weekly data.',
      error,
    )

    weeklyData.value = {}
  }
}

function loadWeeklyForm() {
  hydratingWeeklyForm.value = true

  const stored =
    weeklyData.value[
      weekStartKey.value
    ] || {}

  weeklyForm.value = {
    focus:
      String(stored.focus || ''),

    priorities:
      String(
        stored.priorities || '',
      ),

    notes:
      String(stored.notes || ''),
  }

  saveState.value = 'saved'

  window.setTimeout(() => {
    hydratingWeeklyForm.value =
      false
  }, 0)
}

function saveWeeklyForm() {
  saveState.value = 'saving'

  try {
    weeklyData.value = {
      ...weeklyData.value,

      [weekStartKey.value]: {
        ...weeklyForm.value,

        updatedAt:
          new Date().toISOString(),
      },
    }

    window.localStorage.setItem(
      WEEKLY_DATA_STORAGE_KEY,
      JSON.stringify(
        weeklyData.value,
      ),
    )

    saveState.value = 'saved'
  } catch (error) {
    console.error(
      'Scholarory Weekly View could not save weekly data.',
      error,
    )

    saveState.value = 'unsaved'
  }
}

function loadSettings() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        SETTINGS_STORAGE_KEY,
      ) || '{}',
    )

    timeFormat.value =
      parsed?.timeFormat === '24'
        ? '24'
        : '12'
  } catch (error) {
    timeFormat.value = '12'
  }
}

function handleStorageChange(event) {
  if (
    event.key === PLANNER_STORAGE_KEY
  ) {
    loadPlannerItems()
  }

  if (
    event.key ===
    WEEKLY_DATA_STORAGE_KEY
  ) {
    loadWeeklyData()
    loadWeeklyForm()
  }

  if (
    event.key ===
    SETTINGS_STORAGE_KEY
  ) {
    loadSettings()
  }
}

function togglePlannerComplete(item) {
  const index =
    plannerItems.value.findIndex(
      (plannerItem) =>
        plannerItem.id === item.id,
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

  showToastMessage(
    plannerItems.value[index]
      .completed
      ? 'Planner item completed.'
      : 'Planner item reopened.',
  )
}

function movePlannerItemToWeek(item) {
  const index =
    plannerItems.value.findIndex(
      (plannerItem) =>
        plannerItem.id === item.id,
    )

  if (index === -1) {
    return
  }

  plannerItems.value[index] = {
    ...plannerItems.value[index],

    date: weekStartKey.value,

    updatedAt:
      new Date().toISOString(),
  }

  writePlannerItems()

  showToastMessage(
    'Planner item moved to Monday.',
  )
}

function toggleTaskComplete(task) {
  const nextStatus =
    isCompleted(task)
      ? 'not-started'
      : 'completed'

  if (
    typeof taskStore.updateTask ===
    'function'
  ) {
    taskStore.updateTask(
      task.id,
      {
        status: nextStatus,
      },
    )
  } else if (
    isRef(tasksSource)
  ) {
    tasksSource.value =
      taskList.value.map(
        (item) => {
          return item.id === task.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        },
      )

    if (
      typeof taskStore.saveTasks ===
      'function'
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

function isCompleted(item) {
  if (
    item?.completed === true
  ) {
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

function isDateInSelectedWeek(
  dateValue,
) {
  return (
    dateValue &&
    dateValue >= weekStartKey.value &&
    dateValue <= weekEndKey.value
  )
}

function hasScheduledTime(item) {
  return Boolean(
    item?.start &&
    item?.end,
  )
}

function getDurationMinutes(item) {
  if (
    !hasScheduledTime(item)
  ) {
    return 0
  }

  return Math.max(
    0,
    timeToMinutes(item.end) -
      timeToMinutes(item.start),
  )
}

function timeToMinutes(value) {
  const [hour, minute] =
    String(value || '00:00')
      .split(':')
      .map(Number)

  return (
    (
      Number.isFinite(hour)
        ? hour
        : 0
    ) *
      60 +
    (
      Number.isFinite(minute)
        ? minute
        : 0
    )
  )
}

function formatTime(value) {
  const minutes =
    timeToMinutes(value)

  const hour =
    Math.floor(minutes / 60)

  const minute =
    minutes % 60

  if (
    timeFormat.value === '24'
  ) {
    return `${String(hour).padStart(
      2,
      '0',
    )}:${String(minute).padStart(
      2,
      '0',
    )}`
  }

  const period =
    hour >= 12
      ? 'PM'
      : 'AM'

  const displayHour =
    hour % 12 || 12

  return `${displayHour}:${String(
    minute,
  ).padStart(2, '0')} ${period}`
}

function formatDuration(minutes) {
  const normalized = Math.max(
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

function getCategoryLabel(value) {
  return (
    categoryLabels[value] ||
    'Other'
  )
}

function formatPriority(value) {
  const normalized =
    String(value || 'normal')

  return `${normalized
    .charAt(0)
    .toUpperCase()}${normalized.slice(
    1,
  )} priority`
}

function formatStatus(value) {
  const normalized =
    String(value || 'active')
      .replace(/-/g, ' ')
      .trim()

  return normalized
    .split(/\s+/)
    .map((word) => {
      return `${word
        .charAt(0)
        .toUpperCase()}${word.slice(1)}`
    })
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
  ).format(
    parseDateKey(dateKey),
  )
}

function formatWeekday(dateKey) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: 'short',
    },
  ).format(
    parseDateKey(dateKey),
  )
}

function changeWeek(amount) {
  selectedDate.value =
    shiftDateKey(
      selectedDate.value,
      amount * 7,
    )
}

function goToThisWeek() {
  selectedDate.value =
    getTodayKey()
}

function openWeeklyPlanner() {
  router.push('/planner/week')
}

function openDailyView() {
  router.push('/daily')
}

function openTasks() {
  router.push('/tasks')
}

function openAssignments() {
  router.push('/assignments')
}

function openAssignment(assignment) {
  if (!assignment?.id) {
    openAssignments()
    return
  }

  router.push(
    `/assignments/${encodeURIComponent(
      assignment.id,
    )}`,
  )
}

function getWeekStartKey(dateKey) {
  const date =
    parseDateKey(dateKey)

  const day =
    date.getDay()

  const offset =
    day === 0
      ? -6
      : 1 - day

  date.setDate(
    date.getDate() + offset,
  )

  return dateToKey(date)
}

function getTodayKey() {
  return dateToKey(
    new Date(),
  )
}

function shiftDateKey(
  dateKey,
  amount,
) {
  const date =
    parseDateKey(dateKey)

  date.setDate(
    date.getDate() + amount,
  )

  return dateToKey(date)
}

function dateToKey(date) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
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

  toastTimer =
    window.setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
}
</script>

<style scoped>
.weekly-view {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-btn,
.secondary-btn,
.icon-btn,
.today-btn,
.small-btn,
.completion-box,
.assignment-item {
  font: inherit;
  cursor: pointer;
}

.primary-btn,
.secondary-btn,
.today-btn {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 800;
}

.primary-btn {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: white;
}

.secondary-btn,
.today-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-primary);
}

.primary-btn:hover {
  filter: brightness(1.08);
}

.secondary-btn:hover,
.today-btn:hover,
.icon-btn:hover,
.small-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.full-width {
  width: 100%;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--btn-bg);
  color: var(--text-primary);
}

.week-navigation {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.week-navigation-actions {
  display: flex;
  gap: 0.4rem;
}

.selected-week-copy {
  text-align: center;
}

.selected-week-copy p,
.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.selected-week-copy h2 {
  margin: 0.2rem 0 0;
  color: var(--text-primary);
  font-size:
    clamp(1.1rem, 2.4vw, 1.55rem);
}

.date-picker-field,
.field-label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 750;
}

.date-picker-field input,
.field-label input,
.field-label textarea,
.weekly-notes {
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
}

.date-picker-field input:focus,
.field-label input:focus,
.field-label textarea:focus,
.weekly-notes:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.summary-grid {
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
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: var(--input-bg);
  font-size: 1.15rem;
}

.summary-card div {
  display: grid;
  min-width: 0;
}

.summary-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.61rem;
  font-weight: 850;
  text-transform: uppercase;
}

.summary-card strong {
  margin-top: 0.15rem;
  color: var(--text-primary);
  font-size: 1.35rem;
}

.summary-card span:not(.summary-icon) {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.65rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weekly-card,
.catch-up-card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
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
  margin: 0.18rem 0 0;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.section-heading p:not(.eyebrow) {
  margin: 0.28rem 0 0;
  color: var(--text-muted);
  font-size: 0.7rem;
}

.count-pill {
  display: grid;
  place-items: center;
  min-width: 28px;
  height: 28px;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--input-bg);
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 850;
}

.catch-up-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.catch-up-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.catch-up-main {
  display: grid;
  min-width: 0;
}

.catch-up-main strong {
  margin-top: 0.25rem;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catch-up-main small {
  color: var(--text-muted);
  font-size: 0.61rem;
}

.kind-pill {
  justify-self: start;
  padding: 0.16rem 0.4rem;
  border-radius: 999px;
  font-size: 0.53rem;
  font-weight: 850;
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

.small-btn {
  min-height: 32px;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.64rem;
  font-weight: 800;
}

.weekly-main-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(290px, 0.75fr);
  align-items: start;
  gap: 1rem;
}

.main-column,
.side-column,
.planner-list,
.item-list {
  display: grid;
  gap: 1rem;
}

.day-overview-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 190px;
  gap: 0.75rem;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.2rem 0.2rem 0.75rem;
  scroll-snap-type: x proximity;
}

.day-card {
  display: grid;
  gap: 0.65rem;
  width: 190px;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--input-bg);
  scroll-snap-align: start;
}
 .day-card > * {
    min-width: 0;
 }
.day-card.today {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.day-card-header {
  display: flex;
  justify-content: space-between;
}

.day-card-header div {
  display: grid;
}

.day-card-header span,
.day-card-header small,
.day-card-header b {
  color: var(--text-muted);
  font-size: 0.58rem;
}

.day-card-header strong {
  color: var(--text-primary);
  font-size: 1.25rem;
}

.day-stat-grid,
.progress-details {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
}

.day-stat-grid div,
.progress-details div {
  display: grid;
  gap: 0.1rem;
  padding: 0.45rem;
  border-radius: 8px;
  background: var(--bg-card);
}

.day-stat-grid span,
.progress-details span {
  color: var(--text-muted);
  font-size: 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
}

.day-stat-grid strong,
.progress-details strong {
  color: var(--text-primary);
  font-size: 0.64rem;
}

.day-highlights {
  display: grid;
  gap: 0.35rem;
}

.day-highlights article {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  gap: 0.4rem;
}

.day-highlights article.completed {
  opacity: 0.55;
}

.day-highlights i {
  width: 7px;
  height: 7px;
  margin-top: 0.22rem;
  border-radius: 50%;
  background: #3977a8;
}

.day-highlights i.dot-task {
  background: #b17e2f;
}

.day-highlights i.dot-assignment {
  background: #7053a2;
}

.day-highlights div {
  display: grid;
  min-width: 0;
}

.day-highlights strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.58rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-highlights small,
.day-empty {
  color: var(--text-muted);
  font-size: 0.5rem;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--input-bg);
}

.progress-track.small {
  height: 6px;
  background: var(--bg-card);
}

.progress-track span {
  display: block;
  min-width: 2px;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}

.planner-row {
  display: grid;
  grid-template-columns:
    auto 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.planner-row.completed {
  opacity: 0.62;
}

.planner-row.completed
.planner-copy strong {
  text-decoration: line-through;
}

.completion-box {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: white;
}

.planner-row.completed
.completion-box {
  border-color: var(--accent);
  background: var(--accent);
}

.planner-date,
.planner-copy {
  display: grid;
  min-width: 0;
}

.planner-date strong,
.planner-copy strong {
  color: var(--text-primary);
  font-size: 0.7rem;
}

.planner-date span,
.planner-copy span {
  color: var(--text-muted);
  font-size: 0.59rem;
}

.duration-pill {
  padding: 0.18rem 0.42rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 0.55rem;
  font-weight: 850;
}

.empty-state,
.small-empty {
  display: grid;
  justify-items: center;
  text-align: center;
}

.empty-state {
  min-height: 220px;
  align-content: center;
}

.empty-state h3 {
  margin: 0.5rem 0 0;
}

.empty-state p,
.small-empty p {
  color: var(--text-muted);
  font-size: 0.68rem;
}

.weekly-notes {
  min-height: 240px;
  resize: vertical;
}

.field-label textarea {
  resize: vertical;
}

.save-status {
  color: var(--text-muted);
  font-size: 0.67rem;
  font-weight: 800;
}

.save-unsaved {
  color: #9b6c13;
}

.save-saving {
  color: #416e9b;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.check-item.completed,
.assignment-item.completed {
  opacity: 0.62;
}

.check-item.completed strong,
.assignment-item.completed strong {
  text-decoration: line-through;
}

.check-item input {
  width: 17px;
  height: 17px;
  accent-color: var(--accent);
}

.check-item > span,
.assignment-item {
  display: grid;
}

.check-item strong,
.assignment-item strong {
  color: var(--text-primary);
  font-size: 0.72rem;
}

.check-item small,
.assignment-item span,
.assignment-item small {
  color: var(--text-muted);
  font-size: 0.59rem;
}

.assignment-item {
  gap: 0.16rem;
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
  text-align: left;
}

.assignment-item:hover {
  border-color: var(--accent);
}

.small-empty {
  padding: 0.8rem;
}

.progress-number {
  color: var(--accent-text);
  font-size: 1.2rem;
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
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .weekly-main-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .catch-up-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .side-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .week-navigation {
    grid-template-columns: 1fr;
  }

  .selected-week-copy {
    order: -1;
    text-align: left;
  }
}

@media (max-width: 620px) {
  .summary-grid,
  .progress-details {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .catch-up-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .planner-row {
    grid-template-columns:
      auto minmax(0, 1fr);
  }

  .planner-date,
  .duration-pill {
    display: none;
  }
}
</style>