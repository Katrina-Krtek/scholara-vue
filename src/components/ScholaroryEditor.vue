<template>
  <section class="editor-shell">
    <div class="editor-page">
      <div class="editor-hint">
        Type <strong>/</strong> for commands · <strong>Enter</strong> new block · <strong>Tab</strong> indent · <strong>Shift + Tab</strong> outdent
      </div>

      <div class="editor-blocks">
        <div
          v-for="block in localBlocks"
          :key="block.id"
          class="block-row"
          :style="{ '--indent-level': block.indent || 0 }"
        >
          <div class="block-handle">⋮⋮</div>

          <div class="block-content">
            <template v-if="block.type === 'toggle'">
              <details open class="toggle-block">
                <summary class="toggle-summary">
                  <span class="toggle-arrow">▾</span>

                  <textarea
                    v-model="block.content"
                    :data-block-id="block.id"
                    class="toggle-title"
                    rows="1"
                    placeholder="Toggle title"
                    @input="handleInput(block, $event)"
                    @keydown.enter.exact="handleEnter(block, $event)"
                    @keydown.shift.enter.stop
                    @keydown.backspace="handleBackspace(block, $event)"
                    @keydown.tab.exact.prevent="indentBlock(block)"
                    @keydown.shift.tab.prevent="outdentBlock(block)"
                  />
                </summary>

                <div class="toggle-children">
                  <div
                    v-for="child in getToggleChildren(block)"
                    :key="child.id"
                    class="toggle-child-row"
                    :style="{ '--indent-level': child.indent || 0 }"
                  >
                    <div v-if="child.type === 'bullet'" class="list-prefix">•</div>

                    <div v-if="child.type === 'numbered'" class="list-prefix numbered-prefix">
                      {{ getNestedNumberedIndex(block, child.id) }}.
                    </div>

                    <template v-if="child.type === 'checklist'">
                      <div class="checklist-row">
                        <input
                          v-model="child.checked"
                          type="checkbox"
                          @change="emitBlocks"
                        />

                        <textarea
                          v-model="child.content"
                          :data-block-id="child.id"
                          class="paragraph-block"
                          rows="1"
                          placeholder="To-do"
                          @input="handleInput(child, $event)"
                          @keydown.enter.exact="handleNestedEnter(block, child, $event)"
                          @keydown.shift.enter.stop
                          @keydown.backspace="handleNestedBackspace(block, child, $event)"
                          @keydown.tab.exact.prevent="indentBlock(child)"
                          @keydown.shift.tab.prevent="outdentBlock(child)"
                        />
                      </div>
                    </template>

                    <template v-else-if="child.type === 'toggle'">
                      <details open class="nested-toggle-block">
                        <summary class="toggle-summary">
                          <span class="toggle-arrow">▾</span>

                          <textarea
                            v-model="child.content"
                            :data-block-id="child.id"
                            class="toggle-title"
                            rows="1"
                            placeholder="Nested toggle title"
                            @input="handleInput(child, $event)"
                            @keydown.enter.exact="handleNestedEnter(block, child, $event)"
                            @keydown.shift.enter.stop
                            @keydown.backspace="handleNestedBackspace(block, child, $event)"
                            @keydown.tab.exact.prevent="indentBlock(child)"
                            @keydown.shift.tab.prevent="outdentBlock(child)"
                          />
                        </summary>

                        <textarea
                          v-model="child.childrenText"
                          class="toggle-text"
                          placeholder="Write inside nested toggle..."
                          @input="handleInput(child, $event)"
                          @keydown.tab.prevent="insertTab(child, $event, 'childrenText')"
                        />
                      </details>
                    </template>

                    <template v-else-if="child.type === 'divider'">
                      <hr class="divider-block" />
                    </template>

                    <template v-else>
                      <textarea
                        v-model="child.content"
                        :data-block-id="child.id"
                        :class="getBlockClass(child.type)"
                        rows="1"
                        :placeholder="getPlaceholder(child.type)"
                        @input="handleInput(child, $event)"
                        @keydown.enter.exact="handleNestedEnter(block, child, $event)"
                        @keydown.shift.enter.stop
                        @keydown.backspace="handleNestedBackspace(block, child, $event)"
                        @keydown.tab.exact.prevent="indentBlock(child)"
                        @keydown.shift.tab.prevent="outdentBlock(child)"
                      />

                      <div v-if="slashBlockId === child.id" class="slash-menu">
                        <div class="slash-title">Scholarory Commands</div>

                        <button
                          v-for="command in filteredSlashCommands"
                          :key="command.id"
                          type="button"
                          @click="changeBlock(child, command.blockType)"
                        >
                          <div class="slash-label">{{ command.label }}</div>
                          <div class="slash-command">{{ command.slash }}</div>
                        </button>
                      </div>
                    </template>

                    <button
                      class="delete-btn nested-delete-btn"
                      type="button"
                      @click="deleteNestedBlock(block, child.id)"
                    >
                      ×
                    </button>
                  </div>

                  <button class="add-nested-btn" type="button" @click="addNestedBlock(block)">
                    + Add inside toggle
                  </button>
                </div>
              </details>
            </template>

            <template v-else-if="block.type === 'divider'">
              <hr class="divider-block" />
            </template>

            <template v-else-if="block.type === 'code'">
              <textarea
                v-model="block.content"
                :data-block-id="block.id"
                class="block-textarea code-block"
                placeholder="Code block"
                @input="handleInput(block, $event)"
                @keydown.enter.exact="handleEnter(block, $event)"
                @keydown.shift.enter.stop
                @keydown.backspace="handleBackspace(block, $event)"
                @keydown.tab.prevent="insertTab(block, $event)"
              />
            </template>

            <template v-else-if="block.type === 'quote'">
              <textarea
                v-model="block.content"
                :data-block-id="block.id"
                class="block-textarea quote-block"
                placeholder="Quote"
                @input="handleInput(block, $event)"
                @keydown.enter.exact="handleEnter(block, $event)"
                @keydown.shift.enter.stop
                @keydown.backspace="handleBackspace(block, $event)"
                @keydown.tab.exact.prevent="indentBlock(block)"
                @keydown.shift.tab.prevent="outdentBlock(block)"
              />
            </template>

            <template v-else-if="block.type === 'callout'">
              <textarea
                v-model="block.content"
                :data-block-id="block.id"
                class="block-textarea callout-block"
                placeholder="Callout"
                @input="handleInput(block, $event)"
                @keydown.enter.exact="handleEnter(block, $event)"
                @keydown.shift.enter.stop
                @keydown.backspace="handleBackspace(block, $event)"
                @keydown.tab.exact.prevent="indentBlock(block)"
                @keydown.shift.tab.prevent="outdentBlock(block)"
              />
            </template>

            <template v-else-if="block.type === 'checklist'">
              <div class="checklist-row">
                <input v-model="block.checked" type="checkbox" @change="emitBlocks" />

                <textarea
                  v-model="block.content"
                  :data-block-id="block.id"
                  class="paragraph-block"
                  rows="1"
                  placeholder="To-do"
                  @input="handleInput(block, $event)"
                  @keydown.enter.exact="handleEnter(block, $event)"
                  @keydown.shift.enter.stop
                  @keydown.backspace="handleBackspace(block, $event)"
                  @keydown.tab.exact.prevent="indentBlock(block)"
                  @keydown.shift.tab.prevent="outdentBlock(block)"
                />
              </div>
            </template>

            <template v-else>
              <div v-if="block.type === 'bullet'" class="list-prefix">•</div>

              <div v-if="block.type === 'numbered'" class="list-prefix numbered-prefix">
                {{ getNumberedIndex(block.id) }}.
              </div>

              <textarea
                v-model="block.content"
                :data-block-id="block.id"
                :class="getBlockClass(block.type)"
                rows="1"
                :placeholder="getPlaceholder(block.type)"
                @input="handleInput(block, $event)"
                @keydown.enter.exact="handleEnter(block, $event)"
                @keydown.shift.enter.stop
                @keydown.backspace="handleBackspace(block, $event)"
                @keydown.tab.exact.prevent="indentBlock(block)"
                @keydown.shift.tab.prevent="outdentBlock(block)"
              />

              <div v-if="slashBlockId === block.id" class="slash-menu">
                <div class="slash-title">Scholarory Commands</div>

                <button
                  v-for="command in filteredSlashCommands"
                  :key="command.id"
                  type="button"
                  @click="changeBlock(block, command.blockType)"
                >
                  <div class="slash-label">{{ command.label }}</div>
                  <div class="slash-command">{{ command.slash }}</div>
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
    ? normalizeBlocks(cloneBlocks(props.modelValue))
    : [createBlock('text')]
)

watch(
  () => props.modelValue,
  async (newBlocks) => {
    isSyncingFromParent.value = true

    localBlocks.value = newBlocks.length
      ? normalizeBlocks(cloneBlocks(newBlocks))
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

function normalizeBlocks(blocks) {
  return blocks.map((block) => normalizeBlock(block))
}

function normalizeBlock(block) {
  const normalized = {
    indent: 0,
    childrenText: '',
    checked: false,
    metadata: {},
    ...block
  }

  if (normalized.type === 'toggle') {
    if (!Array.isArray(normalized.childrenBlocks)) {
      normalized.childrenBlocks = normalized.childrenText
        ? [createBlock('text', normalized.childrenText)]
        : [createBlock('text')]
    }

    normalized.childrenBlocks = normalized.childrenBlocks.map((child) => normalizeBlock(child))
  }

  return normalized
}

function createBlock(type = 'text', content = '') {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    childrenText: '',
    checked: false,
    indent: 0,
    metadata: {},
    childrenBlocks: type === 'toggle' ? [createBlock('text')] : undefined
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

function focusBlock(blockId) {
  nextTick(() => {
    const textarea = document.querySelector(`[data-block-id="${blockId}"]`)
    if (!textarea) return

    textarea.focus()
    textarea.selectionStart = textarea.value.length
    textarea.selectionEnd = textarea.value.length
    autoResize(textarea)
  })
}

function getToggleChildren(block) {
  if (!Array.isArray(block.childrenBlocks)) {
    block.childrenBlocks = [createBlock('text')]
  }

  return block.childrenBlocks
}

function handleInput(block, event) {
  autoResize(event.target)
  applyMarkdownShortcut(block)
  handleSlash(block)
  emitBlocks()
}

function handleEnter(block, event) {
  event.preventDefault()

  slashBlockId.value = null
  slashSearch.value = ''

  const nextType = ['bullet', 'numbered', 'checklist'].includes(block.type)
    ? block.type
    : 'text'

  const newBlock = createBlock(nextType)
  newBlock.indent = block.indent || 0

  createBlockAfter(block.id, newBlock)
}

function handleNestedEnter(parentBlock, childBlock, event) {
  event.preventDefault()

  slashBlockId.value = null
  slashSearch.value = ''

  const nextType = ['bullet', 'numbered', 'checklist'].includes(childBlock.type)
    ? childBlock.type
    : 'text'

  const newBlock = createBlock(nextType)
  newBlock.indent = childBlock.indent || 0

  createNestedBlockAfter(parentBlock, childBlock.id, newBlock)
}

function handleBackspace(block, event) {
  if (block.content && block.content.length > 0) return

  if ((block.indent || 0) > 0) {
    event.preventDefault()
    outdentBlock(block)
    return
  }

  const index = localBlocks.value.findIndex((item) => item.id === block.id)
  if (index <= 0) return

  event.preventDefault()

  const previousBlock = localBlocks.value[index - 1]
  localBlocks.value.splice(index, 1)
  emitBlocks()

  if (previousBlock) {
    focusBlock(previousBlock.id)
  }
}

function handleNestedBackspace(parentBlock, childBlock, event) {
  if (childBlock.content && childBlock.content.length > 0) return

  if ((childBlock.indent || 0) > 0) {
    event.preventDefault()
    outdentBlock(childBlock)
    return
  }

  const children = getToggleChildren(parentBlock)
  const index = children.findIndex((item) => item.id === childBlock.id)

  if (index <= 0) return

  event.preventDefault()

  const previousBlock = children[index - 1]
  children.splice(index, 1)
  emitBlocks()

  if (previousBlock) {
    focusBlock(previousBlock.id)
  }
}

function createBlockAfter(currentBlockId, blockOrType = 'text') {
  const index = localBlocks.value.findIndex(
    (block) => block.id === currentBlockId
  )

  if (index === -1) return

  const newBlock =
    typeof blockOrType === 'string'
      ? createBlock(blockOrType)
      : blockOrType

  localBlocks.value.splice(index + 1, 0, newBlock)

  emitBlocks()
  resizeAllTextareas()
  focusBlock(newBlock.id)
}

function createNestedBlockAfter(parentBlock, currentBlockId, blockOrType = 'text') {
  const children = getToggleChildren(parentBlock)
  const index = children.findIndex((block) => block.id === currentBlockId)

  if (index === -1) return

  const newBlock =
    typeof blockOrType === 'string'
      ? createBlock(blockOrType)
      : blockOrType

  children.splice(index + 1, 0, newBlock)

  emitBlocks()
  resizeAllTextareas()
  focusBlock(newBlock.id)
}

function addNestedBlock(parentBlock) {
  const newBlock = createBlock('text')
  getToggleChildren(parentBlock).push(newBlock)
  emitBlocks()
  focusBlock(newBlock.id)
}

function deleteNestedBlock(parentBlock, childBlockId) {
  const children = getToggleChildren(parentBlock)

  if (children.length === 1) {
    children[0].content = ''
    children[0].type = 'text'
    children[0].indent = 0
    emitBlocks()
    return
  }

  parentBlock.childrenBlocks = children.filter((child) => child.id !== childBlockId)
  emitBlocks()
}

function indentBlock(block) {
  const currentIndent = block.indent || 0
  block.indent = Math.min(currentIndent + 1, 5)
  emitBlocks()
  focusBlock(block.id)
}

function outdentBlock(block) {
  const currentIndent = block.indent || 0
  block.indent = Math.max(currentIndent - 1, 0)
  emitBlocks()
  focusBlock(block.id)
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
  const newBlock = createBlock(type)

  localBlocks.value.push(newBlock)
  emitBlocks()
  resizeAllTextareas()
  focusBlock(newBlock.id)
}

function deleteBlock(blockId) {
  if (localBlocks.value.length === 1) {
    localBlocks.value[0].content = ''
    localBlocks.value[0].type = 'text'
    localBlocks.value[0].indent = 0
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

  if (type === 'toggle' && !Array.isArray(block.childrenBlocks)) {
    block.childrenBlocks = [createBlock('text')]
  }

  emitBlocks()

  nextTick(() => {
    resizeAllTextareas()
    focusBlock(block.id)
  })
}

function applyMarkdownShortcut(block) {
  const value = block.content || ''

  if (value === '# ') {
    block.type = 'heading1'
    block.content = ''
  }

  if (value === '## ') {
    block.type = 'heading2'
    block.content = ''
  }

  if (value === '### ') {
    block.type = 'heading3'
    block.content = ''
  }

  if (value === '- ' || value === '* ') {
    block.type = 'bullet'
    block.content = ''
  }

  if (value === '1. ') {
    block.type = 'numbered'
    block.content = ''
  }

  if (value === '[] ' || value === '[ ] ') {
    block.type = 'checklist'
    block.content = ''
  }

  if (value === '> ') {
    block.type = 'quote'
    block.content = ''
  }
}

function getNumberedIndex(blockId) {
  let count = 0

  for (const block of localBlocks.value) {
    if (block.type === 'numbered') {
      count += 1
    }

    if (block.id === blockId) {
      return count
    }
  }

  return 1
}

function getNestedNumberedIndex(parentBlock, blockId) {
  let count = 0

  for (const block of getToggleChildren(parentBlock)) {
    if (block.type === 'numbered') {
      count += 1
    }

    if (block.id === blockId) {
      return count
    }
  }

  return 1
}

function getBlockClass(type) {
  if (type === 'heading1') return 'heading1-block'
  if (type === 'heading2') return 'heading2-block'
  if (type === 'heading3') return 'heading3-block'
  if (type === 'bullet') return 'paragraph-block list-block'
  if (type === 'numbered') return 'paragraph-block list-block'
  if (type === 'quote') return 'block-textarea quote-block'
  if (type === 'callout') return 'block-textarea callout-block'
  if (type === 'code') return 'block-textarea code-block'

  return 'paragraph-block'
}

function getPlaceholder(type) {
  if (type === 'heading1') return 'Heading 1'
  if (type === 'heading2') return 'Heading 2'
  if (type === 'heading3') return 'Heading 3'
  if (type === 'bullet') return 'List item'
  if (type === 'numbered') return 'List item'
  if (type === 'checklist') return 'To-do'
  if (type === 'quote') return 'Quote'
  if (type === 'callout') return 'Callout'
  if (type === 'toggle') return 'Toggle title'

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
  padding-left: calc(var(--indent-level) * 1.75rem);
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

.list-prefix {
  position: absolute;
  left: -1.25rem;
  top: 0.43rem;
  color: var(--text-muted);
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.95rem;
}

.numbered-prefix {
  left: -1.65rem;
  font-size: 0.82rem;
}

.list-block {
  padding-left: 0.15rem;
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

.toggle-summary {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: start;
  gap: 0.35rem;
  list-style: none;
}

.toggle-summary::-webkit-details-marker {
  display: none;
}

.toggle-arrow {
  color: var(--text-muted);
  font-size: 0.8rem;
  padding-top: 0.5rem;
}

.toggle-title {
  font-weight: 700;
  padding: 0.2rem 0;
}

.toggle-children {
  margin-left: 1.7rem;
  margin-top: 0.35rem;
  border-left: 1px solid var(--border-color);
  padding-left: 1rem;
}

.toggle-child-row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 22px;
  gap: 0.35rem;
  align-items: start;
  padding-left: calc(var(--indent-level) * 1.75rem);
}

.nested-toggle-block {
  padding: 0.1rem 0;
}

.toggle-text {
  margin-left: 1.7rem;
  margin-top: 0.4rem;
  color: var(--text-secondary);
  min-height: 70px;
}

.add-nested-btn {
  margin-top: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.8rem;
}

.add-nested-btn:hover {
  color: var(--accent);
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

.nested-delete-btn {
  padding-top: 0.5rem;
}

.block-row:hover .delete-btn,
.toggle-child-row:hover .delete-btn {
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