<template>
  <section class="citation-panel">
    <div class="citation-panel-header">
      <div>
        <p class="citation-eyebrow">
          Citation workspace
        </p>

        <h2>{{ title }}</h2>

        <p class="citation-description">
          {{ styleDescription }}
        </p>
      </div>

      <span
        v-if="isUpdating"
        class="updating-badge"
      >
        Updating…
      </span>
    </div>

    <div class="citation-controls">
      <label class="control-group">
        <span>Citation Style</span>

        <select v-model="selectedStyle">
          <option
            v-for="style in citationStyleOptions"
            :key="style.id"
            :value="style.id"
          >
            {{ style.label }}
          </option>
        </select>
      </label>

      <label class="control-group">
        <span>Locator Type</span>

        <select v-model="locatorType">
          <option
            v-for="locator in locatorOptions"
            :key="locator.value"
            :value="locator.value"
          >
            {{ locator.label }}
          </option>
        </select>
      </label>

      <label class="control-group locator-value-group">
        <span>Locator</span>

        <input
          v-model="locatorValue"
          type="text"
          :placeholder="locatorPlaceholder"
        />
      </label>
    </div>

    <details class="citation-options">
      <summary>
        Additional citation options
      </summary>

      <div class="additional-options-grid">
        <label class="control-group">
          <span>Prefix</span>

          <input
            v-model="citationPrefix"
            type="text"
            placeholder="Example: see"
          />
        </label>

        <label class="control-group">
          <span>Suffix</span>

          <input
            v-model="citationSuffix"
            type="text"
            placeholder="Example: emphasis added"
          />
        </label>
      </div>

      <div
        v-if="styleMode !== 'note'"
        class="citation-checkboxes"
      >
        <label>
          <input
            v-model="suppressAuthor"
            type="checkbox"
            @change="handleSuppressAuthorChange"
          />
          Suppress author
        </label>

        <label>
          <input
            v-model="authorOnly"
            type="checkbox"
            @change="handleAuthorOnlyChange"
          />
          Author only
        </label>
      </div>
    </details>

    <div
      v-if="renderError"
      class="citation-error"
    >
      {{ renderError }}
    </div>

    <div class="citation-output-grid">
      <article
        v-for="output in visibleOutputs"
        :key="output.id"
        class="citation-output-card"
      >
        <div class="output-card-header">
          <div>
            <h3>{{ output.label }}</h3>

            <p>{{ output.description }}</p>
          </div>

          <button
            class="copy-citation-btn"
            type="button"
            :disabled="!output.html"
            @click="copyOutput(output)"
          >
            {{
              copiedOutputId === output.id
                ? 'Copied!'
                : output.copyLabel
            }}
          </button>
        </div>

        <blockquote
          v-if="output.html"
          class="citation-output"
          v-html="output.html"
        ></blockquote>

        <p
          v-else
          class="citation-placeholder"
        >
          Add enough source metadata to generate this citation.
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'

import {
  generateCitation,
  generateFullFootnote,
  generateInTextCitation,
  generateShortFootnote,
  getCitationStyleMode,
} from '@/utils/citations'

import {
  CITATION_STYLE_OPTIONS,
  getCitationStyle,
  setCitationStyle,
} from '@/lib/userPreferences'

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },

  title: {
    type: String,
    default: 'Citations',
  },
})

const locatorOptions = [
  {
    label: 'Page',
    value: 'page',
    placeholder: 'Example: 42 or 42–44',
  },
  {
    label: 'Chapter',
    value: 'chapter',
    placeholder: 'Example: 3',
  },
  {
    label: 'Section',
    value: 'section',
    placeholder: 'Example: 2.1',
  },
  {
    label: 'Paragraph',
    value: 'paragraph',
    placeholder: 'Example: 7',
  },
  {
    label: 'Line',
    value: 'line',
    placeholder: 'Example: 14–18',
  },
  {
    label: 'Figure',
    value: 'figure',
    placeholder: 'Example: 4',
  },
  {
    label: 'Table',
    value: 'table',
    placeholder: 'Example: 2',
  },
  {
    label: 'Verse',
    value: 'verse',
    placeholder: 'Example: 3–5',
  },
  {
    label: 'Volume',
    value: 'volume',
    placeholder: 'Example: 2',
  },
  {
    label: 'Issue',
    value: 'issue',
    placeholder: 'Example: 4',
  },
  {
    label: 'Timestamp',
    value: 'timestamp',
    placeholder: 'Example: 01:24:18',
  },
  {
    label: 'Other / No Label',
    value: 'other',
    placeholder: 'Enter the locator',
  },
]

const citationStyleOptions =
  CITATION_STYLE_OPTIONS

const selectedStyle = ref(
  getCitationStyle(),
)

const locatorType = ref('page')
const locatorValue = ref('')
const citationPrefix = ref('')
const citationSuffix = ref('')
const suppressAuthor = ref(false)
const authorOnly = ref(false)
const isUpdating = ref(false)
const renderError = ref('')
const copiedOutputId = ref('')

const renderedOutputs = ref({
  bibliography: '',
  fullNote: '',
  shortNote: '',
  inText: '',
})

let renderTimer = null
let copiedTimer = null

const styleMode = computed(() => {
  return getCitationStyleMode(
    selectedStyle.value,
  )
})

const selectedLocator = computed(() => {
  return (
    locatorOptions.find(
      (option) => {
        return (
          option.value ===
          locatorType.value
        )
      },
    ) || locatorOptions[0]
  )
})

const locatorPlaceholder = computed(() => {
  return selectedLocator.value
    .placeholder
})

const styleDescription = computed(() => {
  switch (styleMode.value) {
    case 'author-date':
      return 'Reference-list and parenthetical author–date citations.'

    case 'author-page':
      return 'Works-cited and parenthetical author–page citations.'

    case 'numeric':
      return 'Numbered references and numeric in-text citations.'

    case 'note':
    default:
      return 'Bibliography, full-note, and shortened-note citations.'
  }
})

const visibleOutputs = computed(() => {
  const bibliography = {
    id: 'bibliography',
    label:
      styleMode.value ===
      'author-page'
        ? 'Works Cited Entry'
        : styleMode.value ===
              'author-date' ||
            styleMode.value ===
              'numeric'
          ? 'Reference List Entry'
          : 'Bibliography Entry',
    description:
      'Use this entry in the source list at the end of the document.',
    copyLabel: 'Copy Entry',
    html:
      renderedOutputs.value
        .bibliography,
  }

  if (styleMode.value === 'note') {
    return [
      bibliography,
      {
        id: 'full-note',
        label: 'Full Note',
        description:
          'Use the first time the source appears in a note.',
        copyLabel: 'Copy Full Note',
        html:
          renderedOutputs.value
            .fullNote,
      },
      {
        id: 'short-note',
        label: 'Shortened Note',
        description:
          'Use for later notes referring to the same source.',
        copyLabel: 'Copy Short Note',
        html:
          renderedOutputs.value
            .shortNote,
      },
    ]
  }

  return [
    bibliography,
    {
      id: 'in-text',
      label: 'In-Text Citation',
      description:
        'Use this citation within the body of the document.',
      copyLabel: 'Copy In-Text',
      html:
        renderedOutputs.value
          .inText,
    },
  ]
})

const citationOptions = computed(() => {
  const isUnlabelledLocator =
    locatorType.value ===
      'timestamp' ||
    locatorType.value ===
      'other'

  return {
    locator:
      locatorValue.value.trim(),

    label:
      isUnlabelledLocator
        ? ''
        : locatorType.value,

    omitLabel:
      isUnlabelledLocator,

    prefix:
      citationPrefix.value.trim(),

    suffix:
      citationSuffix.value.trim(),

    suppressAuthor:
      suppressAuthor.value,

    authorOnly:
      authorOnly.value,
  }
})

function renderCitations() {
  const item = props.item

  if (!item) {
    renderedOutputs.value = {
      bibliography: '',
      fullNote: '',
      shortNote: '',
      inText: '',
    }

    isUpdating.value = false
    return
  }

  renderError.value = ''

  try {
    const options =
      citationOptions.value

    const bibliography =
      generateCitation(
        item,
        selectedStyle.value,
        options,
      )

    if (styleMode.value === 'note') {
      renderedOutputs.value = {
        bibliography,
        fullNote:
          generateFullFootnote(
            item,
            selectedStyle.value,
            options,
          ),
        shortNote:
          generateShortFootnote(
            item,
            selectedStyle.value,
            options,
          ),
        inText: '',
      }
    } else {
      renderedOutputs.value = {
        bibliography,
        fullNote: '',
        shortNote: '',
        inText:
          generateInTextCitation(
            item,
            selectedStyle.value,
            options,
          ),
      }
    }
  } catch (error) {
    console.error(
      'Could not generate citation outputs:',
      error,
    )

    renderError.value =
      error?.message ||
      'Scholarory could not generate the citation.'
  } finally {
    isUpdating.value = false
  }
}

function scheduleRender() {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }

  isUpdating.value = true

  renderTimer = setTimeout(() => {
    renderCitations()
    renderTimer = null
  }, 450)
}

watch(
  selectedStyle,
  (styleId) => {
    setCitationStyle(styleId)

    suppressAuthor.value = false
    authorOnly.value = false
  },
)

watch(
  [
    () =>
      JSON.stringify(
        props.item || {},
      ),
    selectedStyle,
    locatorType,
    locatorValue,
    citationPrefix,
    citationSuffix,
    suppressAuthor,
    authorOnly,
  ],
  scheduleRender,
  {
    immediate: true,
  },
)

function handleSuppressAuthorChange() {
  if (suppressAuthor.value) {
    authorOnly.value = false
  }
}

function handleAuthorOnlyChange() {
  if (authorOnly.value) {
    suppressAuthor.value = false
  }
}

function htmlToPlainText(html) {
  if (typeof document === 'undefined') {
    return String(html || '')
      .replace(/<[^>]+>/g, '')
      .trim()
  }

  const container =
    document.createElement('div')

  container.innerHTML =
    String(html || '')

  return (
    container.textContent ||
    container.innerText ||
    ''
  ).trim()
}

async function copyOutput(output) {
  if (!output.html) {
    return
  }

  const plainText =
    htmlToPlainText(output.html)

  try {
    if (
      typeof ClipboardItem !==
        'undefined' &&
      navigator.clipboard?.write
    ) {
      const clipboardItem =
        new ClipboardItem({
          'text/plain': new Blob(
            [plainText],
            {
              type: 'text/plain',
            },
          ),
          'text/html': new Blob(
            [output.html],
            {
              type: 'text/html',
            },
          ),
        })

      await navigator.clipboard.write([
        clipboardItem,
      ])
    } else {
      await navigator.clipboard.writeText(
        plainText,
      )
    }

    copiedOutputId.value =
      output.id

    if (copiedTimer) {
      clearTimeout(copiedTimer)
    }

    copiedTimer = setTimeout(() => {
      copiedOutputId.value = ''
      copiedTimer = null
    }, 1600)
  } catch (error) {
    console.error(
      'Could not copy citation:',
      error,
    )

    renderError.value =
      'Scholarory could not copy the citation.'
  }
}

onBeforeUnmount(() => {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }

  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
})
</script>

<style scoped>
.citation-panel {
  margin: 2rem 0;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-card);
  padding: 1rem;
  box-shadow: var(--shadow);
}

.citation-panel-header,
.output-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.citation-eyebrow {
  margin: 0 0 0.25rem;
  color: var(--accent-text);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.citation-panel h2,
.citation-output-card h3 {
  margin: 0;
}

.citation-description,
.citation-output-card p {
  margin: 0.3rem 0 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.updating-badge {
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-text);
  padding: 0.35rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.citation-controls,
.additional-options-grid {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(190px, 1fr)
    );
  gap: 0.75rem;
  margin-top: 1rem;
}

.locator-value-group {
  min-width: 220px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-group > span {
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 650;
}

.control-group input,
.control-group select {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--btn-bg);
  color: var(--text-primary);
  padding: 0.65rem 0.7rem;
  font: inherit;
  box-sizing: border-box;
}

.citation-options {
  margin-top: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--btn-bg);
  padding: 0.7rem;
}

.citation-options summary {
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.citation-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.8rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.citation-checkboxes label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.citation-error {
  margin-top: 0.9rem;
  border: 1px solid #ef4444;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  padding: 0.7rem;
  font-size: 0.82rem;
}

.citation-output-grid {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.citation-output-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--btn-bg);
  padding: 0.85rem;
}

.citation-output-card h3 {
  font-size: 0.98rem;
}

.copy-citation-btn {
  flex: 0 0 auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  padding: 0.45rem 0.65rem;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.copy-citation-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text-primary);
}

.copy-citation-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.citation-output {
  margin: 0.8rem 0 0;
  border-left: 4px solid var(--accent);
  background: var(--bg-card);
  padding: 0.75rem 0.85rem;
  color: var(--text-primary);
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.citation-placeholder {
  margin-top: 0.8rem !important;
  border-radius: 8px;
  background: var(--bg-card);
  padding: 0.75rem;
}

@media (max-width: 700px) {
  .citation-panel-header,
  .output-card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .copy-citation-btn {
    align-self: flex-start;
  }
}
</style>
