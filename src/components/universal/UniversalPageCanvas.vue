<template>
  <section class="universal-canvas" :class="`canvas-width-${layout.width}`">
    <div class="canvas-toolbar">
      <div class="canvas-toolbar-left">
        <button type="button" @click="addRichText">+ Text</button>
        <button type="button" @click="addColumns(2)">+ 2 columns</button>
        <button type="button" @click="addColumns(3)">+ 3 columns</button>
      </div>

      <div class="canvas-toolbar-right">
        <label>
          Page width
          <select v-model="layout.width" @change="saveLayout">
            <option value="narrow">Narrow</option>
            <option value="default">Default</option>
            <option value="full">Full</option>
          </select>
        </label>
      </div>
    </div>

    <draggable
      v-model="layout.blocks"
      item-key="id"
      handle=".canvas-drag-handle"
      group="zeyteo-canvas-blocks"
      class="canvas-block-list"
      ghost-class="canvas-block-ghost"
      @change="saveLayout"
    >
      <template #item="{ element: block }">
        <article class="canvas-block" :class="{ 'canvas-block-protected': block.type === 'system' }">
          <div class="canvas-block-controls">
            <button class="canvas-drag-handle" type="button" title="Move block">⋮⋮</button>
            <span v-if="block.type === 'system'" class="protected-pill">Protected Zeyteo data</span>
            <button
              v-if="block.type !== 'system'"
              class="canvas-remove"
              type="button"
              title="Remove block"
              @click="removeBlock(block.id)"
            >×</button>
          </div>

          <div v-if="block.type === 'system'" class="system-block-body">
            <slot name="system" />
          </div>

          <ScholaroryEditor
            v-else-if="block.type === 'richText'"
            v-model="block.content"
            @update:model-value="saveLayout"
          />

          <div v-else-if="block.type === 'columns'" class="columns-block">
            <div
              v-for="column in block.columns"
              :key="column.id"
              class="canvas-column"
              :style="{ flexBasis: `${column.width}%` }"
            >
              <draggable
                v-model="column.blocks"
                item-key="id"
                group="zeyteo-canvas-blocks"
                handle=".nested-drag-handle"
                class="column-dropzone"
                ghost-class="canvas-block-ghost"
                @change="saveLayout"
              >
                <template #item="{ element: child }">
                  <div class="nested-canvas-block">
                    <div class="nested-block-controls">
                      <button class="nested-drag-handle" type="button" title="Move block">⋮⋮</button>
                      <button
                        class="canvas-remove"
                        type="button"
                        title="Remove block"
                        @click="removeColumnChild(block, column, child.id)"
                      >×</button>
                    </div>

                    <ScholaroryEditor
                      v-if="child.type === 'richText'"
                      v-model="child.content"
                      @update:model-value="saveLayout"
                    />
                  </div>
                </template>
              </draggable>

              <button class="column-add" type="button" @click="addTextToColumn(block, column)">
                + Add block
              </button>
            </div>
          </div>
        </article>
      </template>
    </draggable>

    <button class="canvas-add-bottom" type="button" @click="addRichText">
      + Add block
    </button>
  </section>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import draggable from 'vuedraggable'
import ScholaroryEditor from '@/components/ScholaroryEditor.vue'

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['layout-change'])

const layout = reactive({
  version: 1,
  width: 'default',
  blocks: [],
})

function uuid() {
  return crypto.randomUUID()
}

function newRichTextBlock() {
  return {
    id: uuid(),
    type: 'richText',
    content: [],
  }
}

function defaultLayout() {
  return {
    version: 1,
    width: 'default',
    blocks: [
      {
        id: `system:${props.pageKey}`,
        type: 'system',
        protected: true,
      },
      newRichTextBlock(),
    ],
  }
}

function storageKey() {
  return `zeyteo_page_canvas:${props.pageKey}`
}

function ensureProtectedSystemBlock(candidate) {
  const next = candidate && typeof candidate === 'object'
    ? candidate
    : defaultLayout()

  if (!Array.isArray(next.blocks)) next.blocks = []

  const systemBlocks = next.blocks.filter((block) => block?.type === 'system')
  if (!systemBlocks.length) {
    next.blocks.unshift({
      id: `system:${props.pageKey}`,
      type: 'system',
      protected: true,
    })
  } else if (systemBlocks.length > 1) {
    let kept = false
    next.blocks = next.blocks.filter((block) => {
      if (block?.type !== 'system') return true
      if (kept) return false
      kept = true
      block.protected = true
      return true
    })
  } else {
    systemBlocks[0].protected = true
  }

  return next
}

function loadLayout() {
  try {
    const stored = localStorage.getItem(storageKey())
    const parsed = stored ? JSON.parse(stored) : defaultLayout()
    const normalized = ensureProtectedSystemBlock(parsed)

    layout.version = normalized.version || 1
    layout.width = ['narrow', 'default', 'full'].includes(normalized.width)
      ? normalized.width
      : 'default'
    layout.blocks = normalized.blocks
  } catch (error) {
    console.warn('Could not load Zeyteo page layout. Using defaults.', error)
    Object.assign(layout, defaultLayout())
  }
}

function saveLayout() {
  ensureProtectedSystemBlock(layout)
  localStorage.setItem(storageKey(), JSON.stringify(layout))
  emit('layout-change', JSON.parse(JSON.stringify(layout)))
}

function addRichText() {
  layout.blocks.push(newRichTextBlock())
  saveLayout()
}

function addColumns(count = 2) {
  const width = 100 / count
  layout.blocks.push({
    id: uuid(),
    type: 'columns',
    columns: Array.from({ length: count }, () => ({
      id: uuid(),
      width,
      blocks: [newRichTextBlock()],
    })),
  })
  saveLayout()
}

function addTextToColumn(parent, column) {
  column.blocks.push(newRichTextBlock())
  saveLayout()
}

function removeColumnChild(parent, column, childId) {
  column.blocks = column.blocks.filter((child) => child.id !== childId)
  saveLayout()
}

function removeBlock(blockId) {
  const target = layout.blocks.find((block) => block.id === blockId)
  if (!target || target.type === 'system' || target.protected) return

  layout.blocks = layout.blocks.filter((block) => block.id !== blockId)
  saveLayout()
}

onMounted(loadLayout)

watch(
  () => props.pageKey,
  () => loadLayout(),
)
</script>

<style scoped>
.universal-canvas {
  width: 100%;
  margin: 0 auto;
}

.canvas-width-narrow {
  max-width: 760px;
}

.canvas-width-default {
  max-width: 1120px;
}

.canvas-width-full {
  max-width: none;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.8rem;
  opacity: 0;
  transition: opacity 140ms ease;
}

.universal-canvas:hover > .canvas-toolbar,
.canvas-toolbar:focus-within {
  opacity: 1;
}

.canvas-toolbar-left,
.canvas-toolbar-right {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.canvas-toolbar button,
.canvas-toolbar select,
.canvas-add-bottom,
.column-add {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.42rem 0.65rem;
  font: inherit;
}

.canvas-toolbar button,
.canvas-add-bottom,
.column-add {
  cursor: pointer;
}

.canvas-toolbar label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.canvas-block-list,
.column-dropzone {
  min-height: 1rem;
}

.canvas-block {
  position: relative;
  margin: 0.2rem 0;
  border-radius: 10px;
}

.canvas-block-controls,
.nested-block-controls {
  position: absolute;
  left: -2.2rem;
  top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 3;
}

.canvas-block:hover > .canvas-block-controls,
.nested-canvas-block:hover > .nested-block-controls {
  opacity: 1;
}

.canvas-drag-handle,
.nested-drag-handle,
.canvas-remove {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: grab;
  padding: 0.2rem 0.3rem;
}

.canvas-remove {
  cursor: pointer;
}

.protected-pill {
  white-space: nowrap;
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.18rem 0.42rem;
}

.canvas-block-protected {
  outline: 1px dashed transparent;
}

.canvas-block-protected:hover {
  outline-color: var(--border-color);
}

.columns-block {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  width: 100%;
  padding: 0.4rem 0;
}

.canvas-column {
  min-width: 0;
  flex-grow: 1;
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  padding: 0.55rem;
}

.nested-canvas-block {
  position: relative;
  min-height: 2rem;
}

.column-add,
.canvas-add-bottom {
  opacity: 0.58;
  margin-top: 0.4rem;
}

.canvas-add-bottom {
  margin-top: 1rem;
}

.canvas-block-ghost {
  opacity: 0.35;
  outline: 2px dashed var(--accent);
}

@media (max-width: 860px) {
  .columns-block {
    flex-direction: column;
  }

  .canvas-column {
    flex-basis: auto !important;
  }

  .canvas-block-controls,
  .nested-block-controls {
    position: static;
    opacity: 0.7;
    margin-bottom: 0.15rem;
  }

  .canvas-toolbar {
    opacity: 1;
    flex-wrap: wrap;
  }
}
</style>
