<template>
  <section class="command-center">
    <div class="section-header">
      <div>
        <h2>Academic Command Center</h2>
        <p>Your active academic deadlines in one place.</p>
      </div>
    </div>

    <div class="command-grid">
      <article class="command-card">
        <span class="card-label">Next Deadline</span>
        <h3>{{ nextDeadline?.title || 'No deadlines yet' }}</h3>
        <p v-if="nextDeadline">
          {{ nextDeadline.course }} · Due {{ formatDate(nextDeadline.dueDate) }}
        </p>
      </article>

      <article class="command-card">
        <span class="card-label">Urgent</span>
        <h3>{{ urgentCount }}</h3>
        <p>High-priority academic items</p>
      </article>

      <article class="command-card">
        <span class="card-label">This Week</span>
        <h3>{{ thisWeekCount }}</h3>
        <p>Deadlines due in the next 7 days</p>
      </article>
    </div>

    <div class="deadline-list">
      <h3>Upcoming Academic Deadlines</h3>

      <div
        v-for="deadline in sortedDeadlines"
        :key="deadline.id"
        class="deadline-row"
      >
        <div>
          <h4>{{ deadline.title }}</h4>
          <p>{{ deadline.course }} · {{ deadline.type }}</p>
        </div>

        <div class="deadline-meta">
          <span :class="['priority-pill', deadline.priority]">
            {{ deadline.priority }}
          </span>
          <span>{{ formatDate(deadline.dueDate) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { academicDeadlines } from '@/data/academicCalendar'

const sortedDeadlines = computed(() => {
  return [...academicDeadlines].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  )
})

const nextDeadline = computed(() => {
  const today = new Date()
  return sortedDeadlines.value.find(
    deadline => new Date(deadline.dueDate) >= today
  )
})

const urgentCount = computed(() => {
  return academicDeadlines.filter(
    deadline => deadline.priority === 'urgent' || deadline.priority === 'high'
  ).length
})

const thisWeekCount = computed(() => {
  const today = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  return academicDeadlines.filter(deadline => {
    const due = new Date(deadline.dueDate)
    return due >= today && due <= sevenDaysFromNow
  }).length
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.command-center {
  display: grid;
  gap: 1.25rem;
}

.section-header h2 {
  margin: 0;
  color: #172554;
}

.section-header p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.command-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.command-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
}

.card-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #b45309;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.command-card h3 {
  margin: 0.4rem 0;
  color: #0f172a;
}

.command-card p {
  margin: 0;
  color: #64748b;
}

.deadline-list {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
}

.deadline-list h3 {
  margin-top: 0;
  color: #172554;
}

.deadline-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0;
  border-top: 1px solid #e2e8f0;
}

.deadline-row h4 {
  margin: 0;
  color: #0f172a;
}

.deadline-row p {
  margin: 0.25rem 0 0;
  color: #64748b;
  text-transform: capitalize;
}

.deadline-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #475569;
  white-space: nowrap;
}

.priority-pill {
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.priority-pill.urgent {
  background: #fee2e2;
  color: #991b1b;
}

.priority-pill.high {
  background: #fef3c7;
  color: #92400e;
}

.priority-pill.medium {
  background: #dbeafe;
  color: #1d4ed8;
}

@media (max-width: 850px) {
  .command-grid {
    grid-template-columns: 1fr;
  }

  .deadline-row {
    flex-direction: column;
  }

  .deadline-meta {
    justify-content: space-between;
  }
}
</style>