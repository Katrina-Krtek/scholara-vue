<template>
  <AppLayout
    title="Yearly View"
    subtitle="Review the full year’s workload, deadlines, progress, priorities, and unfinished work."
    banner-key="planner"
    default-icon="📊"
  >
    <template #actions>
      <button
        class="secondary-btn"
        type="button"
        @click="openYearlyPlanner"
      >
        Yearly Planner
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="openMonthlyView"
      >
        Monthly View
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="openWeeklyView"
      >
        Weekly View
      </button>
    </template>

    <div class="yearly-view">
      <section class="year-navigation">
        <div class="year-navigation-actions">
          <button
            class="icon-btn"
            type="button"
            aria-label="Previous year"
            title="Previous year"
            @click="changeYear(-1)"
          >
            ←
          </button>

          <button
            class="today-btn"
            type="button"
            @click="goToThisYear"
          >
            This Year
          </button>

          <button
            class="icon-btn"
            type="button"
            aria-label="Next year"
            title="Next year"
            @click="changeYear(1)"
          >
            →
          </button>
        </div>

        <div class="selected-year-copy">
          <p>{{ yearContext }}</p>
          <h2>{{ yearNumber }}</h2>
        </div>

        <label class="year-picker-field">
          <span>Jump to year</span>

          <input
            v-model.number="selectedYear"
            type="number"
            min="1900"
            max="2100"
            @change="sanitizeSelectedYear"
          />
        </label>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span class="summary-icon">📋</span>

          <div>
            <p>Total Work</p>
            <strong>{{ totalYearlyItems }}</strong>

            <span>
              Planner items, tasks, and assignments
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">✅</span>

          <div>
            <p>Completed</p>
            <strong>{{ completedYearlyItems }}</strong>

            <span>
              {{ yearlyProgress }}% of the year complete
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
              Unfinished work from before this year
            </span>
          </div>
        </article>
      </section>

      <section
        v-if="catchUpCount"
        class="yearly-card catch-up-card"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">Catch Up</p>
            <h2>Work that still needs attention</h2>

            <p>
              Move missed planner items into this year,
              complete overdue tasks, or open past-due
              assignments.
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
            <div class="catch-up-copy">
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
              @click="movePlannerItemToYear(item.raw)"
            >
              Move to Year
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

      <section class="yearly-main-grid">
        <div class="main-column">
          <section class="yearly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Annual Workload</p>
                <h2>Month-by-month overview</h2>

                <p>
                  Compare workload, scheduled time, and
                  completion across all twelve months.
                </p>
              </div>

              <button
                class="secondary-btn"
                type="button"
                @click="openYearlyPlanner"
              >
                Manage Year
              </button>
            </div>

            <div class="month-overview-grid">
              <article
                v-for="month in yearMonths"
                :key="month.start"
                class="month-card"
                :class="{ current: month.isCurrentMonth }"
              >
                <header class="month-card-header">
                  <div>
                    <span>{{ yearNumber }}</span>
                    <strong>{{ month.name }}</strong>
                  </div>

                  <b>{{ month.progress }}%</b>
                </header>

                <div class="progress-track small">
                  <span
                    :style="{ width: `${month.progress}%` }"
                  ></span>
                </div>

                <div class="month-stat-grid">
                  <div>
                    <span>Planner</span>
                    <strong>
                      {{ month.plannerItems.length }}
                    </strong>
                  </div>

                  <div>
                    <span>Tasks</span>
                    <strong>{{ month.tasks.length }}</strong>
                  </div>

                  <div>
                    <span>Assignments</span>
                    <strong>
                      {{ month.assignments.length }}
                    </strong>
                  </div>

                  <div>
                    <span>Time</span>
                    <strong>
                      {{
                        formatDuration(
                          month.plannedMinutes,
                        )
                      }}
                    </strong>
                  </div>
                </div>

                <div
                  v-if="month.highlights.length"
                  class="month-highlights"
                >
                  <article
                    v-for="item in month.highlights"
                    :key="`${item.kind}-${item.id}`"
                    :class="{ completed: item.completed }"
                  >
                    <i :class="`dot-${item.kind}`"></i>

                    <div>
                      <strong>{{ item.title }}</strong>
                      <small>{{ item.meta }}</small>
                    </div>
                  </article>
                </div>

                <p
                  v-else
                  class="month-empty"
                >
                  No dated work this month
                </p>
              </article>
            </div>
          </section>

          <section class="yearly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Schedule</p>
                <h2>Planner items this year</h2>
              </div>

              <span class="count-pill">
                {{ yearlyPlannerItems.length }}
              </span>
            </div>

            <div
              v-if="yearlyPlannerItems.length"
              class="planner-list"
            >
              <article
                v-for="item in visiblePlannerItems"
                :key="item.id"
                class="planner-row"
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

                <div class="planner-date">
                  <strong>
                    {{ formatMonthDay(item.date) }}
                  </strong>

                  <span>
                    {{ formatYear(item.date) }}
                  </span>
                </div>

                <div class="planner-copy">
                  <strong>{{ item.title }}</strong>

                  <span>
                    <template v-if="hasScheduledTime(item)">
                      {{ formatTime(item.start) }}
                      –
                      {{ formatTime(item.end) }}
                      ·
                    </template>

                    {{ getCategoryLabel(item.category) }}
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

              <button
                v-if="yearlyPlannerItems.length > plannerDisplayLimit"
                class="secondary-btn full-width"
                type="button"
                @click="showAllPlannerItems = !showAllPlannerItems"
              >
                {{
                  showAllPlannerItems
                    ? 'Show Fewer Items'
                    : `Show All ${yearlyPlannerItems.length} Items`
                }}
              </button>
            </div>

            <div
              v-else
              class="empty-state"
            >
              <span>🗓️</span>
              <h3>No planner items this year</h3>

              <p>
                Open the Yearly Planner to organize long-range
                goals and scheduled work.
              </p>

              <button
                class="primary-btn"
                type="button"
                @click="openYearlyPlanner"
              >
                Plan This Year
              </button>
            </div>
          </section>

          <section class="yearly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Deadlines</p>
                <h2>Tasks and assignments</h2>

                <p>
                  Everything dated within the selected year.
                </p>
              </div>

              <span class="count-pill">
                {{ yearlyDeadlines.length }}
              </span>
            </div>

            <div
              v-if="yearlyDeadlines.length"
              class="deadline-list"
            >
              <article
                v-for="item in visibleDeadlines"
                :key="`${item.kind}-${item.id}`"
                class="deadline-row"
                :class="{ completed: item.completed }"
              >
                <div class="deadline-date">
                  <strong>
                    {{ formatMonthDay(item.date) }}
                  </strong>

                  <span>
                    {{ formatWeekday(item.date) }}
                  </span>
                </div>

                <div class="deadline-copy">
                  <span
                    class="kind-pill"
                    :class="`kind-${item.kind}`"
                  >
                    {{ item.kindLabel }}
                  </span>

                  <strong>{{ item.title }}</strong>
                  <small>{{ item.context }}</small>
                </div>

                <button
                  v-if="item.kind === 'task'"
                  class="small-btn"
                  type="button"
                  @click="toggleTaskComplete(item.raw)"
                >
                  {{
                    item.completed
                      ? 'Reopen'
                      : 'Complete'
                  }}
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

              <button
                v-if="yearlyDeadlines.length > deadlineDisplayLimit"
                class="secondary-btn full-width"
                type="button"
                @click="showAllDeadlines = !showAllDeadlines"
              >
                {{
                  showAllDeadlines
                    ? 'Show Fewer Deadlines'
                    : `Show All ${yearlyDeadlines.length} Deadlines`
                }}
              </button>
            </div>

            <div
              v-else
              class="small-empty"
            >
              <span>📚</span>
              <strong>No deadlines this year</strong>

              <p>
                There are no dated tasks or assignments in
                the selected year.
              </p>
            </div>
          </section>

          <section class="yearly-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Annual Reflection</p>
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
              v-model="yearlyForm.notes"
              class="yearly-notes"
              placeholder="Record progress, lessons, major wins, obstacles, and anything Rory should remember about this year."
            ></textarea>
          </section>
        </div>

        <aside class="side-column">
          <section class="yearly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Annual Focus</p>
                <h2>Main outcome</h2>
              </div>
            </div>

            <label class="field-label">
              Focus for this year

              <input
                v-model="yearlyForm.focus"
                type="text"
                placeholder="Example: Launch Scholarory and complete the DMin project"
              />
            </label>

            <label class="field-label">
              Top priorities

              <textarea
                v-model="yearlyForm.priorities"
                rows="8"
                placeholder="List the most important outcomes for this year."
              ></textarea>
            </label>
          </section>

          <section class="yearly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Tasks</p>
                <h2>Due this year</h2>
              </div>

              <span class="count-pill">
                {{ yearlyTasks.length }}
              </span>
            </div>

            <div
              v-if="yearlyTasks.length"
              class="item-list"
            >
              <label
                v-for="task in yearlyTasks.slice(0, 12)"
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
                    {{ formatShortDate(getItemDate(task)) }}
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
              <p>This year has no dated tasks.</p>
            </div>

            <button
              class="secondary-btn full-width"
              type="button"
              @click="openTasks"
            >
              Open Tasks
            </button>
          </section>

          <section class="yearly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Assignments</p>
                <h2>Due this year</h2>
              </div>

              <span class="count-pill">
                {{ yearlyAssignments.length }}
              </span>
            </div>

            <div
              v-if="yearlyAssignments.length"
              class="item-list"
            >
              <button
                v-for="assignment in yearlyAssignments.slice(0, 12)"
                :key="assignment.id"
                class="assignment-item"
                :class="{
                  completed: isCompleted(assignment),
                }"
                type="button"
                @click="openAssignment(assignment)"
              >
                <strong>{{ assignment.title }}</strong>

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

              <p>
                This year has no assignment deadlines.
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

          <section class="yearly-card">
            <div class="section-heading compact">
              <div>
                <p class="eyebrow">Progress</p>
                <h2>Yearly completion</h2>
              </div>

              <strong class="progress-number">
                {{ yearlyProgress }}%
              </strong>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-label="Yearly completion"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="yearlyProgress"
            >
              <span
                :style="{ width: `${yearlyProgress}%` }"
              ></span>
            </div>

            <div class="progress-details">
              <div>
                <span>Complete</span>
                <strong>{{ completedYearlyItems }}</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>{{ remainingYearlyItems }}</strong>
              </div>

              <div>
                <span>Planned</span>
                <strong>
                  {{ formatDuration(plannedMinutes) }}
                </strong>
              </div>

              <div>
                <span>Finished</span>
                <strong>
                  {{ formatDuration(completedMinutes) }}
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

const YEARLY_DATA_STORAGE_KEY =
  'scholarory-yearly-view-data'

const plannerDisplayLimit = 20
const deadlineDisplayLimit = 20

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
const yearlyData = ref({})

const yearlyForm = ref(
  createBlankYearlyForm(),
)

const selectedYear = ref(
  new Date().getFullYear(),
)

const timeFormat = ref('12')
const saveState = ref('saved')
const toastMessage = ref('')
const hydratingYearlyForm = ref(false)

const showAllPlannerItems = ref(false)
const showAllDeadlines = ref(false)

let saveTimer = null
let toastTimer = null

const taskList = computed(() => {
  const value = unref(tasksSource)

  return Array.isArray(value)
    ? value
    : []
})

const assignmentList = computed(() => {
  const value = unref(assignmentsSource)

  return Array.isArray(value)
    ? value
    : []
})

const yearNumber = computed(() => {
  const parsed = Number(
    selectedYear.value,
  )

  if (
    !Number.isInteger(parsed) ||
    parsed < 1900 ||
    parsed > 2100
  ) {
    return new Date().getFullYear()
  }

  return parsed
})

const yearStartKey = computed(() => {
  return `${yearNumber.value}-01-01`
})

const yearEndKey = computed(() => {
  return `${yearNumber.value}-12-31`
})

const yearContext = computed(() => {
  const currentYear =
    new Date().getFullYear()

  if (yearNumber.value === currentYear) {
    return 'This Year'
  }

  if (
    yearNumber.value === currentYear + 1
  ) {
    return 'Next Year'
  }

  if (
    yearNumber.value === currentYear - 1
  ) {
    return 'Last Year'
  }

  return 'Selected Year'
})

const yearlyPlannerItems = computed(() => {
  return plannerItems.value
    .filter((item) => {
      return isDateInSelectedYear(
        item.date,
      )
    })
    .slice()
    .sort(sortPlannerItemsByDate)
})

const visiblePlannerItems = computed(() => {
  if (showAllPlannerItems.value) {
    return yearlyPlannerItems.value
  }

  return yearlyPlannerItems.value.slice(
    0,
    plannerDisplayLimit,
  )
})

const yearlyTasks = computed(() => {
  return taskList.value
    .filter((task) => {
      return isDateInSelectedYear(
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

const yearlyAssignments = computed(() => {
  return assignmentList.value
    .filter((assignment) => {
      return isDateInSelectedYear(
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
        item.date < yearStartKey.value &&
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
        date < yearStartKey.value &&
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
        date < yearStartKey.value &&
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
          `Missed ${formatShortDate(item.date)}`,

        context:
          hasScheduledTime(item)
            ? formatTime(item.start)
            : getCategoryLabel(item.category),

        raw: item,
      }),
    )

  const tasks =
    overdueTasks.value.map(
      (task) => ({
        id: task.id,
        kind: 'task',
        kindLabel: 'Task',
        title: task.title,

        dateLabel:
          `Due ${formatShortDate(
            getItemDate(task),
          )}`,

        context:
          task.course ||
          formatPriority(task.priority),

        raw: task,
      }),
    )

  const assignments =
    overdueAssignments.value.map(
      (assignment) => ({
        id: assignment.id,
        kind: 'assignment',
        kindLabel: 'Assignment',
        title: assignment.title,

        dateLabel:
          `Due ${formatShortDate(
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
    ...tasks,
    ...assignments,
  ]
    .sort((a, b) => {
      return getItemDate(a.raw).localeCompare(
        getItemDate(b.raw),
      )
    })
    .slice(0, 12)
})

const yearlyDeadlines = computed(() => {
  const tasks =
    yearlyTasks.value.map(
      (task) => ({
        id: task.id,
        kind: 'task',
        kindLabel: 'Task',
        title: task.title,
        date: getItemDate(task),
        completed: isCompleted(task),

        context:
          task.course ||
          formatPriority(task.priority),

        raw: task,
      }),
    )

  const assignments =
    yearlyAssignments.value.map(
      (assignment) => ({
        id: assignment.id,
        kind: 'assignment',
        kindLabel: 'Assignment',
        title: assignment.title,
        date: getItemDate(assignment),

        completed:
          isCompleted(assignment),

        context:
          assignment.course ||
          formatStatus(assignment.status),

        raw: assignment,
      }),
    )

  return [
    ...tasks,
    ...assignments,
  ].sort((a, b) => {
    return a.date.localeCompare(b.date)
  })
})

const visibleDeadlines = computed(() => {
  if (showAllDeadlines.value) {
    return yearlyDeadlines.value
  }

  return yearlyDeadlines.value.slice(
    0,
    deadlineDisplayLimit,
  )
})

const yearMonths = computed(() => {
  return Array.from(
    { length: 12 },
    (_, monthIndex) => {
      const start = dateToKey(
        new Date(
          yearNumber.value,
          monthIndex,
          1,
        ),
      )

      const end = dateToKey(
        new Date(
          yearNumber.value,
          monthIndex + 1,
          0,
        ),
      )

      const monthPlannerItems =
        yearlyPlannerItems.value.filter(
          (item) => {
            return (
              item.date >= start &&
              item.date <= end
            )
          },
        )

      const monthTasks =
        yearlyTasks.value.filter(
          (task) => {
            const date =
              getItemDate(task)

            return (
              date >= start &&
              date <= end
            )
          },
        )

      const monthAssignments =
        yearlyAssignments.value.filter(
          (assignment) => {
            const date =
              getItemDate(assignment)

            return (
              date >= start &&
              date <= end
            )
          },
        )

      const highlights = [
        ...monthPlannerItems.map(
          (item) => ({
            id: item.id,
            kind: 'planner',
            title: item.title,
            completed: item.completed,

            meta:
              `${formatMonthDay(item.date)} · ${
                hasScheduledTime(item)
                  ? formatTime(item.start)
                  : getCategoryLabel(item.category)
              }`,
          }),
        ),

        ...monthTasks.map(
          (task) => ({
            id: task.id,
            kind: 'task',
            title: task.title,
            completed: isCompleted(task),

            meta:
              `${formatMonthDay(
                getItemDate(task),
              )} · ${formatPriority(
                task.priority,
              )}`,
          }),
        ),

        ...monthAssignments.map(
          (assignment) => ({
            id: assignment.id,
            kind: 'assignment',
            title: assignment.title,

            completed:
              isCompleted(assignment),

            meta:
              `${formatMonthDay(
                getItemDate(assignment),
              )} · ${
                assignment.course ||
                formatStatus(
                  assignment.status,
                )
              }`,
          }),
        ),
      ]

      const completedCount =
        highlights.filter(
          (item) => item.completed,
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

      const planned =
        monthPlannerItems.reduce(
          (total, item) => {
            return (
              total +
              getDurationMinutes(item)
            )
          },
          0,
        )

      const currentDate = new Date()

      return {
        start,
        end,

        name:
          new Intl.DateTimeFormat(
            undefined,
            {
              month: 'long',
            },
          ).format(
            new Date(
              yearNumber.value,
              monthIndex,
              1,
            ),
          ),

        plannerItems:
          monthPlannerItems,

        tasks: monthTasks,

        assignments:
          monthAssignments,

        highlights:
          highlights.slice(0, 5),

        plannedMinutes: planned,
        progress,

        isCurrentMonth:
          currentDate.getFullYear() ===
            yearNumber.value &&
          currentDate.getMonth() ===
            monthIndex,
      }
    },
  )
})

const totalYearlyItems = computed(() => {
  return (
    yearlyPlannerItems.value.length +
    yearlyTasks.value.length +
    yearlyAssignments.value.length
  )
})

const completedYearlyItems = computed(() => {
  return (
    yearlyPlannerItems.value.filter(
      (item) => item.completed,
    ).length +
    yearlyTasks.value.filter(
      isCompleted,
    ).length +
    yearlyAssignments.value.filter(
      isCompleted,
    ).length
  )
})

const remainingYearlyItems = computed(() => {
  return Math.max(
    0,
    totalYearlyItems.value -
      completedYearlyItems.value,
  )
})

const yearlyProgress = computed(() => {
  if (totalYearlyItems.value === 0) {
    return 0
  }

  return Math.round(
    (
      completedYearlyItems.value /
      totalYearlyItems.value
    ) * 100,
  )
})

const plannedMinutes = computed(() => {
  return yearlyPlannerItems.value.reduce(
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
  return yearlyPlannerItems.value.reduce(
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
  yearNumber,
  () => {
    showAllPlannerItems.value = false
    showAllDeadlines.value = false
    loadYearlyForm()
  },
)

watch(
  yearlyForm,
  () => {
    if (hydratingYearlyForm.value) {
      return
    }

    saveState.value = 'unsaved'

    window.clearTimeout(saveTimer)

    saveTimer =
      window.setTimeout(
        saveYearlyForm,
        700,
      )
  },
  { deep: true },
)

onMounted(() => {
  loadPlannerItems()
  loadYearlyData()
  loadSettings()
  loadYearlyForm()

  window.addEventListener(
    'storage',
    handleStorageChange,
  )
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(toastTimer)

  if (saveState.value === 'unsaved') {
    saveYearlyForm()
  }

  window.removeEventListener(
    'storage',
    handleStorageChange,
  )
})

function createBlankYearlyForm() {
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
      'Scholarory Yearly View could not load planner items.',
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

function loadYearlyData() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        YEARLY_DATA_STORAGE_KEY,
      ) || '{}',
    )

    yearlyData.value =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
        ? parsed
        : {}
  } catch (error) {
    console.warn(
      'Scholarory Yearly View could not load yearly data.',
      error,
    )

    yearlyData.value = {}
  }
}

function loadYearlyForm() {
  hydratingYearlyForm.value = true

  const stored =
    yearlyData.value[
      String(yearNumber.value)
    ] || {}

  yearlyForm.value = {
    focus:
      String(stored.focus || ''),

    priorities:
      String(stored.priorities || ''),

    notes:
      String(stored.notes || ''),
  }

  saveState.value = 'saved'

  window.setTimeout(() => {
    hydratingYearlyForm.value = false
  }, 0)
}

function saveYearlyForm() {
  saveState.value = 'saving'

  try {
    yearlyData.value = {
      ...yearlyData.value,

      [String(yearNumber.value)]: {
        ...yearlyForm.value,

        updatedAt:
          new Date().toISOString(),
      },
    }

    window.localStorage.setItem(
      YEARLY_DATA_STORAGE_KEY,
      JSON.stringify(
        yearlyData.value,
      ),
    )

    saveState.value = 'saved'
  } catch (error) {
    console.error(
      'Scholarory Yearly View could not save yearly data.',
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
    YEARLY_DATA_STORAGE_KEY
  ) {
    loadYearlyData()
    loadYearlyForm()
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
    plannerItems.value[index].completed
      ? 'Planner item completed.'
      : 'Planner item reopened.',
  )
}

function movePlannerItemToYear(item) {
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

    date: yearStartKey.value,

    updatedAt:
      new Date().toISOString(),
  }

  writePlannerItems()

  showToastMessage(
    'Planner item moved to January 1.',
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
  } else if (isRef(tasksSource)) {
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

function isDateInSelectedYear(dateValue) {
  return (
    dateValue &&
    dateValue >= yearStartKey.value &&
    dateValue <= yearEndKey.value
  )
}

function hasScheduledTime(item) {
  return Boolean(
    item?.start &&
    item?.end,
  )
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

function sortPlannerItemsByDate(a, b) {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date)
  }

  return (
    timeToMinutes(a.start) -
    timeToMinutes(b.start)
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

  if (timeFormat.value === '24') {
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
      year: 'numeric',
    },
  ).format(
    parseDateKey(dateKey),
  )
}

function formatMonthDay(dateKey) {
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

function formatYear(dateKey) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      year: 'numeric',
    },
  ).format(
    parseDateKey(dateKey),
  )
}

function changeYear(amount) {
  selectedYear.value =
    yearNumber.value + amount
}

function goToThisYear() {
  selectedYear.value =
    new Date().getFullYear()
}

function sanitizeSelectedYear() {
  selectedYear.value =
    yearNumber.value
}

function openYearlyPlanner() {
  router.push('/planner/year')
}

function openMonthlyView() {
  router.push('/planner/month-view')
}

function openWeeklyView() {
  router.push('/planner/weekly')
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
.yearly-view {
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

.year-navigation {
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

.year-navigation-actions {
  display: flex;
  gap: 0.4rem;
}

.selected-year-copy {
  text-align: center;
}

.selected-year-copy p,
.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.selected-year-copy h2 {
  margin: 0.2rem 0 0;
  color: var(--text-primary);
  font-size:
    clamp(1.3rem, 3vw, 1.9rem);
}

.year-picker-field,
.field-label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 750;
}

.year-picker-field input,
.field-label input,
.field-label textarea,
.yearly-notes {
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

.year-picker-field input:focus,
.field-label input:focus,
.field-label textarea:focus,
.yearly-notes:focus {
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

.yearly-card {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
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

.catch-up-copy {
  display: grid;
  min-width: 0;
}

.catch-up-copy strong {
  margin-top: 0.25rem;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catch-up-copy small {
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

.yearly-main-grid {
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
.deadline-list,
.item-list {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.month-overview-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(220px, 1fr)
    );
  gap: 0.7rem;
}

.month-card {
  display: grid;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--input-bg);
}

.month-card.current {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.month-card-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.month-card-header div {
  display: grid;
  min-width: 0;
}

.month-card-header span,
.month-card-header b {
  color: var(--text-muted);
  font-size: 0.58rem;
}

.month-card-header strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-stat-grid,
.progress-details {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
}

.month-stat-grid div,
.progress-details div {
  display: grid;
  gap: 0.1rem;
  padding: 0.45rem;
  border-radius: 8px;
  background: var(--bg-card);
}

.month-stat-grid span,
.progress-details span {
  color: var(--text-muted);
  font-size: 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
}

.month-stat-grid strong,
.progress-details strong {
  color: var(--text-primary);
  font-size: 0.64rem;
}

.month-highlights {
  display: grid;
  gap: 0.4rem;
}

.month-highlights article {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  gap: 0.4rem;
  min-width: 0;
}

.month-highlights article.completed {
  opacity: 0.55;
}

.month-highlights i {
  width: 7px;
  height: 7px;
  margin-top: 0.22rem;
  border-radius: 50%;
  background: #3977a8;
}

.month-highlights i.dot-task {
  background: #b17e2f;
}

.month-highlights i.dot-assignment {
  background: #7053a2;
}

.month-highlights div {
  display: grid;
  min-width: 0;
}

.month-highlights strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.59rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-highlights small,
.month-empty {
  color: var(--text-muted);
  font-size: 0.51rem;
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
    auto 80px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.planner-row.completed,
.deadline-row.completed {
  opacity: 0.62;
}

.planner-row.completed
.planner-copy strong,
.deadline-row.completed
.deadline-copy strong {
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
.planner-copy,
.deadline-date,
.deadline-copy {
  display: grid;
  min-width: 0;
}

.planner-date strong,
.planner-copy strong,
.deadline-date strong,
.deadline-copy strong {
  color: var(--text-primary);
  font-size: 0.7rem;
}

.planner-date span,
.planner-copy span,
.deadline-date span,
.deadline-copy small {
  color: var(--text-muted);
  font-size: 0.59rem;
}

.planner-copy strong,
.deadline-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.duration-pill {
  padding: 0.18rem 0.42rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 0.55rem;
  font-weight: 850;
}

.deadline-row {
  display: grid;
  grid-template-columns:
    78px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.deadline-copy {
  gap: 0.16rem;
}

.yearly-notes {
  min-height: 270px;
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
  min-width: 0;
}

.check-item strong,
.assignment-item strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  box-shadow:
    0 18px 34px
    rgba(15, 23, 42, 0.28);
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .yearly-main-grid {
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
  .year-navigation {
    grid-template-columns: 1fr;
  }

  .selected-year-copy {
    order: -1;
    text-align: left;
  }

  .section-heading {
    flex-direction: column;
  }
}

@media (max-width: 620px) {
  .summary-grid,
  .progress-details {
    grid-template-columns: 1fr;
  }

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

  .deadline-row {
    grid-template-columns:
      minmax(0, 1fr);
  }

  .deadline-date {
    display: none;
  }
}
</style>