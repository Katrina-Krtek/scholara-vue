<template>
  <section class="editor-shell">
    <div class="editor-page">
      <div class="editor-hint">
        Type <strong>/</strong> for commands
      </div>

      <div class="editor-blocks">
        <div v-for="block in localBlocks" :key="block.id" class="block-row">
          <div class="block-handle">⋮⋮</div>

          <div class="block-content">
            <template v-if="block.type === 'toggle'">
              <details open class="toggle-block">
                <summary>
                  <textarea
                    v-model="block.content"
                    class="toggle-title"
                    rows="1"
                    placeholder="Toggle title"
                    @input="handleInput(block, $event)"
                    @keydown.tab.prevent="insertTab(block, $event)"
                  />
                </summary>

                <textarea
                  v-model="block.childrenText"
                  class="toggle-text"
                  placeholder="Write inside toggle..."
                  @input="handleInput(block, $event)"
                  @keydown.tab.prevent="insertTab(block, $event, 'childrenText')"
                />
              </details>
            </template>

            <template v-else-if="block.type === 'divider'">
              <hr class="divider-block" />
            </template>

            <template v-else-if="block.type === 'code'">
              <textarea
                v-model="block.content"
                class="block-textarea code-block"
                placeholder="Code block"
                @input="handleInput(block, $event)"
                @keydown.tab.prevent="insertTab(block, $event)"
              />
            </template>

            <template v-else-if="block.type === 'quote'">
              <textarea
                v-model="block.content"
                class="block-textarea quote-block"
                placeholder="Quote"
                @input="handleInput(block, $event)"
                @keydown.tab.prevent="insertTab(block, $event)"
              />
            </template>

            <template v-else-if="block.type === 'callout'">
              <textarea
                v-model="block.content"
                class="block-textarea callout-block"
                placeholder="Callout"
                @input="handleInput(block, $event)"
                @keydown.tab.prevent="insertTab(block, $event)"
              />
            </template>

            <template v-else-if="block.type === 'checklist'">
              <div class="checklist-row">
                <input
                  v-model="block.checked"
                  type="checkbox"
                  @change="emitBlocks"
                />

                <textarea
                  v-model="block.content"
                  class="paragraph-block"
                  rows="1"
                  placeholder="To-do"
                  @input="handleInput(block, $event)"
                  @keydown.tab.prevent="insertTab(block, $event)"
                />
              </div>
            </template>

            <template v-else>
              <textarea
                v-model="block.content"
                :class="getBlockClass(block.type)"
                rows="1"
                :placeholder="getPlaceholder(block.type)"
                @input="handleInput(block, $event)"
                @keydown.enter.exact.stop
                @keydown.shift.enter.stop
                @keydown.tab.prevent="insertTab(block, $event)"
              />

              <div v-if="slashBlockId === block.id" class="slash-menu">
                <div class="slash-title">
                  Scholarory Commands
                </div>

                <button
                  v-for="command in filteredSlashCommands"
                  :key="command.id"
                  type="button"
                  @click="changeBlock(block, command.blockType)"
                >
                  <div class="slash-label">
                    {{ command.label }}
                  </div>

                  <div class="slash-command">
                    {{ command.slash }}
                  </div>
                </button>
              </div>
            </template>
          </div>

          <button class="delete-btn" type="button" @click="deleteBlock(block.id)">
            ×
          </button>
        </div>
      </div>

      <button class="add-btn" type="button" @click="addBlock('text')">
        + Add block
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { searchEditorCommands } from '@/data/editorCommands'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const slashBlockId = ref(null)
const slashSearch = ref('')
const isSyncingFromParent = ref(false)

const localBlocks = ref(
  props.modelValue.length
    ? cloneBlocks(props.modelValue)
    : [createBlock('text')]
)

watch(
  () => props.modelValue,
  async (newBlocks) => {
    isSyncingFromParent.value = true

    localBlocks.value = newBlocks.length
      ? cloneBlocks(newBlocks)
      : [createBlock('text')]

    await nextTick()
    resizeAllTextareas()

    setTimeout(() => {
      isSyncingFromParent.value = false
    }, 0)
  },
  { deep: true, immediate: true }
)

const filteredSlashCommands = computed(() =>
  searchEditorCommands(slashSearch.value).filter((command) => command.blockType)
)

function cloneBlocks(blocks) {
  return JSON.parse(JSON.stringify(blocks))
}

function createBlock(type = 'text') {
  return {
    id: crypto.randomUUID(),
    type,
    content: '',
    childrenText: '',
    checked: false,
    metadata: {}
  }
}

function emitBlocks() {
  if (isSyncingFromParent.value) return
  emit('update:modelValue', cloneBlocks(localBlocks.value))
}

function resizeAllTextareas() {
  document
    .querySelectorAll('.editor-shell textarea')
    .forEach((textarea) => autoResize(textarea))
}

function autoResize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function handleInput(block, event) {
  autoResize(event.target)
  handleSlash(block)
  emitBlocks()
}

function insertTab(block, event, field = 'content') {
  const textarea = event.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const tab = '    '
  const currentValue = block[field] || ''

  block[field] =
    currentValue.substring(0, start) +
    tab +
    currentValue.substring(end)

  nextTick(() => {
    textarea.selectionStart = start + tab.length
    textarea.selectionEnd = start + tab.length
    autoResize(textarea)
  })

  emitBlocks()
}

function addBlock(type = 'text') {
  localBlocks.value.push(createBlock(type))
  emitBlocks()

  nextTick(() => {
    resizeAllTextareas()
  })
}

function deleteBlock(blockId) {
  if (localBlocks.value.length === 1) {
    localBlocks.value[0].content = ''
    localBlocks.value[0].type = 'text'
    emitBlocks()
    return
  }

  localBlocks.value = localBlocks.value.filter((block) => block.id !== blockId)
  emitBlocks()
}

function handleSlash(block) {
  if (block.content.startsWith('/')) {
    slashBlockId.value = block.id
    slashSearch.value = block.content.replace('/', '')
  } else {
    slashBlockId.value = null
    slashSearch.value = ''
  }
}

function changeBlock(block, type) {
  block.type = type
  block.content = ''
  slashBlockId.value = null
  slashSearch.value = ''
  emitBlocks()

  nextTick(() => {
    resizeAllTextareas()
  })
}

function getBlockClass(type) {
  if (type === 'heading1') return 'heading1-block'
  if (type === 'heading2') return 'heading2-block'
  if (type === 'heading3') return 'heading3-block'

  return 'paragraph-block'
}

function getPlaceholder(type) {
  if (type === 'heading1') return 'Heading 1'
  if (type === 'heading2') return 'Heading 2'
  if (type === 'heading3') return 'Heading 3'

  return "Type '/' for commands"
}
</script>

<style scoped>
.editor-shell {
  background: transparent;
  font-family: Georgia, "Times New Roman", Times, serif;
}

.editor-page {
  padding: 0;
}

.editor-hint {
  color: var(--text-muted);
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.78rem;
  margin-bottom: 1rem;
}

.editor-blocks {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.block-row {
  display: grid;
  grid-template-columns: 24px 1fr 24px;
  gap: 0.4rem;
  align-items: start;
}

.block-row:hover {
  background: rgba(127, 127, 127, 0.025);
}

.block-handle {
  opacity: 0;
  color: var(--text-muted);
  padding-top: 0.45rem;
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.8rem;
}

.block-row:hover .block-handle {
  opacity: 0.45;
}

.block-content {
  position: relative;
}

.paragraph-block,
.heading1-block,
.heading2-block,
.heading3-block,
.block-textarea,
.toggle-title,
.toggle-text {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  overflow: hidden;
  outline: none;
  color: var(--text-primary);
  box-sizing: border-box;
  line-height: 1.75;
  font-family: Georgia, "Times New Roman", Times, serif;
}

.paragraph-block {
  font-size: 1.04rem;
  padding: 0.35rem 0;
  min-height: 42px;
}

.heading1-block {
  font-size: 2.35rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  padding: 0.75rem 0 0.35rem;
  line-height: 1.2;
}

.heading2-block {
  font-size: 1.72rem;
  font-weight: 700;
  padding: 0.65rem 0 0.3rem;
  line-height: 1.25;
}

.heading3-block {
  font-size: 1.35rem;
  font-weight: 700;
  padding: 0.55rem 0 0.25rem;
  line-height: 1.3;
}

.quote-block {
  border-left: 3px solid var(--border-color);
  padding: 0.35rem 0 0.35rem 1rem;
  color: var(--text-secondary);
  min-height: 60px;
}

.callout-block {
  background: var(--accent-soft);
  border-radius: 10px;
  padding: 1rem;
  min-height: 80px;
}

.code-block {
  background: #111827;
  color: #f9fafb;
  border-radius: 10px;
  padding: 1rem;
  font-family: monospace;
  min-height: 90px;
}

.toggle-block {
  padding: 0.2rem 0;
}

.toggle-title {
  font-weight: 700;
  padding: 0.2rem 0;
}

.toggle-text {
  margin-left: 1rem;
  margin-top: 0.4rem;
  color: var(--text-secondary);
  min-height: 80px;
}

.divider-block {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1rem 0;
}

.checklist-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.checklist-row input[type='checkbox'] {
  margin-top: 0.7rem;
}

.delete-btn {
  opacity: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding-top: 0.45rem;
}

.block-row:hover .delete-btn {
  opacity: 0.5;
}

.add-btn {
  margin-top: 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: Inter, system-ui, sans-serif;
}

.slash-menu {
  position: absolute;
  z-index: 50;
  top: 2.2rem;
  left: 0;
  width: 300px;
  max-height: 340px;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 0.45rem;
  font-family: Inter, system-ui, sans-serif;
}

.slash-title {
  font-size: 0.72rem;
  color: var(--text-muted);
  padding: 0.35rem 0.5rem;
}

.slash-menu button {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: var(--text-primary);
  padding: 0.55rem;
  border-radius: 8px;
  cursor: pointer;
}

.slash-menu button:hover {
  background: var(--btn-hover);
}

.slash-label {
  font-weight: 600;
}

.slash-command {
  font-size: 0.72rem;
  color: var(--text-muted);
}
</style>