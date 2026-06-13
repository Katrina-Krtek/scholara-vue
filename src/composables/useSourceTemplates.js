import { computed } from 'vue'
import {
  SOURCE_TEMPLATES,
  DEFAULT_SOURCE_TYPE,
  getSourceTemplate,
  createEmptyTemplateNotes,
} from '@/data/sourceTemplates'

export function useSourceTemplates(source) {
  const sourceType = computed(() => source.value?.type || DEFAULT_SOURCE_TYPE)

  const template = computed(() => getSourceTemplate(sourceType.value))

  const templateOptions = computed(() =>
    Object.entries(SOURCE_TEMPLATES).map(([value, template]) => ({
      value,
      label: template.label,
    })),
  )

  function ensureTemplateNotes() {
    if (!source.value) return

    if (!source.value.templateNotes) {
      source.value.templateNotes = createEmptyTemplateNotes(sourceType.value)
      return
    }

    const emptyNotes = createEmptyTemplateNotes(sourceType.value)

    Object.keys(emptyNotes).forEach((key) => {
      if (!(key in source.value.templateNotes)) {
        source.value.templateNotes[key] = ''
      }
    })
  }

  function changeSourceType(newType) {
    if (!source.value) return

    source.value.type = newType
    source.value.templateNotes = createEmptyTemplateNotes(newType)
  }

  return {
    sourceType,
    template,
    templateOptions,
    ensureTemplateNotes,
    changeSourceType,
  }
}