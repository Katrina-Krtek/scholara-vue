<template>
  <AppLayout
    :title="project?.title || 'Writing Editor'"
    :subtitle="editorSubtitle"
    banner-key="writing-editor"
    default-icon="✍️"
  >
    <template #actions>
      <button class="secondary-btn" type="button" @click="goToDashboard">
        ← Writing Dashboard
      </button>

      <button
        class="secondary-btn"
        type="button"
        @click="toggleFocusMode"
      >
        {{ focusMode ? 'Exit Focus' : 'Focus Mode' }}
      </button>

      <button
        class="primary-btn"
        type="button"
        :disabled="saveState === 'saving'"
        @click="saveNow"
      >
        {{ saveState === 'saving' ? 'Saving…' : 'Save' }}
      </button>
    </template>

    <section
      v-if="project"
      class="writing-editor-page"
      :class="{ 'focus-mode': focusMode }"
    >
      <div v-if="focusMode" class="focus-toolbar">
        <div>
          <strong>{{ documentTitle || 'Untitled Writing Project' }}</strong>
          <span>{{ wordCount.toLocaleString() }} words</span>
        </div>

        <div class="focus-toolbar-actions">
          <span class="save-indicator" :class="`save-${saveState}`">
            <span class="save-dot"></span>
            {{ saveStatusLabel }}
          </span>

          <button
            class="secondary-btn"
            type="button"
            @click="goToDashboard"
          >
            Dashboard
          </button>

          <button
            class="secondary-btn"
            type="button"
            @click="toggleFocusMode"
          >
            Exit Focus
          </button>

          <button class="primary-btn" type="button" @click="saveNow">
            Save
          </button>
        </div>
      </div>

      <header class="document-header">
        <div class="document-heading">
          <span class="project-type">
            {{ getTypeLabel(project.type) }}
          </span>

          <input
            v-model="documentTitle"
            class="document-title-input"
            type="text"
            aria-label="Document title"
            placeholder="Untitled Writing Project"
            @input="markUnsaved"
            @blur="saveNow"
          />

          <div class="document-context">
            <span v-if="project.course">{{ project.course }}</span>

            <span
              v-if="project.course && project.assignment"
              aria-hidden="true"
            >
              ·
            </span>

            <span v-if="project.assignment">
              {{ project.assignment }}
            </span>

            <span v-if="!project.course && !project.assignment">
              Independent writing project
            </span>
          </div>
        </div>

        <div class="document-save-status">
          <span class="save-indicator" :class="`save-${saveState}`">
            <span class="save-dot"></span>
            {{ saveStatusLabel }}
          </span>

          <span v-if="lastSavedLabel" class="last-saved">
            Last saved {{ lastSavedLabel }}
          </span>
        </div>
      </header>

      <div class="editor-layout">
        <main class="editor-column">
          <section class="editor-card">
            <div class="editor-toolbar" role="toolbar" aria-label="Editor tools">
              <div class="toolbar-group">
                <button
                  type="button"
                  title="Undo"
                  aria-label="Undo"
                  @mousedown.prevent="runCommand('undo')"
                >
                  ↶
                </button>

                <button
                  type="button"
                  title="Redo"
                  aria-label="Redo"
                  @mousedown.prevent="runCommand('redo')"
                >
                  ↷
                </button>
              </div>

              <div class="toolbar-divider"></div>

              <div class="toolbar-group">
                <button
                  type="button"
                  title="Paragraph"
                  @mousedown.prevent="runCommand('formatBlock', 'p')"
                >
                  P
                </button>

                <button
                  type="button"
                  title="Heading 1"
                  @mousedown.prevent="runCommand('formatBlock', 'h1')"
                >
                  H1
                </button>

                <button
                  type="button"
                  title="Heading 2"
                  @mousedown.prevent="runCommand('formatBlock', 'h2')"
                >
                  H2
                </button>

                <button
                  type="button"
                  title="Heading 3"
                  @mousedown.prevent="runCommand('formatBlock', 'h3')"
                >
                  H3
                </button>
              </div>

              <div class="toolbar-divider"></div>

              <div class="toolbar-group">
                <button
                  class="format-bold"
                  type="button"
                  title="Bold"
                  aria-label="Bold"
                  @mousedown.prevent="runCommand('bold')"
                >
                  B
                </button>

                <button
                  class="format-italic"
                  type="button"
                  title="Italic"
                  aria-label="Italic"
                  @mousedown.prevent="runCommand('italic')"
                >
                  I
                </button>

                <button
                  class="format-underline"
                  type="button"
                  title="Underline"
                  aria-label="Underline"
                  @mousedown.prevent="runCommand('underline')"
                >
                  U
                </button>

                <button
                  class="format-strike"
                  type="button"
                  title="Strikethrough"
                  aria-label="Strikethrough"
                  @mousedown.prevent="runCommand('strikeThrough')"
                >
                  S
                </button>
              </div>

              <div class="toolbar-divider"></div>

              <div class="toolbar-group">
                <button
                  type="button"
                  title="Bulleted list"
                  aria-label="Bulleted list"
                  @mousedown.prevent="runCommand('insertUnorderedList')"
                >
                  • List
                </button>

                <button
                  type="button"
                  title="Numbered list"
                  aria-label="Numbered list"
                  @mousedown.prevent="runCommand('insertOrderedList')"
                >
                  1. List
                </button>

                <button
                  type="button"
                  title="Block quote"
                  aria-label="Block quote"
                  @mousedown.prevent="
                    runCommand('formatBlock', 'blockquote')
                  "
                >
                  “ ”
                </button>
              </div>

              <div class="toolbar-divider"></div>

              <div class="toolbar-group">
                <button
                  type="button"
                  title="Decrease indent"
                  aria-label="Decrease indent"
                  @mousedown.prevent="runCommand('outdent')"
                >
                  ⇤
                </button>

                <button
                  type="button"
                  title="Increase indent"
                  aria-label="Increase indent"
                  @mousedown.prevent="runCommand('indent')"
                >
                  ⇥
                </button>

                <button
                  type="button"
                  title="Clear formatting"
                  aria-label="Clear formatting"
                  @mousedown.prevent="clearFormatting"
                >
                  Tx
                </button>
              </div>
            </div>

            <div class="editor-paper">
              <div
                ref="editorRef"
                class="editor-surface"
                contenteditable="true"
                role="textbox"
                aria-multiline="true"
                aria-label="Writing document"
                data-placeholder="Begin writing here…"
                :spellcheck="spellcheckEnabled"
                @input="handleEditorInput"
                @paste="handlePaste"
                @keydown="handleEditorKeydown"
              ></div>
            </div>

            <footer class="editor-footer">
              <span>
                {{ wordCount.toLocaleString() }}
                {{ wordCount === 1 ? 'word' : 'words' }}
              </span>

              <span>{{ paragraphCount }} paragraphs</span>
              <span>{{ sentenceCount }} sentences</span>
              <span>{{ readingTime }} min read</span>

              <span class="keyboard-hint">
                {{ saveShortcutLabel }} to save
              </span>
            </footer>
          </section>
        </main>

        <aside class="editor-sidebar">
          <section class="sidebar-card progress-card">
            <div class="sidebar-card-heading">
              <div>
                <p class="eyebrow">Word Goal</p>
                <h2>Writing progress</h2>
              </div>

              <strong>{{ progress }}%</strong>
            </div>

            <div class="word-count-display">
              <strong>{{ wordCount.toLocaleString() }}</strong>
              <span>of {{ normalizedWordGoal.toLocaleString() }} words</span>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-label="Word goal progress"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="progress"
            >
              <span
                class="progress-fill"
                :style="{ width: `${progress}%` }"
              ></span>
            </div>

            <div class="goal-details">
              <div>
                <span>Remaining</span>
                <strong>{{ remainingWords.toLocaleString() }}</strong>
              </div>

              <div>
                <span>Characters</span>
                <strong>{{ characterCount.toLocaleString() }}</strong>
              </div>
            </div>

            <label class="sidebar-field">
              Word goal

              <input
                v-model.number="wordGoal"
                type="number"
                min="0"
                step="100"
                @input="markUnsaved"
                @change="saveNow"
              />
            </label>
          </section>

          <section class="sidebar-card">
            <div class="sidebar-card-heading">
              <div>
                <p class="eyebrow">Project</p>
                <h2>Writing details</h2>
              </div>
            </div>

            <label class="sidebar-field">
              Writing stage

              <select
                v-model="projectStatus"
                @change="saveNow"
              >
                <option
                  v-for="status in writingStatuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </label>

            <label class="sidebar-field">
              Priority

              <select
                v-model="projectPriority"
                @change="saveNow"
              >
                <option
                  v-for="priority in writingPriorities"
                  :key="priority.value"
                  :value="priority.value"
                >
                  {{ priority.label }}
                </option>
              </select>
            </label>

            <label class="sidebar-field">
              Due date

              <input
                v-model="dueDate"
                type="date"
                @change="saveNow"
              />
            </label>

            <div
              v-if="dueDate"
              class="deadline-summary"
              :class="deadlineClass"
            >
              <span>{{ deadlineLabel }}</span>
              <strong>{{ formattedDueDate }}</strong>
            </div>

            <button
              class="completion-btn"
              :class="{ complete: projectStatus === 'complete' }"
              type="button"
              @click="toggleComplete"
            >
              {{
                projectStatus === 'complete'
                  ? 'Reopen Project'
                  : 'Mark Project Complete'
              }}
            </button>
          </section>

          <section class="sidebar-card">
            <div class="sidebar-card-heading">
              <div>
                <p class="eyebrow">Document</p>
                <h2>Writing statistics</h2>
              </div>
            </div>

            <div class="statistics-grid">
              <div>
                <span>Words</span>
                <strong>{{ wordCount.toLocaleString() }}</strong>
              </div>

              <div>
                <span>Characters</span>
                <strong>{{ characterCount.toLocaleString() }}</strong>
              </div>

              <div>
                <span>No spaces</span>
                <strong>
                  {{ characterCountNoSpaces.toLocaleString() }}
                </strong>
              </div>

              <div>
                <span>Paragraphs</span>
                <strong>{{ paragraphCount }}</strong>
              </div>

              <div>
                <span>Sentences</span>
                <strong>{{ sentenceCount }}</strong>
              </div>

              <div>
                <span>Reading time</span>
                <strong>{{ readingTime }} min</strong>
              </div>
            </div>
          </section>

          <section class="sidebar-card">
            <div class="sidebar-card-heading">
              <div>
                <p class="eyebrow">Editor</p>
                <h2>Preferences</h2>
              </div>
            </div>

            <label class="toggle-row">
              <span>
                <strong>Spellcheck</strong>
                <small>Use the browser’s spelling assistance.</small>
              </span>

              <input
                v-model="spellcheckEnabled"
                type="checkbox"
                @change="saveNow"
              />
            </label>

            <label class="sidebar-field">
              Text size

              <select
                v-model.number="fontSize"
                @change="saveNow"
              >
                <option :value="16">Small</option>
                <option :value="18">Standard</option>
                <option :value="20">Large</option>
                <option :value="22">Extra large</option>
              </select>
            </label>

            <label class="sidebar-field">
              Line spacing

              <select
                v-model.number="lineHeight"
                @change="saveNow"
              >
                <option :value="1.5">Compact</option>
                <option :value="1.7">Standard</option>
                <option :value="1.9">Relaxed</option>
                <option :value="2.1">Double spaced</option>
              </select>
            </label>
          </section>
        </aside>
      </div>
    </section>

    <section v-else class="not-found-card">
      <div class="not-found-icon">📄</div>
      <h2>Writing project not found</h2>
      <p>
        This project may have been deleted or the editor link may no
        longer be valid.
      </p>

      <button class="primary-btn" type="button" @click="goToDashboard">
        Return to Writing Dashboard
      </button>
    </section>

    <div v-if="toastMessage" class="save-toast">
      {{ toastMessage }}
    </div>
  </AppLayout>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppLayout from '@/components/AppLayout.vue'
import { useWritingProjects } from '@/composables/useWritingProjects'

const route = useRoute()
const router = useRouter()

const {
  getProjectById,
  updateProjectContent,
  getTypeLabel,
  writingStatuses,
  writingPriorities,
  countWordsFromHtml,
  countCharactersFromHtml,
  countParagraphsFromHtml,
  countSentencesFromHtml,
  calculateReadingTime,
} = useWritingProjects()

const editorRef = ref(null)
const editorHtml = ref('<p></p>')

const documentTitle = ref('')
const projectStatus = ref('planning')
const projectPriority = ref('normal')
const wordGoal = ref(1500)
const dueDate = ref('')

const spellcheckEnabled = ref(true)
const fontSize = ref(18)
const lineHeight = ref(1.7)
const focusMode = ref(false)

const saveState = ref('saved')
const lastSavedAt = ref('')
const toastMessage = ref('')
const hydratedProjectId = ref('')

let autosaveTimer = null
let toastTimer = null

const project = computed(() => {
  return getProjectById(route.params.id)
})

const editorSubtitle = computed(() => {
  if (!project.value) {
    return 'Draft, revise, and track your writing progress.'
  }

  const context = [
    project.value.course,
    project.value.assignment,
  ]
    .filter(Boolean)
    .join(' · ')

  return context || getTypeLabel(project.value.type)
})

const wordCount = computed(() => {
  return countWordsFromHtml(editorHtml.value)
})

const characterCount = computed(() => {
  return countCharactersFromHtml(editorHtml.value, true)
})

const characterCountNoSpaces = computed(() => {
  return countCharactersFromHtml(editorHtml.value, false)
})

const paragraphCount = computed(() => {
  return countParagraphsFromHtml(editorHtml.value)
})

const sentenceCount = computed(() => {
  return countSentencesFromHtml(editorHtml.value)
})

const readingTime = computed(() => {
  return calculateReadingTime(wordCount.value)
})

const normalizedWordGoal = computed(() => {
  const value = Number(wordGoal.value)

  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return Math.round(value)
})

const progress = computed(() => {
  if (normalizedWordGoal.value <= 0) {
    return wordCount.value > 0 ? 100 : 0
  }

  return Math.min(
    100,
    Math.round(
      (wordCount.value / normalizedWordGoal.value) * 100,
    ),
  )
})

const remainingWords = computed(() => {
  return Math.max(
    0,
    normalizedWordGoal.value - wordCount.value,
  )
})

const saveStatusLabel = computed(() => {
  switch (saveState.value) {
    case 'saving':
      return 'Saving…'

    case 'unsaved':
      return 'Unsaved changes'

    case 'error':
      return 'Save failed'

    case 'saved':
    default:
      return 'Saved'
  }
})

const lastSavedLabel = computed(() => {
  if (!lastSavedAt.value) {
    return ''
  }

  const date = new Date(lastSavedAt.value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
})

const saveShortcutLabel = computed(() => {
  if (
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
  ) {
    return '⌘S'
  }

  return 'Ctrl+S'
})

const formattedDueDate = computed(() => {
  if (!dueDate.value) {
    return ''
  }

  const date = new Date(`${dueDate.value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return dueDate.value
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
})

const deadlineLabel = computed(() => {
  if (!dueDate.value) {
    return ''
  }

  const days = getDaysUntil(dueDate.value)

  if (days < 0) {
    const overdueDays = Math.abs(days)

    return `${overdueDays} ${
      overdueDays === 1 ? 'day' : 'days'
    } overdue`
  }

  if (days === 0) {
    return 'Due today'
  }

  if (days === 1) {
    return 'Due tomorrow'
  }

  return `Due in ${days} days`
})

const deadlineClass = computed(() => {
  if (!dueDate.value || projectStatus.value === 'complete') {
    return ''
  }

  const days = getDaysUntil(dueDate.value)

  if (days < 0) {
    return 'deadline-overdue'
  }

  if (days <= 7) {
    return 'deadline-soon'
  }

  return 'deadline-upcoming'
})

watch(
  () => route.params.id,
  () => {
    hydratedProjectId.value = ''

    nextTick(() => {
      hydrateProject()
    })
  },
  { immediate: true },
)

onMounted(() => {
  hydrateProject()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  clearTimeout(autosaveTimer)
  clearTimeout(toastTimer)

  if (saveState.value === 'unsaved') {
    saveNow(false)
  }

  document.body.classList.remove('scholarory-writing-focus')
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function hydrateProject() {
  const currentProject = project.value

  if (!currentProject) {
    return
  }

  if (
    hydratedProjectId.value === String(currentProject.id) &&
    editorRef.value
  ) {
    return
  }

  hydratedProjectId.value = String(currentProject.id)

  documentTitle.value =
    currentProject.documentTitle ||
    currentProject.title ||
    ''

  projectStatus.value = currentProject.status || 'planning'
  projectPriority.value = currentProject.priority || 'normal'
  wordGoal.value = Number(currentProject.wordGoal) || 0
  dueDate.value = currentProject.dueDate || ''

  spellcheckEnabled.value =
    currentProject.editorSettings?.spellcheck !== false

  fontSize.value =
    Number(currentProject.editorSettings?.fontSize) || 18

  lineHeight.value =
    Number(currentProject.editorSettings?.lineHeight) || 1.7

  focusMode.value =
    currentProject.editorSettings?.focusMode === true

  editorHtml.value =
    currentProject.contentHtml || '<p></p>'

  lastSavedAt.value =
    currentProject.lastSavedAt ||
    currentProject.updatedAt ||
    ''

  saveState.value = 'saved'

  applyFocusClass()

  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = editorHtml.value
    }
  })
}

function handleEditorInput() {
  syncEditorHtml()
  markUnsaved()
}

function syncEditorHtml() {
  if (!editorRef.value) {
    return
  }

  editorHtml.value =
    editorRef.value.innerHTML || '<p></p>'
}

function markUnsaved() {
  saveState.value = 'unsaved'
  scheduleAutosave()
}

function scheduleAutosave() {
  clearTimeout(autosaveTimer)

  autosaveTimer = window.setTimeout(() => {
    saveNow(false)
  }, 900)
}

function saveNow(showToast = true) {
  clearTimeout(autosaveTimer)

  if (!project.value) {
    return
  }

  syncEditorHtml()
  saveState.value = 'saving'

  try {
    const sanitizedHtml = sanitizeEditorHtml(editorHtml.value)

    editorHtml.value = sanitizedHtml

    const updatedProject = updateProjectContent(
      project.value.id,
      sanitizedHtml,
      {
        title:
          documentTitle.value.trim() ||
          'Untitled Writing Project',

        documentTitle:
          documentTitle.value.trim() ||
          'Untitled Writing Project',

        status: projectStatus.value,
        priority: projectPriority.value,
        wordGoal: normalizedWordGoal.value,
        dueDate: dueDate.value,

        editorSettings: {
          ...project.value.editorSettings,
          focusMode: focusMode.value,
          spellcheck: spellcheckEnabled.value,
          fontSize: Number(fontSize.value) || 18,
          lineHeight: Number(lineHeight.value) || 1.7,
        },
      },
    )

    if (!updatedProject) {
      throw new Error('Writing project could not be updated.')
    }

    lastSavedAt.value =
      updatedProject.lastSavedAt ||
      updatedProject.updatedAt ||
      new Date().toISOString()

    saveState.value = 'saved'

    if (
      editorRef.value &&
      editorRef.value.innerHTML !== sanitizedHtml
    ) {
      editorRef.value.innerHTML = sanitizedHtml
    }

    if (showToast) {
      showToastMessage('Writing project saved.')
    }
  } catch (error) {
    console.error('Scholarory Writing Editor save failed.', error)
    saveState.value = 'error'

    if (showToast) {
      showToastMessage('The document could not be saved.')
    }
  }
}

function runCommand(command, value = null) {
  if (!editorRef.value) {
    return
  }

  editorRef.value.focus()

  try {
    document.execCommand(command, false, value)
    syncEditorHtml()
    markUnsaved()
  } catch (error) {
    console.warn(
      `Scholarory Writing Editor command "${command}" failed.`,
      error,
    )
  }
}

function clearFormatting() {
  runCommand('removeFormat')
  runCommand('unlink')
}

function handlePaste(event) {
  event.preventDefault()

  const plainText =
    event.clipboardData?.getData('text/plain') || ''

  document.execCommand('insertText', false, plainText)

  syncEditorHtml()
  markUnsaved()
}

function handleEditorKeydown(event) {
  const saveShortcut =
    (event.metaKey || event.ctrlKey) &&
    event.key.toLowerCase() === 's'

  if (saveShortcut) {
    event.preventDefault()
    saveNow()
    return
  }

  if (event.key === 'Tab') {
    event.preventDefault()

    document.execCommand(
      event.shiftKey ? 'outdent' : 'indent',
      false,
      null,
    )

    syncEditorHtml()
    markUnsaved()
  }
}

function sanitizeEditorHtml(html) {
  if (
    typeof document === 'undefined' ||
    !html
  ) {
    return html || '<p></p>'
  }

  const template = document.createElement('template')
  template.innerHTML = String(html)

  const allowedTags = new Set([
    'P',
    'BR',
    'DIV',
    'H1',
    'H2',
    'H3',
    'H4',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'S',
    'STRIKE',
    'UL',
    'OL',
    'LI',
    'BLOCKQUOTE',
    'HR',
    'SPAN',
  ])

  const nodes = Array.from(
    template.content.querySelectorAll('*'),
  )

  nodes.forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes)
      return
    }

    Array.from(node.attributes).forEach((attribute) => {
      node.removeAttribute(attribute.name)
    })
  })

  const sanitized = template.innerHTML.trim()

  return sanitized || '<p></p>'
}

function toggleFocusMode() {
  focusMode.value = !focusMode.value
  applyFocusClass()
  markUnsaved()

  nextTick(() => {
    editorRef.value?.focus()
  })
}

function applyFocusClass() {
  document.body.classList.toggle(
    'scholarory-writing-focus',
    focusMode.value,
  )
}

function toggleComplete() {
  projectStatus.value =
    projectStatus.value === 'complete'
      ? 'drafting'
      : 'complete'

  saveNow()

  showToastMessage(
    projectStatus.value === 'complete'
      ? 'Writing project marked complete.'
      : 'Writing project reopened.',
  )
}

function goToDashboard() {
  if (saveState.value === 'unsaved') {
    saveNow(false)
  }

  router.push('/writing')
}

function handleBeforeUnload() {
  if (saveState.value === 'unsaved') {
    saveNow(false)
  }
}

function getDaysUntil(dateValue) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(due.getTime())) {
    return Number.POSITIVE_INFINITY
  }

  return Math.round(
    (due.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  )
}

function showToastMessage(message) {
  clearTimeout(toastTimer)

  toastMessage.value = message

  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
  }, 2200)
}
</script>

<style scoped>
.writing-editor-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.primary-btn,
.secondary-btn,
.completion-btn,
.editor-toolbar button {
  font: inherit;
  cursor: pointer;
}

.primary-btn {
  min-height: 40px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
}

.primary-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.primary-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--btn-bg);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 750;
  text-decoration: none;
}

.secondary-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.document-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.document-heading {
  display: grid;
  min-width: 0;
  flex: 1;
}

.project-type {
  justify-self: start;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 0.63rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.document-title-input {
  width: 100%;
  margin-top: 0.45rem;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 850;
}

.document-context {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.document-save-status {
  display: grid;
  justify-items: end;
  gap: 0.25rem;
  flex: 0 0 auto;
}

.save-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.74rem;
  font-weight: 750;
}

.save-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.save-saved .save-dot {
  background: #2f8a63;
}

.save-unsaved .save-dot {
  background: #d09523;
}

.save-saving .save-dot {
  background: #4f7fae;
  animation: pulse 700ms ease-in-out infinite alternate;
}

.save-error .save-dot {
  background: #c84842;
}

.last-saved {
  color: var(--text-muted);
  font-size: 0.67rem;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 285px;
  align-items: start;
  gap: 1rem;
}

.editor-column {
  min-width: 0;
}

.editor-card {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem;
  border-bottom: 1px solid var(--border-color);
  background: color-mix(
    in srgb,
    var(--bg-card) 94%,
    transparent
  );
  backdrop-filter: blur(10px);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-divider {
  width: 1px;
  height: 26px;
  margin: 0 0.15rem;
  background: var(--border-color);
}

.editor-toolbar button {
  display: grid;
  place-items: center;
  min-width: 34px;
  min-height: 34px;
  padding: 0.35rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 750;
}

.editor-toolbar button:hover {
  border-color: var(--border-color);
  background: var(--btn-hover);
  color: var(--text-primary);
}

.format-bold {
  font-weight: 900 !important;
}

.format-italic {
  font-style: italic;
}

.format-underline {
  text-decoration: underline;
}

.format-strike {
  text-decoration: line-through;
}

.editor-paper {
  padding: clamp(1rem, 4vw, 3rem);
  background: var(--input-bg);
}

.editor-surface {
  width: min(760px, 100%);
  min-height: 760px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: clamp(1.5rem, 5vw, 4rem);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  outline: none;
  background: #ffffff;
  color: #172033;
  font-family:
    Georgia,
    'Times New Roman',
    serif;
  font-size: v-bind("`${fontSize}px`");
  line-height: v-bind("lineHeight");
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.09);
  caret-color: #172033;
}

.editor-surface:focus {
  border-color: #a58a4d;
  box-shadow:
    0 0 0 3px rgba(165, 138, 77, 0.12),
    0 14px 38px rgba(15, 23, 42, 0.09);
}

.editor-surface:empty::before {
  color: #9aa3b1;
  content: attr(data-placeholder);
  pointer-events: none;
}

.editor-surface :deep(p) {
  margin: 0 0 1em;
}

.editor-surface :deep(h1) {
  margin: 1.2em 0 0.55em;
  font-size: 1.8em;
  line-height: 1.2;
}

.editor-surface :deep(h2) {
  margin: 1.15em 0 0.5em;
  font-size: 1.45em;
  line-height: 1.25;
}

.editor-surface :deep(h3) {
  margin: 1.1em 0 0.45em;
  font-size: 1.2em;
  line-height: 1.3;
}

.editor-surface :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.7rem 1rem;
  border-left: 4px solid #c39a37;
  background: #faf7ef;
  color: #4b5563;
}

.editor-surface :deep(ul),
.editor-surface :deep(ol) {
  padding-left: 1.7rem;
}

.editor-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  padding: 0.65rem 0.85rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.68rem;
}

.keyboard-hint {
  margin-left: auto;
}

.editor-sidebar {
  display: grid;
  gap: 0.85rem;
}

.sidebar-card {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 15px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.sidebar-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-card-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.98rem;
}

.sidebar-card-heading > strong {
  color: var(--accent-text);
  font-size: 1.2rem;
}

.word-count-display {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.word-count-display strong {
  color: var(--text-primary);
  font-size: 1.45rem;
}

.word-count-display span {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.progress-track {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--input-bg);
}

.progress-fill {
  display: block;
  min-width: 2px;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 220ms ease;
}

.goal-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.goal-details div,
.statistics-grid div {
  display: grid;
  gap: 0.15rem;
  padding: 0.6rem;
  border-radius: 9px;
  background: var(--input-bg);
}

.goal-details span,
.statistics-grid span {
  color: var(--text-muted);
  font-size: 0.59rem;
  font-weight: 750;
  text-transform: uppercase;
}

.goal-details strong,
.statistics-grid strong {
  color: var(--text-primary);
  font-size: 0.75rem;
}

.sidebar-field {
  display: grid;
  gap: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 750;
}

.sidebar-field input,
.sidebar-field select {
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.76rem;
}

.sidebar-field input:focus,
.sidebar-field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.deadline-summary {
  display: grid;
  gap: 0.2rem;
  padding: 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.deadline-summary span {
  font-size: 0.65rem;
  font-weight: 750;
}

.deadline-summary strong {
  font-size: 0.76rem;
}

.deadline-overdue {
  border-color: #efc2bf;
  background: #fff1f0;
  color: #aa3e38;
}

.deadline-soon {
  border-color: #ead4a2;
  background: #fff7e4;
  color: #906414;
}

.deadline-upcoming {
  border-color: #c9dceb;
  background: #eef6fc;
  color: #416f9d;
}

.completion-btn {
  min-height: 40px;
  padding: 0.6rem;
  border: 1px solid #318864;
  border-radius: 10px;
  background: #edf8f2;
  color: #246d50;
  font-size: 0.75rem;
  font-weight: 800;
}

.completion-btn.complete {
  border-color: var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.toggle-row span {
  display: grid;
  gap: 0.15rem;
}

.toggle-row strong {
  color: var(--text-primary);
  font-size: 0.74rem;
}

.toggle-row small {
  color: var(--text-muted);
  font-size: 0.63rem;
  line-height: 1.35;
}

.toggle-row input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.focus-toolbar {
  display: none;
}

.not-found-card {
  display: grid;
  justify-items: center;
  padding: 3rem 1rem;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.not-found-icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  margin-bottom: 0.8rem;
  border-radius: 17px;
  background: var(--input-bg);
  font-size: 1.7rem;
}

.not-found-card h2 {
  margin: 0;
}

.not-found-card p {
  max-width: 520px;
  margin: 0.5rem 0 1rem;
  color: var(--text-muted);
}

.save-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 120;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.28);
}

.writing-editor-page.focus-mode {
  min-height: 100vh;
  padding: 0;
  background: var(--input-bg);
}

.focus-mode .focus-toolbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
}

.focus-toolbar > div:first-child {
  display: grid;
}

.focus-toolbar strong {
  color: var(--text-primary);
  font-size: 0.82rem;
}

.focus-toolbar span {
  color: var(--text-muted);
  font-size: 0.67rem;
}

.focus-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.focus-mode .document-header,
.focus-mode .editor-sidebar {
  display: none;
}

.focus-mode .editor-layout {
  display: block;
}

.focus-mode .editor-card {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.focus-mode .editor-paper {
  min-height: calc(100vh - 120px);
  padding-top: 2rem;
}

:global(body.scholarory-writing-focus .sidebar) {
  display: none !important;
}

:global(body.scholarory-writing-focus .app-topbar) {
  display: none !important;
}

:global(body.scholarory-writing-focus .app-content) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

:global(body.scholarory-writing-focus .app-main) {
  width: 100%;
}

@keyframes pulse {
  from {
    opacity: 0.35;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 1000px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .editor-sidebar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .document-header,
  .focus-mode .focus-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .document-save-status {
    justify-items: start;
  }

  .editor-sidebar {
    grid-template-columns: 1fr;
  }

  .editor-paper {
    padding: 0.75rem;
  }

  .editor-surface {
    min-height: 650px;
    padding: 1.25rem;
  }

  .toolbar-divider {
    display: none;
  }

  .keyboard-hint {
    width: 100%;
    margin-left: 0;
  }

  .focus-toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>