<template>
  <article
    class="canvas-node"
    :class="[
      `canvas-node--${localColor}`,
      {
        'canvas-node--selected': selected,
        'canvas-node--missing': !libraryCard,
      },
    ]"
  >
    <NodeResizer
      :is-visible="selected"
      :min-width="240"
      :min-height="180"
      :max-width="760"
      :max-height="900"
      color="#375d95"
    />

    <Handle
      id="target-left"
      type="target"
      :position="Position.Left"
      class="canvas-handle canvas-handle--left"
    />

    <Handle
      id="source-right"
      type="source"
      :position="Position.Right"
      class="canvas-handle canvas-handle--right"
    />

    <header class="node-header">
      <div class="node-heading">
        <span class="node-icon" aria-hidden="true">
          {{ cardIcon }}
        </span>

        <div class="node-heading-text">
          <span class="node-type">
            {{ cardLabel }}
          </span>

          <span
            v-if="libraryCard"
            class="library-label"
            title="This card is stored in the global Card Library"
          >
            Shared card
          </span>
        </div>
      </div>

      <div class="node-actions nodrag nopan">
        <button
          class="color-button"
          type="button"
          :title="`Card color: ${localColor}`"
          aria-label="Change card color"
          @click.stop="cycleColor"
        >
          <span class="color-dot"></span>
        </button>

        <button
          class="delete-button"
          type="button"
          title="Remove card from this canvas"
          aria-label="Remove card from this canvas"
          @click.stop="requestDelete"
        >
          ×
        </button>
      </div>
    </header>

    <div
      v-if="libraryCard"
      class="node-content nodrag nopan"
      @pointerdown.stop
    >
      <input
        v-model="localTitle"
        class="node-title"
        type="text"
        maxlength="120"
        placeholder="Card title"
        aria-label="Card title"
        @input="saveTextChanges"
      />

      <textarea
        v-model="localContent"
        class="node-text"
        maxlength="20000"
        placeholder="Write a note, idea, question, quotation, or reminder..."
        aria-label="Card content"
        @input="saveTextChanges"
      ></textarea>
    </div>

    <div
      v-else
      class="missing-card-content nodrag nopan"
      @pointerdown.stop
    >
      <strong>Card unavailable</strong>

      <p>
        This canvas placement no longer has a matching Card Library
        record.
      </p>
    </div>

    <footer class="node-footer">
      <span v-if="libraryCard">
        {{ characterCount }}
        {{
          characterCount === 1
            ? 'character'
            : 'characters'
        }}
      </span>

      <span v-else>
        Missing library record
      </span>

      <span
        v-if="libraryCard?.sourceType"
        class="linked-badge"
      >
        {{ formatSourceType(libraryCard.sourceType) }}
      </span>

      <span
        v-else-if="libraryCard?.assetId"
        class="linked-badge"
      >
        Attached file
      </span>
    </footer>
  </article>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  Handle,
  Position,
} from '@vue-flow/core'

import {
  NodeResizer,
} from '@vue-flow/node-resizer'

import '@vue-flow/node-resizer/dist/style.css'

import {
  useCanvasCards,
} from '../../composables/useCanvasCards.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },

  data: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update',
  'delete',
])

const {
  getCardById,
  updateCard: updateLibraryCard,
} = useCanvasCards()

const availableColors = [
  'default',
  'gold',
  'blue',
  'green',
  'purple',
  'rose',
]

const cardId = computed(() =>
  props.data.cardId ||
  props.data.libraryCardId ||
  null,
)

const libraryCard = computed(() => {
  if (!cardId.value) {
    return null
  }

  return getCardById(cardId.value)
})

const localTitle = ref(
  libraryCard.value?.title ||
  props.data.title ||
  '',
)

const localContent = ref(
  libraryCard.value?.content ||
  props.data.content ||
  '',
)

const localColor = ref(
  props.data.color ||
  libraryCard.value?.color ||
  'default',
)

const characterCount = computed(
  () => localContent.value.length,
)

const resolvedCardType = computed(() =>
  libraryCard.value?.type ||
  props.data.cardType ||
  'note',
)

const cardLabel = computed(() => {
  const labels = {
    note: 'Note',
    idea: 'Idea',
    question: 'Question',
    quote: 'Quotation',
    source: 'Source',
    concept: 'Concept',
    term: 'Term',
    book: 'Book',
    article: 'Article',
    journal: 'Journal',
    image: 'Image',
    gif: 'GIF',
    pdf: 'PDF',
    drawing: 'Drawing',
    audio: 'Audio',
    video: 'Video',
    file: 'File',
    'linked-record': 'Linked Record',
  }

  return (
    labels[resolvedCardType.value] ||
    'Card'
  )
})

const cardIcon = computed(() => {
  const icons = {
    note: '📝',
    idea: '💡',
    question: '❓',
    quote: '💬',
    source: '📚',
    concept: '🧠',
    term: '🔤',
    book: '📕',
    article: '📄',
    journal: '📘',
    image: '🖼️',
    gif: '🎞️',
    pdf: '📑',
    drawing: '✍️',
    audio: '🎧',
    video: '🎥',
    file: '📎',
    'linked-record': '🔗',
  }

  return (
    icons[resolvedCardType.value] ||
    '📝'
  )
})

watch(
  libraryCard,
  (updatedCard) => {
    if (!updatedCard) {
      return
    }

    if (
      updatedCard.title !==
      localTitle.value
    ) {
      localTitle.value =
        updatedCard.title || ''
    }

    if (
      updatedCard.content !==
      localContent.value
    ) {
      localContent.value =
        updatedCard.content || ''
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => props.data.color,
  (updatedColor) => {
    localColor.value =
      updatedColor ||
      libraryCard.value?.color ||
      'default'
  },
)

function saveTextChanges() {
  if (!libraryCard.value) {
    return
  }

  updateLibraryCard(
    libraryCard.value.id,
    {
      title:
        localTitle.value ||
        'Untitled Card',

      content:
        localContent.value,
    },
  )

  emit('update', {
    cardId: props.id,

    libraryCardId:
      libraryCard.value.id,

    updates: {
      cardId:
        libraryCard.value.id,

      libraryCardId:
        libraryCard.value.id,

      title:
        localTitle.value ||
        'Untitled Card',

      content:
        localContent.value,

      cardType:
        libraryCard.value.type,

      color:
        localColor.value,
    },
  })
}

function cycleColor() {
  const currentIndex =
    availableColors.indexOf(
      localColor.value,
    )

  const nextIndex =
    currentIndex === -1
      ? 0
      : (
          currentIndex + 1
        ) % availableColors.length

  localColor.value =
    availableColors[nextIndex]

  emit('update', {
    cardId: props.id,

    libraryCardId:
      libraryCard.value?.id ||
      cardId.value,

    updates: {
      color:
        localColor.value,
    },
  })
}

function requestDelete() {
  emit('delete', props.id)
}

function formatSourceType(sourceType) {
  return String(sourceType)
    .replace(/[-_]/g, ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )
}
</script>

<style scoped>
.canvas-node {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  flex-direction: column;
  overflow: visible;
  border: 1px solid #cbd3df;
  border-top: 5px solid #75839a;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 8px 22px rgba(15, 31, 54, 0.12),
    0 2px 5px rgba(15, 31, 54, 0.08);
  color: #17233a;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.canvas-node:hover {
  box-shadow:
    0 12px 30px rgba(15, 31, 54, 0.16),
    0 3px 7px rgba(15, 31, 54, 0.1);
}

.canvas-node--selected {
  border-color: #375d95;
  box-shadow:
    0 0 0 3px rgba(55, 93, 149, 0.2),
    0 12px 30px rgba(15, 31, 54, 0.16);
}

.canvas-node--missing {
  border-color: #d79a9a;
  border-top-color: #b13b3b;
}

.canvas-node--default {
  border-top-color: #75839a;
}

.canvas-node--gold {
  border-top-color: #c69b2f;
}

.canvas-node--blue {
  border-top-color: #3c78b5;
}

.canvas-node--green {
  border-top-color: #4c8a66;
}

.canvas-node--purple {
  border-top-color: #7657a5;
}

.canvas-node--rose {
  border-top-color: #a95770;
}

.node-header {
  display: flex;
  min-height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #e0e5ec;
  padding: 0.55rem 0.65rem 0.5rem 0.8rem;
  cursor: grab;
}

.node-header:active {
  cursor: grabbing;
}

.node-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.45rem;
}

.node-icon {
  flex: 0 0 auto;
  font-size: 0.95rem;
}

.node-heading-text {
  display: grid;
  min-width: 0;
  gap: 0.08rem;
}

.node-type {
  overflow: hidden;
  color: #69768a;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.library-label {
  color: #8c96a5;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.node-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.3rem;
}

.color-button,
.delete-button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #657187;
  cursor: pointer;
}

.color-button:hover,
.delete-button:hover {
  border-color: #d6dce5;
  background: #f1f4f8;
  color: #17233a;
}

.delete-button {
  font-size: 1.15rem;
  line-height: 1;
}

.delete-button:hover {
  border-color: #ebc8c8;
  background: #fff0f0;
  color: #b13b3b;
}

.color-dot {
  display: block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(23, 35, 58, 0.18);
  border-radius: 50%;
  background: #75839a;
}

.canvas-node--gold .color-dot {
  background: #c69b2f;
}

.canvas-node--blue .color-dot {
  background: #3c78b5;
}

.canvas-node--green .color-dot {
  background: #4c8a66;
}

.canvas-node--purple .color-dot {
  background: #7657a5;
}

.canvas-node--rose .color-dot {
  background: #a95770;
}

.node-content {
  display: grid;
  min-height: 0;
  flex: 1 1 auto;
  grid-template-rows:
    auto
    minmax(80px, 1fr);
  gap: 0.55rem;
  padding: 0.75rem;
}

.node-title,
.node-text {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #17233a;
  font: inherit;
  outline: none;
}

.node-title {
  padding: 0.35rem 0.45rem;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
}

.node-text {
  min-height: 0;
  resize: none;
  padding: 0.45rem;
  color: #3f4b5e;
  font-size: 0.87rem;
  line-height: 1.5;
}

.node-title::placeholder,
.node-text::placeholder {
  color: #98a2b2;
}

.node-title:hover,
.node-text:hover {
  background: #f7f8fa;
}

.node-title:focus,
.node-text:focus {
  border-color: #7a9ac5;
  background: #ffffff;
  box-shadow:
    0 0 0 3px
    rgba(55, 93, 149, 0.12);
}

.missing-card-content {
  flex: 1 1 auto;
  padding: 1rem;
}

.missing-card-content strong {
  color: #a12f2f;
}

.missing-card-content p {
  margin: 0.4rem 0 0;
  color: #69768a;
  font-size: 0.8rem;
  line-height: 1.45;
}

.node-footer {
  display: flex;
  min-height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px solid #e0e5ec;
  padding: 0.45rem 0.8rem;
  color: #7d8797;
  font-size: 0.67rem;
}

.linked-badge {
  overflow: hidden;
  max-width: 130px;
  border-radius: 999px;
  background: #edf2f8;
  padding: 0.22rem 0.48rem;
  color: #466186;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.canvas-handle {
  width: 12px;
  height: 12px;
  border: 2px solid #ffffff;
  background: #375d95;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.canvas-node:hover .canvas-handle,
.canvas-node--selected .canvas-handle {
  opacity: 1;
}

.canvas-handle:hover {
  transform: scale(1.25);
}

.canvas-handle--left {
  left: -7px;
}

.canvas-handle--right {
  right: -7px;
}

:deep(.vue-flow__resize-control) {
  z-index: 20;
}

:deep(.vue-flow__resize-control.handle) {
  width: 10px;
  height: 10px;
  border: 2px solid #ffffff;
  border-radius: 3px;
  background: #375d95;
}

:deep(.vue-flow__resize-control.line) {
  border-color: #375d95;
}
</style>