<template>
  <section class="course-deadlines-card">
    <div class="card-header">
      <div>
        <h2>Course Deadlines</h2>
        <p>Major dates connected to your active courses.</p>
      </div>
    </div>

    <div class="deadline-list">
      <article
        v-for="deadline in sortedDeadlines"
        :key="deadline.id"
        class="deadline-item"
      >
        <div>
          <h3>{{ deadline.title }}</h3>
          <p>{{ deadline.course }} · {{ deadline.category }}</p>
        </div>

        <div class="deadline-date">
          <span>{{ formatDate(deadline.dueDate) }}</span>
          <small>{{ daysUntil(deadline.dueDate) }}</small>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const courseDeadlines = [
  {
    id: 1,
    title: 'Book Review Submission Window',
    course: 'DMIN 851',
    category: 'Major Assignment',
    dueDate: '2026-06-20',
  },
  {
    id: 2,
    title: 'Implementation Paper Due',
    course: 'DMIN 851',
    category: 'Major Paper',
    dueDate: '2026-06-27',
  },
  {
    id: 3,
    title: 'Assessment Paper Due',
    course: 'DMIN 851',
    category: 'Reflection / Assessment',
    dueDate: '2026-07-03',
  },
  {
    id: 4,
    title: 'Course Ends',
    course: 'DMIN 851',
    category: 'Course Milestone',
    dueDate: '2026-07-10',
  },
]

const sortedDeadlines = computed(() => {
  return [...courseDeadlines].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  )
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysUntil(dateString) {
  const today = new Date()
  const dueDate = new Date(dateString)
  const difference = dueDate - today
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24))

  if (days < 0) return 'Past due'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `${days} days left`
}
</script>

<style scoped>
.course-deadlines-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
}

.card-header h2 {
  margin: 0;
  color: #172554;
}

.card-header p {
  margin: 0.25rem 0 1rem;
  color: #64748b;
}

.deadline-list {
  display: grid;
  gap: 0.85rem;
}

.deadline-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.9rem;
  background: #f8fafc;
}

.deadline-item h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
}

.deadline-item p {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.deadline-date {
  display: grid;
  justify-items: end;
  color: #475569;
  white-space: nowrap;
}

.deadline-date span {
  font-weight: 700;
  color: #92400e;
}

.deadline-date small {
  color: #64748b;
}

@media (max-width: 700px) {
  .deadline-item {
    flex-direction: column;
  }

  .deadline-date {
    justify-items: start;
  }
}
</style>