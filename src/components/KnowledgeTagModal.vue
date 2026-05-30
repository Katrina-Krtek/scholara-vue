<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <section class="modal-card">
      <div class="modal-header">
        <div>
          <h2>{{ modeTitle }}</h2>
          <p>Create a reusable knowledge tag for your graph.</p>
        </div>

        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="form-grid">
        <div class="form-group wide">
          <label>Tag Name</label>
          <input v-model="form.name" type="text" placeholder="Messiah, Kingdom of God..." />
        </div>

        <div class="form-group">
          <label>Icon</label>
          <input v-model="form.icon" type="text" placeholder="🏷️" />
        </div>

        <div class="form-group">
          <label>Kind</label>
          <select v-model="form.kind">
            <option value="topic">Topic</option>
            <option value="person">Person</option>
            <option value="place">Place</option>
            <option value="doctrine">Doctrine</option>
            <option value="theme">Theme</option>
            <option value="term">Term</option>
          </select>
        </div>

        <div class="form-group wide">
          <label>Description</label>
          <textarea
            v-model="form.description"
            placeholder="Briefly describe what this tag means..."
          ></textarea>
        </div>

        <div class="form-group wide">
          <label>Aliases</label>
          <input
            v-model="aliasesText"
            type="text"
            placeholder="Comma-separated aliases..."
          />
        </div>

        <div class="form-group wide">
          <label>Supertags</label>
          <input
            v-model="supertagsText"
            type="text"
            placeholder="Comma-separated supertags..."
          />
        </div>
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" @click="closeModal">Cancel</button>
        <button class="save-btn" @click="handleCreate">
          {{ submitLabel }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  submitLabel: {
    type: String,
    default: 'Create Tag'
  },
  modeTitle: {
    type: String,
    default: 'New Knowledge Tag'
  }
})

const emit = defineEmits(['close', 'create'])

const aliasesText = ref('')
const supertagsText = ref('')

const form = reactive({
  name: '',
  kind: 'topic',
  parentId: null,
  description: '',
  color: '',
  icon: ''
})

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

function resetForm() {
  form.name = ''
  form.kind = 'topic'
  form.parentId = null
  form.description = ''
  form.color = ''
  form.icon = ''
  aliasesText.value = ''
  supertagsText.value = ''
}

function splitList(text) {
  return String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function closeModal() {
  emit('close')
}

function handleCreate() {
  const cleanName = form.name.trim()

  if (!cleanName) return

  emit('create', {
    name: cleanName,
    kind: form.kind,
    parentId: form.parentId,
    description: form.description.trim(),
    color: form.color.trim(),
    icon: form.icon.trim(),
    aliases: splitList(aliasesText.value),
    supertags: splitList(supertagsText.value)
  })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(15, 23, 42, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: min(620px, 100%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 1.25rem;
  color: var(--text-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-header p {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group.wide {
  grid-column: 1 / -1;
}

.form-group label {
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea,
.form-group select {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0.7rem;
  font: inherit;
}

.form-group textarea {
  min-height: 90px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1.25rem;
}

.secondary-btn,
.save-btn {
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
}

.save-btn {
  border: none;
  background: var(--accent);
  color: white;
}
</style>