<template>
  <AppLayout
    title="Assignments"
    subtitle="Track papers, projects, quizzes, exams, and due dates"
    banner-key="assignments"
    default-icon="📝"
  >
    <section class="assignments-page">
      <div class="assignments-toolbar">
        <div class="filter-tabs">
          <button
            v-for="status in statusFilters"
            :key="status"
            class="filter-tab"
            :class="{ active: activeFilter === status }"
            @click="activeFilter = status"
          >
            {{ status }}
            <span>{{ getCountByStatus(status) }}</span>
          </button>
        </div>

        <button class="primary-btn" @click="showAddAssignment = true">
          + New Assignment
        </button>
      </div>

      <div v-if="filteredAssignments.length" class="assignments-grid">
        <article
          v-for="assignment in filteredAssignments"
          :key="assignment.id"
          class="assignment-card clickable"
          @click="goToAssignment(assignment)"
        >
          <div class="assignment-topline">
            <span class="course-pill">{{ assignment.course || 'No Course' }}</span>
            <span class="type-pill">{{ assignment.type }}</span>
          </div>

          <h2>{{ assignment.title }}</h2>

          <p v-if="assignment.description" class="assignment-description">
            {{ assignment.description }}
          </p>

          <div class="assignment-meta">
            <span>📅 Due {{ formatDate(assignment.dueDate) }}</span>
          </div>

          <div class="badge-row">
            <StatusBadge :status="assignment.status" />
            <PriorityBadge :priority="assignment.priority" />
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="empty-icon">📝</p>
        <h2>No assignments found</h2>
        <p>Add an assignment or change your filter.</p>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'
import { useAssignments } from '@/composables/useAssignments'

const router = useRouter()

const { allAssignments } = useAssignments()

const assignments = allAssignments

const statusFilters = ['All', 'Not Started', 'In Progress', 'Waiting', 'Completed']
const activeFilter = ref('All')
const showAddAssignment = ref(false)

const filteredAssignments = computed(() => {
  if (activeFilter.value === 'All') return assignments.value

  const normalizedFilter = activeFilter.value.toLowerCase().replaceAll(' ', '-')

  return assignments.value.filter((assignment) => assignment.status === normalizedFilter)
})

function getCountByStatus(status) {
  if (status === 'All') return assignments.value.length

  const normalizedStatus = status.toLowerCase().replaceAll(' ', '-')

  return assignments.value.filter((assignment) => assignment.status === normalizedStatus).length
}

function goToAssignment(assignment) {
  router.push(`/assignments/${assignment.id}`)
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.assignments-page {
  display: grid;
  gap: 1.25rem;
}

.assignments-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.filter-tab span {
  margin-left: 0.35rem;
  color: var(--text-muted);
}

.filter-tab.active {
  background: var(--accent-soft);
  color: var(--accent-text);
  border-color: var(--accent);
}

.primary-btn {
  border: none;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 800;
  cursor: pointer;
}

.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.assignment-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.1rem;
  box-shadow: var(--shadow);
  display: grid;
  gap: 0.75rem;
}

.clickable {
  cursor: pointer;
  transition: all 0.15s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.assignment-topline,
.badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.course-pill,
.type-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.course-pill {
  background: rgba(15, 23, 42, 0.08);
  color: var(--text-primary);
}

.type-pill {
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-text);
}

.assignment-card h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.assignment-description {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.45;
}

.assignment-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
}

.empty-icon {
  font-size: 3rem;
  margin: 0;
}

@media (max-width: 760px) {
  .assignments-grid {
    grid-template-columns: 1fr;
  }
}
</style>