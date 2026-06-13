<template>
  <AppLayout
    :title="instructor?.displayName || 'Instructor Detail'"
    :subtitle="instructor?.institution || 'Instructor workspace'"
    banner-key="instructor-detail"
    default-icon="👩‍🏫"
  >
    <section v-if="instructor" class="instructor-detail-page">
      <div class="instructor-hero">
        <div>
          <div class="avatar">{{ instructor.avatar }}</div>

          <p class="eyebrow">{{ instructor.title }}</p>

          <h2>{{ instructor.displayName }}</h2>

          <p>{{ instructor.department || 'No department assigned' }}</p>
        </div>

        <div class="instructor-meta-card">
          <p><strong>Institution:</strong> {{ instructor.institution || 'Not Set' }}</p>
          <p><strong>Email:</strong> {{ instructor.email || 'Not Set' }}</p>
          <p><strong>Phone:</strong> {{ instructor.phone || 'Not Set' }}</p>
          <p><strong>Office:</strong> {{ instructor.officeLocation || 'Not Set' }}</p>
          <p><strong>Office Hours:</strong> {{ instructor.officeHours || 'Not Set' }}</p>
        </div>
      </div>

      <div class="detail-grid">
        <section class="detail-card">
          <h3>Biography</h3>
          <p>{{ instructor.bio || 'No biography added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Instructor Notes</h3>
          <p>{{ instructor.notes || 'No notes added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Linked Courses</h3>

          <div v-if="linkedCourses.length" class="linked-list">
            <button
              v-for="course in linkedCourses"
              :key="course.id"
              class="linked-item"
              @click="goToCourse(course)"
            >
              <span>{{ course.title }}</span>
              <small>{{ course.code }}</small>
            </button>
          </div>

          <p v-else>
            No courses linked yet.
          </p>
        </section>

        <section class="detail-card rory-card">
          <h3>Rory Instructor Assistant</h3>

          <ul>
            <li>Summarize instructor expectations</li>
            <li>Show linked courses</li>
            <li>Identify assignment patterns</li>
            <li>Track communication</li>
            <li>Build study strategy</li>
          </ul>
        </section>
      </div>
    </section>

    <section v-else class="instructor-detail-page">
      <h2>Instructor not found</h2>
      <p>This instructor does not exist yet.</p>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'

import { useInstructors } from '@/composables/useInstructors'
import { useCourses } from '@/composables/useCourses'

const route = useRoute()
const router = useRouter()

const { getInstructorById } = useInstructors()
const { allCourses } = useCourses()

const instructor = computed(() =>
  getInstructorById(route.params.id)
)

const linkedCourses = computed(() => {
  if (!instructor.value) return []

  return allCourses.value.filter(course =>
    instructor.value.courseIds.includes(course.id)
  )
})

function goToCourse(course) {
  router.push(`/courses/${course.id}`)
}
</script>

<style scoped>
.instructor-detail-page {
  display: grid;
  gap: 1.25rem;
}

.instructor-hero {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
}

.avatar {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: var(--accent-text);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
}

.instructor-hero h2 {
  margin: 0 0 0.5rem;
}

.instructor-meta-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
}

.instructor-meta-card p {
  margin: 0 0 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.detail-card h3 {
  margin: 0 0 0.75rem;
}

.linked-list {
  display: grid;
  gap: 0.5rem;
}

.linked-item {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 0.75rem;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 0.25rem;
}

.linked-item small {
  color: var(--text-muted);
}

.rory-card ul {
  margin: 0;
  padding-left: 1.2rem;
}

@media (max-width: 860px) {
  .instructor-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>