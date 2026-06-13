<template>
  <AppLayout
    :title="assignment?.title || 'Assignment Detail'"
    :subtitle="assignment?.course || 'Assignment workspace'"
    banner-key="assignment-detail"
    default-icon="📝"
  >
    <section v-if="assignment" class="assignment-detail-page">
      <div class="assignment-hero">
        <div>
          <p class="eyebrow">{{ assignment.type }}</p>
          <h2>{{ assignment.title }}</h2>
          <p>{{ assignment.description }}</p>
        </div>

        <div class="assignment-meta-card">
          <p><strong>Course:</strong> {{ assignment.course }}</p>
          <p><strong>Due:</strong> {{ formatDate(assignment.dueDate) }}</p>

          <label>
            Status
            <select
              v-model="assignment.status"
              class="meta-select"
              @change="updateAssignmentStatus(assignment.id, assignment.status)"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label>
            Priority
            <select
              v-model="assignment.priority"
              class="meta-select"
              @change="updateAssignmentPriority(assignment.id, assignment.priority)"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
      </div>

      <AssignmentProgressTracker
        v-model="assignment.progress"
        @update:modelValue="updateAssignmentProgress(assignment.id, $event)"
      />

      <div class="detail-grid">
        <section class="detail-card">
          <h3>Instructions</h3>
          <p>{{ assignment.instructions || 'No instructions added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Rubric</h3>
          <p>{{ assignment.rubric || 'No rubric added yet.' }}</p>
        </section>

        <section class="detail-card">
          <h3>Word Count</h3>
          <p>Current: {{ assignment.wordCount.current }}</p>
          <p>Target: {{ assignment.wordCount.target }}</p>
          <p>
            Remaining:
            {{ assignment.wordCount.target - assignment.wordCount.current }}
          </p>
        </section>

        <section class="detail-card">
          <h3>Linked Research</h3>
          <p>No research sources linked yet.</p>
          <button class="secondary-btn">+ Link Research Source</button>
        </section>

        <section class="detail-card">
          <h3>Linked Tasks</h3>
          <p>No tasks linked yet.</p>
          <button class="secondary-btn">+ Link Task</button>
        </section>

        <section class="detail-card rory-card">
          <h3>Rory Assignment Assistant</h3>
          <ul>
            <li>Explain assignment</li>
            <li>Summarize instructions</li>
            <li>Suggest research</li>
            <li>Create task plan</li>
            <li>Estimate completion time</li>
          </ul>
        </section>
      </div>

      <AssignmentNotes
        v-model:instructorNotes="assignment.instructorNotes"
        v-model:personalNotes="assignment.personalNotes"
        @update:instructorNotes="updateAssignmentNotes(assignment.id, {
          instructorNotes: assignment.instructorNotes,
        })"
        @update:personalNotes="updateAssignmentNotes(assignment.id, {
          personalNotes: assignment.personalNotes,
        })"
      />

      <SubmissionChecklist
        :checklist="assignment.checklist"
        @update:checklist="updateAssignmentChecklist(assignment.id, $event)"
      />
    </section>

    <section v-else class="assignment-detail-page">
      <h2>Assignment not found</h2>
      <p>This assignment does not exist yet.</p>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AssignmentProgressTracker from '@/components/assignments/AssignmentProgressTracker.vue'
import AssignmentNotes from '@/components/assignments/AssignmentNotes.vue'
import SubmissionChecklist from '@/components/assignments/SubmissionChecklist.vue'
import { useAssignments } from '@/composables/useAssignments'

const route = useRoute()

const {
  getAssignmentById,
  updateAssignmentStatus,
  updateAssignmentPriority,
  updateAssignmentProgress,
  updateAssignmentNotes,
  updateAssignmentChecklist,
} = useAssignments()

const assignment = computed(() => getAssignmentById(route.params.id))

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
.assignment-detail-page {
  display: grid;
  gap: 1.25rem;
}

.assignment-hero {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: 1fr 300px;
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

.assignment-hero h2 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.assignment-hero p {
  color: var(--text-secondary);
}

.assignment-meta-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.assignment-meta-card p {
  margin: 0;
}

.assignment-meta-card label {
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
  color: var(--text-primary);
}

.detail-card p,
.detail-card li {
  color: var(--text-secondary);
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
  .assignment-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>