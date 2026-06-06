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

    <div
      v-if="showAddAssignment"
      class="modal-overlay"
      @click.self="showAddAssignment = false"
    >
      <div class="modal">
        <div class="modal-header">
          <span>New Assignment</span>
          <button class="modal-close" @click="showAddAssignment = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <label>Title *</label>
            <input
              v-model="newAssignment.title"
              class="form-input"
              placeholder="Book Review Rough Draft"
            />
          </div>

          <div class="form-row two-col">
            <div>
              <label>Course</label>
              <input v-model="newAssignment.course" class="form-input" placeholder="DMIN 851" />
            </div>

            <div>
              <label>Type</label>
              <select v-model="newAssignment.type" class="form-input">
                <option>Paper</option>
                <option>Discussion</option>
                <option>Project</option>
                <option>Quiz</option>
                <option>Exam</option>
                <option>Reading</option>
              </select>
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Due Date</label>
              <input v-model="newAssignment.dueDate" class="form-input" type="date" />
            </div>

            <div>
              <label>Priority</label>
              <select v-model="newAssignment.priority" class="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label>Status</label>
            <select v-model="newAssignment.status" class="form-input">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="form-row">
            <label>Description</label>
            <textarea
              v-model="newAssignment.description"
              class="form-input textarea"
              placeholder="Notes, rubric details, or next action..."
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="showAddAssignment = false">
            Cancel
          </button>

          <button
            class="modal-btn-save"
            :disabled="!newAssignment.title.trim()"
            @click="submitAssignment"
          >
            Create Assignment
          </button>
        </div>
      </div>
    </div>
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
const { assignments, addAssignment } = useAssignments()

const statusFilters = ['All', 'Not Started', 'In Progress', 'Waiting', 'Completed']
const activeFilter = ref('All')
const showAddAssignment = ref(false)

const defaultAssignment = () => ({
  title: '',
  course: '',
  courseId: null,
  description: '',
  dueDate: new Date().toISOString().slice(0, 10),
  status: 'not-started',
  priority: 'medium',
  type: 'Paper',
})

const newAssignment = ref(defaultAssignment())

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

function submitAssignment() {
  if (!newAssignment.value.title.trim()) return

  addAssignment(newAssignment.value)
  newAssignment.value = defaultAssignment()
  showAddAssignment.value = false
}

function goToAssignment(assignment) {
  if (assignment.courseId) {
    router.push(`/courses/${assignment.courseId}/assignments/${assignment.id}`)
    return
  }

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

.primary-btn,
.modal-btn-save {
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  width: min(620px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.modal-header {
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  font-weight: 800;
}

.modal-footer {
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
}

.modal-body {
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

.form-row {
  display: grid;
  gap: 0.35rem;
}

.form-row label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
}

.two-col {
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  box-sizing: border-box;
}

.textarea {
  min-height: 110px;
  resize: vertical;
}

.modal-btn-cancel {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.modal-btn-save:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .two-col {
    grid-template-columns: 1fr;
  }

  .assignments-grid {
    grid-template-columns: 1fr;
  }
}
</style>