import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory_tasks'

const defaultTasks = [
  {
    id: 1,
    title: 'Read assigned chapter',
    description: 'Capture key quotes and page numbers.',
    dueDate: '2026-06-06',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Review Scholarory build notes',
    description: 'Document today’s progress.',
    dueDate: '2026-06-06',
    status: 'not-started',
    priority: 'medium',
  },
]

function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY)

    if (!storedTasks) {
      return defaultTasks
    }

    return JSON.parse(storedTasks)
  } catch (error) {
    console.error('Failed to load tasks:', error)
    return defaultTasks
  }
}

const tasks = ref(loadTasks())

watch(
  tasks,
  (newTasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks))
  },
  { deep: true },
)

export function useTasks() {
  const activeTasks = computed(() =>
    tasks.value.filter((task) => task.status !== 'completed'),
  )

  const completedTasks = computed(() =>
    tasks.value.filter((task) => task.status === 'completed'),
  )

  function getTasksByDate(date) {
    return tasks.value.filter((task) => task.dueDate === date)
  }

  function getTask(id) {
    return tasks.value.find((task) => task.id === id)
  }

  function addTask(task) {
    const newTask = {
      id: Date.now(),
      status: 'not-started',
      priority: 'medium',
      ...task,
    }

    tasks.value.push(newTask)
    return newTask
  }

  function updateTask(id, updates) {
    tasks.value = tasks.value.map((task) =>
      task.id === id ? { ...task, ...updates } : task,
    )
  }

  function deleteTask(id) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  function toggleTaskComplete(id) {
    const task = tasks.value.find((taskItem) => taskItem.id === id)

    if (!task) return

    task.status = task.status === 'completed' ? 'not-started' : 'completed'
  }

  return {
    tasks,
    activeTasks,
    completedTasks,
    getTasksByDate,
    getTask,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  }
}