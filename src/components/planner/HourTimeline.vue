<template>
  <div class="hour-timeline">
    <div
      v-for="hour in hours"
      :key="hour"
      class="hour-row"
    >
      <div class="hour-label">
        {{ formatHour(hour) }}
      </div>

      <div class="hour-line"></div>
    </div>
  </div>
</template>

<script setup>
const hours = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00'
]

function formatHour(hour) {
  const [rawHour] = hour.split(':')
  const numberHour = Number(rawHour)

  if (numberHour === 0) return '12 AM'
  if (numberHour < 12) return `${numberHour} AM`
  if (numberHour === 12) return '12 PM'

  return `${numberHour - 12} PM`
}
</script>

<style scoped>
.hour-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hour-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: start;
  min-height: 72px;
}

.hour-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  padding-top: 0.25rem;
}

.hour-line {
  border-top: 1px solid var(--border-color);
  min-height: 72px;
}
</style>