<template>
  <AppLayout
    title="Instructors"
    subtitle="Track instructors, teachers, mentors, office hours, and linked courses"
    banner-key="instructors"
    default-icon="👩‍🏫"
  >
    <section class="instructors-page">
      <div class="instructors-toolbar">
        <button class="primary-btn" @click="showAddInstructor = true">
          + New Instructor
        </button>
      </div>

      <div v-if="allInstructors.length" class="instructors-grid">
        <article
          v-for="instructor in allInstructors"
          :key="instructor.id"
          class="instructor-card clickable"
          @click="goToInstructor(instructor)"
        >
          <div class="avatar">{{ instructor.avatar }}</div>

          <div>
            <h2>{{ instructor.displayName }}</h2>
            <p>{{ instructor.title || 'Instructor' }}</p>
            <p>{{ instructor.department || 'No department set' }}</p>
            <p>{{ instructor.institution || 'No institution set' }}</p>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="empty-icon">👩‍🏫</p>
        <h2>No instructors found</h2>
        <p>Add an instructor to begin connecting courses.</p>
      </div>
    </section>

    <div
      v-if="showAddInstructor"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal">
        <div class="modal-header">
          <span>New Instructor</span>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row two-col">
            <div>
              <label>First Name</label>
              <input v-model="newInstructor.firstName" class="form-input" />
            </div>

            <div>
              <label>Last Name</label>
              <input v-model="newInstructor.lastName" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <label>Display Name *</label>
            <input
              v-model="newInstructor.displayName"
              class="form-input"
              placeholder="Dr. Jane Smith"
            />
          </div>

          <div class="form-row two-col">
            <div>
              <label>Title</label>
              <input
                v-model="newInstructor.title"
                class="form-input"
                placeholder="Instructor, Professor, Teacher, Coach..."
              />
            </div>

            <div>
              <label>Department</label>
              <input
                v-model="newInstructor.department"
                class="form-input"
                placeholder="School of Divinity"
              />
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Email</label>
              <input v-model="newInstructor.email" class="form-input" />
            </div>

            <div>
              <label>Phone</label>
              <input v-model="newInstructor.phone" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <label>Institution</label>
            <input v-model="newInstructor.institution" class="form-input" />
          </div>

          <div class="form-row two-col">
            <div>
              <label>Office Location</label>
              <input v-model="newInstructor.officeLocation" class="form-input" />
            </div>

            <div>
              <label>Office Hours</label>
              <input v-model="newInstructor.officeHours" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <label>Notes</label>
            <textarea v-model="newInstructor.notes" class="form-input textarea" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="closeModal">
            Cancel
          </button>

          <button
            class="modal-btn-save"
            :disabled="!newInstructor.displayName.trim()"
            @click="submitInstructor"
          >
            Create Instructor
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useInstructors } from '@/composables/useInstructors'

const router = useRouter()
const { allInstructors, addInstructor } = useInstructors()

const showAddInstructor = ref(false)

const defaultInstructor = () => ({
  firstName: '',
  lastName: '',
  displayName: '',
  title: 'Instructor',
  department: '',
  email: '',
  phone: '',
  officeLocation: '',
  officeHours: '',
  institution: '',
  bio: '',
  notes: '',
  courseIds: [],
  color: '#6366f1',
  avatar: '👩‍🏫',
})

const newInstructor = ref(defaultInstructor())

function submitInstructor() {
  if (!newInstructor.value.displayName.trim()) return

  addInstructor(newInstructor.value)
  closeModal()
}

function closeModal() {
  newInstructor.value = defaultInstructor()
  showAddInstructor.value = false
}

function goToInstructor(instructor) {
  router.push(`/instructors/${instructor.id}`)
}
</script>

<style scoped>
.instructors-page {
  display: grid;
  gap: 1.25rem;
}

.instructors-toolbar {
  display: flex;
  justify-content: flex-end;
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

.instructors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.instructor-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.1rem;
  box-shadow: var(--shadow);
  display: flex;
  gap: 1rem;
}

.clickable {
  cursor: pointer;
  transition: all 0.15s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.avatar {
  font-size: 2rem;
}

.instructor-card h2 {
  margin: 0 0 0.35rem;
  color: var(--text-primary);
}

.instructor-card p {
  margin: 0 0 0.25rem;
  color: var(--text-secondary);
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

  .instructors-grid {
    grid-template-columns: 1fr;
  }
}
</style>