<template>
  <AppLayout
    title="Courses"
    subtitle="Manage classes, coursework, instructors, assignments, and course progress"
    banner-key="courses"
    default-icon="📚"
  >
    <section class="courses-page">
      <div class="courses-toolbar">
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

        <button class="primary-btn" @click="showAddCourse = true">
          + New Course
        </button>
      </div>

      <div v-if="filteredCourses.length" class="courses-grid">
        <article
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card clickable"
          @click="goToCourse(course)"
        >
          <div class="course-topline">
            <span class="course-icon">{{ course.icon }}</span>
            <span class="course-code">{{ course.code || 'No Code' }}</span>
            <span class="status-pill">{{ formatStatus(course.status) }}</span>
          </div>

          <h2>{{ course.title }}</h2>

          <p v-if="course.description" class="course-description">
            {{ course.description }}
          </p>

          <div class="course-meta">
            <span>📅 {{ formatDateRange(course.startDate, course.endDate) }}</span>
            <span>👤 {{ course.instructorName || 'No instructor assigned' }}</span>
            <span>🎓 {{ course.level || 'No level set' }}</span>
          </div>

          <div class="progress-block">
            <div class="progress-row">
              <span>Progress</span>
              <strong>{{ course.progress }}%</strong>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${course.progress}%` }"
              />
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="empty-icon">📚</p>
        <h2>No courses found</h2>
        <p>Add a course or change your filter.</p>
      </div>
    </section>

    <div
      v-if="showAddCourse"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal">
        <div class="modal-header">
          <span>New Course</span>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <label>Course Title *</label>
            <input
              v-model="newCourse.title"
              class="form-input"
              placeholder="Spiritual Formation"
            />
          </div>

          <div class="form-row two-col">
            <div>
              <label>Course Code</label>
              <input
                v-model="newCourse.code"
                class="form-input"
                placeholder="DMIN 851"
              />
            </div>

            <div>
              <label>Term</label>
              <input
                v-model="newCourse.term"
                class="form-input"
                placeholder="Summer 2026"
              />
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Level</label>
              <select v-model="newCourse.level" class="form-input">
                <option>High School</option>
                <option>Undergraduate</option>
                <option>Graduate</option>
                <option>Doctoral</option>
                <option>Trade / Certificate</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select v-model="newCourse.status" class="form-input">
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Start Date</label>
              <input
                v-model="newCourse.startDate"
                class="form-input"
                type="date"
              />
            </div>

            <div>
              <label>End Date</label>
              <input
                v-model="newCourse.endDate"
                class="form-input"
                type="date"
              />
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Instructor</label>
              <input
                v-model="newCourse.instructorName"
                class="form-input"
                placeholder="Instructor name"
              />
            </div>

            <div>
              <label>Meeting Format</label>
              <select v-model="newCourse.meetingFormat" class="form-input">
                <option>Online</option>
                <option>In Person</option>
                <option>Hybrid</option>
                <option>Self-Paced</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label>Location</label>
            <input
              v-model="newCourse.location"
              class="form-input"
              placeholder="Online, campus, classroom, etc."
            />
          </div>

          <div class="form-row">
            <label>Description</label>
            <textarea
              v-model="newCourse.description"
              class="form-input textarea"
              placeholder="Course description, notes, or focus..."
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="closeModal">
            Cancel
          </button>

          <button
            class="modal-btn-save"
            :disabled="!newCourse.title.trim()"
            @click="submitCourse"
          >
            Create Course
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
import { useCourses } from '@/composables/useCourses'

const router = useRouter()

const { allCourses, addCourse } = useCourses()

const statusFilters = ['All', 'Planned', 'Active', 'Completed', 'Archived']
const activeFilter = ref('All')
const showAddCourse = ref(false)

const defaultCourse = () => ({
  title: '',
  code: '',
  term: '',
  level: 'High School',
  status: 'planned',
  instructorId: null,
  instructorName: '',
  startDate: '',
  endDate: '',
  description: '',
  meetingFormat: 'Online',
  location: '',
  syllabus: '',
  courseNotes: '',
  instructorNotes: '',
  color: '#6366f1',
  icon: '📘',
})

const newCourse = ref(defaultCourse())

const filteredCourses = computed(() => {
  if (activeFilter.value === 'All') return allCourses.value

  const normalizedFilter = activeFilter.value.toLowerCase()

  return allCourses.value.filter((course) => course.status === normalizedFilter)
})

function getCountByStatus(status) {
  if (status === 'All') return allCourses.value.length

  const normalizedStatus = status.toLowerCase()

  return allCourses.value.filter((course) => course.status === normalizedStatus).length
}

function submitCourse() {
  if (!newCourse.value.title.trim()) return

  addCourse(newCourse.value)
  closeModal()
}

function closeModal() {
  newCourse.value = defaultCourse()
  showAddCourse.value = false
}

function goToCourse(course) {
  router.push(`/courses/${course.id}`)
}

function formatStatus(status) {
  if (!status) return 'No Status'

  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return 'No dates set'
  if (startDate && !endDate) return `Starts ${formatDate(startDate)}`
  if (!startDate && endDate) return `Ends ${formatDate(endDate)}`

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
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
.courses-page {
  display: grid;
  gap: 1.25rem;
}

.courses-toolbar {
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

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.course-card {
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

.course-topline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.course-icon {
  font-size: 1.1rem;
}

.course-code,
.status-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.course-code {
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-text);
}

.status-pill {
  background: rgba(15, 23, 42, 0.08);
  color: var(--text-primary);
}

.course-card h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.course-description {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.45;
}

.course-meta {
  display: grid;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.progress-block {
  display: grid;
  gap: 0.4rem;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.2s ease;
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
  width: min(680px, 100%);
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

  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>