<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import RoryBreakTimeAnimation from '@/components/rory/RoryBreakTimeAnimation.vue'

const MODES = {
  focus: { label: 'Focus', minutes: .1
  
   },
  shortBreak: { label: 'Short Break', minutes: 5 },
  longBreak: { label: 'Long Break', minutes: 15 },
}

const mode = ref('focus')
const secondsLeft = ref(MODES.focus.minutes * 60)
const isRunning = ref(false)
const completedFocusSessions = ref(0)
const showRory = ref(false)

let timerId = null

const currentMode = computed(() => MODES[mode.value])

const formattedTime = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  const seconds = secondsLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function setMode(nextMode) {
  stopTimer()
  mode.value = nextMode
  secondsLeft.value = MODES[nextMode].minutes * 60
  showRory.value = false
}

function startTimer() {
  if (isRunning.value) return

  isRunning.value = true

  timerId = window.setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value -= 1
      return
    }

    completeTimer()
  }, 1000)
}

function stopTimer() {
  isRunning.value = false

  if (timerId) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function resetTimer() {
  stopTimer()
  secondsLeft.value = currentMode.value.minutes * 60
  showRory.value = false
}

function completeTimer() {
  stopTimer()

  if (mode.value === 'focus') {
    completedFocusSessions.value += 1
    showRory.value = true

    const nextBreak =
      completedFocusSessions.value % 4 === 0 ? 'longBreak' : 'shortBreak'

    mode.value = nextBreak
    secondsLeft.value = MODES[nextBreak].minutes * 60
  } else {
    showRory.value = false
    mode.value = 'focus'
    secondsLeft.value = MODES.focus.minutes * 60
  }
}

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<template>
  <section class="pomodoro-page">
    <div class="pomodoro-card">
      <p class="eyebrow">Scholarory Pomodoro</p>

      <h1>{{ currentMode.label }}</h1>

      <div class="timer-display">
        {{ formattedTime }}
      </div>

      <div class="mode-buttons">
        <button
          :class="{ active: mode === 'focus' }"
          @click="setMode('focus')"
        >
          Focus
        </button>

        <button
          :class="{ active: mode === 'shortBreak' }"
          @click="setMode('shortBreak')"
        >
          Short Break
        </button>

        <button
          :class="{ active: mode === 'longBreak' }"
          @click="setMode('longBreak')"
        >
          Long Break
        </button>
      </div>

      <div class="timer-actions">
        <button v-if="!isRunning" class="primary" @click="startTimer">
          Start
        </button>

        <button v-else class="primary" @click="stopTimer">
          Pause
        </button>

        <button @click="resetTimer">
          Reset
        </button>
      </div>

      <p class="session-count">
        Focus sessions completed: {{ completedFocusSessions }}
      </p>
    </div>

    <div v-if="showRory" class="rory-panel">
      <RoryBreakTimeAnimation />
      <h2>Break time!</h2>
      <p>Rory says you earned a walk, stretch, or water break.</p>
    </div>
  </section>
</template>

<style scoped>
.pomodoro-page {
  min-height: 100%;
  padding: 2rem;
  display: grid;
  grid-template-columns: minmax(280px, 520px) minmax(260px, 420px);
  gap: 2rem;
  align-items: center;
}

.pomodoro-card,
.rory-panel {
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-color, #d8dee9);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--text-muted, #64748b);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--text-primary, #0b1f3f);
}

.timer-display {
  margin: 2rem 0;
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 800;
  line-height: 1;
  color: #0b1f3f;
}

.mode-buttons,
.timer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button {
  border: 1px solid var(--border-color, #d8dee9);
  background: #ffffff;
  color: #0b1f3f;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

button.active,
button.primary {
  background: #0b1f3f;
  color: #f5c84c;
  border-color: #0b1f3f;
}

.timer-actions {
  margin-top: 1.25rem;
}

.session-count {
  margin: 1.5rem 0 0;
  color: var(--text-muted, #64748b);
}

.rory-panel {
  text-align: center;
}

.rory-panel h2 {
  margin: 1rem 0 0.25rem;
  color: #0b1f3f;
}

.rory-panel p {
  margin: 0;
  color: var(--text-muted, #64748b);
}

@media (max-width: 900px) {
  .pomodoro-page {
    grid-template-columns: 1fr;
  }
}
</style>