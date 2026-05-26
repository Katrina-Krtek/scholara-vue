<template>
  <AppLayout
    :title="course ? course.title : 'Course'"
    :banner-key="course ? `course-${course.id}` : 'course-detail'"
    :default-icon="course ? course.icon : '📚'"
  >
    <template #actions>
      <div class="actions-row">
        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <button class="danger-btn" @click="confirmDelete">🗑 Delete Course</button>
      </div>
    </template>

    <div class="tab-content" v-if="activeTab === 'properties'">
      <div class="properties-grid">
        <div class="prop-row">
          <span class="prop-label">Course Title</span>
          <input class="prop-input" v-model="editable.title" @blur="saveChanges" placeholder="Course title" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Status</span>
          <select class="prop-input" v-model="editable.status" @change="saveChanges">
            <option>Active</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Dropped</option>
          </select>
        </div>
        <div class="prop-row">
          <span class="prop-label">Term</span>
          <input class="prop-input" v-model="editable.term" @blur="saveChanges" placeholder="e.g. Fall 2026" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Credits</span>
          <input class="prop-input" type="number" min="0" max="12" v-model.number="editable.credits" @blur="saveChanges" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Meeting Time</span>
          <input class="prop-input" v-model="editable.meetingTime" @blur="saveChanges" placeholder="MWF 10:00 - 11:00" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Location</span>
          <input class="prop-input" v-model="editable.location" @blur="saveChanges" placeholder="Building, Room" />
        </div>
        <div class="prop-divider">Instructor</div>
        <div class="prop-row">
          <span class="prop-label">Name</span>
          <input class="prop-input" v-model="editable.instructorName" @blur="saveChanges" placeholder="Dr. Smith" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Email</span>
          <input class="prop-input" type="email" v-model="editable.instructorEmail" @blur="saveChanges" placeholder="name@university.edu" />
        </div>
        <div class="prop-row">
          <span class="prop-label">Phone</span>
          <input class="prop-input" type="tel" v-model="editable.instructorPhone" @blur="saveChanges" placeholder="(555) 123-4567" />
        </div>
      </div>
    </div>

    <div class="tab-content" v-if="activeTab === 'assignments'">
      <div class="tab-header-row">
        <div class="grade-summary">
          <span class="grade-avg" v-if="courseAverage !== null">{{ courseAverage }}%</span>
          <span class="grade-letter" v-if="courseAverage !== null">{{ letterGrade }}</span>
          <span class="grade-empty" v-else>No graded assignments yet.</span>
        </div>
        <button class="header-btn primary" @click="openAssignmentModal">+ Add Assignment</button>
      </div>
      <div v-if="!course.assignments || course.assignments.length === 0" class="empty-state">
        <p class="empty-icon">📝</p>
        <p class="empty-title">No assignments yet</p>
        <p class="empty-sub">Add assignments to track grades and progress.</p>
      </div>
      <div v-else class="assignments-list">
        <div v-for="assignment in course.assignments" :key="assignment.id" class="assignment-card">
          <div class="assignment-top">
            <span class="assignment-title">{{ assignment.title }}</span>
            <span class="status-chip" :class="assignment.status.toLowerCase()">{{ assignment.status }}</span>
          </div>
          <div class="assignment-meta">
            <span v-if="assignment.dueDate">📅 Due {{ formatDate(assignment.dueDate) }}</span>
            <span v-if="assignment.grade !== null" class="assignment-grade">{{ assignment.grade }}/{{ assignment.maxGrade }} ({{ computePercentage(assignment) }}%)</span>
            <span v-else class="assignment-grade muted">Not graded</span>
          </div>
          <div class="assignment-files" v-if="assignment.instructions || assignment.rubric || (assignment.files && assignment.files.length) || (assignment.links && assignment.links.length)">
            <span v-if="assignment.instructions" class="file-badge">📄 Instructions</span>
            <span v-if="assignment.rubric" class="file-badge">📋 Rubric</span>
            <span v-if="assignment.files && assignment.files.length" class="file-badge">📎 {{ assignment.files.length }} File{{ assignment.files.length > 1 ? 's' : '' }}</span>
            <span v-if="assignment.links && assignment.links.length" class="file-badge">🔗 {{ assignment.links.length }} Link{{ assignment.links.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="assignment-actions">
            <button class="small-btn" @click="router.push(`/courses/${courseId}/assignments/${assignment.id}`)">Open</button>
            <button class="small-btn danger" @click="removeAssignment(assignment.id)">🗑 Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content" v-if="activeTab === 'relations'">
      <div class="relations-grid">
        <div class="relation-card">
          <div class="relation-title">📝 Tasks</div>
          <div v-if="courseRelations.tasks.length" class="relation-items">
            <div v-for="task in courseRelations.tasks" :key="task.id" class="relation-item">
              <div class="relation-item-title">{{ task.title || 'Untitled task' }}</div>
              <div class="relation-item-meta">{{ task.status || 'Open' }}</div>
            </div>
          </div>
          <div v-else class="relation-empty">No tasks linked yet.</div>
        </div>

        <div class="relation-card">
          <div class="relation-title">🔎 Sources</div>
          <div v-if="courseRelations.sources.length" class="relation-items">
            <div v-for="source in courseRelations.sources" :key="source.id" class="relation-item">
              <div class="relation-item-title">
                <a v-if="source.url" :href="source.url" target="_blank" rel="noreferrer">{{ source.title || source.url }}</a>
                <span v-else>{{ source.title || 'Untitled source' }}</span>
              </div>
              <div class="relation-item-meta">{{ source.type || 'Reference' }}</div>
            </div>
          </div>
          <div v-else class="relation-empty">No sources linked yet.</div>
        </div>

        <div class="relation-card">
          <div class="relation-title">⏱ Study Sessions</div>
          <div v-if="courseRelations.sessions.length" class="relation-items">
            <div v-for="session in courseRelations.sessions" :key="session.id" class="relation-item">
              <div class="relation-item-title">{{ session.title || 'Study session' }}</div>
              <div class="relation-item-meta">{{ session.date ? formatDate(session.date) : session.notes || 'No date set' }}</div>
            </div>
          </div>
          <div v-else class="relation-empty">No study sessions yet.</div>
        </div>
      </div>
    </div>

    <div class="tab-content" v-if="activeTab === 'activity'">
      <div class="activity-input-row">
        <input v-model="manualNote" class="activity-input" placeholder="Add a manual note..." @keydown.enter.prevent="submitManualNote" />
        <button class="primary-btn" @click="submitManualNote" :disabled="!manualNote.trim()">Add</button>
      </div>
      <div v-if="!course.activity || course.activity.length === 0" class="empty-state">
        <p class="empty-icon">📋</p>
        <p class="empty-title">No activity yet</p>
        <p class="empty-sub">Actions and notes will appear here.</p>
      </div>
      <div v-else class="activity-list">
        <div v-for="entry in course.activity" :key="entry.id" class="activity-entry">
          <div class="activity-dot" :class="{ manual: entry.isManual }"></div>
          <div class="activity-body">
            <span class="activity-msg">{{ entry.message }}</span>
            <span class="activity-time">{{ formatDate(entry.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAssignmentModal" class="modal-backdrop" @click.self="closeAssignmentModal">
      <section class="modal-card">
        <header class="modal-header">
          <h2>{{ editingAssignment ? 'Edit assignment' : 'Add assignment' }}</h2>
          <button class="icon-btn" @click="closeAssignmentModal">✕</button>
        </header>

        <div class="modal-body">
          <div class="field-row">
            <label>Title</label>
            <input v-model="assignmentForm.title" placeholder="Assignment title" />
          </div>

          <div class="grid-two">
            <div class="field-row">
              <label>Grade</label>
              <input type="number" min="0" v-model.number="assignmentForm.grade" placeholder="e.g. 88" />
            </div>
            <div class="field-row">
              <label>Max grade</label>
              <input type="number" min="1" v-model.number="assignmentForm.maxGrade" placeholder="e.g. 100" />
            </div>
          </div>

          <div class="grid-two">
            <div class="field-row">
              <label>Due date</label>
              <input type="date" v-model="assignmentForm.dueDate" />
            </div>
            <div class="field-row">
              <label>Status</label>
              <select v-model="assignmentForm.status">
                <option>Pending</option>
                <option>Submitted</option>
                <option>Graded</option>
                <option>Late</option>
                <option>Missing</option>
              </select>
            </div>
          </div>

          <div class="field-row">
            <label>Notes</label>
            <textarea v-model="assignmentForm.notes" rows="3" placeholder="Optional notes"></textarea>
          </div>

          <div class="field-row file-row">
            <label>Instructions file</label>
            <label class="file-upload-btn">
              {{ assignmentForm.instructions ? 'Replace file' : 'Upload file' }}
              <input type="file" @change="onInstructionsSelected" />
            </label>
            <span v-if="assignmentForm.instructions" class="file-chip">
              {{ assignmentForm.instructions.name }}
              <button class="file-chip-remove" @click="assignmentForm.instructions = null">✕</button>
            </span>
          </div>

          <div class="field-row file-row">
            <label>Rubric file</label>
            <label class="file-upload-btn">
              {{ assignmentForm.rubric ? 'Replace file' : 'Upload file' }}
              <input type="file" @change="onRubricSelected" />
            </label>
            <span v-if="assignmentForm.rubric" class="file-chip">
              {{ assignmentForm.rubric.name }}
              <button class="file-chip-remove" @click="assignmentForm.rubric = null">✕</button>
            </span>
          </div>

          <div class="field-row file-row">
            <label>General files</label>
            <label class="file-upload-btn">
              Upload files
              <input type="file" multiple @change="onGeneralFileSelected" />
            </label>
            <div v-if="assignmentForm.files.length" class="files-preview">
              <span v-for="file in assignmentForm.files" :key="file.id" class="file-chip">
                {{ file.name }}
                <button class="file-chip-remove" @click="removeFormFile(file.id)">✕</button>
              </span>
            </div>
          </div>

          <div class="field-row link-row">
            <label>Links</label>
            <div class="link-input-row">
              <input
                v-model="newLinkLabel"
                class="form-input"
                placeholder="Label (e.g. Chapter 3 Video)"
              />
              <input
                v-model="newLinkUrl"
                class="form-input"
                placeholder="URL (https://...)"
                @keydown.enter.prevent="addLink"
              />
              <button class="mini-btn" @click="addLink" :disabled="!newLinkUrl.trim()">Add</button>
            </div>
            <div v-if="assignmentForm.links.length" class="link-preview">
              <span v-for="(link, index) in assignmentForm.links" :key="index" class="link-chip">
                <a :href="link.url" target="_blank" rel="noreferrer">{{ link.label || link.url }}</a>
                <button class="file-chip-remove" @click="removeLink(index)">✕</button>
              </span>
            </div>
          </div>

          <div class="field-row file-row">
            <label>Submission File</label>
            <label class="file-upload-btn">
              {{ assignmentForm.submission ? 'Replace file' : 'Upload file' }}
              <input type="file" @change="onSubmissionSelected" />
            </label>
            <span v-if="assignmentForm.submission" class="file-chip">
              {{ assignmentForm.submission.name }}
              <button class="file-chip-remove" @click="assignmentForm.submission = null">✕</button>
            </span>
          </div>

          <div class="field-row file-row">
            <label>Feedback File (from instructor)</label>
            <label class="file-upload-btn">
              {{ assignmentForm.feedback ? 'Replace file' : 'Upload file' }}
              <input type="file" @change="onFeedbackSelected" />
            </label>
            <span v-if="assignmentForm.feedback" class="file-chip">
              {{ assignmentForm.feedback.name }}
              <button class="file-chip-remove" @click="assignmentForm.feedback = null">✕</button>
            </span>
          </div>

          <div class="field-row comments-row">
            <label>Comments</label>
            <div v-if="assignmentForm.comments.length" class="comments-list">
              <div v-for="comment in assignmentForm.comments" :key="comment.id" class="comment-row">
                <div class="comment-body">
                  <p class="comment-text">{{ comment.text }}</p>
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <button class="file-chip-remove" @click="removeComment(comment.id)">✕</button>
              </div>
            </div>
            <textarea v-model="newComment" rows="3" placeholder="Add a comment..."></textarea>
            <button class="mini-btn" @click="addComment" :disabled="!newComment.trim()">Add Comment</button>
          </div>

          <div class="field-row">
            <label>Assignment Notes</label>
            <textarea v-model="assignmentForm.notes" rows="8" placeholder="Assignment notes"></textarea>
          </div>

          <div class="field-row">
            <label>Outline</label>
            <textarea v-model="assignmentForm.outline" rows="8" placeholder="Assignment outline"></textarea>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="secondary-btn" @click="closeAssignmentModal">Cancel</button>
          <button class="primary-btn" @click="saveAssignment" :disabled="!assignmentForm.title.trim()">Save</button>
        </footer>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useCourses } from '../composables/useCourses.js';

const route = useRoute();
const router = useRouter();
const { getCourse, updateCourse, deleteCourse, addAssignment, updateAssignment, deleteAssignment, addFile, deleteFile, logActivity, addManualActivity, getCourseAverage, getLetterGrade } = useCourses();

const courseId = computed(() => Number(route.params.id));
const course = computed(() => getCourse(courseId.value));
const courseRelations = computed(() => course.value?.relations || { tasks: [], sources: [], sessions: [] });

const tabs = [
  { id: 'properties', label: '⚙ Properties' },
  { id: 'assignments', label: '📝 Assignments' },
  { id: 'relations', label: '🔗 Relations' },
  { id: 'activity', label: '📋 Activity' }
];

const activeTab = ref('properties');
const manualNote = ref('');
const showAssignmentModal = ref(false);
const editingAssignment = ref(null);
const editable = reactive({
  title: '',
  status: 'Active',
  term: '',
  credits: 3,
  meetingTime: '',
  location: '',
  instructorName: '',
  instructorEmail: '',
  instructorPhone: ''
});

const defaultAssignment = {
  title: '',
  grade: null,
  maxGrade: 100,
  dueDate: '',
  status: 'Pending',
  notes: '',
  instructions: null,
  rubric: null,
  files: [],
  links: [],
  submission: null,
  feedback: null,
  comments: [],
  outline: ''
};

const newLinkLabel = ref('');
const newLinkUrl = ref('');
const newComment = ref('');

const assignmentForm = reactive({
  ...defaultAssignment,
  files: [],
  links: [],
  comments: []
});

watch(course, (next) => {
  if (!next) return;
  Object.assign(editable, {
    title: next.title || '',
    status: next.status || 'Active',
    term: next.term || '',
    credits: Number(next.credits) || 3,
    meetingTime: next.meetingTime || '',
    location: next.location || '',
    instructorName: next.instructorName || '',
    instructorEmail: next.instructorEmail || '',
    instructorPhone: next.instructorPhone || ''
  });
}, { immediate: true });

function saveChanges() {
  if (!course.value) return;
  updateCourse(courseId.value, {
    title: editable.title,
    status: editable.status,
    term: editable.term,
    credits: editable.credits,
    meetingTime: editable.meetingTime,
    location: editable.location,
    instructorName: editable.instructorName,
    instructorEmail: editable.instructorEmail,
    instructorPhone: editable.instructorPhone
  });
}

function openAssignmentModal() {
  editingAssignment.value = null;
  resetAssignmentForm();
  showAssignmentModal.value = true;
}

function editAssignment(item) {
  editingAssignment.value = item;
  Object.assign(assignmentForm, {
    title: item.title || '',
    grade: item.grade,
    maxGrade: item.maxGrade || 100,
    dueDate: item.dueDate || '',
    status: item.status || 'Pending',
    notes: item.notes || '',
    outline: item.outline || '',
    instructions: item.instructions ? { ...item.instructions } : null,
    rubric: item.rubric ? { ...item.rubric } : null,
    submission: item.submission ? { ...item.submission } : null,
    feedback: item.feedback ? { ...item.feedback } : null,
    files: item.files ? [...item.files] : [],
    links: item.links ? item.links.map((link) => typeof link === 'string' ? { label: '', url: link } : { ...link }) : [],
    comments: item.comments ? [...item.comments] : []
  });
  newLinkLabel.value = '';
  newLinkUrl.value = '';
  newComment.value = '';
  showAssignmentModal.value = true;
}

function closeAssignmentModal() {
  showAssignmentModal.value = false;
  editingAssignment.value = null;
  resetAssignmentForm();
}

function resetAssignmentForm() {
  Object.assign(assignmentForm, {
    ...defaultAssignment,
    files: [],
    links: [],
    comments: []
  });
  newLinkLabel.value = '';
  newLinkUrl.value = '';
  newComment.value = '';
}

function saveAssignment() {
  if (!assignmentForm.title.trim() || !course.value) return;
  const data = {
    title: assignmentForm.title.trim(),
    grade: assignmentForm.grade === null || assignmentForm.grade === '' ? null : Number(assignmentForm.grade),
    maxGrade: Number(assignmentForm.maxGrade) || 100,
    dueDate: assignmentForm.dueDate || null,
    status: assignmentForm.status,
    notes: assignmentForm.notes.trim(),
    instructions: assignmentForm.instructions ? { ...assignmentForm.instructions } : null,
    rubric: assignmentForm.rubric ? { ...assignmentForm.rubric } : null,
    files: assignmentForm.files.map((file) => ({ ...file })),
    links: [...assignmentForm.links],
    submission: assignmentForm.submission ? { ...assignmentForm.submission } : null,
    feedback: assignmentForm.feedback ? { ...assignmentForm.feedback } : null,
    comments: assignmentForm.comments.map((comment) => ({ ...comment })),
    outline: assignmentForm.outline || ''
  };

  if (editingAssignment.value) {
    updateAssignment(courseId.value, editingAssignment.value.id, data);
  } else {
    addAssignment(courseId.value, data);
  }
  closeAssignmentModal();
}

function removeAssignment(id) {
  deleteAssignment(courseId.value, id);
}

function onInstructionsSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  assignmentForm.instructions = { id: Date.now(), name: file.name, size: file.size, type: file.type };
  event.target.value = '';
}

function onRubricSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  assignmentForm.rubric = { id: Date.now(), name: file.name, size: file.size, type: file.type };
  event.target.value = '';
}

function onGeneralFileSelected(event) {
  const files = Array.from(event.target.files || []);
  files.forEach((file) => assignmentForm.files.push({ id: Date.now() + Math.random(), name: file.name, size: file.size, type: file.type }));
  event.target.value = '';
}

function onSubmissionSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  assignmentForm.submission = { id: Date.now(), name: file.name, size: file.size, type: file.type };
  event.target.value = '';
}

function onFeedbackSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  assignmentForm.feedback = { id: Date.now(), name: file.name, size: file.size, type: file.type };
  event.target.value = '';
}

function addComment() {
  const text = newComment.value.trim();
  if (!text) return;
  assignmentForm.comments.push({ id: Date.now(), text, createdAt: new Date().toISOString() });
  newComment.value = '';
}

function removeComment(id) {
  assignmentForm.comments = assignmentForm.comments.filter((comment) => comment.id !== id);
}

function removeFormFile(id) {
  assignmentForm.files = assignmentForm.files.filter((file) => file.id !== id);
}

function addLink() {
  const url = newLinkUrl.value.trim();
  if (!url) return;
  assignmentForm.links.push({
    label: newLinkLabel.value.trim(),
    url
  });
  newLinkLabel.value = '';
  newLinkUrl.value = '';
}

function removeLink(index) {
  assignmentForm.links.splice(index, 1);
}

function submitManualNote() {
  const note = manualNote.value.trim();
  if (!note || !course.value) return;
  addManualActivity(courseId.value, note);
  manualNote.value = '';
}

const courseAverage = computed(() => getCourseAverage(courseId.value));
const letterGrade = computed(() => {
  const average = courseAverage.value;
  if (average === null) return '';
  return getLetterGrade(average, '4.0-standard')?.letter || '';
});

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
}

function computePercentage(assignment) {
  if (assignment.grade === null || !assignment.maxGrade) return 0;
  return Math.round((assignment.grade / assignment.maxGrade) * 100);
}
</script>

<style scoped>
.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.tab-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tab-btn { padding: 0.75rem 1rem; border-radius: 999px; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; }
.tab-btn.active { background: var(--bg-accent); color: var(--text-on-accent); border-color: transparent; }
.danger-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; border-radius: 0.85rem; padding: 0.75rem 1rem; cursor: pointer; }
.tab-content { padding: 1.25rem 0; }
.properties-grid { display: grid; gap: 1rem; max-width: 720px; }
.prop-row { display: grid; grid-template-columns: 160px 1fr; align-items: center; gap: 1rem; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color); }
.prop-label { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; }
.prop-input, .form-input, .field-row input, .field-row select, .field-row textarea { width: 100%; border: 1px solid var(--border-color); border-radius: 0.85rem; background: var(--bg-primary); color: var(--text-primary); padding: 0.8rem 1rem; font: inherit; }
.prop-input:focus, .form-input:focus, .field-row input:focus, .field-row select:focus, .field-row textarea:focus { outline: 2px solid var(--accent); }
.prop-divider, .form-divider { margin-top: 1.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
.tab-header-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
.grade-summary { display: flex; align-items: baseline; gap: 0.75rem; }
.grade-avg { font-size: 1.9rem; font-weight: 700; color: var(--text-primary); }
.grade-letter { font-size: 1rem; color: var(--accent-text); }
.grade-empty { color: var(--text-muted); }
.header-btn { background: var(--btn-bg); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 0.85rem; padding: 0.75rem 1rem; cursor: pointer; }
.header-btn.primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; }
.empty-state { display: grid; place-items: center; padding: 2rem 0; gap: 0.5rem; text-align: center; }
.empty-icon { font-size: 2rem; }
.empty-title { font-weight: 700; color: var(--text-primary); }
.empty-sub { color: var(--text-muted); }
.assignments-list { display: grid; gap: 1rem; }
.assignment-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1rem; display: grid; gap: 0.75rem; }
.assignment-top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.assignment-title { font-weight: 700; color: var(--text-primary); }
.status-chip { padding: 0.35rem 0.75rem; border-radius: 999px; background: var(--bg-secondary); color: var(--text-muted); font-size: 0.82rem; }
.assignment-meta { display: flex; flex-wrap: wrap; gap: 0.85rem; color: var(--text-muted); font-size: 0.9rem; }
.assignment-grade { font-weight: 600; color: var(--text-primary); }
.assignment-grade.muted { color: var(--text-muted); }
.assignment-files { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
.file-badge { background: var(--bg-secondary); border-radius: 999px; padding: 0.45rem 0.75rem; font-size: 0.82rem; color: var(--text-muted); }
.assignment-actions { display: flex; gap: 0.75rem; }
.small-btn { background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.7rem 0.9rem; border-radius: 0.85rem; cursor: pointer; }
.small-btn.danger { background: var(--bg-secondary); color: var(--accent); border-color: var(--border-color); }
.relations-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.relation-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; padding: 1rem; display: grid; gap: 0.75rem; }
.relation-title { font-weight: 700; color: var(--text-primary); }
.relation-items { display: grid; gap: 0.5rem; }
.relation-item { background: var(--bg-secondary); border-radius: 0.9rem; padding: 0.85rem; display: grid; gap: 0.3rem; }
.relation-item-title { font-weight: 600; }
.relation-item-meta { color: var(--text-muted); font-size: 0.88rem; }
.relation-empty { color: var(--text-muted); }
.activity-input-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.activity-input { flex: 1; border: 1px solid var(--border-color); border-radius: 0.85rem; padding: 0.8rem 1rem; background: var(--bg-primary); color: var(--text-primary); }
.activity-entry { display: grid; grid-template-columns: auto 1fr; gap: 0.75rem; padding: 0.85rem 1rem; border-radius: 1rem; background: var(--bg-card); border: 1px solid var(--border-color); }
.activity-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 0.4rem; background: var(--accent); }
.activity-dot.manual { background: var(--accent-warning); }
.activity-body { display: grid; gap: 0.35rem; }
.activity-msg { font-weight: 600; }
.activity-time { color: var(--text-muted); font-size: 0.85rem; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.55); display: grid; place-items: center; padding: 1.5rem; z-index: 20; }
.modal-card { width: min(880px, 100%); max-height: min(88vh, 820px); overflow-y: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 1.25rem; box-shadow: 0 24px 60px rgba(15,23,42,0.15); padding: 1.25rem; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.modal-header h2 { margin: 0; font-size: 1.2rem; }
.field-row { display: grid; gap: 0.6rem; }
.grid-two { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
.file-row { display: grid; gap: 0.75rem; }
.file-upload-btn { display: grid; width: 100%; min-height: 56px; padding: 1rem; border-radius: 1rem; background: var(--bg-primary); color: var(--text-primary); border: 1px dashed var(--border-color); cursor: pointer; position: relative; overflow: hidden; place-items: center; }
.file-upload-btn input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.files-preview, .link-preview { display: grid; gap: 0.5rem; }
.file-chip, .link-chip { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.85rem; border-radius: 999px; background: var(--bg-secondary); color: var(--text-muted); font-size: 0.88rem; }
.file-chip-remove { border: none; background: transparent; color: var(--text-muted); cursor: pointer; }
.comments-list { display: grid; gap: 0.75rem; padding: 0.85rem 1rem; border-radius: 1rem; background: var(--bg-card); border: 1px solid var(--border-color); }
.comment-row { display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; align-items: flex-start; padding: 0.85rem; border-radius: 1rem; background: var(--bg-secondary); }
.comment-body { display: grid; gap: 0.35rem; }
.comment-text { margin: 0; color: var(--text-primary); }
.comment-time { color: var(--text-muted); font-size: 0.82rem; }
.comments-row textarea { width: 100%; min-height: 120px; }
.link-row { display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center; padding: 0.7rem; border: 1px solid var(--border-color); border-radius: 0.95rem; background: var(--bg-card); }
.link-label { color: var(--text-primary); }
.link-input-row { display: grid; gap: 0.75rem; }
.mini-btn { background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 0.85rem; padding: 0.75rem 1rem; cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
.secondary-btn { background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); }
.primary-btn { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; }
.icon-btn { border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 1rem; }
</style>
