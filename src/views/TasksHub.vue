<template>
  <AppLayout
    title="Tasks"
    subtitle="Track daily tasks, study actions, and personal reminders"
    banner-key="tasks"
    default-icon="✅"
  >
    <section class="tasks-page">
      <div class="tasks-toolbar">
        <div class="filter-tabs">
          <button
            v-for="status in statusFilters"
            :key="status"
            class="filter-tab"
            :class="{ active: activeFilter === status }"
            @click="activeFilter = status"
          >
            {{ status }}
          </button>
        </div>

        <button class="primary-btn" @click="openAddTask">
          + New Task
        </button>
      </div>

      <div v-if="filteredTasks.length" class="tasks-list">
        <article v-for="task in filteredTasks" :key="task.id" class="task-card">
          <div class="task-main">
            <div>
              <h2>{{ task.title }}</h2>
              <p v-if="task.description">{{ task.description }}</p>
              <span class="due-date">Due {{ formatDate(task.dueDate) }}</span>
            </div>

            <div class="badge-row">
              <StatusBadge :status="task.status" />
              <PriorityBadge :priority="task.priority" />
            </div>
          </div>

          <div class="quick-edit-grid">
            <label>
              Status
              <select
                class="mini-select"
                :value="task.status"
                @change="updateTask(task.id, { status: $event.target.value })"
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
                class="mini-select"
                :value="task.priority"
                @change="updateTask(task.id, { priority: $event.target.value })"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>

            <label>
              Due Date
              <input
                class="mini-select"
                type="date"
                :value="task.dueDate"
                @change="updateTask(task.id, { dueDate: $event.target.value })"
              />
            </label>
          </div>

          <div class="task-actions">
            <button class="task-btn" @click="toggleTaskComplete(task.id)">
              {{ task.status === 'completed' ? 'Mark Open' : '✓ Complete' }}
            </button>

            <button class="task-btn" @click="openEditTask(task)">
              Edit
            </button>

            <button class="task-btn danger" @click="deleteTask(task.id)">
              Delete
            </button>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="empty-icon">✅</p>
        <h2>No tasks found</h2>
        <p>Add a task or change your filter.</p>
      </div>
    </section>

    <div v-if="showTaskModal" class="modal-overlay" @click.self="closeTaskModal">
      <div class="modal">
        <div class="modal-header">
          <span>{{ editingTaskId ? 'Edit Task' : 'New Task' }}</span>
          <button class="modal-close" @click="closeTaskModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <label>Title *</label>
            <input v-model="taskForm.title" class="form-input" placeholder="Task title" />
          </div>

          <div class="form-row two-col">
            <div>
              <label>Due Date</label>
              <input v-model="taskForm.dueDate" class="form-input" type="date" />
            </div>

            <div>
              <label>Priority</label>
              <select v-model="taskForm.priority" class="form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label>Status</label>
            <select v-model="taskForm.status" class="form-input">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="form-row">
            <label>Description</label>
            <textarea
              v-model="taskForm.description"
              class="form-input textarea"
              placeholder="Description"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn-cancel" @click="closeTaskModal">
            Cancel
          </button>

          <button
            class="modal-btn-save"
            :disabled="!taskForm.title.trim()"
            @click="saveTask"
          >
            {{ editingTaskId ? 'Save Changes' : 'Create Task' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'
import { useTasks } from '@/composables/useTasks'

const {
  tasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} = useTasks()

const activeFilter = ref('All')
const showTaskModal = ref(false)
const editingTaskId = ref(null)

const statusFilters = [
  'All',
  'Not Started',
  'In Progress',
  'Waiting',
  'Completed',
]

const defaultTask = () => ({
  title: '',
  description: '',
  dueDate: new Date().toISOString().slice(0, 10),
  status: 'not-started',
  priority: 'medium',
})

const taskForm = ref(defaultTask())

const filteredTasks = computed(() => {
  if (activeFilter.value === 'All') return tasks.value

  const normalizedStatus = activeFilter.value.toLowerCase().replaceAll(' ', '-')

  return tasks.value.filter((task) => task.status === normalizedStatus)
})

function openAddTask() {
  editingTaskId.value = null
  taskForm.value = defaultTask()
  showTaskModal.value = true
}

function openEditTask(task) {
  editingTaskId.value = task.id
  taskForm.value = { ...task }
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
  editingTaskId.value = null
  taskForm.value = defaultTask()
}

function saveTask() {
  if (!taskForm.value.title.trim()) return

  if (editingTaskId.value) {
    updateTask(editingTaskId.value, taskForm.value)
  } else {
    addTask(taskForm.value)
  }

  closeTaskModal()
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
.tasks-page {
  display: grid;
  gap: 1.25rem;
}

.tasks-toolbar {
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
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.filter-tab.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent-text);
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

.primary-btn:disabled,
.modal-btn-save:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tasks-list {
  display: grid;
  gap: 1rem;
}

.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.1rem;
  box-shadow: var(--shadow);
  display: grid;
  gap: 0.9rem;
}

.task-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.task-card h2 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.task-card p {
  color: var(--text-secondary);
  margin: 0.35rem 0;
}

.due-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.badge-row,
.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-edit-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 0.75rem;
  padding: 0.85rem;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.quick-edit-grid label {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 800;
}

.mini-select {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  box-sizing: border-box;
}

.task-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  font-weight: 700;
}

.task-btn:hover {
  background: var(--btn-hover);
}

.task-btn.danger {
  color: #ef4444;
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

.empty-state h2 {
  margin-bottom: 0.35rem;
}

.empty-state p {
  color: var(--text-secondary);
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
  width: min(560px, 100%);
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

@media (max-width: 900px) {
  .quick-edit-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .two-col {
    grid-template-columns: 1fr;
  }

  .tasks-toolbar {
    align-items: flex-start;
  }

  .task-main {
    display: grid;
  }
}
</style>