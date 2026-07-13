<template>
  <AppLayout
    title="Monthly Planner"
    subtitle="Balance the month, organize daily workload, and recover unfinished work."
    banner-key="planner"
    default-icon="🗓️"
  >
    <template #actions>
      <button
        class="secondary-btn"
        type="button"
        @click="openDailyPlanner"
      >
        Daily Planner
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="openWeeklyPlanner"
      >
        Weekly Planner
      </button>

      <button
        class="primary-btn"
        type="button"
        @click="openCreateModal(monthStartKey)"
      >
        + Add Planner Item
      </button>
    </template>

    <div class="monthly-planner">
      <section class="month-navigation">
        <div class="month-navigation-actions">
          <button
            class="icon-btn"
            type="button"
            aria-label="Previous month"
            title="Previous month"
            @click="changeMonth(-1)"
          >
            ←
          </button>

          <button
            class="today-btn"
            type="button"
            @click="goToThisMonth"
          >
            This Month
          </button>

          <button
            class="icon-btn"
            type="button"
            aria-label="Next month"
            title="Next month"
            @click="changeMonth(1)"
          >
            →
          </button>
        </div>

        <div class="selected-month-copy">
          <p>{{ monthContext }}</p>
          <h2>{{ formattedMonth }}</h2>
        </div>

        <label class="date-picker-field">
          <span>Jump to month</span>

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
            <span>{{ monthlyItems.length }} planner items</span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">✅</span>

          <div>
            <p>Completed Time</p>
            <strong>{{ formatDuration(completedMinutes) }}</strong>

            <span>
              {{ completedItemCount }} items finished
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">📈</span>

          <div>
            <p>Monthly Progress</p>
            <strong>{{ monthlyProgress }}%</strong>

            <span>
              {{ remainingItemCount }} items remaining
            </span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-icon">📥</span>

          <div>
            <p>Catch-Up Queue</p>
            <strong>{{ catchUpItems.length }}</strong>
            <span>Incomplete items before this month</span>
          </div>
        </article>
      </section>

      <section
        v-if="catchUpItems.length"
        class="catch-up-card"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">Catch Up</p>
            <h2>Unfinished work from earlier dates</h2>

            <p>
              Move missed planner items into this month, mark
              them complete, or edit their details.
            </p>
          </div>

          <span class="count-pill">
            {{ catchUpItems.length }}
          </span>
        </div>

        <div class="catch-up-list">
          <article
            v-for="item in catchUpItems.slice(0, 10)"
            :key="item.id"
            class="catch-up-item"
          >
            <button
              class="catch-up-main"
              type="button"
              @click="openEditModal(item)"
            >
              <strong>{{ item.title }}</strong>

              <span>
                {{ formatShortDate(item.date) }}

                <template v-if="hasScheduledTime(item)">
                  · {{ formatTime(item.start) }}
                </template>

                <template v-else>
                  · {{ getCategoryLabel(item.category) }}
                </template>
              </span>
            </button>

            <div class="catch-up-actions">
              <button
                class="small-btn"
                type="button"
                @click="moveItemToMonth(item)"
              >
                Move to Month
              </button>

              <button
                class="complete-mini-btn"
                type="button"
                aria-label="Mark complete"
                title="Mark complete"
                @click="toggleComplete(item)"
              >
                ✓
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="calendar-card">
        <div class="section-heading calendar-heading">
          <div>
            <p class="eyebrow">Calendar</p>
            <h2>{{ formattedMonth }}</h2>

            <p>
              Select the plus button on any day to add scheduled
              or flexible work.
            </p>
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
        </div>

        <div class="calendar-scroll">
          <div class="weekday-row">
            <span
              v-for="weekday in weekdayLabels"
              :key="weekday"
            >
              {{ weekday }}
            </span>
          </div>

          <div class="month-board">
            <article
              v-for="day in calendarDays"
              :key="day.date"
              class="day-cell"
              :class="{
                today: day.isToday,
                outside: !day.inCurrentMonth,
              }"
            >
              <header class="day-header">
                <div>
                  <strong>{{ day.dayNumber }}</strong>

                  <span v-if="!day.inCurrentMonth">
                    {{ day.month }}
                  </span>
                </div>

                <button
                  class="add-day-btn"
                  type="button"
                  :aria-label="`Add planner item to ${day.fullDate}`"
                  :title="`Add item to ${day.fullDate}`"
                  @click="openCreateModal(day.date)"
                >
                  +
                </button>
              </header>

              <div class="day-summary">
                <span>
                  {{ formatDuration(day.plannedMinutes) }}
                </span>

                <strong>
                  {{ day.progress }}%
                </strong>
              </div>

              <div
                v-if="day.visibleItems.length"
                class="day-items"
              >
                <article
                  v-for="item in day.visibleItems"
                  :key="item.id"
                  class="planner-item"
                  :class="[
                    `category-${item.category}`,
                    { completed: item.completed },
                  ]"
                >
                  <button
                    class="complete-toggle"
                    type="button"
                    :aria-label="
                      item.completed
                        ? `Mark ${item.title} incomplete`
                        : `Mark ${item.title} complete`
                    "
                    @click="toggleComplete(item)"
                  >
                    {{ item.completed ? '✓' : '' }}
                  </button>

                  <button
                    class="planner-item-main"
                    type="button"
                    @click="openEditModal(item)"
                  >
                    <span v-if="hasScheduledTime(item)">
                      {{ formatTime(item.start) }}
                    </span>

                    <span v-else>
                      Flexible
                    </span>

                    <strong>{{ item.title }}</strong>

                    <small>
                      {{ getCategoryLabel(item.category) }}
                    </small>
                  </button>
                </article>

                <button
                  v-if="day.hiddenItemCount"
                  class="more-items-btn"
                  type="button"
                  @click="openDayItems(day)"
                >
                  +{{ day.hiddenItemCount }} more
                </button>
              </div>

              <div
                v-else
                class="day-empty"
              >
                <span>Open day</span>

                <button
                  type="button"
                  @click="openCreateModal(day.date)"
                >
                  Add a block
                </button>
              </div>

              <footer class="day-footer">
                <span>
                  {{ day.completedCount }}
                  of
                  {{ day.items.length }}
                  done
                </span>

                <div
                  class="day-progress-track"
                  role="progressbar"
                  :aria-label="`${day.fullDate} completion`"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="day.progress"
                >
                  <i
                    :style="{ width: `${day.progress}%` }"
                  ></i>
                </div>
              </footer>
            </article>
          </div>
        </div>
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
            <p class="eyebrow">Monthly Planner</p>

            <h2>
              {{
                editingItemId
                  ? 'Edit Planner Item'
                  : 'New Planner Item'
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
              placeholder="Example: Finish Scholarory monthly planner"
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
                Turn this off to keep the item flexible for
                that day.
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
              placeholder="Add the purpose, location, next action, or reminder."
            ></textarea>
          </label>

          <label class="schedule-toggle">
            <span>
              <strong>Completed</strong>
              <small>Mark this planner item finished.</small>
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
                  : 'Add to Month'
              }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div
      v-if="dayItemsModalOpen"
      class="modal-backdrop"
      @click.self="closeDayItemsModal"
    >
      <section class="day-items-modal">
        <div class="modal-heading">
          <div>
            <p class="eyebrow">Day Schedule</p>
            <h2>{{ selectedDayLabel }}</h2>
          </div>

          <button
            class="modal-close"
            type="button"
            aria-label="Close day schedule"
            @click="closeDayItemsModal"
          >
            ×
          </button>
        </div>

        <div class="expanded-day-list">
          <article
            v-for="item in selectedDayItems"
            :key="item.id"
            class="expanded-day-item"
            :class="{ completed: item.completed }"
          >
            <button
              class="complete-toggle"
              type="button"
              @click="toggleComplete(item)"
            >
              {{ item.completed ? '✓' : '' }}
            </button>

            <button
              class="expanded-day-main"
              type="button"
              @click="openEditFromDayModal(item)"
            >
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
            </button>
          </article>
        </div>

        <button
          class="primary-btn full-width-btn"
          type="button"
          @click="addFromDayModal"
        >
          + Add Another Item
        </button>
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
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '../../components/AppLayout.vue'

const PLANNER_STORAGE_KEY =
  'scholarory-planner-blocks'

const SETTINGS_STORAGE_KEY =
  'scholarory-planner-settings'

const LEGACY_TIME_FORMAT_KEY =
  'scholarory_time_format'

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

const weekdayLabels = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const router = useRouter()

const plannerItems = ref([])
const selectedDate = ref(getTodayKey())

const settings = ref({
  timeFormat: '12',
  dayStart: 6,
  dayEnd: 24,
})

const itemModalOpen = ref(false)
const dayItemsModalOpen = ref(false)

const editingItemId = ref('')
const selectedDayKey = ref('')
const formError = ref('')
const toastMessage = ref('')

const itemForm = ref(
  createBlankItem(getTodayKey()),
)

let toastTimer = null

const monthStartKey = computed(() => {
  return getMonthStartKey(
    selectedDate.value,
  )
})

const monthEndKey = computed(() => {
  return getMonthEndKey(
    selectedDate.value,
  )
})

const calendarStartKey = computed(() => {
  return getWeekStartKey(
    monthStartKey.value,
  )
})

const calendarEndKey = computed(() => {
  return getWeekEndKey(
    monthEndKey.value,
  )
})

const formattedMonth = computed(() => {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: 'long',
      year: 'numeric',
    },
  ).format(
    parseDateKey(monthStartKey.value),
  )
})

const monthContext = computed(() => {
  const currentMonth =
    getMonthStartKey(getTodayKey())

  if (
    monthStartKey.value === currentMonth
  ) {
    return 'This Month'
  }

  if (
    monthStartKey.value ===
    shiftMonthKey(currentMonth, 1)
  ) {
    return 'Next Month'
  }

  if (
    monthStartKey.value ===
    shiftMonthKey(currentMonth, -1)
  ) {
    return 'Last Month'
  }

  return 'Selected Month'
})

const monthlyItems = computed(() => {
  return plannerItems.value.filter(
    (item) => {
      return (
        item.date >= monthStartKey.value &&
        item.date <= monthEndKey.value
      )
    },
  )
})

const catchUpItems = computed(() => {
  return plannerItems.value
    .filter((item) => {
      return (
        item.date < monthStartKey.value &&
        !item.completed
      )
    })
    .slice()
    .sort(sortPlannerItemsByDate)
})

const calendarDays = computed(() => {
  const dayCount =
    getDaysBetween(
      calendarStartKey.value,
      calendarEndKey.value,
    ) + 1

  return Array.from(
    { length: dayCount },
    (_, index) => {
      const date = shiftDateKey(
        calendarStartKey.value,
        index,
      )

      const items = plannerItems.value
        .filter((item) => item.date === date)
        .slice()
        .sort(sortPlannerItems)

      const scheduledItems =
        items.filter(hasScheduledTime)

      const planned =
        scheduledItems.reduce(
          (total, item) => {
            return (
              total +
              getDurationMinutes(item)
            )
          },
          0,
        )

      const completedCount =
        items.filter(
          (item) => item.completed,
        ).length

      const progress =
        items.length === 0
          ? 0
          : Math.round(
              (
                completedCount /
                items.length
              ) * 100,
            )

      const parsedDate =
        parseDateKey(date)

      return {
        date,
        items,
        visibleItems:
          items.slice(0, 4),

        hiddenItemCount:
          Math.max(0, items.length - 4),

        plannedMinutes: planned,
        completedCount,
        progress,

        inCurrentMonth:
          date >= monthStartKey.value &&
          date <= monthEndKey.value,

        isToday:
          date === getTodayKey(),

        dayNumber:
          parsedDate.getDate(),

        month:
          new Intl.DateTimeFormat(
            undefined,
            {
              month: 'short',
            },
          ).format(parsedDate),

        fullDate:
          new Intl.DateTimeFormat(
            undefined,
            {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            },
          ).format(parsedDate),
      }
    },
  )
})

const plannedMinutes = computed(() => {
  return monthlyItems.value.reduce(
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
  return monthlyItems.value.reduce(
    (total, item) => {
      if (!item.completed) {
        return total
      }

      return (
        total +
        getDurationMinutes(item)
      )
    },
    0,
  )
})

const completedItemCount = computed(() => {
  return monthlyItems.value.filter(
    (item) => item.completed,
  ).length
})

const remainingItemCount = computed(() => {
  return Math.max(
    0,
    monthlyItems.value.length -
      completedItemCount.value,
  )
})

const monthlyProgress = computed(() => {
  if (monthlyItems.value.length === 0) {
    return 0
  }

  return Math.round(
    (
      completedItemCount.value /
      monthlyItems.value.length
    ) * 100,
  )
})

const selectedDayItems = computed(() => {
  return plannerItems.value
    .filter(
      (item) =>
        item.date === selectedDayKey.value,
    )
    .slice()
    .sort(sortPlannerItems)
})

const selectedDayLabel = computed(() => {
  if (!selectedDayKey.value) {
    return 'Selected Day'
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    parseDateKey(selectedDayKey.value),
  )
})

onMounted(() => {
  loadSettings()
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
        ? parsed.map(normalizePlannerItem)
        : []
  } catch (error) {
    console.warn(
      'Scholarory Monthly Planner could not load planner items.',
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

    settings.value = {
      ...settings.value,
      ...(storedSettings || {}),

      timeFormat:
        storedSettings?.timeFormat ||
        legacyTimeFormat ||
        '12',
    }
  } catch (error) {
    console.warn(
      'Scholarory Monthly Planner could not load settings.',
      error,
    )
  }
}

function saveSettings() {
  settings.value.timeFormat =
    settings.value.timeFormat === '24'
      ? '24'
      : '12'

  window.localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings.value),
  )

  window.localStorage.setItem(
    LEGACY_TIME_FORMAT_KEY,
    settings.value.timeFormat,
  )
}

function handleStorageChange(event) {
  if (
    event.key === PLANNER_STORAGE_KEY
  ) {
    loadPlannerItems()
  }

  if (
    event.key === SETTINGS_STORAGE_KEY ||
    event.key === LEGACY_TIME_FORMAT_KEY
  ) {
    loadSettings()
  }
}

function createBlankItem(dateValue) {
  return {
    title: '',
    date: dateValue,
    category: 'scholarory',
    scheduled: true,
    start: '09:00',
    end: '10:00',
    notes: '',
    completed: false,
  }
}

function openCreateModal(dateValue) {
  editingItemId.value = ''
  formError.value = ''

  itemForm.value =
    createBlankItem(
      dateValue || selectedDate.value,
    )

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
    start: item.start || '09:00',
    end: item.end || '10:00',
    notes: item.notes || '',
    completed:
      item.completed === true,
  }

  itemModalOpen.value = true
}

function closeItemModal() {
  itemModalOpen.value = false
  editingItemId.value = ''
  formError.value = ''

  itemForm.value =
    createBlankItem(
      selectedDate.value,
    )
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

  if (
    !isValidDateKey(itemForm.value.date)
  ) {
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

  const existingItem =
    plannerItems.value.find(
      (item) =>
        item.id === editingItemId.value,
    )

  const timestamp =
    new Date().toISOString()

  const cleanedItem =
    normalizePlannerItem({
      id:
        editingItemId.value ||
        createPlannerItemId(),

      title,
      date: itemForm.value.date,
      start,
      end,
      category:
        itemForm.value.category,
      notes: itemForm.value.notes,

      completed:
        itemForm.value.completed === true,

      createdAt:
        existingItem?.createdAt ||
        timestamp,

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
    plannerItems.value.push(
      cleanedItem,
    )

    showToastMessage(
      'Planner item added to the month.',
    )
  }

  writePlannerItems()
  closeItemModal()
}

function deleteEditingItem() {
  if (!editingItemId.value) {
    return
  }

  const item =
    plannerItems.value.find(
      (plannerItem) =>
        plannerItem.id ===
        editingItemId.value,
    )

  const confirmed =
    window.confirm(
      `Delete "${
        item?.title ||
        'this planner item'
      }"?`,
    )

  if (!confirmed) {
    return
  }

  plannerItems.value =
    plannerItems.value.filter(
      (plannerItem) =>
        plannerItem.id !==
        editingItemId.value,
    )

  writePlannerItems()
  closeItemModal()

  showToastMessage(
    'Planner item deleted.',
  )
}

function toggleComplete(item) {
  const itemIndex =
    plannerItems.value.findIndex(
      (plannerItem) =>
        plannerItem.id === item.id,
    )

  if (itemIndex === -1) {
    return
  }

  plannerItems.value[itemIndex] = {
    ...plannerItems.value[itemIndex],

    completed:
      !plannerItems.value[itemIndex]
        .completed,

    updatedAt:
      new Date().toISOString(),
  }

  writePlannerItems()

  showToastMessage(
    plannerItems.value[itemIndex]
      .completed
      ? 'Planner item completed.'
      : 'Planner item reopened.',
  )
}

function moveItemToMonth(item) {
  const itemIndex =
    plannerItems.value.findIndex(
      (plannerItem) =>
        plannerItem.id === item.id,
    )

  if (itemIndex === -1) {
    return
  }

  plannerItems.value[itemIndex] = {
    ...plannerItems.value[itemIndex],

    date: monthStartKey.value,

    updatedAt:
      new Date().toISOString(),
  }

  writePlannerItems()

  showToastMessage(
    'Planner item moved to the first day of the month.',
  )
}

function openDayItems(day) {
  selectedDayKey.value = day.date
  dayItemsModalOpen.value = true
}

function closeDayItemsModal() {
  dayItemsModalOpen.value = false
  selectedDayKey.value = ''
}

function openEditFromDayModal(item) {
  closeDayItemsModal()
  openEditModal(item)
}

function addFromDayModal() {
  const date =
    selectedDayKey.value

  closeDayItemsModal()
  openCreateModal(date)
}

function changeMonth(amount) {
  selectedDate.value =
    shiftMonthKey(
      selectedDate.value,
      amount,
    )
}

function goToThisMonth() {
  selectedDate.value =
    getTodayKey()
}

function openDailyPlanner() {
  router.push('/planner')
}

function openWeeklyPlanner() {
  router.push('/planner/week')
}

function normalizePlannerItem(
  item = {},
) {
  return {
    id: String(
      item.id ||
      createPlannerItemId(),
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

    start: normalizeTime(item.start),
    end: normalizeTime(item.end),

    category:
      normalizeCategory(
        item.category ||
        item.type,
      ),

    notes:
      String(item.notes || '').trim(),

    completed:
      item.completed === true,

    createdAt:
      item.createdAt ||
      new Date().toISOString(),

    updatedAt:
      item.updatedAt ||
      new Date().toISOString(),
  }
}

function normalizeCategory(value) {
  const normalized =
    String(value || '')
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
    aliases[normalized] ||
    normalized

  return categories.some(
    (category) =>
      category.value === aliasedValue,
  )
    ? aliasedValue
    : 'other'
}

function sortPlannerItems(a, b) {
  const aScheduled =
    hasScheduledTime(a)

  const bScheduled =
    hasScheduledTime(b)

  if (aScheduled !== bScheduled) {
    return aScheduled ? -1 : 1
  }

  if (aScheduled && bScheduled) {
    return (
      timeToMinutes(a.start) -
      timeToMinutes(b.start)
    )
  }

  return a.title.localeCompare(
    b.title,
  )
}

function sortPlannerItemsByDate(a, b) {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date)
  }

  return sortPlannerItems(a, b)
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

function formatTime(value) {
  const minutes =
    timeToMinutes(value)

  const hour =
    Math.floor(minutes / 60)

  const minute =
    minutes % 60

  if (
    settings.value.timeFormat === '24'
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
    hour >= 12 ? 'PM' : 'AM'

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
    categories.find(
      (category) =>
        category.value === value,
    )?.label ||
    'Other'
  )
}

function formatShortDate(dateKey) {
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

function normalizeTime(value) {
  const match =
    String(value || '').match(
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

function createPlannerItemId() {
  return `planner-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function getMonthStartKey(dateKey) {
  const date = parseDateKey(dateKey)

  return dateToKey(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    ),
  )
}

function getMonthEndKey(dateKey) {
  const date = parseDateKey(dateKey)

  return dateToKey(
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ),
  )
}

function shiftMonthKey(
  dateKey,
  amount,
) {
  const date = parseDateKey(dateKey)

  return dateToKey(
    new Date(
      date.getFullYear(),
      date.getMonth() + amount,
      1,
    ),
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

function getWeekEndKey(dateKey) {
  return shiftDateKey(
    getWeekStartKey(dateKey),
    6,
  )
}

function getDaysBetween(
  startKey,
  endKey,
) {
  const start =
    parseDateKey(startKey)

  const end =
    parseDateKey(endKey)

  return Math.round(
    (
      end.getTime() -
      start.getTime()
    ) /
      (1000 * 60 * 60 * 24),
  )
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

function isValidDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    String(value || ''),
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
.monthly-planner {
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
.add-day-btn,
.planner-item-main,
.complete-toggle,
.catch-up-main,
.more-items-btn,
.expanded-day-main,
.modal-close,
.delete-btn {
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
.today-btn:hover,
.icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.full-width-btn {
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
  font-weight: 850;
}

.month-navigation {
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

.month-navigation-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.selected-month-copy {
  text-align: center;
}

.selected-month-copy p {
  margin: 0;
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.selected-month-copy h2 {
  margin: 0.2rem 0 0;
  color: var(--text-primary);
  font-size:
    clamp(1.1rem, 2.4vw, 1.55rem);
}

.date-picker-field,
.settings-field {
  display: grid;
  gap: 0.3rem;
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
}

.date-picker-field input,
.settings-field select {
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

.date-picker-field input:focus,
.settings-field select:focus {
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
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catch-up-card,
.calendar-card {
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

.eyebrow {
  margin: 0 0 0.2rem;
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.section-heading p:not(.eyebrow) {
  margin: 0.28rem 0 0;
  color: var(--text-muted);
  font-size: 0.7rem;
  line-height: 1.45;
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

.catch-up-list {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.9rem;
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
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.catch-up-main strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catch-up-main span {
  margin-top: 0.16rem;
  color: var(--text-muted);
  font-size: 0.61rem;
}

.catch-up-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
}

.small-btn,
.complete-mini-btn {
  min-height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.63rem;
  font-weight: 800;
}

.small-btn {
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

.calendar-heading {
  margin-bottom: 0.9rem;
}

.settings-field {
  width: min(180px, 100%);
}

.calendar-scroll {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 0.35rem;
}

.weekday-row,
.month-board {
  min-width: 1050px;
}

.weekday-row {
  display: grid;
  grid-template-columns:
    repeat(7, minmax(0, 1fr));
  gap: 0.55rem;
  margin-bottom: 0.55rem;
}

.weekday-row span {
  padding: 0.4rem;
  color: var(--text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  text-align: center;
  text-transform: uppercase;
}

.month-board {
  display: grid;
  grid-template-columns:
    repeat(7, minmax(0, 1fr));
  gap: 0.55rem;
}

.day-cell {
  display: grid;
  grid-template-rows:
    auto auto minmax(145px, 1fr) auto;
  min-width: 0;
  min-height: 230px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
}

.day-cell.today {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.day-cell.outside {
  opacity: 0.58;
  background: var(--input-bg);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.55rem;
  border-bottom: 1px solid var(--border-color);
}

.day-header > div {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.day-header strong {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.day-header span {
  color: var(--text-muted);
  font-size: 0.55rem;
}

.add-day-btn {
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--btn-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 850;
}

.add-day-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.day-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.55rem;
  background: var(--input-bg);
}

.day-summary span,
.day-summary strong {
  color: var(--text-muted);
  font-size: 0.55rem;
}

.day-summary strong {
  color: var(--text-secondary);
}

.day-items {
  display: grid;
  align-content: start;
  gap: 0.35rem;
  padding: 0.5rem;
}

.planner-item,
.expanded-day-item {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  align-items: flex-start;
  gap: 0.4rem;
  min-width: 0;
  padding: 0.42rem;
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  background: var(--input-bg);
}

.planner-item.completed,
.expanded-day-item.completed {
  opacity: 0.58;
}

.planner-item.completed
.planner-item-main strong,
.expanded-day-item.completed
.expanded-day-main strong {
  text-decoration: line-through;
}

.complete-toggle {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-card);
  color: white;
  font-size: 0.58rem;
  font-weight: 900;
}

.planner-item.completed
.complete-toggle,
.expanded-day-item.completed
.complete-toggle {
  border-color: var(--accent);
  background: var(--accent);
}

.planner-item-main,
.expanded-day-main {
  display: grid;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.planner-item-main span {
  color: var(--text-muted);
  font-size: 0.48rem;
}

.planner-item-main strong,
.expanded-day-main strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.59rem;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.planner-item-main small,
.expanded-day-main span {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.48rem;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.more-items-btn {
  width: 100%;
  padding: 0.3rem;
  border: none;
  background: transparent;
  color: var(--accent-text);
  font-size: 0.56rem;
  font-weight: 800;
  text-align: left;
}

.day-empty {
  display: grid;
  place-items: center;
  align-content: center;
  padding: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

.day-empty span {
  font-size: 0.58rem;
}

.day-empty button {
  margin-top: 0.25rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--accent-text);
  font: inherit;
  font-size: 0.56rem;
  font-weight: 800;
  cursor: pointer;
}

.day-footer {
  display: grid;
  gap: 0.3rem;
  padding: 0.45rem 0.55rem;
  border-top: 1px solid var(--border-color);
}

.day-footer > span {
  color: var(--text-muted);
  font-size: 0.5rem;
}

.day-progress-track {
  height: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--input-bg);
}

.day-progress-track i {
  display: block;
  min-width: 2px;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
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

.planner-modal,
.day-items-modal {
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

.day-items-modal {
  width: min(560px, 100%);
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
  font-size: 1.08rem;
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

.expanded-day-list {
  display: grid;
  gap: 0.55rem;
  margin: 1rem 0;
}

.expanded-day-item {
  padding: 0.65rem;
}

.expanded-day-main strong {
  font-size: 0.74rem;
}

.expanded-day-main span {
  margin-top: 0.15rem;
  font-size: 0.62rem;
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

  .catch-up-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .month-navigation {
    grid-template-columns: 1fr;
  }

  .selected-month-copy {
    order: -1;
    text-align: left;
  }

  .month-navigation-actions {
    justify-content: space-between;
  }

  .section-heading {
    flex-direction: column;
  }

  .settings-field {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .summary-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .catch-up-item,
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