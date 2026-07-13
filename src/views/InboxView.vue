<template>
  <AppLayout
    title="Jot Inbox"
    :subtitle="`${inboxCount} unprocessed jot${inboxCount === 1 ? '' : 's'}`"
    banner-key="inbox"
    default-icon="📥"
  >
    <template #actions>
      <button
        class="secondary-btn"
        type="button"
        @click="focusCapture"
      >
        ⚡ New Jot
      </button>
    </template>

    <main class="inbox-page">
      <!-- QUICK CAPTURE -->
      <section class="capture-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Quick Capture</p>
            <h2>Jot it down. Fetch it later.</h2>
            <p>
              Capture the thought now and decide where it belongs
              afterward.
            </p>
          </div>

          <span class="shortcut-label">
            Command/Ctrl + Shift + J
          </span>
        </div>

        <form
          class="capture-form"
          @submit.prevent="captureJot"
        >
          <textarea
            ref="captureInput"
            v-model="captureForm.content"
            class="capture-textarea"
            rows="4"
            placeholder="What do you need to remember?"
            @keydown.meta.enter.prevent="captureJot"
            @keydown.ctrl.enter.prevent="captureJot"
          ></textarea>

          <div class="form-grid">
            <label>
              Optional title

              <input
                v-model.trim="captureForm.title"
                type="text"
                placeholder="Short title"
              />
            </label>

            <label>
              Type

              <select v-model="captureForm.type">
                <option
                  v-for="type in jotTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
            </label>

            <label>
              Tags

              <input
                v-model="captureForm.tags"
                type="text"
                placeholder="research, idea, sermon"
              />
            </label>

            <label>
              Context

              <input
                v-model.trim="captureForm.context"
                type="text"
                placeholder="Course, project, or person"
              />
            </label>
          </div>

          <div class="capture-footer">
            <label class="check-label">
              <input
                v-model="captureForm.pinned"
                type="checkbox"
              />

              <span>Pin this jot</span>
            </label>

            <div class="button-row">
              <button
                class="secondary-btn"
                type="button"
                @click="clearCapture"
              >
                Clear
              </button>

              <button
                class="primary-btn"
                type="submit"
                :disabled="!captureHasContent"
              >
                Capture Jot
              </button>
            </div>
          </div>
        </form>
      </section>

      <!-- SUMMARY -->
      <section class="summary-grid">
        <article class="summary-card">
          <span>📥</span>
          <div>
            <small>Inbox</small>
            <strong>{{ unfiledJots.length }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>✅</span>
          <div>
            <small>Processed</small>
            <strong>{{ processedJots.length }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>📌</span>
          <div>
            <small>Pinned</small>
            <strong>{{ pinnedCount }}</strong>
          </div>
        </article>

        <article class="summary-card">
          <span>🗄️</span>
          <div>
            <small>Archived</small>
            <strong>{{ archivedJots.length }}</strong>
          </div>
        </article>
      </section>

      <!-- INBOX LIST -->
      <section class="inbox-card">
        <div class="toolbar">
          <div class="status-tabs">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="status-tab"
              :class="{ active: activeStatus === tab.value }"
              type="button"
              @click="activeStatus = tab.value"
            >
              {{ tab.label }}
              <span>{{ statusCount(tab.value) }}</span>
            </button>
          </div>

          <div class="filters">
            <input
              v-model.trim="searchQuery"
              type="search"
              placeholder="Search jots"
            />

            <select v-model="typeFilter">
              <option value="all">All types</option>

              <option
                v-for="type in jotTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="results-heading">
          <div>
            <p class="eyebrow">{{ activeStatusLabel }}</p>

            <h2>
              {{ filteredJots.length }}
              jot{{ filteredJots.length === 1 ? '' : 's' }}
            </h2>
          </div>
        </div>

        <div
          v-if="filteredJots.length"
          class="jots-list"
        >
          <article
            v-for="jot in filteredJots"
            :key="jot.id"
            class="jot-card"
            :class="{
              pinned: jot.pinned,
              processed: jot.status === 'processed',
              archived: jot.status === 'archived',
            }"
          >
            <header class="jot-header">
              <div class="jot-badges">
                <span class="type-badge">
                  {{ typeIcon(jot.type) }}
                  {{ typeLabel(jot.type) }}
                </span>

                <span class="status-badge">
                  {{ statusLabel(jot.status) }}
                </span>

                <span
                  v-if="jot.pinned"
                  class="pin-badge"
                >
                  📌 Pinned
                </span>
              </div>

              <button
                class="icon-btn"
                type="button"
                :title="jot.pinned ? 'Unpin' : 'Pin'"
                @click="handleTogglePin(jot)"
              >
                📌
              </button>
            </header>

            <button
              class="jot-content"
              type="button"
              @click="openEditModal(jot)"
            >
              <h3 v-if="jot.title">
                {{ jot.title }}
              </h3>

              <p>
                {{ jot.content || 'No additional content.' }}
              </p>
            </button>

            <div
              v-if="jot.context || jot.tags?.length"
              class="jot-tags"
            >
              <span
                v-if="jot.context"
                class="detail-badge"
              >
                📍 {{ jot.context }}
              </span>

              <span
                v-for="tag in jot.tags"
                :key="tag"
                class="detail-badge"
              >
                #{{ tag }}
              </span>
            </div>

            <footer class="jot-footer">
              <span class="jot-date">
                Captured {{ formatDate(jot.createdAt) }}
              </span>

              <div class="jot-actions">
                <button
                  class="row-btn"
                  type="button"
                  @click="openEditModal(jot)"
                >
                  Edit
                </button>

                <button
                  v-if="jot.status === 'inbox'"
                  class="row-btn process-btn"
                  type="button"
                  @click="openProcessModal(jot)"
                >
                  Process
                </button>

                <button
                  v-if="jot.status === 'processed'"
                  class="row-btn"
                  type="button"
                  @click="returnToInbox(jot)"
                >
                  Return to Inbox
                </button>

                <button
                  v-if="jot.status !== 'archived'"
                  class="row-btn"
                  type="button"
                  @click="handleArchive(jot)"
                >
                  Archive
                </button>

                <button
                  v-else
                  class="row-btn"
                  type="button"
                  @click="handleRestore(jot)"
                >
                  Restore
                </button>

                <button
                  class="row-btn delete-btn"
                  type="button"
                  @click="confirmDelete(jot)"
                >
                  Delete
                </button>
              </div>
            </footer>
          </article>
        </div>

        <div
          v-else
          class="empty-state"
        >
          <span>{{ emptyIcon }}</span>
          <h3>{{ emptyTitle }}</h3>
          <p>{{ emptyMessage }}</p>
        </div>
      </section>
    </main>

    <!-- PROCESS MODAL -->
    <div
      v-if="processModalOpen"
      class="modal-backdrop"
      @click.self="closeProcessModal"
    >
      <section class="modal-card process-modal">
        <div class="modal-heading">
          <div>
            <p class="eyebrow">Process Jot</p>
            <h2>{{ jotDisplayTitle(processingJot) }}</h2>

            <p>
              Choose what should happen to this capture.
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            @click="closeProcessModal"
          >
            ×
          </button>
        </div>

        <div class="process-preview">
          {{ processingJot?.content }}
        </div>

        <div class="process-options">
          <button
            class="process-option"
            type="button"
            @click="markJotProcessed"
          >
            <span>✅</span>

            <div>
              <strong>Mark Processed</strong>
              <p>Keep it in Scholarory as an organized jot.</p>
            </div>
          </button>

          <button
            class="process-option daily-note-option"
            type="button"
            @click="sendToTodayNotes"
          >
            <span>🗒️</span>

            <div>
              <strong>Send to Today’s Notes</strong>

              <p>
                Copy this jot into today’s Daily View notes and
                mark it processed.
              </p>
            </div>
          </button>

          <button
            class="process-option"
            type="button"
            @click="saveAsReference"
          >
            <span>📚</span>

            <div>
              <strong>Save as Reference</strong>
              <p>Change its type to Reference and process it.</p>
            </div>
          </button>

          <button
            class="process-option"
            type="button"
            @click="archiveProcessingJot"
          >
            <span>🗄️</span>

            <div>
              <strong>Archive</strong>
              <p>Remove it from the active inbox.</p>
            </div>
          </button>
        </div>
      </section>
    </div>

    <!-- EDIT MODAL -->
    <div
      v-if="editModalOpen"
      class="modal-backdrop"
      @click.self="closeEditModal"
    >
      <form
        class="modal-card"
        @submit.prevent="saveEdit"
      >
        <div class="modal-heading">
          <div>
            <p class="eyebrow">Edit Jot</p>
            <h2>Update capture</h2>
          </div>

          <button
            class="modal-close"
            type="button"
            @click="closeEditModal"
          >
            ×
          </button>
        </div>

        <div class="modal-form">
          <label>
            Title

            <input
              v-model.trim="editForm.title"
              type="text"
              placeholder="Optional title"
            />
          </label>

          <label>
            Content

            <textarea
              v-model="editForm.content"
              rows="7"
            ></textarea>
          </label>

          <div class="form-grid two-columns">
            <label>
              Type

              <select v-model="editForm.type">
                <option
                  v-for="type in jotTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
            </label>

            <label>
              Status

              <select v-model="editForm.status">
                <option value="inbox">Inbox</option>
                <option value="processed">Processed</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <div class="form-grid two-columns">
            <label>
              Tags

              <input
                v-model="editForm.tags"
                type="text"
                placeholder="research, idea"
              />
            </label>

            <label>
              Context

              <input
                v-model.trim="editForm.context"
                type="text"
                placeholder="Course or project"
              />
            </label>
          </div>

          <label class="check-label">
            <input
              v-model="editForm.pinned"
              type="checkbox"
            />

            <span>Pin this jot</span>
          </label>

          <p
            v-if="editError"
            class="form-error"
          >
            {{ editError }}
          </p>
        </div>

        <div class="modal-footer">
          <button
            class="secondary-btn"
            type="button"
            @click="closeEditModal"
          >
            Cancel
          </button>

          <button
            class="primary-btn"
            type="submit"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="toastMessage"
      class="toast"
    >
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
  reactive,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'
import { useJots } from '../composables/useJots'

const DAILY_NOTES_STORAGE_KEY =
  'scholarory-daily-notes'

const DAILY_NOTES_UPDATED_EVENT =
  'scholarory-daily-notes-updated'

const router = useRouter()

const jotTypes = [
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'idea', label: 'Idea', icon: '💡' },
  { value: 'task', label: 'Task', icon: '✅' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'quote', label: 'Quote', icon: '💬' },
  { value: 'reference', label: 'Reference', icon: '📚' },
  { value: 'reminder', label: 'Reminder', icon: '⏰' },
  { value: 'other', label: 'Other', icon: '📌' },
]

const statusTabs = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'processed', label: 'Processed' },
  { value: 'pinned', label: 'Pinned' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
]

const {
  jots,
  unfiledJots,
  processedJots,
  archivedJots,
  inboxCount,
  addJot,
  updateJot,
  deleteJot,
  markProcessed,
  unfileJot,
  archiveJot,
  restoreJot,
  togglePin,
} = useJots()

const captureInput = ref(null)

const activeStatus = ref('inbox')
const searchQuery = ref('')
const typeFilter = ref('all')

const processModalOpen = ref(false)
const processingJot = ref(null)

const editModalOpen = ref(false)
const editingJotId = ref('')
const editError = ref('')

const toastMessage = ref('')
let toastTimer = null

const captureForm = reactive(
  blankCaptureForm(),
)

const editForm = reactive({
  title: '',
  content: '',
  type: 'note',
  status: 'inbox',
  tags: '',
  context: '',
  pinned: false,
})

const captureHasContent = computed(() => {
  return Boolean(
    captureForm.title.trim() ||
      captureForm.content.trim(),
  )
})

const pinnedCount = computed(() => {
  return jots.value.filter(
    (jot) => jot.pinned,
  ).length
})

const activeStatusLabel = computed(() => {
  return (
    statusTabs.find(
      (tab) =>
        tab.value === activeStatus.value,
    )?.label || 'Inbox'
  )
})

const sourceJots = computed(() => {
  if (activeStatus.value === 'inbox') {
    return unfiledJots.value
  }

  if (activeStatus.value === 'processed') {
    return processedJots.value
  }

  if (activeStatus.value === 'archived') {
    return archivedJots.value
  }

  if (activeStatus.value === 'pinned') {
    return jots.value.filter(
      (jot) => jot.pinned,
    )
  }

  return jots.value
})

const filteredJots = computed(() => {
  const query =
    searchQuery.value
      .trim()
      .toLowerCase()

  return sourceJots.value
    .filter((jot) => {
      if (
        typeFilter.value !== 'all' &&
        jot.type !== typeFilter.value
      ) {
        return false
      }

      if (!query) {
        return true
      }

      const searchable = [
        jot.title,
        jot.content,
        jot.context,
        ...(jot.tags || []),
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
    .slice()
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }

      return String(
        b.createdAt,
      ).localeCompare(
        String(a.createdAt),
      )
    })
})

const emptyIcon = computed(() => {
  if (searchQuery.value) return '🔍'
  if (activeStatus.value === 'inbox') return '✅'
  if (activeStatus.value === 'archived') return '🗄️'
  if (activeStatus.value === 'pinned') return '📌'
  return '📭'
})

const emptyTitle = computed(() => {
  if (searchQuery.value) return 'No matching jots'
  if (activeStatus.value === 'inbox') return 'Inbox zero!'
  if (activeStatus.value === 'processed') return 'No processed jots'
  if (activeStatus.value === 'archived') return 'No archived jots'
  if (activeStatus.value === 'pinned') return 'No pinned jots'
  return 'No jots yet'
})

const emptyMessage = computed(() => {
  if (searchQuery.value) {
    return 'Try a different search.'
  }

  if (activeStatus.value === 'inbox') {
    return 'Everything has been processed.'
  }

  return 'Captures in this section will appear here.'
})

onMounted(() => {
  window.addEventListener(
    'keydown',
    handleShortcut,
  )
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)

  window.removeEventListener(
    'keydown',
    handleShortcut,
  )
})

function blankCaptureForm() {
  return {
    title: '',
    content: '',
    type: 'note',
    tags: '',
    context: '',
    pinned: false,
  }
}

function captureJot() {
  if (!captureHasContent.value) {
    return
  }

  addJot({
    title: captureForm.title,
    content: captureForm.content,
    type: captureForm.type,
    tags: parseTags(captureForm.tags),
    context: captureForm.context,
    pinned: captureForm.pinned,
    status: 'inbox',
  })

  clearCapture()
  activeStatus.value = 'inbox'
  showToast('Jot captured.')

  nextTick(() => {
    captureInput.value?.focus()
  })
}

function clearCapture() {
  Object.assign(
    captureForm,
    blankCaptureForm(),
  )
}

function focusCapture() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })

  nextTick(() => {
    captureInput.value?.focus()
  })
}

function openProcessModal(jot) {
  processingJot.value = jot
  processModalOpen.value = true
}

function closeProcessModal() {
  processModalOpen.value = false
  processingJot.value = null
}

function markJotProcessed() {
  if (!processingJot.value) {
    return
  }

  markProcessed(processingJot.value.id)
  closeProcessModal()
  showToast('Jot marked processed.')
}

function saveAsReference() {
  if (!processingJot.value) {
    return
  }

  updateJot(processingJot.value.id, {
    type: 'reference',
    status: 'processed',
  })

  closeProcessModal()
  showToast('Jot saved as reference.')
}

async function sendToTodayNotes() {
  const jot = processingJot.value

  if (!jot) {
    showToast('No jot was selected.')
    return
  }

  const todayKey = getTodayKey()

  const jotTitle = String(
    jot.title || '',
  ).trim()

  const jotContent = String(
    jot.content ||
    jot.text ||
    '',
  ).trim()

  const contextText = jot.context
    ? `Context: ${jot.context}`
    : ''

  const tagText = Array.isArray(jot.tags)
    ? jot.tags
        .map((tag) => `#${tag}`)
        .join(' ')
    : ''

  const mainText =
  jotTitle && jotContent
    ? `${jotTitle}: ${jotContent}`
    : jotTitle || jotContent

const details = [
  contextText,
  tagText,
]
  .filter(Boolean)
  .join(' · ')

const noteText =
  `• ${[
    mainText,
    details,
  ]
    .filter(Boolean)
    .join(' · ')}`

  if (!noteText) {
    showToast(
      'This jot does not contain any text to send.',
    )

    return
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        DAILY_NOTES_STORAGE_KEY,
      )

    let dailyNotes = {}

    if (storedValue) {
      const parsed = JSON.parse(
        storedValue,
      )

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        dailyNotes = parsed
      }
    }

    const existingText =
      typeof dailyNotes[todayKey] ===
      'string'
        ? dailyNotes[todayKey].trim()
        : ''

    dailyNotes[todayKey] =
      existingText
        ? `${existingText}\n\n${noteText}`
        : noteText

    window.localStorage.setItem(
      DAILY_NOTES_STORAGE_KEY,
      JSON.stringify(dailyNotes),
    )

    /*
     * Confirm that the note was actually saved before
     * processing the jot.
     */
    const savedNotes = JSON.parse(
      window.localStorage.getItem(
        DAILY_NOTES_STORAGE_KEY,
      ) || '{}',
    )

    const savedText = String(
      savedNotes[todayKey] || '',
    )

    if (!savedText.includes(noteText)) {
      throw new Error(
        'The Daily Note could not be verified.',
      )
    }

    updateJot(jot.id, {
      status: 'processed',

      convertedTo: {
        type: 'daily-note',
        date: todayKey,
      },
    })

    closeProcessModal()

    showToast(
      'Jot sent to today’s notes.',
    )

    await router.push('/daily')
    await nextTick()

    window.dispatchEvent(
      new CustomEvent(
        DAILY_NOTES_UPDATED_EVENT,
        {
          detail: {
            date: todayKey,
          },
        },
      ),
    )

    /*
     * The full refresh prevents a cached Daily View from
     * displaying its older copy of the notes.
     */
    window.setTimeout(() => {
      window.location.reload()
    }, 100)
  } catch (error) {
    console.error(
      'Scholarory could not send the jot to Daily Notes.',
      error,
    )

    showToast(
      'The jot could not be added to Daily Notes.',
    )
  }
}

function archiveProcessingJot() {
  if (!processingJot.value) {
    return
  }

  archiveJot(processingJot.value.id)
  closeProcessModal()
  showToast('Jot archived.')
}

function openEditModal(jot) {
  editingJotId.value = jot.id
  editError.value = ''

  Object.assign(editForm, {
    title: jot.title || '',
    content: jot.content || '',
    type: jot.type || 'note',
    status: jot.status || 'inbox',
    tags: (jot.tags || []).join(', '),
    context: jot.context || '',
    pinned: jot.pinned === true,
  })

  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  editingJotId.value = ''
  editError.value = ''
}

function saveEdit() {
  const title =
    editForm.title.trim()

  const content =
    editForm.content.trim()

  if (!title && !content) {
    editError.value =
      'Please enter a title or content.'

    return
  }

  updateJot(editingJotId.value, {
    title,
    content,
    type: editForm.type,
    status: editForm.status,
    tags: parseTags(editForm.tags),
    context: editForm.context,
    pinned: editForm.pinned,
  })

  closeEditModal()
  showToast('Jot updated.')
}

function handleTogglePin(jot) {
  const wasPinned = jot.pinned

  togglePin(jot.id)

  showToast(
    wasPinned
      ? 'Jot unpinned.'
      : 'Jot pinned.',
  )
}

function returnToInbox(jot) {
  unfileJot(jot.id)
  showToast('Jot returned to inbox.')
}

function handleArchive(jot) {
  archiveJot(jot.id)
  showToast('Jot archived.')
}

function handleRestore(jot) {
  restoreJot(jot.id)
  showToast('Jot restored.')
}

function confirmDelete(jot) {
  const confirmed =
    window.confirm(
      `Delete "${jotDisplayTitle(jot)}"? This cannot be undone.`,
    )

  if (!confirmed) {
    return
  }

  deleteJot(jot.id)
  showToast('Jot deleted.')
}

function statusCount(status) {
  if (status === 'inbox') {
    return unfiledJots.value.length
  }

  if (status === 'processed') {
    return processedJots.value.length
  }

  if (status === 'archived') {
    return archivedJots.value.length
  }

  if (status === 'pinned') {
    return pinnedCount.value
  }

  return jots.value.length
}

function typeLabel(value) {
  return (
    jotTypes.find(
      (type) => type.value === value,
    )?.label || 'Other'
  )
}

function typeIcon(value) {
  return (
    jotTypes.find(
      (type) => type.value === value,
    )?.icon || '📌'
  )
}

function statusLabel(status) {
  if (status === 'processed') {
    return 'Processed'
  }

  if (status === 'archived') {
    return 'Archived'
  }

  return 'Inbox'
}

function jotDisplayTitle(jot) {
  if (!jot) {
    return 'Jot'
  }

  if (jot.title) {
    return jot.title
  }

  const content =
    String(jot.content || '').trim()

  if (!content) {
    return 'Untitled Jot'
  }

  return content.length > 45
    ? `${content.slice(0, 45)}…`
    : content
}

function parseTags(value) {
  return [
    ...new Set(
      String(value || '')
        .split(/[,\n]/)
        .map((tag) =>
          tag
            .replace(/^#/, '')
            .trim(),
        )
        .filter(Boolean),
    ),
  ]
}

function readDailyNotes() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        DAILY_NOTES_STORAGE_KEY,
      ) || '{}',
    )

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed
    }
  } catch (error) {
    console.warn(
      'Scholarory could not read Daily Notes.',
      error,
    )
  }

  return {}
}

function getTodayKey() {
  const today = new Date()

  const year =
    today.getFullYear()

  const month =
    String(
      today.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      today.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

function handleShortcut(event) {
  if (
    !(event.metaKey || event.ctrlKey) ||
    !event.shiftKey ||
    event.key.toLowerCase() !== 'j'
  ) {
    return
  }

  event.preventDefault()
  focusCapture()
}

function showToast(message) {
  window.clearTimeout(toastTimer)

  toastMessage.value = message

  toastTimer =
    window.setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
}
</script>

<style scoped>
.inbox-page {
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
}

.capture-card,
.inbox-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.section-heading,
.capture-footer,
.toolbar,
.results-heading,
.jot-header,
.jot-footer,
.modal-heading,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading {
  align-items: flex-start;
}

.section-heading h2,
.results-heading h2,
.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
}

.section-heading p:not(.eyebrow),
.modal-heading p:not(.eyebrow) {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  font-size: 0.76rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-text);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.shortcut-label {
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 0.6rem;
  font-weight: 800;
}

.capture-form,
.modal-form {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.capture-textarea,
.form-grid input,
.form-grid select,
.filters input,
.filters select,
.modal-form input,
.modal-form select,
.modal-form textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
}

.capture-textarea {
  min-height: 115px;
  resize: vertical;
}

.capture-textarea:focus,
.form-grid input:focus,
.form-grid select:focus,
.filters input:focus,
.filters select:focus,
.modal-form input:focus,
.modal-form select:focus,
.modal-form textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.form-grid.two-columns {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

.form-grid label,
.modal-form label {
  display: grid;
  gap: 0.3rem;
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 800;
}

.check-label {
  display: flex !important;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
}

.check-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.check-label span {
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 800;
}

.button-row,
.jot-actions,
.status-tabs,
.filters,
.jot-badges,
.jot-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.primary-btn,
.secondary-btn,
.status-tab,
.icon-btn,
.row-btn,
.jot-content,
.modal-close,
.process-option {
  font: inherit;
  cursor: pointer;
}

.primary-btn,
.secondary-btn {
  min-height: 40px;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  font-size: 0.76rem;
  font-weight: 800;
}

.primary-btn {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: white;
}

.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-primary);
}

.primary-btn:not(:disabled):hover {
  filter: brightness(1.08);
}

.secondary-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.summary-card > span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: var(--bg-secondary);
  font-size: 1.1rem;
}

.summary-card div {
  display: grid;
}

.summary-card small {
  color: var(--text-muted);
  font-size: 0.6rem;
  font-weight: 850;
  text-transform: uppercase;
}

.summary-card strong {
  color: var(--text-primary);
  font-size: 1.25rem;
}

.inbox-card {
  display: grid;
  gap: 1rem;
}

.toolbar {
  align-items: flex-end;
  flex-wrap: wrap;
}

.status-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-secondary);
  font-size: 0.67rem;
  font-weight: 800;
}

.status-tab span {
  min-width: 20px;
  padding: 0.15rem 0.3rem;
  border-radius: 999px;
  background: var(--bg-secondary);
  text-align: center;
  font-size: 0.56rem;
}

.status-tab.active,
.status-tab:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-text);
}

.filters input {
  min-width: 220px;
}

.results-heading {
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color);
}

.results-heading h2 {
  font-size: 1.05rem;
}

.jots-list {
  display: grid;
  gap: 0.7rem;
}

.jot-card {
  display: grid;
  gap: 0.7rem;
  padding: 0.9rem;
  border: 1px solid var(--border-color);
  border-left: 5px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
}

.jot-card.pinned {
  border-left-color: var(--accent);
}

.jot-card.processed {
  opacity: 0.82;
}

.jot-card.archived {
  opacity: 0.65;
}

.type-badge,
.status-badge,
.pin-badge,
.detail-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.56rem;
  font-weight: 850;
}

.type-badge {
  background: #edf3fb;
  color: #416e9b;
}

.status-badge,
.detail-badge {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
}

.pin-badge {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
}

.jot-content {
  display: grid;
  gap: 0.35rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
}

.jot-content h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.88rem;
}

.jot-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.79rem;
  line-height: 1.55;
  white-space: pre-wrap;
}

.jot-footer {
  align-items: flex-end;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
}

.jot-date {
  color: var(--text-muted);
  font-size: 0.58rem;
}

.row-btn {
  min-height: 31px;
  padding: 0.38rem 0.55rem;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.62rem;
  font-weight: 800;
}

.row-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.process-btn {
  border-color: var(--accent);
  color: var(--accent-text);
}

.delete-btn {
  color: #b4443e;
}

.empty-state {
  display: grid;
  justify-items: center;
  min-height: 300px;
  align-content: center;
  text-align: center;
}

.empty-state > span {
  font-size: 2.3rem;
}

.empty-state h3 {
  margin: 0.6rem 0 0;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.65);
}

.modal-card {
  width: min(680px, 100%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.15rem;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--bg-card);
}

.process-modal {
  width: min(600px, 100%);
}

.modal-heading {
  align-items: flex-start;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 1.15rem;
}

.modal-form textarea {
  resize: vertical;
}

.modal-footer {
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.process-preview {
  margin-top: 1rem;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.76rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.process-options {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

.process-option {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  gap: 0.75rem;
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--bg-secondary);
  color: inherit;
  text-align: left;
}

.process-option:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.daily-note-option {
  border-color: var(--accent);
}

.process-option > span {
  font-size: 1.25rem;
}

.process-option strong {
  color: var(--text-primary);
  font-size: 0.78rem;
}

.process-option p {
  margin: 0.18rem 0 0;
  color: var(--text-secondary);
  font-size: 0.66rem;
  line-height: 1.4;
}

.form-error {
  margin: 0;
  padding: 0.7rem;
  border: 1px solid #efc2bf;
  border-radius: 9px;
  background: #fff1f0;
  color: #aa3e38;
  font-size: 0.72rem;
  font-weight: 750;
}

.toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 150;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
}

@media (max-width: 1000px) {
  .form-grid,
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 700px) {
  .section-heading,
  .capture-footer,
  .jot-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .shortcut-label {
    display: none;
  }

  .filters {
    width: 100%;
  }

  .filters input,
  .filters select {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 620px) {
  .form-grid,
  .form-grid.two-columns,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .status-tabs {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .status-tab {
    justify-content: space-between;
  }
}
</style>