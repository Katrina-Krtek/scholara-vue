<script setup>
import {
  computed,
  onBeforeUnmount,
  ref,
} from 'vue'

import AppLayout from '../../components/AppLayout.vue'

import RoryBreakTimeAnimation from '@/components/rory/RoryBreakTimeAnimation.vue'

const MODES = {
  focus: {
    label: 'Focus',
    minutes: 0.1,
  },

  shortBreak: {
    label: 'Short Break',
    minutes: 5,
  },

  longBreak: {
    label: 'Long Break',
    minutes: 15,
  },
}

const mode = ref('focus')

const secondsLeft = ref(
  MODES.focus.minutes * 60,
)

const isRunning = ref(false)
const completedFocusSessions = ref(0)
const showRory = ref(false)

let timerId = null

const currentMode = computed(
  () => MODES[mode.value],
)

const formattedTime = computed(() => {
  const totalSeconds = Math.max(
    0,
    Math.ceil(secondsLeft.value),
  )

  const minutes = Math.floor(
    totalSeconds / 60,
  )

  const seconds =
    totalSeconds % 60

  return `${String(minutes).padStart(
    2,
    '0',
  )}:${String(seconds).padStart(
    2,
    '0',
  )}`
})

function setMode(nextMode) {
  if (!MODES[nextMode]) {
    return
  }

  stopTimer()

  mode.value = nextMode

  secondsLeft.value =
    MODES[nextMode].minutes * 60

  showRory.value = false
}

function startTimer() {
  if (isRunning.value) {
    return
  }

  isRunning.value = true

  timerId = window.setInterval(() => {
    if (secondsLeft.value > 1) {
      secondsLeft.value -= 1
      return
    }

    secondsLeft.value = 0
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

  secondsLeft.value =
    currentMode.value.minutes * 60

  showRory.value = false
}

function completeTimer() {
  stopTimer()

  if (mode.value === 'focus') {
    completedFocusSessions.value += 1
    showRory.value = true

    const nextBreak =
      completedFocusSessions.value % 4 === 0
        ? 'longBreak'
        : 'shortBreak'

    mode.value = nextBreak

    secondsLeft.value =
      MODES[nextBreak].minutes * 60

    return
  }

  showRory.value = false
  mode.value = 'focus'

  secondsLeft.value =
    MODES.focus.minutes * 60
}

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<template>
  <AppLayout
    title="Pomodoro Timer"
    subtitle="Focus deeply, take intentional breaks, and let Rory help you stay on track."
    banner-key="pomodoro"
    default-icon="⏱️"
  >
    <section class="pomodoro-page">
      <div class="pomodoro-card">
        <p class="eyebrow">
          Scholarory Pomodoro
        </p>

        <h2>
          {{ currentMode.label }}
        </h2>

        <div
          class="timer-display"
          aria-live="polite"
        >
          {{ formattedTime }}
        </div>

        <div
          class="mode-buttons"
          aria-label="Pomodoro timer mode"
        >
          <button
            type="button"
            :class="{
              active: mode === 'focus',
            }"
            @click="setMode('focus')"
          >
            Focus
          </button>

          <button
            type="button"
            :class="{
              active:
                mode === 'shortBreak',
            }"
            @click="setMode('shortBreak')"
          >
            Short Break
          </button>

          <button
            type="button"
            :class="{
              active:
                mode === 'longBreak',
            }"
            @click="setMode('longBreak')"
          >
            Long Break
          </button>
        </div>

        <div class="timer-actions">
          <button
            v-if="!isRunning"
            class="primary"
            type="button"
            @click="startTimer"
          >
            Start
          </button>

          <button
            v-else
            class="primary"
            type="button"
            @click="stopTimer"
          >
            Pause
          </button>

          <button
            type="button"
            @click="resetTimer"
          >
            Reset
          </button>
        </div>

        <p class="session-count">
          Focus sessions completed:
          {{ completedFocusSessions }}
        </p>
      </div>

      <div
        v-if="showRory"
        class="rory-panel"
      >
        <RoryBreakTimeAnimation />

        <h2>Break time!</h2>

        <p>
          Rory says you earned a walk,
          stretch, or water break.
        </p>
      </div>

      <div
        v-else
        class="focus-tips"
      >
        <span
          class="focus-tips-icon"
          aria-hidden="true"
        >
          🐾
        </span>

        <h2>Focus with Rory</h2>

        <p>
          Work without interruption until
          the timer ends, then take the
          recommended break.
        </p>

        <div class="session-guide">
          <div>
            <strong>Focus</strong>
            <span>25 minutes</span>
          </div>

          <div>
            <strong>Short break</strong>
            <span>5 minutes</span>
          </div>

          <div>
            <strong>Long break</strong>
            <span>After four sessions</span>
          </div>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style scoped>
.pomodoro-page {
  display: grid;
  grid-template-columns:
    minmax(280px, 520px)
    minmax(260px, 420px);
  gap: 2rem;
  align-items: stretch;
}

.pomodoro-card,
.rory-panel,
.focus-tips {
  border: 1px solid
    var(--border-color, #d8dee9);
  border-radius: 24px;
  background:
    var(--bg-card, #ffffff);
  padding: 2rem;
  box-shadow:
    0 16px 40px
    rgba(15, 23, 42, 0.1);
}

.pomodoro-card {
  display: flex;
  min-height: 440px;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color:
    var(--text-secondary, #64748b);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pomodoro-card h2 {
  margin: 0;
  color:
    var(--text-primary, #0b1f3f);
  font-size: 2rem;
}

.timer-display {
  margin: 2rem 0;
  color: #0b1f3f;
  font-size:
    clamp(4rem, 12vw, 7rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
}

.mode-buttons,
.timer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button {
  border: 1px solid
    var(--border-color, #d8dee9);
  border-radius: 999px;
  background:
    var(--bg-card, #ffffff);
  padding: 0.75rem 1rem;
  color: #0b1f3f;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

button:hover {
  border-color: #0b1f3f;
  transform: translateY(-1px);
}

button.active,
button.primary {
  border-color: #0b1f3f;
  background: #0b1f3f;
  color: #f5c84c;
}

.timer-actions {
  margin-top: 1.25rem;
}

.session-count {
  margin: 1.5rem 0 0;
  color:
    var(--text-secondary, #64748b);
}

.rory-panel,
.focus-tips {
  display: grid;
  align-content: center;
  justify-items: center;
  min-height: 440px;
  text-align: center;
}

.rory-panel h2,
.focus-tips h2 {
  margin: 1rem 0 0.25rem;
  color: #0b1f3f;
}

.rory-panel p,
.focus-tips p {
  max-width: 320px;
  margin: 0;
  color:
    var(--text-secondary, #64748b);
  line-height: 1.6;
}

.focus-tips-icon {
  font-size: 4rem;
}

.session-guide {
  display: grid;
  width: 100%;
  gap: 0.65rem;
  margin-top: 1.5rem;
}

.session-guide div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid
    var(--border-color, #d8dee9);
  border-radius: 12px;
  background:
    var(--bg-secondary, #f7f8fb);
  padding: 0.75rem 0.9rem;
  text-align: left;
}

.session-guide strong {
  color:
    var(--text-primary, #0b1f3f);
  font-size: 0.82rem;
}

.session-guide span {
  color:
    var(--text-secondary, #64748b);
  font-size: 0.78rem;
}

@media (max-width: 900px) {
  .pomodoro-page {
    grid-template-columns: 1fr;
  }

  .pomodoro-card,
  .rory-panel,
  .focus-tips {
    min-height: auto;
  }
}

@media (max-width: 600px) {
  .pomodoro-card,
  .rory-panel,
  .focus-tips {
    border-radius: 18px;
    padding: 1.25rem;
  }

  .timer-display {
    font-size: 4rem;
  }

  .mode-buttons button {
    flex: 1 1 120px;
  }
}
</style>