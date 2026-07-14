<template>
  <AppLayout
    title="Canvas"
    subtitle="Build visual maps from notes, ideas, sources, concepts, and connections"
    banner-key="canvas"
    default-icon="🧩"
  >
    <section class="canvas-page">
      <header class="canvas-toolbar">
        <div>
          <h2>Your Canvases</h2>
          <p>
            Create flexible visual workspaces for brainstorming, research,
            planning, and connecting ideas.
          </p>
        </div>

        <button class="primary-button" type="button" @click="openCreateModal">
          <span aria-hidden="true">＋</span>
          New Canvas
        </button>
      </header>

      <section v-if="sortedCanvases.length" class="canvas-grid">
        <article
          v-for="canvas in sortedCanvases"
          :key="canvas.id"
          class="canvas-card"
          tabindex="0"
          role="button"
          @click="openCanvas(canvas.id)"
          @keydown.enter="openCanvas(canvas.id)"
          @keydown.space.prevent="openCanvas(canvas.id)"
        >
          <div class="canvas-preview">
            <div class="preview-grid"></div>

            <div class="preview-content">
              <span class="preview-icon" aria-hidden="true">🧩</span>

              <div class="preview-stat">
                {{ canvas.nodes.length }}
                {{ canvas.nodes.length === 1 ? 'card' : 'cards' }}
              </div>
            </div>
          </div>

          <div class="canvas-card-body">
            <div class="canvas-card-heading">
              <div>
                <h3>{{ canvas.title }}</h3>

                <p v-if="canvas.description">
                  {{ canvas.description }}
                </p>

                <p v-else class="empty-description">
                  No description added.
                </p>
              </div>

              <button
                class="menu-button"
                type="button"
                aria-label="Open canvas actions"
                @click.stop="toggleMenu(canvas.id)"
              >
                ⋯
              </button>
            </div>

            <footer class="canvas-card-footer">
              <span>
                Updated {{ formatUpdatedDate(canvas.updatedAt) }}
              </span>

              <span>
                {{ canvas.edges.length }}
                {{ canvas.edges.length === 1 ? 'connection' : 'connections' }}
              </span>
            </footer>
          </div>

          <div
            v-if="activeMenuId === canvas.id"
            class="canvas-menu"
            @click.stop
          >
            <button type="button" @click="openCanvas(canvas.id)">
              Open
            </button>

            <button type="button" @click="openRenameModal(canvas)">
              Rename
            </button>

            <button type="button" @click="handleDuplicateCanvas(canvas.id)">
              Duplicate
            </button>

            <button
              class="danger-menu-item"
              type="button"
              @click="openDeleteModal(canvas)"
            >
              Delete
            </button>
          </div>
        </article>
      </section>

      <section v-else class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">🧩</div>

        <h2>Create your first canvas</h2>

        <p>
          Arrange note cards, connect related ideas, and create visual maps for
          research, writing, courses, and projects.
        </p>

        <button class="primary-button" type="button" @click="openCreateModal">
          Create Canvas
        </button>
      </section>
    </section>

    <div
      v-if="showCanvasModal"
      class="modal-backdrop"
      @click.self="closeCanvasModal"
    >
      <section
        class="modal-card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          modalMode === 'create'
            ? 'create-canvas-heading'
            : 'rename-canvas-heading'
        "
      >
        <header class="modal-header">
          <div>
            <h2
              :id="
                modalMode === 'create'
                  ? 'create-canvas-heading'
                  : 'rename-canvas-heading'
              "
            >
              {{ modalMode === 'create' ? 'New Canvas' : 'Rename Canvas' }}
            </h2>

            <p>
              {{
                modalMode === 'create'
                  ? 'Create a visual workspace for your ideas.'
                  : 'Update the canvas title and description.'
              }}
            </p>
          </div>

          <button
            class="close-button"
            type="button"
            aria-label="Close modal"
            @click="closeCanvasModal"
          >
            ×
          </button>
        </header>

        <form class="canvas-form" @submit.prevent="saveCanvas">
          <label class="form-field">
            <span>Canvas title</span>

            <input
              ref="titleInput"
              v-model="canvasForm.title"
              type="text"
              maxlength="100"
              placeholder="Research Map"
              required
            />
          </label>

          <label class="form-field">
            <span>Description</span>

            <textarea
              v-model="canvasForm.description"
              rows="4"
              maxlength="300"
              placeholder="What will this canvas help you organize?"
            ></textarea>
          </label>

          <footer class="modal-actions">
            <button
              class="secondary-button"
              type="button"
              @click="closeCanvasModal"
            >
              Cancel
            </button>

            <button class="primary-button" type="submit">
              {{
                modalMode === 'create'
                  ? 'Create Canvas'
                  : 'Save Changes'
              }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div
      v-if="showDeleteModal"
      class="modal-backdrop"
      @click.self="closeDeleteModal"
    >
      <section
        class="modal-card delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-canvas-heading"
      >
        <header class="modal-header">
          <div>
            <h2 id="delete-canvas-heading">Delete Canvas?</h2>

            <p>
              This will permanently delete
              <strong>{{ selectedCanvas?.title }}</strong>
              and all of its cards and connections.
            </p>
          </div>

          <button
            class="close-button"
            type="button"
            aria-label="Close modal"
            @click="closeDeleteModal"
          >
            ×
          </button>
        </header>

        <footer class="modal-actions">
          <button
            class="secondary-button"
            type="button"
            @click="closeDeleteModal"
          >
            Cancel
          </button>

          <button
            class="danger-button"
            type="button"
            @click="confirmDeleteCanvas"
          >
            Delete Canvas
          </button>
        </footer>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useCanvases } from '../../composables/useCanvases'

const router = useRouter()

const {
  sortedCanvases,
  createCanvas,
  updateCanvas,
  deleteCanvas,
  duplicateCanvas,
} = useCanvases()

const activeMenuId = ref(null)
const showCanvasModal = ref(false)
const showDeleteModal = ref(false)
const modalMode = ref('create')
const selectedCanvas = ref(null)
const titleInput = ref(null)

const canvasForm = reactive({
  title: '',
  description: '',
})

function openCanvas(canvasId) {
  activeMenuId.value = null
  router.push(`/canvas/${canvasId}`)
}

function toggleMenu(canvasId) {
  activeMenuId.value =
    activeMenuId.value === canvasId ? null : canvasId
}

function closeMenus() {
  activeMenuId.value = null
}

function resetCanvasForm() {
  canvasForm.title = ''
  canvasForm.description = ''
}

async function focusTitleInput() {
  await nextTick()
  titleInput.value?.focus()
}

function openCreateModal() {
  activeMenuId.value = null
  selectedCanvas.value = null
  modalMode.value = 'create'
  resetCanvasForm()
  showCanvasModal.value = true
  focusTitleInput()
}

function openRenameModal(canvas) {
  activeMenuId.value = null
  selectedCanvas.value = canvas
  modalMode.value = 'rename'
  canvasForm.title = canvas.title
  canvasForm.description = canvas.description || ''
  showCanvasModal.value = true
  focusTitleInput()
}

function closeCanvasModal() {
  showCanvasModal.value = false
  selectedCanvas.value = null
  resetCanvasForm()
}

function saveCanvas() {
  const title = canvasForm.title.trim()

  if (!title) {
    titleInput.value?.focus()
    return
  }

  if (modalMode.value === 'create') {
    const newCanvas = createCanvas({
      title,
      description: canvasForm.description,
    })

    closeCanvasModal()
    openCanvas(newCanvas.id)
    return
  }

  if (selectedCanvas.value) {
    updateCanvas(selectedCanvas.value.id, {
      title,
      description: canvasForm.description,
    })
  }

  closeCanvasModal()
}

function handleDuplicateCanvas(canvasId) {
  activeMenuId.value = null
  duplicateCanvas(canvasId)
}

function openDeleteModal(canvas) {
  activeMenuId.value = null
  selectedCanvas.value = canvas
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedCanvas.value = null
}

function confirmDeleteCanvas() {
  if (!selectedCanvas.value) {
    return
  }

  deleteCanvas(selectedCanvas.value.id)
  closeDeleteModal()
}

function formatUpdatedDate(dateValue) {
  if (!dateValue) {
    return 'recently'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'recently'
  }

  const now = new Date()
  const differenceInMilliseconds = now.getTime() - date.getTime()
  const differenceInMinutes = Math.floor(
    differenceInMilliseconds / (1000 * 60),
  )
  const differenceInHours = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60),
  )
  const differenceInDays = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24),
  )

  if (differenceInMinutes < 1) {
    return 'just now'
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`
  }

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`
  }

  if (differenceInDays < 7) {
    return `${differenceInDays}d ago`
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== now.getFullYear()
        ? 'numeric'
        : undefined,
  }).format(date)
}

function handleEscapeKey(event) {
  if (event.key !== 'Escape') {
    return
  }

  if (showDeleteModal.value) {
    closeDeleteModal()
    return
  }

  if (showCanvasModal.value) {
    closeCanvasModal()
    return
  }

  closeMenus()
}

onMounted(() => {
  window.addEventListener('click', closeMenus)
  window.addEventListener('keydown', handleEscapeKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenus)
  window.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style scoped>
.canvas-page {
  display: grid;
  gap: 1.5rem;
}

.canvas-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.canvas-toolbar h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.35rem;
}

.canvas-toolbar p {
  max-width: 680px;
  margin: 0.4rem 0 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.primary-button,
.secondary-button,
.danger-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 42px;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.primary-button {
  border: 1px solid var(--accent-color);
  background: var(--accent-color);
  color: white;
}

.primary-button:hover {
  transform: translateY(-1px);
}

.secondary-button {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.secondary-button:hover {
  border-color: var(--accent-color);
}

.danger-button {
  border: 1px solid #c43c3c;
  background: #c43c3c;
  color: white;
}

.danger-button:hover {
  background: #a92f2f;
}

.canvas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
  gap: 1.25rem;
}

.canvas-card {
  position: relative;
  overflow: visible;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.canvas-card:hover,
.canvas-card:focus-visible {
  transform: translateY(-3px);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-md);
  outline: none;
}

.canvas-preview {
  position: relative;
  min-height: 155px;
  overflow: hidden;
  border-bottom: 1px solid var(--border-color);
  border-radius: 13px 13px 0 0;
  background: var(--bg-secondary);
}

.preview-grid {
  position: absolute;
  inset: 0;
  opacity: 0.45;
  background-image:
    linear-gradient(
      var(--border-color) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      var(--border-color) 1px,
      transparent 1px
    );
  background-size: 22px 22px;
}

.preview-content {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 155px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}

.preview-icon {
  font-size: 2.2rem;
}

.preview-stat {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  padding: 0.35rem 0.7rem;
  color: var(--text-secondary);
  font-size: 0.82rem;

  font-weight: 700;
}

.canvas-card-body {
  padding: 1rem;
}

.canvas-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.canvas-card-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.05rem;
  line-height: 1.35;
}

.canvas-card-heading p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0.4rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.canvas-card-heading .empty-description {
  font-style: italic;
  opacity: 0.75;
}

.menu-button {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
}

.menu-button:hover {
  border-color: var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.canvas-card-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted, var(--text-secondary));
  font-size: 0.76rem;
}

.canvas-menu {
  position: absolute;
  z-index: 20;
  top: calc(155px + 3.2rem);
  right: 0.75rem;
  display: grid;
  min-width: 145px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
}

.canvas-menu button {
  border: 0;
  background: transparent;
  padding: 0.7rem 0.85rem;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
}

.canvas-menu button:hover {
  background: var(--bg-secondary);
}

.canvas-menu .danger-menu-item {
  color: #c43c3c;
}

.empty-state {
  display: grid;
  justify-items: center;
  min-height: 420px;
  place-content: center;
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state-icon {
  margin-bottom: 0.75rem;
  font-size: 3rem;
}

.empty-state h2 {
  margin: 0;
  color: var(--text-primary);
}

.empty-state p {
  max-width: 520px;
  margin: 0.75rem 0 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: rgba(6, 15, 30, 0.64);
  padding: 1.25rem;
}

.modal-card {
  width: min(100%, 540px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  padding: 1.25rem;
}

.delete-modal {
  width: min(100%, 500px);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-header p {
  margin: 0.4rem 0 0;
  color: var(--text-secondary);
  line-height: 1.55;
}

.close-button {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.3rem;
  cursor: pointer;
}

.canvas-form {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.form-field {
  display: grid;
  gap: 0.45rem;
}

.form-field span {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.form-field input,
.form-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
  padding: 0.78rem 0.85rem;
  color: var(--text-primary);
  font: inherit;
  outline: none;
}

.form-field textarea {
  resize: vertical;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--accent-color) 18%, transparent);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.4rem;
}

.canvas-form .modal-actions {
  margin-top: 0.35rem;
}

@media (max-width: 700px) {
  .canvas-toolbar {
    flex-direction: column;
  }

  .canvas-toolbar .primary-button {
    width: 100%;
  }

  .canvas-grid {
    grid-template-columns: 1fr;
  }

  .canvas-card-footer {
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>