<template>
  <AppLayout
    :title="course?.title || 'Course Detail'"
    :subtitle="course?.code || 'Course workspace'"
    banner-key="course-detail"
    default-icon="📚"
  >
    <section v-if="course" class="course-detail-page">
      <div class="course-hero">
        <div>
          <p class="eyebrow">{{ course.code }}</p>
          <h2>{{ course.icon }} {{ course.title }}</h2>
          <p>{{ course.description }}</p>
        </div>

        <div class="course-meta-card">
          <p><strong>Term:</strong> {{ course.term || 'No term set' }}</p>
          <p><strong>Level:</strong> {{ course.level || 'No level set' }}</p>
          <p><strong>Instructor:</strong> {{ course.instructorName || 'No instructor assigned' }}</p>
          <p><strong>Dates:</strong> {{ formatDateRange(course.startDate, course.endDate) }}</p>

          <label>
            Status
            <select
              v-model="course.status"
              class="meta-select"
              @change="updateCourse(course.id, { status: course.status })"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
      </div>

      <section class="progress-card">
        <div class="progress-header">
          <h3>Course Progress</h3>
          <span>{{ course.progress }}%</span>
        </div>

        <input
          v-model="course.progress"
          type="range"
          min="0"
          max="100"
          class="progress-slider"
          @input="updateCourseProgress(course.id, course.progress)"
        />

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${course.progress}%` }"
          />
        </div>
      </section>

      <CourseDeadlinesCard />

      <div class="detail-grid">
        <section class="detail-card">
          <h3>Course Information</h3>
          <p><strong>Format:</strong> {{ course.meetingFormat || 'Not set' }}</p>
          <p><strong>Location:</strong> {{ course.location || 'Not set' }}</p>
        </section>

        <section class="detail-card">
          <h3>Syllabus</h3>
          <p>{{ course.syllabus || 'No syllabus added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Course Notes</h3>
          <p>{{ course.courseNotes || 'No course notes added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Instructor Notes</h3>
          <p>{{ course.instructorNotes || 'No instructor notes added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Linked Assignments</h3>

          <div v-if="linkedAssignments.length" class="linked-list">
            <button
              v-for="assignment in linkedAssignments"
              :key="assignment.id"
              class="linked-item"
              @click="goToAssignment(assignment)"
            >
              <span>{{ assignment.title }}</span>
              <small>{{ assignment.status }} · Due {{ formatDate(assignment.dueDate) }}</small>
            </button>
          </div>

          <p v-else>No assignments linked yet.</p>
        </section>

        <section class="detail-card">
          <h3>Research Sources</h3>
          <p>No research sources linked yet.</p>
          <button class="secondary-btn">+ Link Research Source</button>
        </section>

        <section class="detail-card">
          <h3>Course Files</h3>
          <p>No files uploaded yet.</p>
          <button class="secondary-btn">+ Add File</button>
        </section>

        <section class="detail-card rory-card">
          <h3>Rory Course Assistant</h3>
          <ul>
            <li>Summarize syllabus</li>
            <li>Find upcoming assignments</li>
            <li>Create weekly study plan</li>
            <li>Estimate course workload</li>
            <li>Connect notes and research</li>
          </ul>
        </section>
      </div>
    </section>

    <section v-else class="course-detail-page">
      <h2>Course not found</h2>
      <p>This course does not exist yet.</p>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useCourses } from '@/composables/useCourses'
import { useAssignments } from '@/composables/useAssignments'
import CourseDeadlinesCard from '@/components/courses/CourseDeadlinesCard.vue'

const route = useRoute()
const router = useRouter()

const {
  getCourseById,
  updateCourse,
  updateCourseProgress,
} = useCourses()

const { allAssignments } = useAssignments()

const course = computed(() => getCourseById(route.params.id))

const linkedAssignments = computed(() => {
  if (!course.value) return []

  return allAssignments.value.filter((assignment) =>
    course.value.assignmentIds.includes(assignment.id)
  )
})

function goToAssignment(assignment) {
  router.push(`/assignments/${assignment.id}`)
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
.course-detail-page {
  display: grid;
  gap: 1.25rem;
}

.course-hero {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: var(--accent-text);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.course-hero h2 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.course-hero p {
  color: var(--text-secondary);
}

.course-meta-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.course-meta-card p {
  margin: 0;
}

.course-meta-card label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 800;
}

.meta-select {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
}

.progress-card,
.detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-header h3 {
  margin: 0;
}

.progress-header span {
  font-weight: 800;
  color: var(--accent-text);
}

.progress-slider {
  width: 100%;
  margin: 1rem 0;
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.detail-card h3 {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
}

.detail-card p,
.detail-card li {
  color: var(--text-secondary);
}

.linked-list {
  display: grid;
  gap: 0.65rem;
}

.linked-item {
  width: 100%;
  text-align: left;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.75rem;
  cursor: pointer;
  display: grid;
  gap: 0.25rem;
}

.linked-item small {
  color: var(--text-muted);
}

.secondary-btn {
  margin-top: 0.75rem;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-weight: 700;
}

.rory-card ul {
  margin: 0;
  padding-left: 1.2rem;
}

@media (max-width: 860px) {
  .course-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>