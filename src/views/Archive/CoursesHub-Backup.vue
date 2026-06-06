<template>
  <div class="dashboard-shell">
    <AppSidebar />

    <main class="dashboard-main">
      <header class="dashboard-header">
        <div class="header-left">
          <h1 class="dashboard-title">📚 Courses</h1>
          <span class="dashboard-date">{{ activeCourses.length }} active</span>
        </div>

        <div class="header-right">
          <button class="header-btn" @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'">
            {{ viewMode === 'grid' ? '☰ List' : '⊞ Grid' }}
          </button>
          <button class="header-btn" @click="showProgramManager = true">🎓 Programs</button>
          <button class="header-btn primary" @click="showAddCourse = true">+ Add Course</button>
        </div>
      </header>

      <section class="hub-content">
        <div v-if="programs.length" class="gpa-bar">
          <div v-for="program in programs" :key="program.id" class="gpa-chip">
            <span class="gpa-label">{{ program.name }}</span>
            <span class="gpa-value">
              {{ getProgramGPA(program.id) !== null ? getProgramGPA(program.id).toFixed(2) + ' GPA' : 'No grades yet' }}
            </span>
          </div>
        </div>

        <div v-if="!programs.length" class="notice-bar">
          <span>Set up a program to enable GPA tracking.</span>
          <button class="notice-btn" @click="showProgramManager = true">+ Add Program</button>
        </div>

        <div class="filter-tabs">
          <button
            v-for="status in ['All', 'Active', 'Upcoming', 'Completed', 'Dropped']"
            :key="status"
            class="filter-tab"
            :class="{ active: activeFilter === status }"
            @click="activeFilter = status"
          >
            {{ status }}
            <span class="tab-count">{{ getCountByStatus(status) }}</span>
          </button>
        </div>

        <div v-if="filteredCourses.length === 0" class="empty-state">
          <p class="empty-icon">📚</p>
          <p class="empty-title">No courses yet</p>
          <p class="empty-sub">Add your first course to get started.</p>
          <button class="primary-btn" @click="showAddCourse = true">+ Add Course</button>
        </div>

        <div v-else-if="viewMode === 'grid'" class="courses-grid">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-card"
            @click="goToCourse(course.id)"
          >
            <div
              class="card-banner"
              :style="course.bannerUrl
                ? `background-image: url(${course.bannerUrl}); background-position: center ${course.bannerPosition}%;`
                : `background: ${course.color};`"
            ></div>

            <div class="card-body">
              <div class="card-icon">{{ course.icon }}</div>
              <div class="card-title">{{ course.title }}</div>
              <div class="card-meta">{{ course.term }} · {{ course.credits }} cr</div>
              <div v-if="course.instructorName" class="card-instructor">
                👤 {{ course.instructorName }}
              </div>

              <div class="card-footer">
                <span class="status-chip" :class="course.status.toLowerCase()">
                  {{ course.status }}
                </span>
                <span v-if="getCourseAverage(course.id) !== null" class="card-grade">
                  {{ getCourseAverage(course.id) }}%
                </span>
                <span v-else class="card-grade muted">No grades</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="courses-list">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-row"
            @click="goToCourse(course.id)"
          >
            <div class="row-icon">{{ course.icon }}</div>

            <div class="row-main">
              <span class="row-title">{{ course.title }}</span>
              <span class="row-meta">
                {{ course.term }} · {{ course.credits }} cr · {{ course.instructorName }}
              </span>
            </div>

            <span class="status-chip" :class="course.status.toLowerCase()">
              {{ course.status }}
            </span>

            <span v-if="getCourseAverage(course.id) !== null" class="row-grade">
              {{ getCourseAverage(course.id) }}%
            </span>
            <span v-else class="row-grade muted">—</span>
          </div>
        </div>
      </section>
    </main>

    <div v-if="showAddCourse" class="modal-overlay" @click.self="showAddCourse = false">
      <div class="modal">
        <div class="modal-header">
          <span>Add Course</span>
          <button class="modal-close" @click="showAddCourse = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <label>Icon</label>
            <input v-model="newCourse.icon" class="form-input small" maxlength="2" />
          </div>

          <div class="form-row">
            <label>Course Title *</label>
            <input v-model="newCourse.title" class="form-input" placeholder="e.g. Introduction to Psychology" />
          </div>

          <div class="form-row">
            <label>Instructor Name</label>
            <input v-model="newCourse.instructorName" class="form-input" placeholder="Dr. Smith" />
          </div>

          <div class="form-row">
            <label>Instructor Email</label>
            <input v-model="newCourse.instructorEmail" class="form-input" placeholder="smith@university.edu" />
          </div>

          <div class="form-row">
            <label>Instructor Phone</label>
            <input v-model="newCourse.instructorPhone" class="form-input" placeholder="(555) 000-0000" />
          </div>

          <div class="form-row two-col">
            <div>
              <label>Credits</label>
              <input v-model="newCourse.credits" class="form-input" type="number" min="0" max="12" />
            </div>

            <div>
              <label>Status</label>
              <select v-model="newCourse.status" class="form-input">
                <option>Active</option>
                <option>Upcoming</option>
                <option>Completed</option>
                <option>Dropped</option>
              </select>
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Term</label>
              <input v-model="newCourse.term" class="form-input" placeholder="Fall 2026" />
            </div>

            <div>
              <label>Meeting Time</label>
              <input v-model="newCourse.meetingTime" class="form-input" placeholder="MWF 10-11am" />
            </div>
          </div>

          <div class="form-row">
            <label>Location</label>
            <input v-model="newCourse.location" class="form-input" placeholder="Building 101, Room 204" />
          </div>

          <div v-if="programs.length" class="form-row">
            <label>Program</label>
            <select v-model="newCourse.programId" class="form-input">
              <option :value="null">— None —</option>
              <option v-for="p in programs" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label>Color</label>
            <input v-model="newCourse.color" class="form-input" type="color" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="showAddCourse = false">Cancel</button>
          <button class="modal-btn-save" :disabled="!newCourse.title.trim()" @click="submitCourse">
            Create Course
          </button>
        </div>
      </div>
    </div>

    <div v-if="showProgramManager" class="modal-overlay" @click.self="showProgramManager = false">
      <div class="modal">
        <div class="modal-header">
          <span>🎓 Programs</span>
          <button class="modal-close" @click="showProgramManager = false">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="programs.length" class="programs-list">
            <div v-for="p in programs" :key="p.id" class="program-row">
              <span class="program-name">{{ p.name }}</span>

              <select
                class="form-input small"
                :value="p.gpaScale"
                @change="updateProgram(p.id, { gpaScale: $event.target.value })"
              >
                <option value="4.0-standard">4.0 Standard</option>
                <option value="4.0-plusminus">4.0 Plus/Minus</option>
              </select>

              <button class="delete-btn" @click="deleteProgram(p.id)">🗑</button>
            </div>
          </div>

          <div v-else class="widget-empty">No programs yet.</div>

          <div class="add-program-row">
            <input
              v-model="newProgramName"
              class="form-input"
              placeholder="Program name, e.g. B.S. Psychology"
              @keydown.enter="submitProgram"
            />
            <button class="modal-btn-save" :disabled="!newProgramName.trim()" @click="submitProgram">
              Add
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn-save" @click="showProgramManager = false">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '../components/AppSidebar.vue';
import { useCourses } from '../composables/useCourses';

const router = useRouter();

const {
  courses,
  programs,
  activeCourses,
  addCourse,
  addProgram,
  updateProgram,
  deleteProgram,
  getCourseAverage,
  getProgramGPA
} = useCourses();

const viewMode = ref('grid');
const activeFilter = ref('All');
const showAddCourse = ref(false);
const showProgramManager = ref(false);
const newProgramName = ref('');

const defaultCourse = () => ({
  title: '',
  icon: '📚',
  instructorName: '',
  instructorEmail: '',
  instructorPhone: '',
  credits: 3,
  term: '',
  status: 'Active',
  meetingTime: '',
  location: '',
  programId: null,
  color: '#6366f1'
});

const newCourse = ref(defaultCourse());

const filteredCourses = computed(() => {
  if (activeFilter.value === 'All') return courses.value;
  return courses.value.filter((course) => course.status === activeFilter.value);
});

function getCountByStatus(status) {
  if (status === 'All') return courses.value.length;
  return courses.value.filter((course) => course.status === status).length;
}

function submitCourse() {
  if (!newCourse.value.title.trim()) return;

  const created = addCourse(newCourse.value);

  newCourse.value = defaultCourse();
  showAddCourse.value = false;

  router.push(`/courses/${created.id}`);
}

function submitProgram() {
  if (!newProgramName.value.trim()) return;

  addProgram(newProgramName.value.trim());
  newProgramName.value = '';
}

function goToCourse(id) {
  router.push(`/courses/${id}`);
}
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.dashboard-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.dashboard-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn,
.primary-btn,
.notice-btn,
.modal-btn-save,
.modal-btn-cancel,
.modal-close,
.delete-btn,
.filter-tab {
  cursor: pointer;
}

.header-btn {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  transition: background 0.15s ease, color 0.15s ease;
}

.header-btn:hover {
  background: var(--btn-hover);
  color: var(--text-primary);
}

.header-btn.primary,
.primary-btn,
.modal-btn-save {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: none;
  color: white;
  font-weight: 600;
}

.header-btn.primary:hover,
.primary-btn:hover,
.modal-btn-save:hover {
  opacity: 0.9;
}

.hub-content {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.gpa-bar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.gpa-chip {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.gpa-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.gpa-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.notice-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.25);
  color: #facc15;
  padding: 0.75rem 1rem;
  border-radius: 10px;
}

.notice-btn {
  background: transparent;
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #facc15;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  background: var(--btn-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
}

.filter-tab.active {
  color: var(--accent-text);
  background: var(--accent-soft);
  border-color: var(--accent);
}

.tab-count {
  margin-left: 0.35rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.empty-icon {
  font-size: 3rem;
  margin: 0;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.empty-sub {
  color: var(--text-muted);
}

.primary-btn {
  border-radius: 8px;
  padding: 0.65rem 1rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1rem;
}

.course-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
  box-shadow: var(--shadow);
}

.course-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.card-banner {
  height: 90px;
  background-size: cover;
  background-repeat: no-repeat;
}

.card-body {
  padding: 1rem;
}

.card-icon {
  font-size: 1.8rem;
}

.card-title {
  font-weight: 700;
  margin-top: 0.5rem;
  color: var(--text-primary);
}

.card-meta,
.card-instructor {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 0.75rem;
}

.status-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: var(--btn-bg);
  color: var(--text-secondary);
}

.status-chip.active {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.status-chip.upcoming {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.status-chip.completed {
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
}

.status-chip.dropped {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.card-grade,
.row-grade {
  font-weight: 700;
  color: var(--text-primary);
}

.muted {
  color: var(--text-muted);
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.course-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  box-shadow: var(--shadow);
}

.course-row:hover {
  border-color: var(--accent);
}

.row-icon {
  font-size: 1.5rem;
}

.row-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.row-title {
  font-weight: 700;
  color: var(--text-primary);
}

.row-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
}

.modal-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-row label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}

.two-col {
  display: grid;
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

.form-input.small {
  max-width: 180px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.modal-btn-cancel,
.modal-btn-save {
  border-radius: 8px;
  padding: 0.6rem 1rem;
}

.modal-btn-cancel {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.modal-btn-save:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.program-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem;
}

.program-name {
  flex: 1;
  font-weight: 600;
  color: var(--text-primary);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
}

.widget-empty {
  color: var(--text-muted);
  text-align: center;
  padding: 1rem;
}

.add-program-row {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 760px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    flex-wrap: wrap;
  }

  .hub-content {
    padding: 1rem;
  }

  .two-col {
    grid-template-columns: 1fr;
  }

  .course-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .add-program-row {
    flex-direction: column;
  }
}
</style>