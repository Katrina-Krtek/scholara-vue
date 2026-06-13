import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory_sources'

const sourceMetadataDefaults = {
  isbn: '',
  doi: '',
  url: '',
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  edition: '',
  accessDate: '',
  publicationLocation: '',
  firstAuthorFirstName: '',
  firstAuthorLastName: '',
  secondAuthorFirstName: '',
  secondAuthorLastName: '',
  contributorsText: '',
  forewordBy: '',
  sourceNotes: [],
}

const defaultSources = [
  {
    id: 1,
    title: 'A Short Guide to Spiritual Formation',
    author: 'Alex Sosler',
    type: 'Book',
    year: '2024',
    publisher: 'B&H Academic',
    ...sourceMetadataDefaults,
    courseId: 1,
    course: 'DMIN 851',
    assignmentId: null,
    assignment: '',
    status: 'reading',
    priority: 'high',
    tags: ['spiritual formation', 'truth', 'goodness', 'beauty'],
    notes: 'Used for DMIN 851 book review.',
    citation: '',
    createdAt: '2026-06-12',
  },
  {
    id: 2,
    title: 'Belong',
    author: 'Melanie Dobson',
    type: 'Book',
    year: '2022',
    publisher: '',
    ...sourceMetadataDefaults,
    courseId: 1,
    course: 'DMIN 851',
    assignmentId: null,
    assignment: '',
    status: 'reading',
    priority: 'high',
    tags: ['discernment', 'friendship', 'spiritual direction'],
    notes: 'Used for DMIN 851 book review.',
    citation: '',
    createdAt: '2026-06-12',
  },
]

function loadSources() {
  try {
    const storedSources = localStorage.getItem(STORAGE_KEY)

    if (!storedSources) {
      return defaultSources
    }

    return JSON.parse(storedSources).map((source) => ({
      ...sourceMetadataDefaults,
      ...source,
    }))
  } catch (error) {
    console.error('Failed to load sources:', error)
    return defaultSources
  }
}

const sources = ref(loadSources())

watch(
  sources,
  (newSources) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSources))
  },
  { deep: true },
)

export function useSources() {
  const allSources = computed(() => sources.value)

  const activeSources = computed(() =>
    sources.value.filter((source) => source.status !== 'archived'),
  )

  function getSourceById(id) {
    return sources.value.find((source) => String(source.id) === String(id))
  }

  function addSource(source) {
    const newSource = {
      id: Date.now(),
      title: '',
      author: '',
      type: 'Book',
      year: '',
      publisher: '',
      ...sourceMetadataDefaults,
      courseId: null,
      course: '',
      assignmentId: null,
      assignment: '',
      status: 'planned',
      priority: 'medium',
      tags: [],
      notes: '',
      citation: '',
      createdAt: new Date().toISOString().slice(0, 10),
      ...source,
    }

    sources.value.unshift(newSource)
    return newSource
  }

  function updateSource(id, updates) {
    sources.value = sources.value.map((source) =>
      String(source.id) === String(id)
        ? { ...source, ...updates }
        : source,
    )
  }

  function deleteSource(id) {
    sources.value = sources.value.filter(
      (source) => String(source.id) !== String(id),
    )
  }

  return {
    sources,
    allSources,
    activeSources,
    getSourceById,
    addSource,
    updateSource,
    deleteSource,
  }
}