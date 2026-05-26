<template>
  <AppLayout
    :title="assignment.title || 'Assignment'"
    banner-key="assignment-detail"
    default-icon="📝"
  >
    <div class="notion-page">
      <PageBanner :entity="assignment" entity-type="assignment" @update="updateAssignment" />

      <div class="notion-content">
        <!-- Title -->
        <div class="notion-title-row">
        <input
          v-model="assignment.title"
          class="notion-title"
          placeholder="Untitled assignment"
          @blur="updateAssignment({ title: assignment.title })"
        />
      </div>

      <!-- Properties Table -->
      <div class="notion-properties">
        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">📅</span> Due Date
          </span>
          <div class="notion-property-value">
            <input
              type="date"
              v-model="assignment.dueDate"
              class="notion-prop-input"
              @change="updateAssignment({ dueDate: assignment.dueDate })"
            />
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">🔵</span> Status
          </span>
          <div class="notion-property-value">
            <select
              v-model="assignment.status"
              class="notion-prop-select"
              @change="updateAssignment({ status: assignment.status })"
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
              <option value="Late">Late</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">🏷️</span> Type
          </span>
          <div class="notion-property-value">
            <select
              v-model="assignment.type"
              class="notion-prop-select"
              @change="updateAssignment({ type: assignment.type })"
            >
              <option value="Discussion">Discussion</option>
              <option value="Essay">Essay</option>
              <option value="Exam">Exam</option>
              <option value="Quiz">Quiz</option>
              <option value="Project">Project</option>
              <option value="Lab">Lab</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">#</span> Grade
          </span>
          <div class="notion-property-value notion-grade-row">
            <input
              type="number"
              v-model="assignment.grade"
              class="notion-prop-input grade-input"
              placeholder="—"
              @blur="updateAssignment({ grade: assignment.grade })"
            />
            <span class="grade-slash">/</span>
            <input
              type="number"
              v-model="assignment.maxGrade"
              class="notion-prop-input grade-input"
              placeholder="100"
              @blur="updateAssignment({ maxGrade: assignment.maxGrade })"
            />
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">📎</span> Instructions
          </span>
          <div class="notion-property-value">
            <button class="notion-file-btn" @click="$refs.instructionsFile.click()">
              {{ assignment.instructions ? '📄 View file' : 'Upload file' }}
            </button>
            <input ref="instructionsFile" type="file" class="hidden-input" @change="handleFile('instructions', $event)" />
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">📋</span> Rubric
          </span>
          <div class="notion-property-value">
            <button class="notion-file-btn" @click="$refs.rubricFile.click()">
              {{ assignment.rubric ? '📄 View file' : 'Upload file' }}
            </button>
            <input ref="rubricFile" type="file" class="hidden-input" @change="handleFile('rubric', $event)" />
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">📤</span> Submission File
          </span>
          <div class="notion-property-value">
            <button class="notion-file-btn" @click="$refs.submissionFile.click()">
              {{ assignment.submission ? '📄 View file' : 'Upload file' }}
            </button>
            <input ref="submissionFile" type="file" class="hidden-input" @change="handleFile('submission', $event)" />
          </div>
        </div>

        <div class="notion-property-row">
          <span class="notion-property-label">
            <span class="prop-icon">💬</span> Feedback File
          </span>
          <div class="notion-property-value">
            <button class="notion-file-btn" @click="$refs.feedbackFile.click()">
              {{ assignment.feedback ? '📄 View file' : 'Upload file' }}
            </button>
            <input ref="feedbackFile" type="file" class="hidden-input" @change="handleFile('feedback', $event)" />
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="notion-divider"></div>

      <!-- Body / Notes area -->
      <div class="notion-body">
        <textarea
          v-model="assignment.notes"
          class="notion-body-text"
          placeholder="Add notes, ideas, or anything about this assignment..."
          @blur="updateAssignment({ notes: assignment.notes })"
        ></textarea>
      </div>

      <!-- Outline -->
      <div class="notion-section">
        <details open>
          <summary class="notion-section-title">▶ Outline</summary>
          <textarea
            v-model="assignment.outline"
            class="notion-body-text"
            placeholder="Start your outline..."
            @blur="updateAssignment({ outline: assignment.outline })"
          ></textarea>
        </details>
      </div>

      <!-- Source Citations -->
      <div class="notion-section">
        <details open>
          <summary class="notion-section-title">▶ Source Citations</summary>
          <div class="notion-citations">
            <div v-for="(citation, i) in citations" :key="i" class="citation-row">
              <span>{{ citation.text }}</span>
              <button class="citation-remove" @click="removeCitation(i)">×</button>
            </div>
            <button class="notion-add-btn" @click="addingCitation = true">+ Add citation</button>
            <div v-if="addingCitation" class="add-citation-form">
              <input v-model="newCitation" class="notion-prop-input" placeholder="Citation text..." @keyup.enter="saveCitation" />
              <button class="notion-file-btn" @click="saveCitation">Save</button>
            </div>
          </div>
        </details>
      </div>

      <!-- Comments -->
      <div class="notion-section">
        <details open>
          <summary class="notion-section-title">▶ Comments</summary>
          <div class="notion-comments">
            <div v-for="(c, i) in comments" :key="i" class="comment-row">
              <span class="comment-avatar">K</span>
              <span class="comment-text">{{ c.text }}</span>
            </div>
            <div class="add-comment-row">
              <span class="comment-avatar">K</span>
              <textarea
                v-model="newComment"
                class="comment-input"
                placeholder="Add a comment..."
              ></textarea>
            </div>
            <button
              class="notion-file-btn"
              :disabled="!newComment.trim()"
              @click="addComment"
            >Add comment</button>
          </div>
        </details>
      </div>

    </div>
  </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCourses } from '@/composables/useCourses'
import AppLayout from '@/components/AppLayout.vue'
import PageBanner from '@/components/PageBanner.vue'

const route = useRoute()
const { getCourse, updateAssignment: saveAssignment } = useCourses()

const assignment = ref({
  title: '',
  status: 'Pending',
  dueDate: '',
  grade: null,
  maxGrade: 100,
  type: 'Other',
  notes: '',
  outline: '',
  instructions: null,
  rubric: null,
  submission: null,
  feedback: null
})

const citations = ref([])
const comments = ref([])
const newComment = ref('')
const newCitation = ref('')
const addingCitation = ref(false)

const courseId = Number(route.params.courseId || route.params.id)
const assignmentId = Number(route.params.assignmentId || route.params.id)

function getAssignment(courseId, assignmentId) {
  const course = getCourse(courseId)
  return course?.assignments?.find((item) => item.id === assignmentId) || null
}

onMounted(() => {
  const data = getAssignment(courseId, assignmentId)
  if (!data) return

  Object.assign(assignment.value, {
    title: data.title || '',
    status: data.status || 'Pending',
    dueDate: data.dueDate || '',
    grade: data.grade ?? null,
    maxGrade: data.maxGrade ?? 100,
    type: data.type || 'Other',
    notes: data.notes || '',
    outline: data.outline || '',
    instructions: data.instructions || null,
    rubric: data.rubric || null,
    submission: data.submission || null,
    feedback: data.feedback || null
  })

  citations.value = data.source_citations ? [...data.source_citations] : []
  comments.value = data.comments ? [...data.comments] : []
})

async function updateAssignment(fields) {
  await saveAssignment(courseId, assignmentId, fields)
}

async function handleFile(field, event) {
  const file = event.target.files?.[0]
  if (!file) return

  const metadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString()
  }

  assignment.value[field] = metadata
  await updateAssignment({ [field]: metadata })
}

function addComment() {
  if (!newComment.value.trim()) return

  comments.value.push({
    text: newComment.value.trim(),
    createdAt: new Date().toISOString()
  })
  updateAssignment({ comments: comments.value })
  newComment.value = ''
}

function saveCitation() {
  if (!newCitation.value.trim()) return

  citations.value.push({ text: newCitation.value.trim() })
  updateAssignment({ source_citations: citations.value })
  newCitation.value = ''
  addingCitation.value = false
}

function removeCitation(i) {
  citations.value.splice(i, 1)
  updateAssignment({ source_citations: citations.value })
}
</script>

<style scoped>
.notion-page {
  min-height: 100vh;
  background: var(--bg-primary, #fff);
}

/* Title */
.notion-title-row {
  margin-bottom: 24px;
}

.notion-title {
  width: 100%;
  font-size: 2.5rem;
  font-weight: 700;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #1a1a1a);
  line-height: 1.2;
  padding: 0;
}

.notion-title::placeholder {
  color: var(--text-muted);
}

/* Properties */
.notion-properties {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 8px;
}

.notion-content {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.notion-property-row {
  display: flex;
  align-items: center;
  min-height: 34px;
  border-radius: 4px;
  padding: 2px 0;
  gap: 0;
}

.notion-property-row:hover {
  background: var(--accent-soft);
}

.notion-property-label {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 180px;
  min-width: 180px;
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  padding: 4px 8px 4px 4px;
  user-select: none;
}

.prop-icon {
  font-size: 0.85rem;
  width: 18px;
  text-align: center;
}

.notion-property-value {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 0.875rem;
  color: var(--text-primary, #1a1a1a);
  min-height: 28px;
}

.notion-prop-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: var(--text-primary, #1a1a1a);
  width: 100%;
  padding: 0;
}

.notion-prop-input:hover,
.notion-prop-input:focus {
  background: var(--accent-soft);
  border-radius: 3px;
  padding: 2px 4px;
}

.notion-prop-select {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: var(--text-primary, #1a1a1a);
  cursor: pointer;
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
}

.notion-prop-select:hover {
  background: var(--accent-soft);
  border-radius: 3px;
  padding: 2px 4px;
}

.notion-grade-row {
  gap: 6px;
}

.grade-input {
  width: 60px;
}

.grade-slash {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.notion-file-btn {
  background: var(--accent-soft);
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 3px 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.notion-file-btn:hover {
  background: var(--accent-soft);
}

.notion-file-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.hidden-input {
  display: none;
}

/* Divider */
.notion-divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 16px 0 24px;
}

/* Body / Notes */
.notion-body {
  margin-bottom: 8px;
}

.notion-body-text {
  width: 100%;
  min-height: 120px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary, #1a1a1a);
  padding: 0;
  font-family: inherit;
}

.notion-body-text::placeholder {
  color: var(--text-muted);
}

/* Sections (Outline, Citations, Comments) */
.notion-section {
  margin-top: 24px;
}

.notion-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  cursor: pointer;
  list-style: none;
  padding: 4px 0;
  margin-bottom: 12px;
  user-select: none;
}

.notion-section-title::-webkit-details-marker {
  display: none;
}

/* Citations */
.notion-citations {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 8px;
}

.citation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--accent-soft);
}

.citation-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1;
}

.notion-add-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 4px 0;
  text-align: left;
}

.notion-add-btn:hover {
  color: var(--text-primary, #1a1a1a);
}

.add-citation-form {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}

/* Comments */
.notion-comments {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 8px;
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
}

.comment-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-text {
  color: var(--text-primary, #1a1a1a);
  line-height: 1.5;
}

.add-comment-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.comment-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  outline: none;
  resize: none;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text-primary, #1a1a1a);
  padding: 4px 0;
  min-height: 36px;
}

.comment-input::placeholder {
  color: var(--text-muted);
}
</style>