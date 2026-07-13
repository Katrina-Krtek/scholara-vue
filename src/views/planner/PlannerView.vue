<template>
  <AppLayout
    title="Daily Planner"
    subtitle="Plan the day, recover missed work, and protect focused time."
    banner-key="planner"
    default-icon="🗓️"
  >
    <template #actions>
      <button
        class="primary-btn"
        type="button"
        @click="openCreateModal(true)"
      >
        + Add Time Block
      </button>
    </template>

    <div class="daily-planner">
      <section class="date-navigation">
        <div class="date-navigation-actions">
          <button
            class="icon-btn"
            type="button"
            aria-label="Previous day"
            title="Previous day"
            @click="changeDay(-1)"
          >
            ←
          </button>

          <button
            class="today-btn"
            type="button"
            @click="goToToday"
          >
            Today
          </button>

          <button
            class="icon-btn"
            type="button"
            aria-label="Next day"
            title="Next day"
            @click="changeDay(1)"
          >
            →
          </button>
        </div>

        <div class="selected-date-copy">
          <p>{{ selectedDateContext }}</p>
          <h2>{{ formattedSelectedDate }}</h2>
        </div>

        <label class="date-picker-field">
          <span>Jump to date</span>

          <input
            v-model="selectedDate"
            type="date"
          />
        </label>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <span class="summary-icon">⏱️</span>

          <div>
            <p>Planned Time</p>
            <strong>{{ formatDuration(plannedMinutes) }}</strong>
            <span>{{ scheduledBlocks.length }} scheduled blocks</span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">✅</span>

          <div>
            <p>Completed</p>
            <strong>{{ formatDuration(completedMinutes) }}</strong>
            <span>{{ completedBlockCount }} blocks finished</span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">⌛</span>

          <div>
            <p>Remaining</p>
            <strong>{{ formatDuration(remainingMinutes) }}</strong>
            <span>{{ remainingBlockCount }} blocks left</span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">📥</span>

          <div>
            <p>Catch-Up Queue</p>
            <strong>{{ catchUpBlocks.length }}</strong>
            <span>Incomplete items from earlier days</span>
          </div>
        </article>
      </section>

      <section class="planner-layout">
        <article class="timeline-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Daily Timeline</p>
              <h2>{{ selectedDateContext }}’s schedule</h2>
              <p>
                {{ formatHourBoundary(settings.dayStart) }}
                –
                {{ formatHourBoundary(settings.dayEnd) }}
              </p>
            </div>

            <div class="timeline-heading-actions">
              <div
                class="day-progress"
                role="progressbar"
                aria-label="Daily planner completion"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="dayProgress"
              >
                <span>{{ dayProgress }}%</span>

                <div>
                  <i :style="{ width: `${dayProgress}%` }"></i>
                </div>
              </div>

              <button
                class="secondary-btn"
                type="button"
                @click="openCreateModal(false)"
              >
                + Unscheduled Item
              </button>
            </div>
          </div>

          <div
            v-if="scheduledBlocks.length === 0"
            class="timeline-empty"
          >
            <span>🗓️</span>
            <h3>No time blocks scheduled</h3>
            <p>
              Add focused work, meals, exercise, appointments, or
              rest to shape this day.
            </p>

            <button
              class="primary-btn"
              type="button"
              @click="openCreateModal(true)"
            >
              Add First Time Block
            </button>
          </div>

          <div
            v-else
            class="timeline-scroll"
          >
            <div
              class="timeline-stage"
              :style="{ height: `${timelineHeight}px` }"
            >
              <div
                v-for="slot in timeSlots"
                :key="slot.minutes"
                class="timeline-line"
                :style="{ top: `${slot.offset}px` }"
              >
                <span>{{ slot.label }}</span>
                <i></i>
              </div>

              <article
                v-for="block in visibleScheduledBlocks"
                :key="block.id"
                class="timeline-event"
                :class="[
                  `category-${block.category}`,
                  { completed: block.completed },
                ]"
                :style="getBlockStyle(block)"
                tabindex="0"
                role="button"
                :aria-label="`Edit ${block.title}`"
                @click="openEditModal(block)"
                @keydown.enter.prevent="openEditModal(block)"
                @keydown.space.prevent="openEditModal(block)"
              >
                <button
                  class="complete-toggle"
                  type="button"
                  :aria-label="
                    block.completed
                      ? `Mark ${block.title} incomplete`
                      : `Mark ${block.title} complete`
                  "
                  :title="
                    block.completed
                      ? 'Mark incomplete'
                      : 'Mark complete'
                  "
                  @click.stop="toggleComplete(block)"
                >
                  {{ block.completed ? '✓' : '' }}
                </button>

                <div class="event-copy">
                  <strong>{{ block.title }}</strong>

                  <span>
                    {{ formatTime(block.start) }}
                    –
                    {{ formatTime(block.end) }}
                    ·
                    {{ formatDuration(getDurationMinutes(block)) }}
                  </span>

                  <small v-if="block.notes">
                    {{ block.notes }}
                  </small>
                </div>

                <span class="event-category">
                  {{ getCategoryLabel(block.category) }}
                </span>
              </article>
            </div>
          </div>

          <div
            v-if="outsideTimelineBlocks.length"
            class="outside-timeline-notice"
          >
            <strong>
              {{ outsideTimelineBlocks.length }}
              {{
                outsideTimelineBlocks.length === 1
                  ? 'block is'
                  : 'blocks are'
              }}
              outside the visible time range.
            </strong>

            <span>
              Adjust the planner’s start or end time in Settings to
              display them.
            </span>
          </div>
        </article>

        <aside class="planner-sidebar">
          <section class="sidebar-card">
            <div class="sidebar-heading">
              <div>
                <p class="eyebrow">Catch Up</p>
                <h2>Missed items</h2>
              </div>

              <span>{{ catchUpBlocks.length }}</span>
            </div>

            <div
              v-if="catchUpBlocks.length"
              class="queue-list"
            >
              <article
                v-for="block in catchUpBlocks.slice(0, 8)"
                :key="block.id"
                class="queue-item"
              >
                <button
                  class="queue-main"
                  type="button"
                  @click="openEditModal(block)"
                >
                  <strong>{{ block.title }}</strong>

                  <span>
                    {{ formatShortDate(block.date) }}
                    <template v-if="hasScheduledTime(block)">
                      · {{ formatTime(block.start) }}
                    </template>
                  </span>
                </button>

                <div class="queue-actions">
                  <button
                    class="small-btn"
                    type="button"
                    @click="moveToSelectedDate(block)"
                  >
                    Move here
                  </button>

                  <button
                    class="complete-mini-btn"
                    type="button"
                    aria-label="Mark complete"
                    title="Mark complete"
                    @click="toggleComplete(block)"
                  >
                    ✓
                  </button>
                </div>
              </article>

              <p
                v-if="catchUpBlocks.length > 8"
                class="more-items"
              >
                +{{ catchUpBlocks.length - 8 }} more missed items
              </p>
            </div>

            <div
              v-else
              class="sidebar-empty"
            >
              <span>🎉</span>
              <strong>You are caught up</strong>
              <p>No unfinished planner items are waiting from earlier days.</p>
            </div>
          </section>

          <section class="sidebar-card">
            <div class="sidebar-heading">
              <div>
                <p class="eyebrow">Flexible Work</p>
                <h2>Unscheduled today</h2>
              </div>

              <span>{{ unscheduledBlocks.length }}</span>
            </div>

            <div
              v-if="unscheduledBlocks.length"
              class="queue-list"
            >
              <article
                v-for="block in unscheduledBlocks"
                :key="block.id"
                class="queue-item"
                :class="{ completed: block.completed }"
              >
                <button
                  class="queue-main"
                  type="button"
                  @click="openEditModal(block)"
                >
                  <strong>{{ block.title }}</strong>
                  <span>{{ getCategoryLabel(block.category) }}</span>
                </button>

                <div class="queue-actions">
                  <button
                    class="small-btn"
                    type="button"
                    @click="scheduleBlock(block)"
                  >
                    Schedule
                  </button>

                  <button
                    class="complete-mini-btn"
                    type="button"
                    :aria-label="
                      block.completed
                        ? 'Mark incomplete'
                        : 'Mark complete'
                    "
                    :title="
                      block.completed
                        ? 'Mark incomplete'
                        : 'Mark complete'
                    "
                    @click="toggleComplete(block)"
                  >
                    {{ block.completed ? '↺' : '✓' }}
                  </button>
                </div>
              </article>
            </div>

            <div
              v-else
              class="sidebar-empty compact"
            >
              <span>📌</span>
              <strong>No flexible items</strong>
              <p>Add work that needs to happen without assigning a time yet.</p>
            </div>

            <button
              class="secondary-btn full-width-btn"
              type="button"
              @click="openCreateModal(false)"
            >
              + Add Unscheduled Item
            </button>
          </section>

          <section class="sidebar-card">
            <div class="sidebar-heading">
              <div>
                <p class="eyebrow">Preferences</p>
                <h2>Planner settings</h2>
              </div>
            </div>

            <label class="settings-field">
              Time format

              <select
                v-model="settings.timeFormat"
                @change="saveSettings"
              >
                <option value="12">AM / PM</option>
                <option value="24">24-hour</option>
              </select>
            </label>

            <div class="settings-grid">
              <label class="settings-field">
                Day starts

                <select
                  v-model.number="settings.dayStart"
                  @change="handleTimeRangeChange"
                >
                  <option
                    v-for="hour in dayStartOptions"
                    :key="hour"
                    :value="hour"
                  >
                    {{ formatHourBoundary(hour) }}
                  </option>
                </select>
              </label>

              <label class="settings-field">
                Day ends

                <select
                  v-model.number="settings.dayEnd"
                  @change="handleTimeRangeChange"
                >
                  <option
                    v-for="hour in dayEndOptions"
                    :key="hour"
                    :value="hour"
                  >
                    {{ formatHourBoundary(hour) }}
                  </option>
                </select>
              </label>
            </div>

            <p class="settings-note">
              Set the visible window around your real schedule. The
              planner supports overnight workers and a full 24-hour day.
            </p>
          </section>
        </aside>
      </section>
    </div>

    <div
      v-if="itemModalOpen"
      class="modal-backdrop"
      @click.self="closeItemModal"
    >
      <form
        class="planner-modal"
        @submit.prevent="saveItem"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">Planner Item</p>

            <h2>
              {{
                editingItemId
                  ? 'Edit Planner Item'
                  : itemForm.scheduled
                    ? 'New Time Block'
                    : 'New Unscheduled Item'
              }}
            </h2>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close planner item"
            @click="closeItemModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label class="full-field">
            Title

            <input
              v-model.trim="itemForm.title"
              type="text"
              required
              placeholder="Example: Scholarory build session"
            />
          </label>

          <div class="form-grid">
            <label>
              Date

              <input
                v-model="itemForm.date"
                type="date"
                required
              />
            </label>

            <label>
              Category

              <select v-model="itemForm.category">
                <option
                  v-for="category in categories"
                  :key="category.value"
                  :value="category.value"
                >
                  {{ category.label }}
                </option>
              </select>
            </label>
          </div>

          <label class="schedule-toggle">
            <span>
              <strong>Schedule a time</strong>
              <small>
                Turn this off to keep the item in the flexible-work list.
              </small>
            </span>

            <input
              v-model="itemForm.scheduled"
              type="checkbox"
            />
          </label>

          <div
            v-if="itemForm.scheduled"
            class="form-grid"
          >
            <label>
              Start time

              <input
                v-model="itemForm.start"
                type="time"
                required
              />
            </label>

            <label>
              End time

              <input
                v-model="itemForm.end"
                type="time"
                required
              />
            </label>
          </div>

          <label class="full-field">
            Notes

            <textarea
              v-model.trim="itemForm.notes"
              rows="4"
              placeholder="Add a goal, location, instructions, or next action."
            ></textarea>
          </label>

          <label class="schedule-toggle">
            <span>
              <strong>Completed</strong>
              <small>Mark this item finished for the day.</small>
            </span>

            <input
              v-model="itemForm.completed"
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
            v-if="editingItemId"
            class="delete-btn"
            type="button"
            @click="deleteEditingItem"
          >
            Delete Item
          </button>

          <div class="modal-actions-right">
            <button
              class="secondary-btn"
              type="button"
              @click="closeItemModal"
            >
              Cancel
            </button>

            <button
              class="primary-btn"
              type="submit"
            >
              {{
                editingItemId
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
  onMounted,
  ref,
} from 'vue'

import AppLayout from '../../components/AppLayout.vue'
import {
  plannerBlocks as mockPlannerBlocks,
} from '../../data/mockPlannerData.js'

const PLANNER_STORAGE_KEY = 'scholarory-planner-blocks'
const SETTINGS_STORAGE_KEY = 'scholarory-planner-settings'
const LEGACY_TIME_FORMAT_KEY = 'scholarory_time_format'

const HOUR_HEIGHT = 72

const categories = [
  { value: 'scholarory', label: 'Scholarory' },
  { value: 'classwork', label: 'Classwork' },
  { value: 'study', label: 'Study' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'personal', label: 'Personal' },
  { value: 'meal', label: 'Meal' },
  { value: 'gym', label: 'Gym' },
  { value: 'rest', label: 'Rest' },
  { value: 'other', label: 'Other' },
]

const plannerItems = ref([])
const selectedDate = ref(getTodayKey())

const settings = ref({
  timeFormat: '12',
  dayStart: 6,
  dayEnd: 24,
})

const itemModalOpen = ref(false)
const editingItemId = ref('')
const formError = ref('')
const toastMessage = ref('')

const itemForm = ref(createBlankItem(true))

let toastTimer = null

const dayStartOptions = Array.from(
  { length: 24 },
  (_, index) => index,
)

const dayEndOptions = Array.from(
  { length: 24 },
  (_, index) => index + 1,
)

const formattedSelectedDate = computed(() => {
  const date = parseDateKey(selectedDate.value)

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
})

const selectedDateContext = computed(() => {
  const today = getTodayKey()
  const tomorrow = shiftDateKey(today, 1)
  const yesterday = shiftDateKey(today, -1)

  if (selectedDate.value === today) {
    return 'Today'
  }

  if (selectedDate.value === tomorrow) {
    return 'Tomorrow'
  }

  if (selectedDate.value === yesterday) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
  }).format(parseDateKey(selectedDate.value))
})

const selectedDateItems = computed(() => {
  return plannerItems.value.filter(
    (item) => item.date === selectedDate.value,
  )
})

const scheduledBlocks = computed(() => {
  return selectedDateItems.value
    .filter(hasScheduledTime)
    .slice()
    .sort((a, b) => {
      return (
        timeToMinutes(a.start) -
        timeToMinutes(b.start)
      )
    })
})

const unscheduledBlocks = computed(() => {
  return selectedDateItems.value
    .filter((item) => !hasScheduledTime(item))
    .slice()
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      return a.title.localeCompare(b.title)
    })
})

const catchUpBlocks = computed(() => {
  const today = getTodayKey()

  return plannerItems.value
    .filter((item) => {
      return (
        item.date < today &&
        !item.completed
      )
    })
    .slice()
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }

      return (
        timeToMinutes(a.start) -
        timeToMinutes(b.start)
      )
    })
})

const dayStartMinutes = computed(() => {
  return settings.value.dayStart * 60
})

const dayEndMinutes = computed(() => {
  return settings.value.dayEnd * 60
})

const timelineHeight = computed(() => {
  return (
    settings.value.dayEnd -
    settings.value.dayStart
  ) * HOUR_HEIGHT
})

const timeSlots = computed(() => {
  const slots = []

  for (
    let hour = settings.value.dayStart;
    hour <= settings.value.dayEnd;
    hour += 1
  ) {
    const minutes = hour * 60

    slots.push({
      minutes,
      label: formatMinutes(minutes),
      offset:
        (hour - settings.value.dayStart) *
        HOUR_HEIGHT,
    })
  }

  return slots
})

const visibleScheduledBlocks = computed(() => {
  return scheduledBlocks.value.filter((block) => {
    const start = timeToMinutes(block.start)
    const end = timeToMinutes(block.end)

    return (
      end > dayStartMinutes.value &&
      start < dayEndMinutes.value
    )
  })
})

const outsideTimelineBlocks = computed(() => {
  return scheduledBlocks.value.filter((block) => {
    return !visibleScheduledBlocks.value.some(
      (visibleBlock) =>
        visibleBlock.id === block.id,
    )
  })
})

const plannedMinutes = computed(() => {
  return scheduledBlocks.value.reduce(
    (total, block) =>
      total + getDurationMinutes(block),
    0,
  )
})

const completedMinutes = computed(() => {
  return scheduledBlocks.value.reduce(
    (total, block) => {
      if (!block.completed) {
        return total
      }

      return total + getDurationMinutes(block)
    },
    0,
  )
})

const remainingMinutes = computed(() => {
  return Math.max(
    0,
    plannedMinutes.value - completedMinutes.value,
  )
})

const completedBlockCount = computed(() => {
  return selectedDateItems.value.filter(
    (item) => item.completed,
  ).length
})

const remainingBlockCount = computed(() => {
  return selectedDateItems.value.filter(
    (item) => !item.completed,
  ).length
})

const dayProgress = computed(() => {
  if (plannedMinutes.value > 0) {
    return Math.min(
      100,
      Math.round(
        (
          completedMinutes.value /
          plannedMinutes.value
        ) * 100,
      ),
    )
  }

  if (selectedDateItems.value.length === 0) {
    return 0
  }

  return Math.round(
    (
      completedBlockCount.value /
      selectedDateItems.value.length
    ) * 100,
  )
})

onMounted(() => {
  loadSettings()
  loadPlannerItems()
})

function loadSettings() {
  try {
    const storedSettings = JSON.parse(
      window.localStorage.getItem(
        SETTINGS_STORAGE_KEY,
      ) || 'null',
    )

    const legacyTimeFormat =
      window.localStorage.getItem(
        LEGACY_TIME_FORMAT_KEY,
      )

    settings.value = normalizeSettings({
      ...settings.value,
      ...(storedSettings || {}),
      timeFormat:
        storedSettings?.timeFormat ||
        legacyTimeFormat ||
        settings.value.timeFormat,
    })
  } catch (error) {
    console.warn(
      'Scholarory Planner settings could not be loaded.',
      error,
    )
  }
}

function saveSettings() {
  settings.value = normalizeSettings(
    settings.value,
  )

  window.localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings.value),
  )

  window.localStorage.setItem(
    LEGACY_TIME_FORMAT_KEY,
    settings.value.timeFormat,
  )
}

function handleTimeRangeChange() {
  settings.value = normalizeSettings(
    settings.value,
  )

  saveSettings()
}

function normalizeSettings(value = {}) {
  let dayStart = Number(value.dayStart)
  let dayEnd = Number(value.dayEnd)

  if (
    !Number.isFinite(dayStart) ||
    dayStart < 0 ||
    dayStart > 23
  ) {
    dayStart = 6
  }

  if (
    !Number.isFinite(dayEnd) ||
    dayEnd < 1 ||
    dayEnd > 24
  ) {
    dayEnd = 24
  }

  dayStart = Math.round(dayStart)
  dayEnd = Math.round(dayEnd)

  if (dayEnd <= dayStart) {
    dayEnd = Math.min(24, dayStart + 1)
  }

  return {
    timeFormat:
      value.timeFormat === '24'
        ? '24'
        : '12',
    dayStart,
    dayEnd,
  }
}

function loadPlannerItems() {
  try {
    const storedItems = JSON.parse(
      window.localStorage.getItem(
        PLANNER_STORAGE_KEY,
      ) || 'null',
    )

    if (Array.isArray(storedItems)) {
      plannerItems.value = storedItems.map(
        normalizePlannerItem,
      )

      writePlannerItems()
      return
    }
  } catch (error) {
    console.warn(
      'Scholarory Planner items could not be loaded.',
      error,
    )
  }

  const seedItems = Array.isArray(mockPlannerBlocks)
    ? mockPlannerBlocks.map((block, index) => {
        return normalizePlannerItem({
          ...block,
          id:
            block.id ||
            `planner-seed-${index}`,
          date: getTodayKey(),
          category: normalizeCategory(
            block.category || block.type,
          ),
          notes: block.notes || '',
          completed:
            block.completed === true,
        })
      })
    : []

  plannerItems.value = seedItems
  writePlannerItems()
}

function writePlannerItems() {
  window.localStorage.setItem(
    PLANNER_STORAGE_KEY,
    JSON.stringify(plannerItems.value),
  )
}

function normalizePlannerItem(
  item = {},
  index = 0,
) {
  const scheduled =
    Boolean(item.start) &&
    Boolean(item.end)

  return {
    id:
      String(
        item.id ||
        `planner-${Date.now()}-${index}`,
      ),

    title:
      String(
        item.title ||
        item.name ||
        'Untitled Planner Item',
      ).trim() ||
      'Untitled Planner Item',

    date:
      isValidDateKey(item.date)
        ? item.date
        : getTodayKey(),

    start:
      scheduled
        ? normalizeTime(item.start)
        : '',

    end:
      scheduled
        ? normalizeTime(item.end)
        : '',

    category: normalizeCategory(
      item.category || item.type,
    ),

    notes: String(item.notes || '').trim(),

    completed: item.completed === true,

    createdAt:
      item.createdAt ||
      new Date().toISOString(),

    updatedAt:
      item.updatedAt ||
      new Date().toISOString(),
  }
}

function normalizeCategory(value) {
  const normalized = String(
    value || '',
  )
    .trim()
    .toLowerCase()

  const aliases = {
    work: 'scholarory',
    development: 'scholarory',
    dev: 'scholarory',
    school: 'classwork',
    assignment: 'classwork',
    exercise: 'gym',
    workout: 'gym',
    lunch: 'meal',
    dinner: 'meal',
    breakfast: 'meal',
    break: 'rest',
  }

  const aliasedValue =
    aliases[normalized] || normalized

  return categories.some(
    (category) =>
      category.value === aliasedValue,
  )
    ? aliasedValue
    : 'other'
}

function createBlankItem(scheduled = true) {
  const start = getSuggestedStart()
  const end = minutesToTime(
    Math.min(
      1439,
      timeToMinutes(start) + 60,
    ),
  )

  return {
    title: '',
    date: selectedDate.value,
    category: 'scholarory',
    scheduled,
    start,
    end,
    notes: '',
    completed: false,
  }
}

function openCreateModal(scheduled = true) {
  editingItemId.value = ''
  formError.value = ''
  itemForm.value = createBlankItem(scheduled)
  itemModalOpen.value = true
}

function openEditModal(item) {
  editingItemId.value = item.id
  formError.value = ''

  itemForm.value = {
    title: item.title,
    date: item.date,
    category: item.category,
    scheduled: hasScheduledTime(item),
    start:
      item.start ||
      getSuggestedStart(),
    end:
      item.end ||
      minutesToTime(
        Math.min(
          1439,
          timeToMinutes(getSuggestedStart()) +
            60,
        ),
      ),
    notes: item.notes,
    completed: item.completed,
  }

  itemModalOpen.value = true
}

function closeItemModal() {
  itemModalOpen.value = false
  editingItemId.value = ''
  formError.value = ''
  itemForm.value = createBlankItem(true)
}

function saveItem() {
  formError.value = ''

  const title =
    itemForm.value.title.trim()

  if (!title) {
    formError.value =
      'Please enter a title for this planner item.'
    return
  }

  if (!isValidDateKey(itemForm.value.date)) {
    formError.value =
      'Please choose a valid date.'
    return
  }

  let start = ''
  let end = ''

  if (itemForm.value.scheduled) {
    start = normalizeTime(
      itemForm.value.start,
    )

    end = normalizeTime(
      itemForm.value.end,
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

  const timestamp =
    new Date().toISOString()

  const cleanedItem = normalizePlannerItem({
    id:
      editingItemId.value ||
      createPlannerItemId(),

    title,
    date: itemForm.value.date,
    start,
    end,
    category: itemForm.value.category,
    notes: itemForm.value.notes,
    completed:
      itemForm.value.completed === true,

    createdAt:
      editingItemId.value
        ? plannerItems.value.find(
            (item) =>
              item.id === editingItemId.value,
          )?.createdAt || timestamp
        : timestamp,

    updatedAt: timestamp,
  })

  if (editingItemId.value) {
    const itemIndex =
      plannerItems.value.findIndex(
        (item) =>
          item.id === editingItemId.value,
      )

    if (itemIndex !== -1) {
      plannerItems.value[itemIndex] =
        cleanedItem

      showToastMessage(
        'Planner item updated.',
      )
    }
  } else {
    plannerItems.value.push(cleanedItem)

    showToastMessage(
      itemForm.value.scheduled
        ? 'Time block added.'
        : 'Unscheduled item added.',
    )
  }

  writePlannerItems()
  closeItemModal()
}

function deleteEditingItem() {
  if (!editingItemId.value) {
    return
  }

  const item = plannerItems.value.find(
    (plannerItem) =>
      plannerItem.id === editingItemId.value,
  )

  const confirmed = window.confirm(
    `Delete "${
      item?.title || 'this planner item'
    }"?`,
  )

  if (!confirmed) {
    return
  }

  plannerItems.value =
    plannerItems.value.filter(
      (plannerItem) =>
        plannerItem.id !== editingItemId.value,
    )

  writePlannerItems()
  closeItemModal()
  showToastMessage('Planner item deleted.')
}

function toggleComplete(item) {
  updatePlannerItem(item.id, {
    completed: !item.completed,
  })

  showToastMessage(
    item.completed
      ? 'Planner item reopened.'
      : 'Planner item completed.',
  )
}

function moveToSelectedDate(item) {
  updatePlannerItem(item.id, {
    date: selectedDate.value,
  })

  showToastMessage(
    `Moved to ${selectedDateContext.value}.`,
  )
}

function scheduleBlock(item) {
  editingItemId.value = item.id
  formError.value = ''

  const start = getSuggestedStart()

  itemForm.value = {
    title: item.title,
    date: selectedDate.value,
    category: item.category,
    scheduled: true,
    start,
    end: minutesToTime(
      Math.min(
        1439,
        timeToMinutes(start) + 60,
      ),
    ),
    notes: item.notes,
    completed: item.completed,
  }

  itemModalOpen.value = true
}

function updatePlannerItem(
  itemId,
  updates = {},
) {
  const itemIndex =
    plannerItems.value.findIndex(
      (item) => item.id === itemId,
    )

  if (itemIndex === -1) {
    return null
  }

  const currentItem =
    plannerItems.value[itemIndex]

  const updatedItem = normalizePlannerItem({
    ...currentItem,
    ...updates,
    id: currentItem.id,
    createdAt: currentItem.createdAt,
    updatedAt: new Date().toISOString(),
  })

  plannerItems.value[itemIndex] =
    updatedItem

  writePlannerItems()

  return updatedItem
}

function changeDay(amount) {
  selectedDate.value = shiftDateKey(
    selectedDate.value,
    amount,
  )
}

function goToToday() {
  selectedDate.value = getTodayKey()
}

function getBlockStyle(block) {
  const rawStart =
    timeToMinutes(block.start)

  const rawEnd =
    timeToMinutes(block.end)

  const visibleStart = Math.max(
    rawStart,
    dayStartMinutes.value,
  )

  const visibleEnd = Math.min(
    rawEnd,
    dayEndMinutes.value,
  )

  const top =
    (
      visibleStart -
      dayStartMinutes.value
    ) /
    60 *
    HOUR_HEIGHT

  const height = Math.max(
    48,
    (
      visibleEnd -
      visibleStart
    ) /
    60 *
    HOUR_HEIGHT,
  )

  return {
    top: `${top}px`,
    height: `${height}px`,
  }
}

function hasScheduledTime(item) {
  return Boolean(
    normalizeTime(item.start) &&
    normalizeTime(item.end),
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

function getSuggestedStart() {
  const now = new Date()

  let minutes =
    now.getHours() * 60 +
    now.getMinutes()

  minutes =
    Math.ceil(minutes / 30) * 30

  const startBoundary =
    settings.value.dayStart * 60

  const endBoundary =
    settings.value.dayEnd * 60

  if (
    selectedDate.value !== getTodayKey() ||
    minutes < startBoundary ||
    minutes >= endBoundary - 30
  ) {
    minutes = Math.max(
      startBoundary,
      Math.min(
        9 * 60,
        endBoundary - 60,
      ),
    )
  }

  return minutesToTime(
    Math.max(
      0,
      Math.min(1439, minutes),
    ),
  )
}

function getCategoryLabel(value) {
  return (
    categories.find(
      (category) =>
        category.value === value,
    )?.label ||
    'Other'
  )
}

function formatTime(time) {
  const minutes = timeToMinutes(time)

  return formatMinutes(minutes)
}

function formatMinutes(totalMinutes) {
  const normalized =
    ((totalMinutes % 1440) + 1440) %
    1440

  const hour = Math.floor(
    normalized / 60,
  )

  const minute =
    normalized % 60

  if (settings.value.timeFormat === '24') {
    if (totalMinutes === 1440) {
      return '24:00'
    }

    return `${String(hour).padStart(
      2,
      '0',
    )}:${String(minute).padStart(2, '0')}`
  }

  const period =
    hour >= 12 ? 'PM' : 'AM'

  const displayHour =
    hour % 12 || 12

  return `${displayHour}:${String(
    minute,
  ).padStart(2, '0')} ${period}`
}

function formatHourBoundary(hour) {
  if (
    settings.value.timeFormat === '24' &&
    hour === 24
  ) {
    return '24:00'
  }

  return formatMinutes(hour * 60)
}

function formatDuration(minutes) {
  const normalized = Math.max(
    0,
    Math.round(Number(minutes) || 0),
  )

  const hours = Math.floor(
    normalized / 60,
  )

  const remaining =
    normalized % 60

  if (hours === 0) {
    return `${remaining}m`
  }

  if (remaining === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remaining}m`
}

function formatShortDate(dateKey) {
  const date = parseDateKey(dateKey)

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(date)
}

function normalizeTime(value) {
  const match = String(value || '').match(
    /^(\d{1,2}):(\d{2})/,
  )

  if (!match) {
    return ''
  }

  const hour = Number(match[1])
  const minute = Number(match[2])

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
  )}:${String(minute).padStart(2, '0')}`
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

function minutesToTime(minutes) {
  const normalized = Math.max(
    0,
    Math.min(
      1439,
      Math.round(Number(minutes) || 0),
    ),
  )

  const hour = Math.floor(
    normalized / 60,
  )

  const minute =
    normalized % 60

  return `${String(hour).padStart(
    2,
    '0',
  )}:${String(minute).padStart(2, '0')}`
}

function createPlannerItemId() {
  return `planner-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
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

function isValidDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    String(value || ''),
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
.daily-planner {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-btn,
.secondary-btn,
.icon-btn,
.today-btn,
.small-btn,
.complete-mini-btn,
.modal-close,
.delete-btn,
.queue-main,
.complete-toggle {
  font: inherit;
  cursor: pointer;
}

.primary-btn {
  min-height: 40px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
}

.primary-btn:hover {
  filter: brightness(1.08);
}

.secondary-btn,
.today-btn {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--btn-bg);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 750;
}

.secondary-btn:hover,
.today-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
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
  font-weight: 850;
}

.icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.date-navigation {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.date-navigation-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.selected-date-copy {
  text-align: center;
}

.selected-date-copy p {
  margin: 0;
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.selected-date-copy h2 {
  margin: 0.2rem 0 0;
  color: var(--text-primary);
  font-size: clamp(1.1rem, 2.4vw, 1.55rem);
}

.date-picker-field {
  display: grid;
  gap: 0.3rem;
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
}

.date-picker-field input {
  min-height: 40px;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.76rem;
}

.date-picker-field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
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
  font-size: 1.18rem;
}

.summary-card div {
  display: grid;
  min-width: 0;
}

.summary-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-card strong {
  margin-top: 0.18rem;
  color: var(--text-primary);
  font-size: 1.35rem;
  line-height: 1;
}

.summary-card span:not(.summary-icon) {
  margin-top: 0.28rem;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.planner-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(280px, 330px);
  align-items: start;
  gap: 1rem;
}

.timeline-card,
.sidebar-card {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.timeline-card {
  min-width: 0;
  overflow: hidden;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--border-color);
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading h2,
.sidebar-heading h2,
.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.section-heading > div:first-child > p:last-child {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.72rem;
}

.timeline-heading-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.day-progress {
  display: grid;
  gap: 0.28rem;
  width: 118px;
}

.day-progress > span {
  justify-self: end;
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 800;
}

.day-progress > div {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--input-bg);
}

.day-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 220ms ease;
}

.timeline-scroll {
  max-height: 820px;
  overflow-y: auto;
  background: var(--input-bg);
}

.timeline-stage {
  position: relative;
  min-width: 620px;
  background:
    linear-gradient(
      to right,
      transparent 0,
      transparent 78px,
      color-mix(
        in srgb,
        var(--border-color) 70%,
        transparent
      ) 78px,
      color-mix(
        in srgb,
        var(--border-color) 70%,
        transparent
      ) 79px,
      transparent 79px
    );
}

.timeline-line {
  position: absolute;
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
  gap: 0.7rem;
  transform: translateY(-0.5px);
}

.timeline-line span {
  color: var(--text-muted);
  font-size: 0.64rem;
  font-weight: 750;
  text-align: right;
}

.timeline-line i {
  height: 1px;
  background: color-mix(
    in srgb,
    var(--border-color) 75%,
    transparent
  );
}

.timeline-event {
  position: absolute;
  right: 1rem;
  left: 92px;
  z-index: 2;
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto;
  align-items: flex-start;
  gap: 0.65rem;
  min-height: 48px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0.62rem 0.7rem;
  border: 1px solid var(--border-color);
  border-left: 5px solid var(--accent);
  border-radius: 11px;
  background: var(--bg-card);
  color: inherit;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
  cursor: pointer;
}

.timeline-event:hover,
.timeline-event:focus {
  z-index: 4;
  border-color: var(--accent);
  outline: none;
  box-shadow:
    0 0 0 3px var(--accent-soft),
    0 10px 24px rgba(15, 23, 42, 0.1);
}

.timeline-event.completed {
  opacity: 0.67;
}

.timeline-event.completed .event-copy strong {
  text-decoration: line-through;
}

.complete-toggle {
  display: grid;
  place-items: center;
  width: 21px;
  height: 21px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--accent-text);
  font-size: 0.72rem;
  font-weight: 900;
}

.timeline-event.completed .complete-toggle {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.event-copy {
  display: grid;
  min-width: 0;
}

.event-copy strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-copy span,
.event-copy small {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.63rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-copy small {
  margin-top: 0.2rem;
}

.event-category {
  padding: 0.16rem 0.4rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 0.55rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.category-classwork {
  border-left-color: #6b63b5;
}

.category-study {
  border-left-color: #3977a8;
}

.category-meeting {
  border-left-color: #a56b32;
}

.category-personal {
  border-left-color: #9a5b85;
}

.category-meal {
  border-left-color: #b17e2f;
}

.category-gym {
  border-left-color: #2f8665;
}

.category-rest {
  border-left-color: #6b7f95;
}

.category-other {
  border-left-color: #737373;
}

.timeline-empty {
  display: grid;
  min-height: 460px;
  place-items: center;
  align-content: center;
  padding: 2rem 1rem;
  text-align: center;
  background: var(--input-bg);
}

.timeline-empty > span {
  font-size: 2rem;
}

.timeline-empty h3 {
  margin: 0.65rem 0 0;
  color: var(--text-primary);
}

.timeline-empty p {
  max-width: 440px;
  margin: 0.45rem 0 1rem;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.5;
}

.outside-timeline-notice {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--accent-soft);
  color: var(--text-secondary);
}

.outside-timeline-notice strong {
  font-size: 0.72rem;
}

.outside-timeline-notice span {
  font-size: 0.66rem;
}

.planner-sidebar {
  display: grid;
  gap: 0.85rem;
}

.sidebar-card {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
}

.sidebar-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.sidebar-heading > span {
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

.queue-list {
  display: grid;
  gap: 0.5rem;
}

.queue-item {
  display: grid;
  gap: 0.55rem;
  padding: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.queue-item.completed {
  opacity: 0.65;
}

.queue-item.completed strong {
  text-decoration: line-through;
}

.queue-main {
  display: grid;
  gap: 0.18rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.queue-main strong {
  color: var(--text-primary);
  font-size: 0.74rem;
}

.queue-main span {
  color: var(--text-muted);
  font-size: 0.63rem;
}

.queue-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.small-btn,
.complete-mini-btn {
  min-height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.64rem;
  font-weight: 800;
}

.small-btn {
  flex: 1;
  padding: 0.4rem 0.55rem;
}

.complete-mini-btn {
  width: 30px;
  padding: 0;
}

.small-btn:hover,
.complete-mini-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.sidebar-empty {
  display: grid;
  justify-items: center;
  padding: 1rem 0.5rem;
  text-align: center;
}

.sidebar-empty.compact {
  padding: 0.6rem 0.25rem;
}

.sidebar-empty > span {
  font-size: 1.35rem;
}

.sidebar-empty strong {
  margin-top: 0.45rem;
  color: var(--text-primary);
  font-size: 0.75rem;
}

.sidebar-empty p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.64rem;
  line-height: 1.45;
}

.more-items {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.65rem;
  text-align: center;
}

.full-width-btn {
  width: 100%;
}

.settings-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.settings-field {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 750;
}

.settings-field select {
  width: 100%;
  min-height: 40px;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.73rem;
}

.settings-field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.settings-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.63rem;
  line-height: 1.45;
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

.planner-modal {
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
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.schedule-toggle {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.schedule-toggle > span {
  display: grid;
  gap: 0.18rem;
}

.schedule-toggle strong {
  color: var(--text-primary);
  font-size: 0.75rem;
}

.schedule-toggle small {
  color: var(--text-muted);
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

  .planner-layout {
    grid-template-columns: 1fr;
  }

  .planner-sidebar {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .date-navigation {
    grid-template-columns: 1fr;
  }

  .selected-date-copy {
    order: -1;
    text-align: left;
  }

  .date-navigation-actions {
    justify-content: space-between;
  }

  .date-picker-field {
    width: 100%;
  }

  .timeline-heading-actions {
    align-items: flex-end;
    flex-direction: column;
  }

  .planner-sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .summary-grid,
  .form-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .modal-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .timeline-heading-actions {
    width: 100%;
    align-items: stretch;
  }

  .day-progress {
    width: 100%;
  }

  .timeline-stage {
    min-width: 520px;
  }

  .timeline-event {
    right: 0.6rem;
    left: 84px;
  }

  .event-category {
    display: none;
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
