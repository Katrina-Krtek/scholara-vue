<template>
  <AppLayout
    title="Planner"
    subtitle="Time blocking, study sessions, and daily scheduling"
    banner-key="planner"
    default-icon="🗓️"
  >
    <div class="planner-toolbar">
      <label for="time-format">Time Format</label>

      <select
        id="time-format"
        v-model="timeFormat"
        class="time-select"
        @change="saveTimeFormat"
      >
        <option value="12">AM / PM</option>
        <option value="24">24-hour</option>
      </select>
    </div>

    <div class="planner-card">
      <h2>Planner</h2>

      <div
        v-for="block in plannerBlocks"
        :key="block.id"
        class="planner-block"
      >
        <strong>{{ block.title }}</strong>

        <div>
          {{ formatTime(block.start) }} - {{ formatTime(block.end) }}
        </div>

        <div>
          {{ block.type }}
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/AppLayout.vue'
import { plannerBlocks } from '../../data/mockPlannerData.js'

const STORAGE_KEY = 'scholarory_time_format'

const timeFormat = ref('12')

onMounted(() => {
  const savedFormat = localStorage.getItem(STORAGE_KEY)

  if (savedFormat) {
    timeFormat.value = savedFormat
  }
})

function saveTimeFormat() {
  localStorage.setItem(STORAGE_KEY, timeFormat.value)
}

function formatTime(time) {
  if (timeFormat.value === '24') {
    return time
  }

  const [hourString, minute] = time.split(':')
  const hour = Number(hourString)

  if (hour === 0) {
    return `12:${minute} AM`
  }

  if (hour < 12) {
    return `${hour}:${minute} AM`
  }

  if (hour === 12) {
    return `12:${minute} PM`
  }

  return `${hour - 12}:${minute} PM`
}
</script>

<style scoped>
.planner-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.planner-toolbar label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}

.time-select {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
}

.planner-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.planner-card h2 {
  margin-top: 0;
}

.planner-block {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.planner-block:last-child {
  margin-bottom: 0;
}
</style>