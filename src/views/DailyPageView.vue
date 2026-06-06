<template>
  <AppLayout>
    <template #header>
      <div>
        <p class="page-eyebrow">Daily Page</p>
        <h1>{{ formattedSelectedDate }}</h1>
        <p class="page-subtitle">
          Tasks, assignments, notes, and daily planning in one place.
        </p>
      </div>
    </template>

    <template #actions>
      <div class="date-actions">
        <button class="ghost-button" @click="goToPreviousDay">
          ← Previous
        </button>

        <input v-model="selectedDate" class="date-input" type="date" />

        <button class="ghost-button" @click="goToToday">
          Today
        </button>

        <button class="ghost-button" @click="goToNextDay">
          Next →
        </button>
      </div>
    </template>

    <section class="daily-page">
      <div class="daily-grid">
        <TodaysTasksWidget
          :tasks="tasksForSelectedDate"
          @toggle-complete="toggleTaskComplete"
        />

        <TodaysAssignmentsWidget :assignments="assignmentsForSelectedDate" />
      </div>

      <section class="daily-notes-card">
        <div class="notes-header">
          <div>
            <p class="page-eyebrow">Notes</p>
            <h2>Daily Notes</h2>
          </div>
        </div>

        <textarea
          v-model="dailyNotes[selectedDate]"
          class="daily-notes"
          placeholder="Jot down what happened today, what you studied, what Rory should remember, or what needs to carry forward."
        />
      </section>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import TodaysTasksWidget from '@/components/dashboard/TodaysTasksWidget.vue'
import TodaysAssignmentsWidget from '@/components/dashboard/TodaysAssignmentsWidget.vue'
import { useTasks } from '@/composables/useTasks'
import { useAssignments } from '@/composables/useAssignments'

const { tasks, getTasksByDate } = useTasks()
const { getAssignmentsByDate } = useAssignments()

const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = new Date()
const selectedDate = ref(toDateInputValue(today))

const dailyNotes = reactive({})

const formattedSelectedDate = computed(() => {
  const date = new Date(`${selectedDate.value}T12:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
})

const tasksForSelectedDate = computed(() => getTasksByDate(selectedDate.value))

const assignmentsForSelectedDate = computed(() =>
  getAssignmentsByDate(selectedDate.value),
)

const shiftSelectedDate = (amount) => {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + amount)
  selectedDate.value = toDateInputValue(date)
}

const goToPreviousDay = () => {
  shiftSelectedDate(-1)
}

const goToNextDay = () => {
  shiftSelectedDate(1)
}

const goToToday = () => {
  selectedDate.value = toDateInputValue(new Date())
}

const toggleTaskComplete = (taskId) => {
  tasks.value = tasks.value.map((task) => {
    if (task.id !== taskId) return task

    return {
      ...task,
      status: task.status === 'completed' ? 'not-started' : 'completed',
    }
  })
}
</script>

<style scoped>
.daily-page {
  display: grid;
  gap: 1.5rem;
}

.daily-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.page-eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d4a017;
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
  gap: 0.65rem;
}

.ghost-button {
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--card-bg, #ffffff);
  color: var(--text-primary, #111827);
  border-radius: 999px;
  padding: 0.65rem 0.95rem;
  font-weight: 800;
  cursor: pointer;
}

.ghost-button:hover {
  border-color: #d4a017;
  color: #b45309;
}

.date-input {
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--card-bg, #ffffff);
  color: var(--text-primary, #111827);
  border-radius: 999px;
  padding: 0.62rem 0.9rem;
  font-weight: 700;
}

.daily-notes-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.daily-notes-card h2 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-primary, #111827);
}

.daily-notes {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 1rem;
  padding: 1rem;
  font: inherit;
  color: var(--text-primary, #111827);
  background: rgba(248, 250, 252, 0.75);
  outline: none;
  box-sizing: border-box;
}

.daily-notes:focus {
  border-color: #d4a017;
  box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.12);
}

@media (max-width: 900px) {
  .daily-grid {
    grid-template-columns: 1fr;
  }
}
</style>