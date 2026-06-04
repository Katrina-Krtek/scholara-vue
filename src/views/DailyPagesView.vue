<template>
  <AppLayout
    title="Daily Pages"
    subtitle="Your daily command center for planning, assignments, notes, research, and focus work."
    banner-key="daily-pages"
    default-icon="📅"
  >
    <main class="daily-pages-page">
      <section class="daily-header-card">
        <div>
          <p class="eyebrow">Today</p>
          <h2>{{ todayLabel }}</h2>

          <p class="daily-subtitle">
            Focus Word:
            <strong>{{ currentDailyPage.focusWord }}</strong>
          </p>
        </div>

        <div class="daily-actions">
          <button type="button" class="secondary-btn">
            Previous Day
          </button>

          <button type="button" class="primary-btn">
            Today
          </button>

          <button type="button" class="secondary-btn">
            Next Day
          </button>
        </div>
      </section>

      <section class="daily-grid">
        <div class="main-column">
          <section class="daily-card">
            <div class="card-header">
              <h3>Today's Schedule</h3>
              <span>{{ plannerBlocks.length }} blocks</span>
            </div>

            <div class="timeline">
              <div
                v-for="block in plannerBlocks"
                :key="block.id"
                class="timeline-row"
              >
                <div class="timeline-time">
                  {{ block.startTime }}
                  <span>{{ block.endTime }}</span>
                </div>

                <div class="timeline-content">
                  <div class="category-pill">
                    {{ block.category }}
                  </div>

                  <strong>{{ block.title }}</strong>
                  <p>{{ block.description }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="daily-card">
            <div class="card-header">
              <h3>Today's Notes</h3>
              <span>{{ notes.length }} notes</span>
            </div>

            <div class="simple-list">
              <article
                v-for="note in notes"
                :key="note.id"
                class="list-item"
              >
                <strong>{{ note.title }}</strong>
                <p>{{ note.description }}</p>
              </article>
            </div>
          </section>

          <section class="daily-card">
            <div class="card-header">
              <h3>Today's Research</h3>
              <span>{{ research.length }} sources</span>
            </div>

            <div class="simple-list">
              <article
                v-for="source in research"
                :key="source.id"
                class="list-item"
              >
                <strong>{{ source.title }}</strong>
                <p>{{ source.type }}</p>
              </article>
            </div>
          </section>
        </div>

        <aside class="side-column">
          <section class="daily-card">
            <div class="card-header">
              <h3>Tasks</h3>
              <span>{{ tasks.length }} items</span>
            </div>

            <div class="task-list">
              <label
                v-for="task in tasks"
                :key="task.id"
                class="task-item"
              >
                <input type="checkbox" />

                <span>{{ task.title }}</span>

                <small>{{ task.priority }}</small>
              </label>
            </div>
          </section>

          <section class="daily-card">
            <div class="card-header">
              <h3>Assignments</h3>
              <span>{{ assignments.length }} active</span>
            </div>

            <div class="simple-list">
              <article
                v-for="assignment in assignments"
                :key="assignment.id"
                class="list-item"
              >
                <strong>{{ assignment.title }}</strong>
                <p>
                  {{ assignment.course }} · {{ assignment.status }} · Due {{ assignment.dueDate }}
                </p>
              </article>
            </div>
          </section>

          <section class="daily-card">
            <div class="card-header">
              <h3>Reflection</h3>
              <span>{{ currentDailyPage.mood }} / {{ currentDailyPage.energy }}</span>
            </div>

            <p class="reflection-text">
              {{ currentDailyPage.reflection }}
            </p>
          </section>

          <section class="daily-card rory-card">
            <div class="card-header">
              <h3>🐾 Rory Notices...</h3>
              <span>{{ roryInsights.length }} insights</span>
            </div>

            <div class="simple-list">
              <article
                v-for="insight in roryInsights"
                :key="insight.id"
                class="list-item"
              >
                <strong>{{ insight.title }}</strong>
                <p>{{ insight.description }}</p>
              </article>
            </div>
          </section>
        </aside>
      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'

import {
  mockDailyPages,
  mockPlannerBlocks,
  mockDailyTasks,
  mockDailyAssignments,
  mockDailyNotes,
  mockDailyResearch,
  mockDailyRoryInsights,
} from '../data/mockDailyPages'

const currentDailyPage = computed(() => {
  return mockDailyPages[0]
})

const todayLabel = computed(() => {
  const page = currentDailyPage.value

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${page.date}T12:00:00`))
})

const plannerBlocks = computed(() => {
  return mockPlannerBlocks.filter(
    (block) => block.dailyPageId === currentDailyPage.value.id
  )
})

const tasks = computed(() => {
  return mockDailyTasks.filter(
    (task) => task.dailyPageId === currentDailyPage.value.id
  )
})

const assignments = computed(() => {
  return mockDailyAssignments.filter(
    (assignment) => assignment.dailyPageId === currentDailyPage.value.id
  )
})

const notes = computed(() => {
  return mockDailyNotes.filter(
    (note) => note.dailyPageId === currentDailyPage.value.id
  )
})

const research = computed(() => {
  return mockDailyResearch.filter(
    (source) => source.dailyPageId === currentDailyPage.value.id
  )
})

const roryInsights = computed(() => {
  return mockDailyRoryInsights
})
</script>

<style scoped>
.daily-pages-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 1.5rem 2rem 6rem;
  color: var(--text-primary);
}

.daily-header-card,
.daily-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow);
}

.daily-header-card {
  padding: 1.4rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.daily-header-card h2 {
  margin: 0;
  font-size: 1.8rem;
}

.daily-subtitle {
  margin: 0.45rem 0 0;
  color: var(--text-secondary);
}

.daily-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn,
.primary-btn:hover,
.secondary-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.daily-grid {
  display: grid;
  grid-template-columns: minmax(420px, 1fr) 360px;
  gap: 1rem;
  align-items: start;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.daily-card {
  padding: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
}

.card-header span {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--btn-bg);
}

.timeline-time {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

.timeline-time span {
  display: block;
  margin-top: 0.2rem;
  font-weight: 500;
}

.timeline-content strong,
.list-item strong {
  display: block;
}

.timeline-content p,
.list-item p,
.rory-card p,
.reflection-text {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.45;
}

.category-pill {
  display: inline-block;
  margin-bottom: 0.45rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg-card);
}

.simple-list,
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.list-item,
.task-item {
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--btn-bg);
}

.task-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}

.task-item small {
  color: var(--text-muted);
  text-transform: capitalize;
}

@media (max-width: 1100px) {
  .daily-header-card,
  .daily-grid {
    grid-template-columns: 1fr;
  }

  .daily-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .daily-actions {
    width: 100%;
  }

  .primary-btn,
  .secondary-btn {
    flex: 1;
  }
}
</style>