import { computed } from 'vue'

import {
  SOURCE_TEMPLATES,
  DEFAULT_SOURCE_TYPE,
  normalizeSourceTemplateKey,
  getSourceTypeLabel,
  getSourceTemplate,
  createEmptyTemplateNotes,
} from '@/data/sourceTemplates'

export function useSourceTemplates(source) {
  const sourceType = computed(() => {
    return normalizeSourceTemplateKey(
      source.value?.type || DEFAULT_SOURCE_TYPE,
    )
  })

  const template = computed(() => {
    return getSourceTemplate(sourceType.value)
  })

  const templateOptions = computed(() => {
    return Object.entries(SOURCE_TEMPLATES).map(
      ([value, templateDefinition]) => ({
        value,
        label: templateDefinition.label,
      }),
    )
  })

  function ensureTemplateNotes() {
    if (!source.value) {
      return
    }

    source.value.templateNotes = createEmptyTemplateNotes(
      sourceType.value,
      source.value.templateNotes || {},
    )
  }

  function changeSourceType(newType) {
    if (!source.value) {
      return
    }

    const templateKey = normalizeSourceTemplateKey(newType)

    source.value.type = getSourceTypeLabel(templateKey)
    source.value.templateNotes = createEmptyTemplateNotes(
      templateKey,
      source.value.templateNotes || {},
    )
  }

  return {
    sourceType,
    template,
    templateOptions,
    ensureTemplateNotes,
    changeSourceType,
  }
}
